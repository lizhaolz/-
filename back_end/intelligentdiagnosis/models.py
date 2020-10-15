from django.db import models
from django.utils import timezone

# Create your models here.


class IntelligentDiagnosisInfo(models.Model):
    diagnosis_id = models.IntegerField(primary_key=True)
    diagnosis_studyUID = models.CharField(max_length=255)
    diagnosis_seriesUID = models.CharField(max_length=255)
    diagnosis_algorithm = models.CharField(max_length=255)
    diagnosis_time = models.DateTimeField(default=timezone.now)
    diagnosis_info = models.TextField()


class FreehandMeasurementInfo(models.Model):
    freehand_id = models.IntegerField(primary_key=True)
    freehand_studyUID = models.CharField(max_length=255)
    freehand_seriesUID = models.CharField(max_length=255)
    freehand_add_time = models.DateTimeField(default=timezone.now)
    freehand_mod_time = models.DateTimeField(auto_now = True)
    freehand_info = models.TextField()
