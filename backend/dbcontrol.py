import datetime
from email.policy import default
import hashlib
import inspect
import re
import secrets
import string
from flask import request, render_template, session, flash
import yaml
import os
import json
from sqlalchemy import Column, ForeignKey, Integer, String, Boolean, update, delete, inspect as dbinspect
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import relationship  
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session

from backend.function import logger

### Раздел описания сущностей БД 
Base = declarative_base()

class Users(Base):  
    __tablename__ = "users" 
    
    id = Column(Integer, primary_key=True)  
    username = Column(String(255), nullable=False, unique=True)  
    password = Column(String(255), nullable=False)  
    role = Column(String(255))
    email = Column(String(255))
    
    domains = relationship(
        "Domains", secondary='users_domains', back_populates="users",
    )
    def __repr__(self):
        return f"Webind(id={self.id!r}, username={self.username!r}, password={self.password!r}, role={self.role!r})"

class Servers(Base):
    __tablename__ = "servers"
    
    id = Column(Integer, primary_key=True)
    hostname = Column(String(255), nullable=False, unique=True)
    core = Column(String(255), nullable=False)
    machine_id = Column(String(255), nullable=False, unique=True)
    username = Column(String(255), nullable=False)
    keyid = Column(String(255), nullable=False)
    confpath = Column(String(255), nullable=False)
    workdirectory = Column(String(255), nullable=False)
    bind_version = Column(String(255), nullable=False)
    configured = Column(Boolean, default=False)
    
    configs = relationship(
        "Configs", secondary='servers_configs', back_populates="servers",
        single_parent=True, lazy='joined'
    )
    views = relationship(
        "Views", secondary='servers_views', back_populates="servers",
        single_parent=True
    )

class Configs(Base):
    __tablename__ = "configs"
    id = Column(Integer, primary_key=True, autoincrement=True)
    config=Column(String(255), unique=True)
    version = Column(Integer, nullable=False)
    options = Column(Boolean, nullable=False, default=False)
    view = Column(Boolean, nullable=False, default=False)
    zone = Column(Boolean, nullable=False, default=False)
    server = Column(Boolean, nullable=False, default=False)
    misc = Column(String)


    servers = relationship(
        "Servers", secondary='servers_configs', back_populates="configs",
    )
    views = relationship(
        "Views", secondary='views_configs', back_populates="configs",
        single_parent=True
    )
    zones = relationship(
        "Zones", secondary='zones_configs', back_populates="configs",
        single_parent=True
    )
    
class Views(Base):
    __tablename__ = "views"
    id = Column(Integer, primary_key=True, autoincrement=True)
    viewname = Column(String(255), nullable=True)
    alias = Column(String(255))
    
    servers = relationship(
        "Servers", secondary='servers_views', back_populates="views",
    )
    configs = relationship(
        "Configs", secondary='views_configs', back_populates="views",
    )
    zones = relationship("Zones", cascade="all, delete")

class Zones(Base):
    __tablename__ = 'zones'
    id = Column(Integer, primary_key=True, autoincrement=True)
    view_id=Column(Integer, ForeignKey("views.id"), nullable=False)
    zonename = Column(String(255), nullable=False)
    type = Column(String(255), nullable=False)
    serial = Column(Integer, nullable=False, default=datetime.datetime.now().strftime('%Y%m%d01'))
    ttl = Column(Integer, nullable=False, default = 86400)
    expire = Column(Integer, nullable=False, default = 604800)
    refresh = Column(Integer, nullable=False, default = 28800)
    retry = Column(Integer, nullable=False, default = 3600)
    
    configs = relationship(
        "Configs", secondary='zones_configs', back_populates="zones",

    )
    domains = relationship("Domains", cascade="all, delete")
    
class Domains(Base):
    __tablename__ = 'domains'
    id = Column(Integer, primary_key=True, autoincrement=True)
    domain = Column(String(255), unique=True, nullable=False)
    zone_id=Column(Integer, ForeignKey("zones.id"), nullable=False)
    
    users = relationship(
        "Users", secondary='users_domains', back_populates="domains",
    )
    rrs = relationship("RRs", cascade="all, delete")
    
