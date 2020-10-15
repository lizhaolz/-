#!/usr/bin/env python
# -*- coding: utf-8 -*-
# @Time    : 2018/9/3 21:14
# @Author  : Lijinjin
# @Site    : 
# @File    : forms.py
# @Software: PyCharm

# 本文件专门创建与form相关的文件

# from django import forms as dforms
# from django.forms import fields
# from account import models
#
# # 创建此对象之后，具有自动生成HTML的功能  默认关键词与添加页面的值相同，便于在添加后台赋值
# class UserForm(dforms.Form):
#     user = fields.CharField()
#     age = fields.IntegerField()
#     gender = fields.BooleanField()
#     cs = fields.CharField()
#     # email = fields.EmailField()
#
# class depForm(dforms.Form):
#     dep_name = fields.CharField()
#     depUser = fields.ChoiceField(
#     )


from django import forms
# from captcha.fields import CaptchaField


class LoginForm(forms.Form):
    username = forms.CharField(label='用户名', max_length=128, widget=forms.TextInput(attrs={'class': 'form-control'}))
    password = forms.CharField(label='密码', max_length=256, widget=forms.PasswordInput(attrs={'class': 'form-control'}))
    # captcha = CaptchaField(label='验证码')


class RegisterForm(forms.Form):
    gender = (
        ('male', '男'),
        ('female', '女')
    )
    username = forms.CharField(label='用户名', max_length=128, widget=forms.TextInput(attrs={'class': 'form-control'}))
    password1 = forms.CharField(label='密码', max_length=256, widget=forms.PasswordInput(attrs={'class': 'form-control'}))
    password2 = forms.CharField(label='确认密码', max_length=256,
                                widget=forms.PasswordInput(attrs={'class': 'form-control'}))
    email = forms.EmailField(label='邮箱', widget=forms.EmailInput(attrs={'class': 'form-control'}))
    sex = forms.ChoiceField(label='性别', choices=gender)
    # captcha = CaptchaField('验证码')


#
