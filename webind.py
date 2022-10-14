#!flask/bin/python3
from nis import match
import os
import pwd
import secrets
from flask import Flask, template_rendered, url_for, request, render_template, redirect, session, abort
from werkzeug.utils import secure_filename
from flask_mysqldb import MySQL
from jinja2 import TemplateNotFound
from flask_sqlalchemy import SQLAlchemy

## Подключаем наш файл с функциями
from backend.function import *
from backend.dbcontrol import *
from backend.sshjob import *
from backend.servcontrol import *

#Создаём объект Flask
app = Flask(__name__)

#Ключ Нужен для создании сессии:
app.config['SECRET_KEY'] = secrets.token_hex()

#Вносим значения для последующей инициализации подключения к MySQL
if os.path.exists('db.yaml'):
	try:
		with open('db.yaml') as stream:
			file = yaml.safe_load(stream)
		if 'mysql' in file['type'] or 'postgresql' in file['type']:
			dbtype = file['type']
			if dbtype == 'mysql': driver = 'mysql+pymysql'
			elif dbtype == 'postgresql': driver = 'postgresql+psycopg2'
			host = file['hostname']
			port = int(file['port'])
			dbname = file['name']
			dbuser = file['dbuser']
			dbpass = file['dbpass']
			app.config['SQLALCHEMY_DATABASE_URI'] = f'{driver}://{dbuser}:{dbpass}@{host}:{port}/{dbname}'
		elif 'sqlite' in file['type']:
			dbname = file['dbname']
			dbpath = os.path.abspath(f"./bases/{dbname}.db")
			app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{dbpath}'
		app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = 'False'
		dbsql = SQLAlchemy(app)
		dbsql.session.execute
	except:
		dbsql = None
else: dbsql = None

##!-- Сегмент адресации
@app.route('/', methods=['GET','POST'])
def index():
	try:
		#Блок: Пост-запрос, ДБ НЕ настроена, Вход НЕ произведен
		if 'POST' in request.method and 'status' in request.form and not dbsql and 'loggedin' not in session:
			if 'sqlsetup' == request.form.get('status'):
				return create_sql_db()
			elif 'sqlitesetup' == request.form.get('status'):
				return create_sqlite_db()
			elif 'restart' == request.form.get('status'):
				return restart()
		#Блок: Пост-запрос, ДБ настроена, Вход произведен
		elif 'POST' in request.method and 'status' in request.form and dbsql and 'loggedin' in session:
			if 'filecheck' == request.form.get('status'):
				return configurate()
			elif 'logout' == request.form.get('status'):
				session.pop('loggedin', None)
				return show_the_login_form()
			elif 'useradd' == request.form.get('status'):
				return user_add(dbsql)
			elif 'userchange' == request.form.get('status'):
				return user_change(dbsql)
			elif 'userdel' == request.form.get('status'):
				return user_delete(dbsql)
			elif 'userfind' == request.form.get('status'):
				return user_find(dbsql)
			elif 'server' == request.form.get('status'):
				return server(dbsql)
		#Блок: Пост-запрос, ДБ настроена, Вход НЕ произведен
		elif 'POST' in request.method and 'status' in request.form and dbsql and 'loggedin' not in session:
			if  'login' == request.form.get('status'):
				if 'username' in request.form and 'password' in request.form:
					return do_the_login(request.form['username'],request.form['password'],dbsql)
		#Блок: Гет-запрос, ДБ настроена, Вход НЕ произведён
		elif dbsql and 'loggedin' not in session:
			return show_the_login_form()
		#Блок: Гет-запрос, ДБ НЕ настроена, Вход НЕ произведён
		elif 'GET' in request.method and not dbsql and 'loggedin' not in session:
			return setup_db()
		#Блок: Гет-запрос, ДБ настроена, Вход произвёден
		elif 'GET' in request.method and dbsql and 'loggedin' in session:
			return main_page()
		#Блок: Остальное
		return render_template('404.html'), 404
	except TemplateNotFound:
		abort(404)
#404
@app.errorhandler(404)
def page_not_found(e):
	return render_template('404.html'), 404

#Тестовая страница
@app.route('/test', methods=['GET','POST'])
def test():
	if request.method == 'POST':
		return testpage()
	return render_template('test.html')
#--!

#Рзмещается в конце
if __name__ == '__main__':
	
	app.debug = True
	app.use_debugger = True
	app.run('0.0.0.0',5000)

