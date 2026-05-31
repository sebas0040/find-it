from django.contrib.postgres.indexes import GistIndex
from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("stores", "0001_initial"),
    ]

    operations = [
        migrations.AddIndex(
            model_name="store",
            index=GistIndex(fields=["location"], name="stores_stor_locatio_3e1221_gist"),
        ),
    ]