class RRs(Base):
    __tablename__ = 'rrs'
    id = Column(Integer, primary_key=True, autoincrement=True)
    domain_id = Column(Integer, ForeignKey('domains.id'), nullable=False)
    ttl = Column(Integer)
    r_class = Column(String, default='IN')
    r_type = Column(String)
    value = Column(String)

class Users_Domains(Base):
    __tablename__ = 'users_domains'
    id = Column(Integer, primary_key=True, autoincrement=True)
    username_id = Column(Integer, ForeignKey('users.id'))
    domain_id = Column(Integer, ForeignKey('domains.id'))


class Views_Configs(Base):
    __tablename__ = "views_configs"

    id = Column(Integer, primary_key=True)
    config_id=Column(Integer, ForeignKey('configs.id'))
    viewid=Column(Integer, ForeignKey('views.id'))
    value = Column(String, nullable=True)
    
    
class Servers_Configs(Base):
    __tablename__ = "servers_configs"

    id = Column(Integer, primary_key=True)
    server_id=Column(Integer, ForeignKey('servers.id'))
    config_id=Column(Integer, ForeignKey('configs.id'))
    value = Column(String, nullable=True)

class Servers_Views(Base):
    __tablename__ = "servers_views"

    id = Column(Integer, primary_key=True)
    server_id=Column(Integer, ForeignKey('servers.id'))
    viewid=Column(Integer, ForeignKey('views.id'))
    priority=Column(Integer)
    
class Zones_Configs(Base):
    __tablename__ = "zones_configs"

    id = Column(Integer, primary_key=True)
    zone_id=Column(Integer, ForeignKey("zones.id"))
    config_id=Column(Integer, ForeignKey('configs.id'))
    value = Column(String, nullable=True)    

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
            logger(inspect.currentframe().f_code.co_name) 
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
                try:
                    pass
                    #create_confgs(engine)
                except:
                    raise Exception
            else:
                return 'table_exist'
    except Exception as e:
        logger(inspect.currentframe().f_code.co_name)
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
                logger(inspect.currentframe().f_code.co_name)				
                return 'create_bad'
            try:
                pass
                #create_confgs(engine)
            except:
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
    except Exception as e:
        logger(inspect.currentframe().f_code.co_name)
        return 'bad_connect'
    
def create_confgs(engine):
    try:
        Base.metadata.create_all(engine)
        with open('/home/bind/webind/workbench/options.block', 'r') as f:
            op_block = f.read().split('\n')
        for config in op_block:
            with Session(engine) as ses:
                new = Configs(
                    config=config,
                    version=9181,
                    options=True,
                    view = True
                )
                ses.add(new)
                ses.commit()
    except Exception as e: 
        logger(inspect.currentframe().f_code.co_name) 
        

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
        logger(inspect.currentframe().f_code.co_name) 
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
        logger(inspect.currentframe().f_code.co_name) 
        return False

def userchange_updateuname_query(dbsql, data):
    username = data['username']
    newusername = data['newusername']
    try:
        getUserID = (select(Users.id)
                     .where(Users.username == username))
        with dbsql.engine.connect() as con:
            UserID = con.execute(getUserID).first()
        if UserID:
            updateq = (update(Users)
                        .where(Users.id == UserID[0])
                        .values(username=newusername)
            )
            with dbsql.session() as ses: 
                ses.execute(updateq)
                ses.commit()
            return True
        else: return False
    except Exception as e:
        logger(inspect.currentframe().f_code.co_name) 
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
    dlt = ses.query(Users).filter(Users.id == account['id']).first()
    with dbsql.session() as ses:
        ses.delete(dlt)
        ses.commit()
    return 'userdel_success'


def server_insertdb(dbsql, data):
    if 'superadmin' in session.get('role'):
        hostname = data['hostname']
        core=data['core']
        id=data['id']
        username=data['username']
        key_id=data['key_id']
        conf=data['conf']
        dir=data['dir']
        vers=data['vers']
        try:
            Base.metadata.create_all(dbsql.engine)
            with dbsql.session() as ses:
                new = Servers(
                    hostname=hostname, 
                    core=core, 
                    machine_id=id, 
                    username=username, 
                    keyid=key_id, 
                    confpath=conf,  
                    workdirectory=dir, 
                    bind_version=vers,
                    configured=False
                )
                ses.add(new)
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
            engine = dbsql.engine
            stmt = select(Servers).order_by(Servers.id)
            servs = []
            with engine.connect() as ses:
                for row in ses.execute(stmt):
                    myjson = {
                        "id":row['id'], 
                        "hostname":row['hostname'], 
                        "status":row['configured']}
                    servs.append(myjson)
            return json.dumps(servs)
        except Exception as e:
            logger(inspect.currentframe().f_code.co_name)
            return 'db_failed'
    return 'bad_role'


