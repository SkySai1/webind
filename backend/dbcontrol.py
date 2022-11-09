from email.policy import default
import hashlib
import inspect
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
from sqlalchemy import Column, Integer, String, Boolean, update, delete
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import relationship  
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session

from backend.function import logging

### Раздел описания сущностей БД 
Base = declarative_base()
ServersBase = declarative_base()

class Users(Base):  
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
    core = Column(String(255), nullable=False)
    machine_id = Column(String(255), nullable=False, unique=True)
    username = Column(String(255), nullable=False)
    keyid = Column(String(255), nullable=False)
    confpath = Column(String(255), nullable=False)
    workdirectory = Column(String(255), nullable=False)
    bind_version = Column(String(255), nullable=False)
    configured = Column(Boolean, default=False)
    
def dyntable(tbname, act, *engine):
    ServBase = declarative_base()
    class Dynamic(ServBase):
        __tablename__ = tbname
        id = Column(Integer, primary_key=True)
        config = Column(String(255), unique=True)
        value = Column(String(255))

    if act == 0: pass
    elif act == 1: ServBase.metadata.create_all(engine[-1])
    elif act == 2:
        ServBase.metadata.drop_all(bind=engine[-1], tables=[Dynamic.__table__])
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
        except Exception as e:
            logging('e', e, inspect.currentframe().f_code.co_name) 
            return False
    return False

#Фукнкция создания БД sql lite
def create_sqlite_db():
    try:
        dbname = request.form['dbname']
        engine = create_engine(f'sqlite:///bases/{dbname}.db')
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
                    superadmin = Users(username=request.form['sauser'], password=hashpass, role="superadmin") 
                    session.add(superadmin) 
                    session.commit()
            else:
                return 'table_exist'
    except Exception as e:
        logging('e', e, inspect.currentframe().f_code.co_name)
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
            if not request.form.get('sauser') or not request.form.get('sapass'):
                return 'empty_login'
            try:
                Base.metadata.create_all(engine)
                username = request.form['sauser']
                hashpass = hashlib.sha1(request.form['sapass'].encode()).hexdigest()
                with Session(engine) as session:
                    superadmin = Users(username=username, password=hashpass, role="superadmin") 
                    session.add(superadmin) 
                    session.commit()
            except Exception as e:
                logging('e', e, inspect.currentframe().f_code.co_name)				
                return 'create_bad'
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
        logging('e', e, inspect.currentframe().f_code.co_name)
        return 'bad_connect'

#Функция выбора и настройки параметров БД
def setup_db():
    newdb = secrets.token_hex()
    return render_template('db.html',dbname = newdb)

#Фукнция добавления нового пользователя
def useradd_query(dbsql, data):
    username = data['username']
    password = data['password']
    role = data['role']
    with dbsql.session() as ses:
        user = Users(username=username, password=password, role=role) 
        ses.add(user) 
        ses.commit()
        return 'add_sucess'

def userchange_checkuname_query(dbsql, username):
    selectq = select(Users.username, Users.id).where(Users.username == username)
    with dbsql.session() as ses:
        account = {}
        for row in ses.execute(selectq): 
            account['id'] = row['id']
            account['username'] = row['username']
        if not account['username']: return 'bad_username'
        if account['id'] == 1: return 'sa_block'
    
def userchange_updateupass_query(dbsql, data):
    username = data['username']
    password = data['password']
    try:
        updateq = (update(Users)
                    .where(Users.username == username)
                    .values(password=password)
        )
        with dbsql.session() as ses: 
            ses.execute(updateq)
            ses.commit()
        return True
    except Exception as e: 
        logging('e', e, inspect.currentframe().f_code.co_name) 
        return False
    
def userchange_updateurole_query(dbsql, data):
    username = data['username']
    role = data['role']
    try:
        updateq = (update(Users)
                    .where(Users.username == username)
                    .values(role=role)
        )
        with dbsql.session() as ses: 
            ses.execute(updateq)
            ses.commit()
        return True
    except Exception as e: 
        logging('e', e, inspect.currentframe().f_code.co_name) 
        return False

def userchange_updateuname_query(dbsql, data):
    username = data['username']
    newusername = data['newusername']
    try:
        updateq = (update(Users)
                    .where(Users.username == username)
                    .values(username=newusername)
        )
        with dbsql.session() as ses: 
            ses.execute(updateq)
            ses.commit()
        return True
    except Exception as e:
        logging('e', e, inspect.currentframe().f_code.co_name) 
        return False
    
def usersfind_query(dbsql):
    query = select(Users.username).order_by(Users.username)
    with dbsql.session() as ses:
        out = []
        for user in ses.execute(query):
            out.append(f"{user['username']}")
    return json.dumps(out)

