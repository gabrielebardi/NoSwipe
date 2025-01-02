from django.db import migrations

class Migration(migrations.Migration):
    dependencies = [
        ('core', '0006_sync_username_email'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='user',
            name='username',
        ),
    ] 