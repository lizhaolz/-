from django.shortcuts import render
from django.shortcuts import HttpResponse
import os
import re


# Create your views here.
def adminIndex(request):
    return render(request, 'adminIndex.html')


def index(request):
    path = re.split('index/', request.path)[1]
    if path == '':
        return render(request, 'index.html')
    else:
        return render(request, path)

