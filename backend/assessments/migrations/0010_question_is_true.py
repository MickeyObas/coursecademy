# Generated by Django 5.1.6 on 2025-07-17 19:22

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("assessments", "0009_option_created_at_option_updated_at_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="question",
            name="is_true",
            field=models.BooleanField(default=True),
        ),
    ]
