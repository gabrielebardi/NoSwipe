# Generated by Django 5.0 on 2024-12-18 12:42

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("core", "0003_alter_user_location"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="dislikes",
            field=models.JSONField(blank=True, default=list),
        ),
        migrations.AddField(
            model_name="user",
            name="likes",
            field=models.JSONField(blank=True, default=list),
        ),
    ]
