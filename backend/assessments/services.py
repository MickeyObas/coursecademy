import logging
import random
from decimal import Decimal

from django.contrib.contenttypes.models import ContentType
from django.db import transaction
from django.utils.timezone import now
from rest_framework.generics import get_object_or_404
from rest_framework.response import Response

from assessments.models import (AssessmentAnswer, AssessmentQuestion,
                                AssessmentSession, CourseAssessment,
                                LessonAssessment, ModuleAssessment, Option,
                                Question, TestAssessment, TestBlueprint,
                                TestSession, TestSessionAnswer,
                                TestSessionQuestion)
from courses.exceptions import NoCourseError, NoLessonError
from courses.models import Course, CourseProgress, Lesson, LessonProgress

from .exceptions import (NoAssessmentSessionError, NoCorrectOptionError,
                         NoCourseAssessmentError, NoLessonAssessmentError,
                         NoQuestionError, NoTestAssessmentError,
                         NoTestBlueprintError, NoTestSessionError,
                         TestSessionExpiredError, TestSessionMarkingError)
from .serializers import QuestionSerializer

logger = logging.getLogger(__name__)
TOTAL_QUESTIONS_PER_SESSION = 10


def start_test_session(user, category, difficulty):
    with transaction.atomic():
        try:
            test_assessment = TestAssessment.objects.get(category=category)
        except TestAssessment.DoesNotExist:
            raise NoTestAssessmentError

        try:
            test_blueprint = TestBlueprint.objects.get(
                test_assessment=test_assessment, difficulty=difficulty
            )
        except TestBlueprint.DoesNotExist:
            raise NoTestBlueprintError

        test_session = TestSession.objects.create(
            user=user,
            test_assessment=test_assessment,
            blueprint=test_blueprint,
        )

        content_type = ContentType.objects.get_for_model(TestAssessment)
        easy_count = round(
            test_blueprint.rules.get("easy", 0) * TOTAL_QUESTIONS_PER_SESSION
        )
        normal_count = round(
            test_blueprint.rules.get("normal", 0) * TOTAL_QUESTIONS_PER_SESSION
        )
        hard_count = TOTAL_QUESTIONS_PER_SESSION - (easy_count + normal_count)

        questions = list(
            Question.objects.filter(
                content_type=content_type,
                object_id=test_assessment.id,
            ).order_by("?")
        )

        questions_easy = [q for q in questions if q.difficulty == "EASY"][:easy_count]
        questions_normal = [q for q in questions if q.difficulty == "NORMAL"][
            :normal_count
        ]
        questions_hard = [q for q in questions if q.difficulty == "HARD"][:hard_count]

        selected_questions = questions_easy + questions_normal + questions_hard
        random.shuffle(selected_questions)

        for index, question in enumerate(selected_questions):
            TestSessionQuestion.objects.create(
                test_session=test_session,
                question=question,
                order=index + 1,
                snapshot_text=question.text,
            )

        return test_session


def mark_test_session(user, session_id):
    try:
        test_session = TestSession.objects.get(user=user, id=session_id)
    except TestSession.DoesNotExist:
        raise NoTestSessionError()

    if test_session.submitted_at:
        raise TestSessionExpiredError()

    test_session.submitted_at = now()
    test_session.status = TestSession.Status.SUBMITTED

    try:
        test_session_answers = TestSessionAnswer.objects.filter(
            session_question__test_session=test_session
        )
        with transaction.atomic():
            for test_answer in test_session_answers:
                _mark_test_answer(test_answer)

            question_count = test_session.questions.count()
            correct_answer_count = test_session_answers.filter(is_correct=True).count()
            score = Decimal(0)
            if question_count > 0:
                score = Decimal((correct_answer_count / question_count) * 100)
            test_session.score = score
            test_session.marked_at = now()

    except Exception as e:
        test_session.status = TestSession.Status.ERROR
        raise TestSessionMarkingError()

    test_session.save()

    return test_session


@transaction.atomic
def generate_assessment_answer_objects(session_id, answer_data: dict):
    session = AssessmentSession.objects.get(id=session_id)

    for key, value in answer_data.items():
        question = Question.objects.get(id=key)
        assessment_answer = AssessmentAnswer.objects.create(
            session=session,
            question=question,
            input=value,
            option_id=value if question.type == "MCQ" else None,
        )


