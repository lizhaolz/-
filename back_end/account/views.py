from django.shortcuts import HttpResponse
from django.shortcuts import render, redirect
from account import models
from account.forms import LoginForm, RegisterForm
import os
import re

# Create your views here.

def adminIndex(request):

    return render(request, 'adminIndex.html')

def login(request):
    if request.session.get('is_login', None):
        return redirect('/index/')

    if request.method == 'POST':
        login_form = LoginForm(request.POST)
        message = '请检查填写内容'

        if login_form.is_valid():
            username = login_form.cleaned_data['username']
            password = login_form.cleaned_data['password']

            try:
                user = models.User.objects.get(name=username)

                if user.password == password:
                    request.session['is_login'] = True
                    request.session['user_id'] = user.id
                    request.session['user_name'] = user.name
                    return redirect('/index/')

                else:
                    message = '密码错误'

            except Exception as e:
                print(e)
                message = '用户不存在'
            login_form = LoginForm()
            return render(request, 'adminIndex.html', {'message': message,'login_form': login_form})
            # return render(request, 'login.html', {'message': message,'login_form': login_form})

    login_form = LoginForm()
    return render(request, 'login.html', {'login_form': login_form})


def register(request):
    if request.session.get('is_login', None):
        return redirect('/index/')

    if request.method == 'POST':
        register_form = RegisterForm(request.POST)

        if register_form.is_valid():
            username = register_form.cleaned_data['username']
            password1 = register_form.cleaned_data['password1']
            password2 = register_form.cleaned_data['password2']
            email = register_form.cleaned_data['email']
            sex = register_form.cleaned_data['sex']

            if password1 != password2:
                message = '两次密码不正确,请重新输入'
                return render(request, 'register.html', {'message': message})
            else:
                same_name_user = models.User.objects.filter(name=username)
                if same_name_user:
                    message = '用户名存在，请重新输入'
                    register_form = RegisterForm()
                    return render(request, 'register.html', {'message': message,'register_form': register_form})

                same_email_user = models.User.objects.filter(email=email)

                if same_email_user:
                    message = '邮箱已经被注册，请重新输入'
                    register_form = RegisterForm()
                    return render(request, 'register.html', {'message': message,'register_form': register_form})

                new_user = models.User.objects.create()
                new_user.name = username
                new_user.password = password1
                new_user.email = email
                new_user.sex = sex
                new_user.save()

                # return redirect('/login')
                return redirect('/adminIndex')

    register_form = RegisterForm()
    return render(request, 'register.html', {'register_form': register_form})


def logout(request):
    if not request.session.get('is_login', None):
        return redirect('login/')

    request.session.flush()  # flush清空session
    return redirect('index/')
