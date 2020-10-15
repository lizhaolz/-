from django.db import models

# Create your models here.

class Patient(models.Model):
    primaryKey = models.AutoField(primary_key=True)
    patientID = models.CharField(max_length=128, blank=False)
    patientName = models.CharField(max_length=128, blank=True)
    patientSex = models.CharField(max_length=1,blank=True)
    patientBirthDate = models.CharField(max_length=128, blank=True)
    studyTime = models.CharField(max_length=128,blank=True)
    modality = models.CharField(max_length=128, blank=True)
    accessionNumber = models.CharField(max_length=128, default='')
    
    def __str__(self):
        return self.patientID
    
    class Meta:
        verbose_name = '病人信息'
        verbose_name_plural = '病人信息'


class Study(models.Model):
    studyId = models.AutoField(primary_key=True)
    studyInstanceUID = models.CharField(max_length=128, default='')
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name="patientinfo")
    studyDescription = models.TextField(blank=True)
    accessionID = models.CharField(max_length=128, default='')
    studyDate = models.CharField(max_length=128,blank=True)
    imageNum = models.PositiveIntegerField(default=0)

    class Meta:
        verbose_name = "诊断信息"
        verbose_name_plural = "诊断信息"


class Series(models.Model):
    seriersId = models.AutoField(primary_key=True)
    seriesInstanceUID = models.CharField(max_length=128)
    study = models.ForeignKey(Study, on_delete=models.CASCADE, related_name="studyinfo")
    seriesNumber = models.IntegerField()
    seriesDescription = models.TextField(blank=True)
    thumbnailImage = models.CharField(max_length=256, blank=True)

    class Meta:
        verbose_name = "序列信息"
        verbose_name_plural = "序列信息"


class Instance(models.Model):
    instanceNumber = models.PositiveIntegerField()
    sopInstanceUID = models.CharField(max_length=128, blank=True)
    series = models.ForeignKey(Series, on_delete=models.CASCADE, related_name="seriesinfo")

    class Meta:
        db_table = ''
        managed = True
        ordering = ['instanceNumber']
        verbose_name = '实例信息'
        verbose_name_plural = '实例信息'





