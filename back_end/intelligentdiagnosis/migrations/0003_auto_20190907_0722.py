# -*- coding: utf-8 -*-
# Generated by Django 1.11.15 on 2019-09-07 07:22
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('intelligentdiagnosis', '0002_auto_20190907_0545'),
    ]

    operations = [
        migrations.RenameField(
            model_name='freehandmeasurementinfo',
            old_name='freehand_time',
            new_name='freehand_add_time',
        ),
        migrations.AddField(
            model_name='freehandmeasurementinfo',
            name='freehand_mod_time',
            field=models.DateTimeField(auto_now=True),
        ),
    ]