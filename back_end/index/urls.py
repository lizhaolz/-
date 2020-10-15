import sys
sys.path.append('..')
from django.conf.urls import url
from . import views as index_views
from pacs import views as pacs_views
from intelligentdiagnosis import views as intelligentdiagnosis_views

urlpatterns = [
    url(r'^studylist$', pacs_views.studylist),
    url(r'^studies$', pacs_views.studies),
    url(r'^lungnoduleinfo$', intelligentdiagnosis_views.lung_nodule_info),
    url(r'^freehandmeasurementinfo$', intelligentdiagnosis_views.freehand_measurement_info),
    url(r'^', index_views.index),
    url(r'^dcm4chee-arc/aets/(?P<AET>.+)/wado$', pacs_views.retrieve_image),

]
