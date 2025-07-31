import logging
import random

from django.db import transaction
from django.contrib.contenttypes.models import ContentType

from assessments.models import (Question, TestAssessment, TestBlueprint,
                                TestSession, TestSessionQuestion)

logger = logging.getLogger(__name__)
TOTAL_QUESTIONS_PER_SESSION = 15


def start_test_session(user, category, difficulty):
    with transaction.atomic():
        test_assessment = TestAssessment.objects.get(category=category)
        test_blueprint = TestBlueprint.objects.get(
            test_assessment=test_assessment, difficulty=difficulty
        )
        logger.info("TestBlueprint rules type: %s", type(test_blueprint.rules))

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