def mark_assessment_session(user, session_id, assessment_id, assessment_type):
    from courses.services import get_next_step, update_lesson_completion

    session = None
    content_type_model = ""

    try:
        if assessment_type == "lesson":
            content_type_model = "lessonassessment"
            session = AssessmentSession.objects.get(
                user=user,
                content_type=ContentType.objects.get_for_model(LessonAssessment),
                object_id=assessment_id,  # NOTE: Need assessment id
            )

        elif assessment_type == "module":
            content_type_model = "moduleassessment"
            session = AssessmentSession.objects.get(
                user=user,
                content_type=ContentType.objects.get_for_model(ModuleAssessment),
                object_id=assessment_id,
            )

        elif assessment_type == "course":
            content_type_model = "courseassessment"
            session = AssessmentSession.objects.get(
                user=user,
                content_type=ContentType.objects.get_for_model(CourseAssessment),
                object_id=assessment_id,
            )
    except AssessmentSession.DoesNotExist:
        raise NoAssessmentSessionError()

    try:
        session_answers = AssessmentAnswer.objects.filter(session=session)
        for session_answer in session_answers:
            _mark_assessment_answer(session_answer)

        question_count = Question.objects.filter(
            content_type=ContentType.objects.get(model=content_type_model),
            object_id=assessment_id,
        ).count()
        correct_answer_count = session_answers.filter(is_correct=True).count()
        score = Decimal(0)
        if question_count > 0:
            score = Decimal((correct_answer_count / question_count) * 100)
        session.score = score
        session.completed_at = now()
        session.save()

        # Checking to see what should happen after an assessment, can be improved
        ao = session.assessment_object
        if isinstance(ao, LessonAssessment):
            resume_lesson_id = ao.lesson_id
        elif isinstance(ao, CourseAssessment):
            last_lesson = (
                Lesson.objects.filter(module__course=ao.course)
                .order_by("module__order", "order")
                .last()
            )
            resume_lesson_id = last_lesson.id

        # Mark lesson as completed if scored about half
        if session.score >= 50:
            if isinstance(ao, LessonAssessment):
                update_lesson_completion(user, ao.lesson)

            elif isinstance(ao, CourseAssessment):
                course_progress = CourseProgress.objects.get(
                    enrollment__course=ao.course, enrollment__user=user
                )
                course_progress.completed_at = now()
                course_progress.save()

        next_step = get_next_step(
            user, ao.lesson.module.course, current_assessment_id=ao.id
        )

        if session.score >= 50:
            return next_step

        next_step["title"] = ao.lesson.module.course.title
        next_step["type"] = "retry_lesson"
        next_step["url"] = (
            f"/courses/{ao.lesson.module.course.slug}/lessons/{ao.lesson.id}/"
        )
        return next_step

    except Exception as e:
        print(e)
        return {"error": str(e)}


@transaction.atomic
def start_lesson_assessment(user, lesson_id):
    try:
        lesson_assessment = LessonAssessment.objects.get(lesson_id=lesson_id)
    except LessonAssessment.DoesNotExist:
        raise NoLessonAssessmentError()

    content_type = ContentType.objects.get_for_model(LessonAssessment)

    user_lesson_assessment_session, created = AssessmentSession.objects.get_or_create(
        user=user,
        content_type=content_type,
        object_id=lesson_assessment.id,
    )

    # Delete answers from previous attempts
    if not created:
        AssessmentAnswer.objects.filter(session=user_lesson_assessment_session).delete()

    return user_lesson_assessment_session


def start_course_assessment(user, course_slug):
    try:
        course_assessment = CourseAssessment.objects.get(course__slug=course_slug)
    except CourseAssessment.DoesNotExist:
        raise NoCourseAssessmentError()

    content_type = ContentType.objects.get_for_model(CourseAssessment)
    user_course_assessment_session, created = AssessmentSession.objects.get_or_create(
        user=user, content_type=content_type, object_id=course_assessment.id
    )
    return user_course_assessment_session, course_assessment.course.id


def save_test_answer(user, question_id, session_id, answer):
    question = Question.objects.get(id=question_id)
    test_session = TestSession.objects.get(id=session_id, user=user)

    if test_session.is_expired:
        mark_test_session(user, session_id)
        raise TestSessionExpiredError()

    session_question = TestSessionQuestion.objects.get(
        test_session=test_session, question=question
    )

    tsa, created = TestSessionAnswer.objects.get_or_create(
        session_question=session_question
    )
    tsa.input = answer if session_question.question.type != "MCQ" else None
    tsa.option_id = answer if session_question.question.type == "MCQ" else None
    tsa.save()
    return {"success": True, "message": "Answer saved successfully."}


