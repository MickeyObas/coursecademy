# Generated by Django 5.1.6 on 2025-07-19 13:49

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("assessments", "0017_alter_question_is_true"),
    ]

    operations = [
        migrations.AlterField(
            model_name="question",
            name="is_true",
            field=models.BooleanField(blank=True, null=True),
        ),
    ]
