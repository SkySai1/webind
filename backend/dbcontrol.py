import hashlib
import secrets
import string
from flask import request, render_template, session

import MySQLdb
import MySQLdb.cursors
from pkg_resources import require
import yaml
import os
import sys  
from sqlalchemy import Column, ForeignKey, Integer, String  
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import relationship  
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

#Функция подключения к БД
def connect_db(app):
	if os.path.exists('db.yaml'):
		with open('db.yaml') as stream:
				file = yaml.safe_load(stream)
		try:
			app.config['MYSQL_HOST'] = file['hostname']
			app.config['MYSQL_PORT'] = file['port']
			app.config['MYSQL_DB'] = file['name']
			app.config['MYSQL_USER'] = file['dbuser']
			app.config['MYSQL_PASSWORD'] = file['dbpass']
			return app
		except:
			return False
	return False

Base = declarative_base()


class NewUser(Base):  
    __tablename__ = "Users" 
    
    id = Column(Integer, primary_key=True)  
    username = Column(String(255), nullable=False, unique=True)  
    password = Column(String(255), nullable=False)  
    role = Column(String(255))
    #email = Column(String(255))
    def __repr__(self):
        return f"Webind(id={self.id!r}, username={self.username!r}, password={self.password!r}, role={self.role!r})"


#Фукнкция создания БД sql lite
def create_sqlite_db():
    try:
        hashpass = hashlib.sha1(request.form['sapass'].encode()).hexdigest()
        dbname = request.form['dbname']
        engine = create_engine(f'sqlite:///bases/{dbname}.db')
        engine.connect()
        if 'create' in request.form:
            Base.metadata.create_all(engine)
            cursor = engine.connect()
            answer = cursor.execute("select * from Users limit 1")
            result = answer.fetchone()
            if not result:
                with Session(engine) as session:
                    superadmin = NewUser(username=request.form['sauser'], password=hashpass, role="superadmin") 
                    session.add(superadmin) 
                    session.commit()
            else:
                return 'table_exist'
    except:
        return 'create_bad'
    dbtype='sqlite'
    to_yaml = {'type': dbtype, 'dbname': dbname}
    with open('db.yaml','w+') as fstream:
        yaml.dump(to_yaml, fstream, default_flow_style=False)
        fstream.close()
    if 'create' in request.form:
        return 'create_scuess'
    return 'connection_sucess'


#Функция создания файла конфигурации БД mysql
def create_sql_db():  
    try: 
        type=request.form['dbtype'].lower()
        host=request.form['hostname']
        port=int(request.form['port'])
        db=request.form['dbname']
        user=request.form['dbuser']
        passwd=request.form['dbpass']
        if type == 'mysql': driver = 'mysql+pymysql'
        elif type == 'postgresql': driver = 'postgresql+psycopg2'
        engine = create_engine(f'{driver}://{user}:{passwd}@{host}:{port}/{db}')
        engine.connect()
        if 'create' in request.form:
            cursor = engine.connect()
            answer = cursor.execute("SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME='Users';")
            result = answer.fetchone()
            if not result:
                try:
                    Base.metadata.create_all(engine)
                    username = request.form['sauser']
                    hashpass = hashlib.sha1(request.form['sapass'].encode()).hexdigest()
                    with Session(engine) as session:
                        superadmin = NewUser(username=username, password=hashpass, role="superadmin") 
                        session.add(superadmin) 
                        session.commit()
                except Exception as e:				
                    #return 'create_bad'
                    return(str(e))
            else:
                return 'table_exist'
        to_yaml = {'type': type, 'hostname': host,
                    'port': port, 'name': db, 'dbuser': user,
                    'dbpass': passwd}
        with open('db.yaml','w+') as fstream:
            yaml.dump(to_yaml, fstream, default_flow_style=False)
            fstream.close()
        if 'create' in request.form:
            return 'create_scuess'
        return 'connection_sucess'
    except:
        return 'bad_connect'

#Функция выбора и настройки параметров БД
def setup_db():
    newdb = secrets.token_hex()
    return render_template('db.html',dbname = newdb)

#Фукнция добавления нового пользователя
def user_add(dbsql):
    try:
        if 'superadmin' in session.get('role'):
            if not request.form.get('username') or not request.form.get('passwd'): return 'empty_login'
            if 'superadmin' == request.form.get('role'): role = 'superadmin'
            elif 'admin' == request.form.get('role'): role = 'admin'
            elif 'user' == request.form.get('role'): role = 'user'
            else: return 'bad_role'
            hashpass = hashlib.sha1(request.form['passwd'].encode()).hexdigest()
            connect = dbsql.session()
            try: 
                user = NewUser(username=request.form['username'], password=hashpass, role=role) 
                connect.add(user) 
                connect.commit()
            except: return 'user_exist'
            return 'add_sucess'
    except: return 'add_failure'