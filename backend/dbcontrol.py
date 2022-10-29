from email.policy import default
import hashlib
import re
import secrets
import string
from flask import request, render_template, session, flash

import MySQLdb
import MySQLdb.cursors
from pkg_resources import require
import yaml
import os
import json
from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import relationship  
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session

### Раздел описания сущностей БД 
Base = declarative_base()
ServersBase = declarative_base()

class NewUser(Base):  
    __tablename__ = "users" 
    
    id = Column(Integer, primary_key=True)  
    username = Column(String(255), nullable=False, unique=True)  
    password = Column(String(255), nullable=False)  
    role = Column(String(255))
    email = Column(String(255))
    def __repr__(self):
        return f"Webind(id={self.id!r}, username={self.username!r}, password={self.password!r}, role={self.role!r})"

class ServList(ServersBase):
    __tablename__ = "server_list"
    
    id = Column(Integer, primary_key=True)
    hostname = Column(String(255), nullable=False)
    machine_id = Column(String(255), nullable=False, unique=True)
    username = Column(String(255), nullable=False)
    confpath = Column(String(255), nullable=False)
    workdirectory = Column(String(255), nullable=False)
    configured = Column(Boolean, default=False)
    
def dyntable(tbname):
    ServBase = declarative_base()
    class Dynamic(ServBase):
        __tablename__ = tbname
        id = Column(Integer, primary_key=True)
        config = Column(String(255), unique=True)
        value = Column(String(255))
    return Dynamic

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

#Фукнкция создания БД sql lite
def create_sqlite_db():
    try:
        dbname = request.form['dbname']
        engine = create_engine(f'sqlite:///bases/{dbname}.db')
        engine.connect()
        if 'create' in request.form:
            Base.metadata.create_all(engine)
            cursor = engine.connect()
            answer = cursor.execute("select * from users limit 1")
            result = answer.fetchone()
            if not result:
                if not request.form.get('sauser') or not request.form.get('sapass'):
                    return 'empty_login'
                hashpass = hashlib.sha1(request.form['sapass'].encode()).hexdigest()
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
            answer = cursor.execute("SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME='users';")
            result = answer.fetchone()
            if not result:
                if not request.form.get('sauser') or not request.form.get('sapass'):
                    return 'empty_login'
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
    except: return 'failure'
def user_change(dbsql):
    if 'superadmin' in session.get('role'):
        if 'change' == request.form.get('action'):
            username = request.form['username']
            if not request.form.get('username'): return 'empty_user'
            else:
                connect = dbsql.session()
                answer = connect.execute(f"SELECT username, id FROM users WHERE username = '{username}';")
                account = {}
                for row in answer: 
                    account['id'] = row['id']
                    account['username'] = row['username']
                if not account['username']: return 'bad_username'
                if account['id'] == 1: return 'sa_block'
            if 'on' == request.form.get('isnewpasswd') and not request.form.get('passwd'): return 'empty_field'
            elif 'on' == request.form.get('isnewusername') and not request.form.get('newusername'): return 'empty_field'
            elif 'on' == request.form.get('isnewrole') and not request.form.get('newrole'): return 'empty_field'
            success = False
            if 'on' == request.form.get('isnewpasswd'): 
                hashpass = hashlib.sha1(request.form['passwd'].encode()).hexdigest()
                try:
                    connect = dbsql.session()
                    connect.execute(f"UPDATE users SET password = '{hashpass}' WHERE username = '{username}';")
                    connect.commit()
                    success = True
                except: return 'failure'
            if 'on' == request.form.get('isnewrole'):
                if 'superadmin' == request.form.get('newrole'): role = 'superadmin'
                elif 'admin' == request.form.get('newrole'): role = 'admin'
                elif 'user' == request.form.get('newrole'): role = 'user'
                else: return 'bad_role'
                try:
                    connect = dbsql.session()
                    connect.execute(f"UPDATE users SET role = '{role}' WHERE username = '{username}';")
                    connect.commit()
                    success = True
                except: return 'failure'
            if 'on' == request.form.get('isnewusername'):
                newusername = request.form.get('newusername')
                try:
                    connect = dbsql.session()
                    connect.execute(f"UPDATE users SET username = '{newusername}' WHERE username = '{username}';")
                    connect.commit()
                    success = True
                except: return 'failure'
            if success is True: return 'change_success'
            else: return 'nothing_change'
    return 'failure'

def user_delete(dbsql):
    if 'superadmin' in session.get('role') and 'userdel' == request.form.get('action'):
        try:
            if not request.form.get('username'): return 'empty_user'
            connect = dbsql.session()
            username = request.form['username']
            answer = connect.execute(f"SELECT username, id FROM users WHERE username = '{username}';")
            account = {}
            for row in answer: 
                account['id'] = row['id']
                account['username'] = row['username']
            if not account['username']: return 'bad_username'
            if account['id'] == 1: return 'sa_block'
            connect.execute(f"DELETE FROM users WHERE username = '{username}';")
            connect.commit()
            return 'userdel_success'
        except: return 'failure'
    return 'failure'

def user_find(dbsql):
    if 'superadmin' in session.get('role'):
        try:
            if 'getuserlist' == request.form.get('action'):
                connect = dbsql.session()
                answer = connect.execute("SELECT username FROM users ORDER BY username;")
                result = answer.fetchall()
                out = []
                for user in result:
                    out.append(f"{user['username']}")
                return json.dumps({'usernames': out})
            elif not request.form.get('username'): return 'empty_user'
            return request.form.get('username')
        except: return 'failure'
    return 'failure'

def server_insertdb(dbsql, hostname, mid, user, confpath, wd):
    if 'superadmin' in session.get('role'):
        try:
            engine = dbsql.get_engine()
            ServersBase.metadata.create_all(engine)
            with Session(engine) as ses:
                serv = ServList(hostname=hostname, machine_id=mid, username=user, confpath=confpath, workdirectory=wd) 
                ses.add(serv)
                ses.commit()
            return 'serv_add_success'
        except Exception as e:
            print(e)
            if re.search('already exists', str(e)): return 'serv_exist'
            return 'failure'
    return 'failure'

def getservlist(dbsql):
    if 'superadmin' in session.get('role') or 'admin' in session.get('role'):
        try:
            engine = dbsql.get_engine()
            stmt = select(ServList)
            #print(stmt)
            servs = []
            with engine.connect() as ses:
                for row in ses.execute(stmt):
                    myjson = {"id":row[0], "hostname":row[1], "configured":row[6]}
                    servs.append(myjson)
            return json.dumps(servs)
        except Exception as e:
            return e
    return 'bad_role'

def getserv(dbsql):
    if 'superadmin' in session.get('role') or 'admin' in session.get('role'):
        tbname = request.form.get('servname')
        try:
            engine = dbsql.get_engine()
            custom = dyntable(tbname)
            stmt = select(custom)
            servs = []
            with engine.connect() as ses:
                for row in ses.execute(stmt):
                    myjson = {"id":row[0], "config":row[1], "value":row[2]}
                    servs.append(myjson)
            return json.dumps(servs)
        except Exception as e:
            print(e)
            return 'newserv'
    return 'bad_role'