def getserv(dbsql):
    if 'superadmin' in session.get('role') or 'admin' in session.get('role'):
        hostname = request.form.get('servname')
        try:      
            getHostID = select(Servers.id).where(Servers.hostname == hostname)
            with dbsql.engine.connect() as ses:
                s_id = ses.execute(getHostID).first()[0]
            if not s_id:  return 'missing_server'
             
            options = {}
            viewsList = {}
            view = {}
        
            getHost = select(Servers.hostname).where(Servers.id == s_id)
            with dbsql.engine.connect() as ses:
                hostname = ses.execute(getHost).first()[0]
                
            ##Составления списка общих сведений о сервере
            servInfo = {}
            getHostInfo = select(Servers).where(Servers.id == s_id)
            with dbsql.engine.connect() as ses:
                for servInfoArray in ses.execute(getHostInfo).all():
                    servInfo['hostname'] = servInfoArray['hostname']
                    servInfo['version'] = servInfoArray['bind_version']  
                    servInfo['core'] = servInfoArray['core']
                    servInfo['username'] = servInfoArray['username']
                    servInfo['conf'] = servInfoArray['confpath']
                    servInfo['directory'] = servInfoArray['workdirectory']          
                
            ## Поиск всех параметров привязанных к серверу    
            getHostOptsId = (
                select(Servers_Configs.config_id, Servers_Configs.value)
                .where(Servers_Configs.server_id == s_id)
                .order_by(Servers_Configs.id)
            )
            with dbsql.engine.connect() as ses:
                HostOptsId=[]
                HostOptsValue=[]
                for value in ses.execute(getHostOptsId):
                    HostOptsId.append(value[0])
                    HostOptsValue.append(value[1])
                    
            for id in HostOptsId:
                getHostOpt = select(Configs.config).where(Configs.id == id)
                with dbsql.engine.connect() as ses:
                    options[ses.execute(getHostOpt).first()[0]] = HostOptsValue[HostOptsId.index(id)]
                    
            ## Поиск всех View привязанных к серверу 
            with Session(dbsql.engine) as ses:
                
                views = (ses.query(Views, Servers_Views)
                        .join(Servers_Views, Servers_Views.viewid == Views.id)
                        .filter(Views.servers.any(Servers.id == s_id))
                        .filter(Servers_Views.server_id == s_id)
                        .order_by(Servers_Views.priority)
                        .all()
                )
                for view in views:
                    viewDesc = {}
                    #Список параметров Обзора
                    
                    viewOpt = (ses.query(Configs, Views_Configs)
                            .join(Views_Configs, Views_Configs.config_id == Configs.id)
                            .filter(Configs.views.any(Views.id == view.Views.id))
                    )
                    viewDesc['alias'] = view.Views.alias
                    viewDesc['priority'] = view.Servers_Views.priority
                    viewOptsList = {}
                    for row in viewOpt:
                        viewOptsList[row.Configs.config] = row.Views_Configs.value
                    viewDesc['options'] = viewOptsList
                    
                    #Список зон входящих во View
                    zones = ses.query(Zones).filter(Zones.view_id == view.Views.id).all()
                    zonesList = {}
                    for zone in zones:
                        zoneDesc = {}
                        zoneInfo ={
                            'type': zone.type,
                            'serial': zone.serial,
                            'ttl': zone.ttl,
                            'expire': zone.expire,
                            'refresh': zone.refresh,
                            'retry': zone.retry
                        }
                        zoneDesc['Info'] = zoneInfo
                        
                    
                        #Поиск доменов входящих в зону
                        domains = {}
                        domains = ses.query(Domains).filter(Domains.zone_id == zone.id).all()
                        domainDesc = {}
                        for domain in domains:
                            domainInfo = {}
                            #Поиск RR принадлежащих домену
                            rrs = ses.query(RRs).filter(RRs.domain_id == domain.id).all()
                            rrsList = []
                            for rr in rrs:
                                rrInfo ={
                                    'ttl': rr.ttl,
                                    'class': rr.r_class,
                                    'type': rr.r_type,
                                    'value': rr.value
                                }
                                rrsList.append(rrInfo)
                            domainInfo['records'] = rrsList
                            
                            #Поиск пользователей закрепелнных за доменом
                            
                            usersDomain = (ses.query(Users)
                            .filter(Users.domains.any(Domains.id == domain.id))
                            .all()
                            )
                            userList =[]
                            for user in usersDomain:
                                userList.append(user.username)
                            domainInfo['users'] = userList
                            domainDesc[domain.domain] = domainInfo
                            
                            zoneDesc['domains'] = domainDesc
                        zonesList[zone.zonename] = zoneDesc
                    viewDesc['zones'] = zonesList
                    viewsList[view.Views.viewname] = viewDesc
                
            hostinfo = {'info':servInfo, 'options': options, 'views': viewsList}
            return json.dumps(hostinfo, indent=4)
        except Exception as e:
            logger(inspect.currentframe().f_code.co_name)
            return 'failure'
    return 'bad_role'