def save_assessment_answer(user, question_id, answer):
    try:
        question = Question.objects.get(id=question_id)
        session = AssessmentSession.objects.get(
            user=user,
            content_type=question.content_type,
            object_id=question.assessment_object.id,
        )
        session_ans, _ = AssessmentAnswer.objects.get_or_create(
            session=session, question=question
        )
        session_ans.input = answer if question.type != "MCQ" else None
        session_ans.option_id = answer if question.type == "MCQ" else None
        session_ans.save()
    except Question.DoesNotExist:
        raise NoQuestionError("Question with this ID does not exist")
    except AssessmentSession.DoesNotExist:
        raise NoAssessmentSessionError()

    return {"success": True, "message": "Answer saved successfully."}


def _mark_test_answer(test_answer: TestSessionAnswer):
    question = test_answer.session_question.question

    if question.type == "MCQ":
        correct_option = Option.objects.get(question=question, is_correct=True)
        if test_answer.option_id == correct_option.id:
            test_answer.is_correct = True
        else:
            test_answer.is_correct = False

        test_answer.save()

    elif question.type == "FIB":
        # TODO: Mutate model to allow FIB questions to have multiple allowed answers (besides case-sensitivity)

        correct_answer = question.correct_answer.strip().lower()
        if test_answer.input.strip().lower() == correct_answer:
            test_answer.is_correct = True
        else:
            test_answer.is_correct = False

        test_answer.save()

    elif question.type == "TF":
        correct_answer = str(question.is_true).lower()
        if test_answer.input == correct_answer:
            test_answer.is_correct = True
        else:
            test_answer.is_correct = False

        test_answer.save()

    else:
        logger.error("Invalid question type found: %s" % question.type)


def _mark_assessment_answer(assessment_answer: AssessmentAnswer):
    question = assessment_answer.question

    if question.type == "MCQ":
        try:
            correct_option = Option.objects.get(question=question, is_correct=True)
            if assessment_answer.option_id == correct_option.id:
                assessment_answer.is_correct = True
            else:
                assessment_answer.is_correct = False
        except Option.DoesNotExist:
            raise NoCorrectOptionError()

        assessment_answer.save()

    elif question.type == "FIB":
        # TODO: Mutate model to allow FIB questions to have multiple allowed answers (besides case-sensitivity)

        correct_answer = question.correct_answer.strip().lower()
        if assessment_answer.input.strip().lower() == correct_answer:
            assessment_answer.is_correct = True
        else:
            assessment_answer.is_correct = False

        assessment_answer.save()

    elif question.type == "TF":
        correct_answer = str(question.is_true).lower()
        if assessment_answer.input == correct_answer:
            assessment_answer.is_correct = True
        else:
            assessment_answer.is_correct = False

        assessment_answer.save()

    else:
        logger.error("Invalid question type found: %s" % question.type)


@transaction.atomic
def update_lesson_assessment(lesson, questions, request):

    results = []

    for q_item in questions:
        question_id = q_item.get("id")

        if question_id:
            try:
                question = Question.objects.get(id=question_id)
                serializer = QuestionSerializer(
                    question, data=q_item, partial=True, context={"request": request}
                )
            except Question.DoesNotExist:
                raise NoQuestionError(f"Question with ID {question_id} does not exist")
        else:
            q_item["assessment_type_input"] = request.data.get("assessment_type_input")
            q_item["lesson_id"] = lesson.id
            serializer = QuestionSerializer(data=q_item, context={"request": request})

        serializer.is_valid(raise_exception=True)
        instance = serializer.save()
        results.append(QuestionSerializer(instance).data)

    return results


@transaction.atomic
def update_course_assessment(course, questions, request):
    results = []

    for q_item in questions:
        question_id = q_item.get("id")
        if question_id:
            try:
                question = Question.objects.get(id=question_id)
                serializer = QuestionSerializer(
                    question, data=q_item, partial=True, context={"request": request}
                )
            except Question.DoesNotExist:
                return Response(
                    {"error": f"Question with ID {question_id} does not exist"}
                )
        else:
            q_item["assessment_type_input"] = request.data.get("assessment_type_input")
            q_item["course_id"] = course.id
            serializer = QuestionSerializer(data=q_item, context={"request": request})

        serializer.is_valid(raise_exception=True)
        instance = serializer.save()
        results.append(QuestionSerializer(instance).data)

    return results
