import logging
import random
from datetime import datetime
from pprint import pprint

from django.db import transaction
from django.contrib.contenttypes.models import ContentType

from assessments.models import (Question, Option, TestAssessment, TestBlueprint,
                                TestSession, TestSessionQuestion, TestSessionAnswer)

logger = logging.getLogger(__name__)
TOTAL_QUESTIONS_PER_SESSION = 15


def start_test_session(user, category, difficulty):
    with transaction.atomic():
        test_assessment = TestAssessment.objects.get(category=category)
        test_blueprint = TestBlueprint.objects.get(
            test_assessment=test_assessment, difficulty=difficulty
        )

        test_session = TestSession.objects.create(
            user=user,
            test_assessment=test_assessment,
            blueprint=test_blueprint,
        )

        content_type = ContentType.objects.get_for_model(TestAssessment)
        easy_count = round(test_blueprint.rules.get("easy", 0) * TOTAL_QUESTIONS_PER_SESSION)
        normal_count = round(test_blueprint.rules.get("normal", 0) * TOTAL_QUESTIONS_PER_SESSION)
        hard_count = TOTAL_QUESTIONS_PER_SESSION - (easy_count + normal_count)

        questions = list(
            Question.objects.filter(
                content_type=content_type,
                object_id=test_assessment.id,
            ).order_by('?')
        )

        questions_easy = [q for q in questions if q.difficulty == 'EASY'][:easy_count]
        questions_normal = [q for q in questions if q.difficulty == 'NORMAL'][:normal_count]
        questions_hard = [q for q in questions if q.difficulty == 'HARD'][:hard_count]

        selected_questions = questions_easy + questions_normal + questions_hard
        random.shuffle(selected_questions)

        for index, question in enumerate(selected_questions):
            TestSessionQuestion.objects.create(
                test_session=test_session,
                question=question,
                order=index+1,
                snapshot_text=question.text,
            )

        return test_session
    

def mark_test_session(user, session_id):
    test_session = TestSession.objects.get(
        user=user,
        id=session_id
        )
    
    try:
        test_session.submitted_at = datetime.now()
        test_session_answers= TestSessionAnswer.objects.filter(
            session_question__test_session=test_session
        )
        for test_answer in test_session_answers:
            _mark_test_answer(test_answer)
        
        test_session.status = TestSession.Status.SUBMITTED
        test_session.save()

    except Exception as e:
        logger.error("Error ----> %s" % str(e))
        test_session.status = TestSession.Status.ERROR
        test_session.save()


def _mark_test_answer(test_answer: TestSessionAnswer):
    question = test_answer.session_question.question

    if question.type == 'MCQ':
        correct_option = Option.objects.get(
            question=question,
            is_correct=True
        )
        if test_answer.option_id == correct_option.id:
            test_answer.is_correct = True
        else:
            test_answer.is_correct = False

        test_answer.save()

    elif question.type == 'FIB':
        # TODO: Mutate model to allow FIB questions to have multiple allowed answers (besides case-sensitivity)

        correct_answer = question.correct_answer.strip().lower()
        if test_answer.input.strip().lower() == correct_answer:
            test_answer.is_correct = True
        else:
            test_answer.is_correct = False
        
        test_answer.save()

    elif question.type == 'TF':
        correct_answer = str(question.is_true).lower()
        if test_answer.input == correct_answer:
            test_answer.is_correct = True
        else:
            test_answer.is_correct = False
        
        test_answer.save()

    else:
        logger.error("Invalid question type found: %s" % question.type)