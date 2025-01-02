from django.db import migrations

def sync_usernames_with_emails(apps, schema_editor):
    User = apps.get_model('core', 'User')
    for user in User.objects.all():
        user.username = user.email
        user.save()

def reverse_sync(apps, schema_editor):
    pass  # We don't want to reverse this migration

class Migration(migrations.Migration):
    dependencies = [
        ('core', '0005_remove_photo_image_url_photo_image'),
    ]

    operations = [
        migrations.RunPython(sync_usernames_with_emails, reverse_sync),
    ] 