def userdelete_query(dbsql, username):
    selq = select(Users.username, Users.id).where(Users.username == username)
    account = ''
    with dbsql.session() as ses:
        for account in ses.execute(selq):
            pass
    if not account: return 'bad_username'
    if account['id'] == 1: return 'sa_block'
    delq = delete(Users).where(Users.id == account['id'])
    with dbsql.session() as ses:
        ses.execute(delq)
        ses.commit()
    return 'userdel_success'


def server_insertdb(dbsql, hostname, core, mid, user, key_id, confpath, workdir, bind_vers):
    if 'superadmin' in session.get('role'):
        try:
            engine = dbsql.get_engine()
            ServersBase.metadata.create_all(engine)
            with Session(engine) as ses:
                serv = ServList(hostname=hostname, core=core, machine_id=mid, username=user, keyid=key_id, confpath=confpath, workdirectory=workdir,bind_version=bind_vers) 
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
            stmt = select(ServList).order_by(ServList.id)
            #print(stmt)
            servs = []
            with engine.connect() as ses:
                for row in ses.execute(stmt):
                    myjson = {"id":row[0], "hostname":row[1], "configured":row[6]}
                    servs.append(myjson)
            return json.dumps(servs)
        except Exception as e:
            logging('e', e, inspect.currentframe().f_code.co_name)
            return 'db_failed'
    return 'bad_role'


def getserv(dbsql):
    if 'superadmin' in session.get('role') or 'admin' in session.get('role'):
        tbname = request.form.get('servname')
        engine = dbsql.get_engine()
        custom = dyntable(tbname, 0)
        stmt = select(custom)
        stmt2 = select(ServList).where(ServList.hostname == tbname)
        servs = {}
        try:
            with engine.connect() as ses:
                for row in ses.execute(stmt):
                    pass
                myjson = {"id":row[0], "config":row[1], "value":row[2], "clear_serv":"false"}
                servs.update(serv_config=myjson)
        except:
            myjson = {'clear_serv':"true"}
            servs.update(serv_config=myjson)
        try:
            with engine.connect() as ses:
                for row in ses.execute(stmt2):
                    pass
                myjson = {"hostname":row[1], "core":row[2], "bind_version":row[8]}
                servs.update(serv_controls=myjson)
            return json.dumps(servs, indent=4)
        except Exception as e:
            logging('e', e, inspect.currentframe().f_code.co_name)
            return 'failure'
    return 'bad_role'

def getservlistbox(dbsql):
    try:
        stmt = select(ServList.hostname).order_by(ServList.hostname)
        out = []
        with dbsql.session() as ses:
            for row in ses.execute(stmt):
                #print(row)
                out.append(row[-1])
        return json.dumps(out, indent=4)
    except Exception as e:
        logging('e', e, inspect.currentframe().f_code.co_name)
        return 'failure'

def serverchange_query(dbsql, hostname, newhost):
    try:
        if 'postgresql' in str(dbsql):
            rename_serv=f"ALTER TABLE \"{hostname}\" RENAME TO \"{newhost}\""
            rename_seq=f"ALTER SEQUENCE \"{hostname}_id_seq\" RENAME TO \"{newhost}_id_seq\""
            with dbsql.session() as ses:
                ses.execute(rename_serv)
                ses.execute(rename_seq)
                ses.commit()
        else:
            rename_serv=f"RENAME TABLE `{hostname}` TO `{newhost}`"
            with dbsql.session() as ses:
                ses.execute(rename_serv)
                ses.commit()
    except Exception as e:
        #logging('e', e, inspect.currentframe().f_code.co_name)
        pass
    try:
        getserv = select(ServList.id).where(ServList.hostname == hostname)
        with dbsql.session() as ses:
            for row in ses.execute(getserv):
                servid = row[-1]
        delquery = delete(ServList).where(ServList.id == servid)
        with dbsql.session() as ses:
            ses.execute(delquery)
            ses.commit()
        return 'servermv_success'
    except Exception as e:
        logging('e', e, inspect.currentframe().f_code.co_name)
        return 'failure'
    
def delserver(dbsql, hostname):
    try:
        if not request.form.get('hostname'): return 'empty_host'
        hostname = request.form.get('hostname')
        selq = select(ServList.hostname, ServList.id).where(ServList.hostname == hostname)
        server = ''
        with dbsql.session() as ses:
            for server in ses.execute(selq):
                pass
        if not server: return 'bad_hostname'
        delq = delete(ServList).where(ServList.id == server['id'])
        with dbsql.session() as ses:
            ses.execute(delq)
            ses.commit()
        try:
            dyntable(server['hostname'],2,dbsql.engine)
        except Exception as e:
            pass
        return 'servdel_success'
    except Exception as e:
        logging('e', e, inspect.currentframe().f_code.co_name)
        return 'failure'