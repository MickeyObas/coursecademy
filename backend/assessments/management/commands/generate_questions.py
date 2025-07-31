import json
import os

from django.contrib.contenttypes.models import ContentType
from django.core.management.base import BaseCommand

from assessments.models import Option, Question, TestAssessment
from categories.models import Category


class Command(BaseCommand):
    help = (
        "Generate questions from a JSON file under TestAssessment ID 1, Category ID 4"
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--file",
            type=str,
            default="assessments/data/web_development_questions.json",
            help="Path to the JSON file containing questions",
        )

    def handle(self, *args, **options):
        json_file = options["file"]
        file_path = os.path.abspath(json_file)

        if not os.path.exists(file_path):
            self.stderr.write(self.style.ERROR(f"❌ JSON file not found: {file_path}"))
            return

        try:
            with open(file_path, "r") as f:
                question_bank = json.load(f)
        except Exception as e:
            self.stderr.write(self.style.ERROR(f"❌ Error reading JSON: {e}"))
            return

        try:
            category = Category.objects.get(id=4)
            test_assessment = TestAssessment.objects.get(id=1)
            content_type = ContentType.objects.get_for_model(TestAssessment)
        except Category.DoesNotExist:
            self.stderr.write(self.style.ERROR("Category with ID 4 not found."))
            return
        except TestAssessment.DoesNotExist:
            self.stderr.write(self.style.ERROR("TestAssessment with ID 1 not found."))
            return

        created = 0

        for q_data in question_bank:
            q_type = q_data.get("type")
            text = q_data.get("text")

            if not q_type or not text:
                continue

            try:
                question = Question.objects.create(
                    object_id=test_assessment.id,
                    content_type=content_type,
                    category=category,
                    text=text,
                    type=q_type,
                    difficulty=q_data.get("difficulty", "EASY"),
                    is_true=q_data.get("is_true"),
                    correct_answer=q_data.get("correct_answer"),
                )

                if q_type == Question.QuestionTypes.MCQ:
                    options = q_data.get("options", [])
                    for opt in options:
                        Option.objects.create(
                            question=question,
                            text=opt["text"],
                            is_correct=opt["is_correct"],
                        )

                created += 1

            except Exception as e:
                self.stderr.write(
                    self.style.ERROR(
                        f"❌ Failed to create question: {text[:50]}... Error: {e}"
                    )
                )
                continue

        self.stdout.write(
            self.style.SUCCESS(
                f"✅ Successfully created {created} questions from {file_path}"
            )
        )
