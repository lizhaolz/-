#!/usr/bin/env python
# -*- coding: utf-8 -*-

'''
@author: zhaoyh
@contact: 1028728923@qq.com
@file: PACS.py
@time: 2018/8/30 15:13
@desc:
'''

import urllib.request
import urllib.parse
import urllib.error


class PACS(object):

    def __init__(self, pacs_url, aet):
        self.pacs_url = pacs_url
        self.aet = aet

    def query(self, url, params):
        if params is None:
            pass
        else:
            url += '?' + urllib.parse.urlencode(params)
        print(url)

        headers = {'accept': 'application/dicom+json'}
        requests = urllib.request.Request(url, headers=headers)

        try:
            data = urllib.request.urlopen(requests).read().decode('utf-8')
        except urllib.error.HTTPError as e:
            print(str(e.getcode()) + ' Request error: ' + e.reason)
            return None
        return data

    def retrieve(self, url, headers):
        requests = urllib.request.Request(url, headers=headers)

        try:
            data = urllib.request.urlopen(requests).read()
        except urllib.error.HTTPError as e:
            print(str(e.getcode()) + ' Request error: ' + e.reason)
            return None
        return data

    def store(self, url, data):
        if data is None:
            return "Error！"

        headers = {'accept': 'application/dicom+json'}
        requests = urllib.request.Request(url, headers=headers, data=data)

        try:
            data = urllib.request.urlopen(requests).read().decode('utf-8')
        except urllib.error.HTTPError as e:
            print(str(e.getcode()) + ' Request error: ' + e.reason)
            return None
        return data

    def queryStudies(self, params):
        url = '%saets/%s/rs/studies' % (self.pacs_url, self.aet)
        return self.query(url, params)

    def querySeries(self, params=None):
        url = '%saets/%s/rs/series' % (self.pacs_url, self.aet)
        return self.query(url, params)

    def queryPatients(self, params=None):
        url = '%saets/%s/rs/patients' % (self.pacs_url, self.aet)
        return self.query(url, params)

    def queryInstances(self, params=None):
        url = '%saets/%s/rs/instances' % (self.pacs_url, self.aet)
        return self.query(url, params)

    def queryInstancesOfStudy(self, studyUID, params=None):
        url = '%saets/%s/rs/studies/%s/instances' % (self.pacs_url, self.aet, studyUID)
        return self.query(url, params)

    def querySeriesOfStudy(self, studyUID, params=None):
        url = '%saets/%s/rs/studies/%s/series' % (self.pacs_url, self.aet, studyUID)
        return self.query(url, params)

    def queryInstancesOfSeriesOfStudy(self, studyUID, SeriesUID, params=None):
        url = '%saets/%s/rs/studies/%s/series/%s/instances' % (self.pacs_url, self.aet, studyUID, SeriesUID)
        return self.query(url, params)

    def retrieveStudy(self, studyUID):
        url = '%saets/%s/rs/studies/%s' % (self.pacs_url, self.aet, studyUID)
        headers = {'accept': 'application/zip'}
        return self.retrieve(url, headers)

    def retrieveSeries(self, studyUID, seriesUID):
        url = '%saets/%s/rs/studies/%s/series/%s' % (self.pacs_url, self.aet, studyUID, seriesUID)
        headers = {'accept': 'application/zip'}
        return self.retrieve(url, headers)

    def retrieveInstance(self, studyUID, seriesUID, instanceUID):
        url = '%saets/%s/wado?requestType=WADO&studyUID=%s&seriesUID=%s&objectUID=%s&contentType=application/dicom' % (
        self.pacs_url, self.aet, studyUID, seriesUID, instanceUID)
        headers = {}
        return self.retrieve(url, headers)

    def retrieveInstanceThumbnail(self, studyUID, seriesUID, instanceUID):
        url = '%saets/%s/wado?requestType=WADO&studyUID=%s&seriesUID=%s&objectUID=%s&contentType=image/jpeg' % (
        self.pacs_url, self.aet, studyUID, seriesUID, instanceUID)
        headers = {}
        return self.retrieve(url, headers)

    def retrieveFrames(self, studyUID, seriesUID, instanceUID, frameList):
        url = '%saets/%s/rs/studies/%s/series/%s/instances/%s/frames/%s' % (
            self.pacs_url, self.aet, studyUID, seriesUID, instanceUID, frameList)
        headers = {'accept': 'multipart/related;type=application/octet-stream'}
        return self.retrieve(url, headers)

    def retrieveStudyMetadata(self, studyUID):
        url = '%saets/%s/rs/studies/%s/metadata' % (self.pacs_url, self.aet, studyUID)
        headers = {'accept': 'application/dicom+json'}
        return self.retrieve(url, headers).decode('utf-8')

    def retrieveSeriesMetadata(self, studyUID, seriesUID):
        url = '%saets/%s/rs/studies/%s/series/%s/metadata' % (self.pacs_url, self.aet, studyUID, seriesUID)
        headers = {'accept': 'application/dicom+json'}
        return self.retrieve(url, headers).decode('utf-8')

    def retrieveInstanceMetadata(self, studyUID, seriesUID, instanceUID):
        url = '%saets/%s/rs/studies/%s/series/%s/instances/%s/metadata' % (
        self.pacs_url, self.aet, studyUID, seriesUID, instanceUID)
        headers = {'accept': 'application/dicom+json'}
        return self.retrieve(url, headers).decode('utf-8')
