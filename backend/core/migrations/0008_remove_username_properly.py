from django.db import migrations

class Migration(migrations.Migration):
    dependencies = [
        ('core', '0007_remove_username'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='user',
            options={'verbose_name': 'User', 'verbose_name_plural': 'Users'},
        ),
        migrations.AlterModelManagers(
            name='user',
            managers=[],
        ),
    ] 