def getservlistbox(dbsql):
    try:
        stmt = select(Servers.hostname).order_by(Servers.hostname)
        out = []
        with dbsql.session() as ses:
            for row in ses.execute(stmt):
                out.append(row[0])
        return json.dumps(out, indent=4)
    except Exception as e:
        logger(inspect.currentframe().f_code.co_name)
        return 'failure'
def serveradd_query(dbsql, hostname, data):
    try:
        hostname = hostname
        newhost = data['hostname']
        core = data['core']
        id = data['id']
        username = data['username']
        keyid = data['key_id']
        conf = data['conf']
        dir = data['dir']
        vers = data['vers']
        new = Servers(hostname = newhost,
                       core = core,
                       machine_id = id,
                       username = username,
                       keyid = keyid,
                       confpath = conf,
                       workdirectory = dir,
                       bind_version = vers)
        with dbsql.session() as ses:
            ses.add(new)
            ses.commit()
        return 'serv_add_success'
    except Exception as e:
        logger(inspect.currentframe().f_code.co_name)
        return 'failure'
    
def serverchange_query(dbsql, hostname, data):
    try:
        hostname = hostname
        newhost = data['hostname']
        core = data['core']
        id = data['id']
        username = data['username']
        keyid = data['key_id']
        conf = data['conf']
        dir = data['dir']
        vers = data['vers']
        with dbsql.engine.connect() as con:
            getServID = select(Servers.id).where(Servers.hostname == hostname)
            servID = con.execute(getServID).first()
        if not servID: return 'missing_server'
        with dbsql.session() as ses:
            updt = (update(Servers)
                    .where(Servers.id == servID[0])
                    .values(hostname = newhost,
                        core = core,
                        machine_id = id,
                        username = username,
                        keyid = keyid,
                        confpath = conf,
                        workdirectory = dir,
                        bind_version = vers)
            )
            ses.execute(updt)
            ses.commit()
        return 'servermv_success'
    except Exception as e:
        logger(inspect.currentframe().f_code.co_name)
        return 'failure'
    
def delserver(dbsql, hostname):
    try:
        if not request.form.get('hostname'): return 'empty_host'
        hostname = request.form.get('hostname')
        with dbsql.session() as ses:
            dlt = ses.query(Servers).filter(Servers.hostname == hostname).first()
            ses.delete(dlt)
            ses.commit()
        return 'servdel_success'
    except Exception as e:
        logger(inspect.currentframe().f_code.co_name)
        return 'failure'

def updateconf_query(dbsql, data):
    try:
        hostname = data['hostname']
        param_id = data['param']
        value = data['value']

        return 'update_success'
    except Exception as e:
        logger(inspect.currentframe().f_code.co_name)
        return 'failure'

