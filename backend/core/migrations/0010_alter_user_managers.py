# Generated by Django 5.0 on 2025-01-02 10:03

import core.models
from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("core", "0009_alter_photo_options_alter_user_managers_and_more"),
    ]

    operations = [
        migrations.AlterModelManagers(
            name="user",
            managers=[
                ("objects", core.models.UserManager()),
            ],
        ),
    ]
