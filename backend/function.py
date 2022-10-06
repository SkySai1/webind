from ast import Return
import hashlib
import socket
import sys
from flask import Flask, render_template, session, redirect, url_for, request, flash, escape
from flask_mysqldb import MySQL
from jinja2 import *
import MySQLdb
import MySQLdb.cursors
import os
import yaml
import subprocess
import re
from subprocess import PIPE

def restart():
	os.execv(sys.argv[0], sys.argv)

#Login
#Функция осуществления входа, получаем на приём - логин, пароль и объект инициализированной базы данных
def do_the_login(username,password,dbsql):
	#Испольуем объект cursor который позволяет выполнять команды MySQL
	#MySQLdb.cursors.DictCursor - обязательная опция для правильного формата ответа
	try:
		query = dbsql.session()
		#Выполняем саму команду
		pass_hash = hashlib.sha1(password.encode()).hexdigest()
		if 'postgresql' in str(dbsql):
			answer = query.execute(f"SELECT * FROM \"users\" WHERE username = '{username}' AND password = '{pass_hash}'")
		else:
			answer = query.execute(f"SELECT * FROM users WHERE username = '{username}' AND password = '{pass_hash}'")
		account = None
		for row in answer: account = row
		if account:
			#Создаим сессионные пременные на основе данных из вывода MySQL
			session['loggedin'] = True
			session['id'] = account['id']
			session['username'] = account['username']
			session['role'] = account['role']
			return 'ok'
		else:
			return 'badpass'
	except Exception as e:
		return (str(e))
		return ('baddb')

#Функция вывода формы вход
def show_the_login_form():
	return render_template('login.html')

#Функция предварительной загрузки главной страницы
def main_page():
	return render_template('index.html')

def add_server():
	if config_check() is False:
		return render()
	with open('config.yaml') as f:
		config = yaml.safe_load(f)
	error = []
	for key, value in config.items():
		if not key == 'version' and not key == 'hostname' and not os.access(value, os.R_OK):
			error.append(value)
	if error:
		return render_template('index.html',access_error = error)
#Функция проверки config.yaml
def config_check():
	if not os.path.exists('config.yaml'):
		return False
	with open('./config.yaml','r') as stream:
		try:
			file = yaml.safe_load(stream)
			if ("\'named.conf\'" and "\'rndc.key\'" and "\'named\'" 
			and "\'rndc\'" and "\'named-checkzone\'" and "\'named-checkconf\'"
			and "\'named-compilezone\'" and "\'work_directory\'" and "\'cache_directory\'"
			and "\'version\'" and "\'hostname\'") in str(file.keys()):
				return True
			else:
				return False
		except:
			return False


#функция поиска файлов Bind9
def render():
	#Поиск файла named.conf 
	named_conf = seeker('named.conf','/')

	#Поиск файла rndc.key
	rndc_key = seeker('rndc.key','/')
	
	#Поиск исполняемого файла named
	named = seeker('named','/usr/')

	#Поиск исполняемого файла rndc
	rndc = seeker('rndc','/usr/')
	
	#Поиск исполняемого файла named-checkzone
	named_checkzone = seeker('named-checkzone', '/usr/')

	#Поиск исполняемого файла named-checkconf
	named_checkconf = seeker('named-checkconf','/usr/')

	#Поиск исполняемого файла named-compilezone
	named_compilezone = seeker('named-compilezone','/usr/')

	finder = {'named.conf': named_conf, 'rndc.key': rndc_key, 'named': named, 'rndc': rndc,  'named-checkzone': named_checkzone, 'named-checkconf': named_checkconf, 'named-compilezone':named_compilezone }
	return render_template('setup.html',finder = finder)

#Поисковик
def seeker(fname,path):
	result = []
	for root, dirs, files in os.walk(path):
		if fname in files:
			result.append(os.path.join(root, fname))
	return result

#Функция проверки и конфигурации файлов
def configurate():
	nconf = request.form['named.conf']
	rndc_key = request.form['rndc.key']
	named = request.form['named']
	rndc = request.form['rndc']
	n_checkzone = request.form['named-checkzone']
	n_checkconf = request.form['named-checkconf']
	n_compilezone = request.form['named-compilezone']
	dbind = '/etc/bind/'
	dbcache = '/var/cache/bind/'
	result = []
	#Проверка рабочих директорий
	if os.access(dbind, os.R_OK | os.W_OK |os.X_OK) is False:
		result.append('Директория:\t\t'+dbind)
	if os.access(dbcache, os.R_OK | os.W_OK |os.X_OK) is False:
		result.append('Директория:\t\t'+dbcache)

	#Последовательно проверяем доступность файлов

	if os.access(nconf, os.W_OK | os.R_OK) is False:
		result.append('Файл:\t\t\t'+nconf)
	if os.access(rndc_key, os.W_OK | os.R_OK) is False:
		result.append('Файл:\t\t\t'+rndc_key)
	if os.access(named, os.R_OK | os.X_OK) is False:
		result.append('Файл:\t\t\t'+named)
	if os.access(rndc, os.R_OK | os.X_OK) is False:
		result.append('Файл:\t\t\t'+rndc)
	if os.access(n_checkzone, os.R_OK | os.X_OK) is False:
		result.append('Файл:\t\t\t'+n_checkzone)
	if os.access(n_checkconf, os.R_OK | os.X_OK) is False:
		result.append('Файл:\t\t\t'+n_checkconf)
	if os.access(n_compilezone, os.R_OK | os.X_OK) is False:
		result.append('Файл:\t\t\t'+n_compilezone)


	if result:
		output = ''
		for path in result:
			output += path+'\n'
		return output
	else:	
		vers = "".join(re.sub(r'<.*>\s','', runcommand('named', '-v'), re.M).rstrip())
		hostname = socket.gethostname()
		to_yaml = {'named.conf': nconf, 'rndc.key': rndc_key, 'named': named, 
				'rndc': rndc, 'named-checkzone': n_checkzone, 
				'named-checkconf': n_checkconf, 'named-compilezone': n_compilezone,
				'work_directory': dbind, 'cache_directory': dbcache, 'version': vers,
				'hostname': hostname}
		
		with open('config.yaml','w+') as fstream:
			yaml.dump(to_yaml, fstream, default_flow_style=False)
			fstream.close()
		return ('',204)

def runcommand(cmd, args):
	if args:
		result = subprocess.run([str(cmd), str(args)], stdout=PIPE, stderr=PIPE)
	else:
		result = subprocess.run([str(cmd)], stdout=PIPE, stderr=PIPE)
	
	return result.stdout.decode('utf-8')

def testpage():
	if 'dbtype' in request.form:
		return request.form.get('dbtype').lower()
	return 'Nothing'