def get_views_list(dbsql):
    try:
        with Session(dbsql.engine) as ses:
            viewsList = {}
            views = (ses.query(Views).order_by(Views.viewname).all()
            )
            for view in views:
                viewDesc = {}
                viewDesc['alias'] = view.alias
                viewDesc['viewname'] = view.viewname
                #Список параметров Обзора
                
                viewOpt = (ses.query(Configs, Views_Configs)
                           .join(Views_Configs, Views_Configs.config_id == Configs.id)
                           .filter(Configs.views.any(Views.id == view.id))
                           .filter(Views_Configs.viewid == view.id)
                           .all()
                )
                viewOptsList = {}
                for row in viewOpt:
                    viewOptsList[row.Configs.config] = row.Views_Configs.value               
                viewDesc['options'] = viewOptsList
                
                #Список зон входящих во View
                zones = ses.query(Zones).filter(Zones.view_id == view.id).all()
                zonesList = {}
                for zone in zones:
                    zoneDesc = {}
                    zoneInfo ={
                        'type': zone.type,
                        'serial': zone.serial,
                        'ttl': zone.ttl,
                        'expire': zone.expire,
                        'refresh': zone.refresh,
                        'retry': zone.retry
                    }
                    zoneDesc['Info'] = zoneInfo
                    zonesList[f'{zone.id}: {zone.zonename}'] = zoneDesc
                    viewDesc['zones'] = zonesList
                    
                #Список серверов используеющих View\
                servers = (ses.query(Servers.id, Servers.hostname)
                           .filter(Servers.views.any(Views.id == view.id))
                           .order_by(Servers.hostname)
                           .all()
        
                )
                servList = []
                for server in servers:
                    servList.append(f"{server.id}: {server.hostname}")
                    #print(servList)
                viewDesc['servers'] = servList
                viewsList[view.id] = viewDesc
            return json.dumps(viewsList, indent=4)
    except Exception as e:
        logger(inspect.currentframe().f_code.co_name)
        return 'failure'
   
def newView_query(dbsql, data):
    try:
        with dbsql.session() as ses:
            new = Views(
                viewname = data['name'],
                alias = data['alias'],
            )
            ses.add(new)
            ses.commit()
            getNewView = (ses.query(Views)
                          .order_by(Views.id.desc())
                          .first())
            data = {
                'id': getNewView.id,
                'viewname': getNewView.viewname,
                'alias': getNewView.alias
            }
        return data
    except Exception as e:
        logger(inspect.currentframe().f_code.co_name)
        return 'failure'

def deleteView_query(dbsql, id):
    try:
        with dbsql.session() as ses:
            dlt = ses.query(Views).filter(Views.id==id).first()
            ses.delete(dlt)
            ses.commit()
        return 'viewdelete_success'
    except Exception as e:
        logger(inspect.currentframe().f_code.co_name)
        return 'failure'

def viewNewOpt_query(dbsql, data):
    try:
        config = data['config']
        viewID = data['viewID']
        value = data['value']
        with dbsql.session() as ses:
            optID = (ses.query(Configs.id)
                     .filter(Configs.config == config)
                     .filter(Configs.view == True)
                     .first()
            )
            if not optID: return 'bad_view_opt'
            check = (ses.query(Views_Configs)
                     .filter(Views_Configs.viewid == viewID)     
                     .filter(Views_Configs.config_id == optID[0])
                     .all()    
            )
            if check: return 'view_opt_exist'
            new = Views_Configs(config_id = optID[0], 
                                viewid = viewID,
                                value = value)
            ses.add(new)
            ses.commit()
            newViewOpt = (ses.query(Configs, Views_Configs)
                        .join(Views_Configs, Views_Configs.config_id == Configs.id)
                        .filter(Configs.views.any(Views.id == viewID))
                        .filter(Views_Configs.viewid == viewID)
                        .order_by(Views_Configs.id.desc())
                        .first()
            )
            data = {
                'option': newViewOpt.Configs.config,
                'value': newViewOpt.Views_Configs.value
            }
            return data
    except Exception as e:
        logger(inspect.currentframe().f_code.co_name)
        return 'failure'


def zoneadd_query(dbsql, data):
    try:
        with dbsql.session() as ses:
            new = Zones(
                zonename = data['zonename'],
                type = data['type'],
                serial = data['serial'],
                ttl = data['TTL'],
                expire = data['expire'],
                refresh = data['refresh'],
                retry = data['retry']
            )
            ses.add(new)
            ses.commit()
        return 'zone_add_success'
    except Exception as e:
        logger(inspect.currentframe().f_code.co_name)
        return 'failure'

