# Generated by Django 5.0 on 2024-12-18 12:07

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("core", "0002_alter_photo_options_alter_user_options_and_more"),
    ]

    operations = [
        migrations.AlterField(
            model_name="user",
            name="location",
            field=models.TextField(blank=True, max_length=500, null=True),
        ),
    ]