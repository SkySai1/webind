from flask import session, request
import paramiko

from backend.dbcontrol import *
from backend.sshjob import *


def server(dbsql):
    if 'superadmin' in session.get('role'):
        if 'serveradd' in request.form.get('action'):
            return serveradd(dbsql)
        elif 'getservlistbox' in request.form.get('action'):
            return getservlistbox(dbsql)
        elif 'servermv' in request.form.get('action'):
            return serverchange(dbsql)
        elif 'servdel' in request.form.get('action'):
            hostname = request.form.get('hostname')
            return delserver(dbsql, hostname)
    if 'superadmin' in session.get('role') or 'admin' in session.get('role'):
        if 'updateconf' in request.form.get('action'):
            return updateconf(dbsql)
        elif 'getservlist' in request.form.get('action'):
            return getservlist(dbsql)
        elif 'getserver' in request.form.get('action'):
            return getserv(dbsql)
    return 'failure'
        
def serveradd(dbsql):
    out = ''
    for key, value in request.form.items(multi=True):
        out += f"{key}: {value}'\n'"
        if not request.form.get(key): return 'empty_serv_field'
    try:
        data = {
            "host": request.form.get('host'),
            "port": request.form.get('port'),
            "user": request.form.get('user'),
            "passwd": request.form.get('pass')
        }
        host = data['host']
        data = serveradd_proces(dbsql, data)
        if not data or 'failure' in data: return 'failure'
        else:
            if 'connect_failure' in data: return 'connect_failure'
            if 'sshkey_failure' in data: return 'sshkey_failure'
            if 'true' in data['access']:
                return serveradd_query(dbsql, host, data)
            else: return 'serv_permission_bad'
    except Exception as e:
        logger(inspect.currentframe().f_code.co_name)
        return 'failure'
    
def serverchange(dbsql):
    for key, value in request.form.items(multi=True):
            if not request.form.get(key): return 'empty_serv_field'
    try:
        host = request.form.get('hostname')
        newhost = request.form.get('newhostname')
        port = request.form.get('port')
        username = request.form.get('username')
        passwd = request.form.get('passwd')
        connect = {
            "host": newhost,
            "port": port,
            "user": username,
            "passwd": passwd
        }
        data = serveradd_proces(dbsql, connect)
        if not data: return 'failure'
        if 'connect_failure' in data: return 'connect_failure'
        if 'sshkey_failure' in data: return 'sshkey_failure'
        if 'true' in data['access']:
            return serverchange_query(dbsql, host, data)
        elif 'false' in data['access']: return 'serv_permission_bad'
        return 'connect_failure'
    except Exception as e:
        logger(inspect.currentframe().f_code.co_name)
        return 'failure'
       
def serveradd_proces(dbsql, data):
    host = data['host']
    port = data['port']
    user = data['user']
    passwd = data['passwd']
    try:
        key_id = keygen(host, port, passwd, user) 
    except Exception as e:
        logger(inspect.currentframe().f_code.co_name)
        return 'connect_failure'
    try:
        cmlist = ["echo \"connected\""]
        send_command(host, port, user, key_id, cmlist, 2)
    except Exception as e:
        logger(inspect.currentframe().f_code.co_name)
        return 'sshkey_failure'
    try:
        cmlist = [
            "\n",
            "python3",
            "import subprocess",
            "named = subprocess.run(['named', '-V'], capture_output=True)",
            "import re",
            "vers = re.search(r'BIND[\\t 0-9\.-_\(\)a-zA-Z]*',named.stdout.decode())[0]",
            "import os",
            "if os.path.isfile('/etc/debian_version'):",
            "\tsys = 'debian'",
            "\tdir = '/etc/bind/'",
            "\tconf = '/etc/bind/named.conf'",
            "elif os.path.isfile('/etc/redhat-release'):",
            "\tsys = 'rhel'",
            "\tdir = '/var/named/'",
            "\tconf = '/etc/named.conf'",
            "\n",
            "dir_ac = os.access(f'{dir}', os.W_OK&os.R_OK)",
            "conf_ac = os.access(f'{conf}', os.W_OK&os.R_OK)",
            "info = subprocess.run(['hostnamectl'], capture_output=True)",
            "machine_id = re.search(r'Machine ID:[\\t ][\w]+', info.stdout.decode())[0]",
            "id = re.sub(r'\s*',\"\", machine_id).split(sep=':')[1]",
            "if dir_ac is True and conf_ac is True: access='true'",
            "else: access='false'",
            "\n\n",
            "print(access)",
            "print(vers)",
            "print(sys)",
            "print(dir)",
            "print(conf)",
            "print(id)"
        ]
        timeout = 0.02
        for i in range(5):
            try:
                result = send_command(host, port, user, key_id, cmlist, timeout)
                if not result: return 'connect_failure'
                id=result[-1].split(sep='\n')[1]
                conf=result[-2].split(sep='\n')[1]
                dir=result[-3].split(sep='\n')[1]
                sys=result[-4].split(sep='\n')[1]
                vers=result[-5].split(sep='\n')[1]
                access=result[-6].split(sep='\n')[1]
                id_hash = hashlib.sha1(id.encode()).hexdigest()
                #print(result[-6])
                data = {
                    'hostname': host,
                    'core': sys,
                    'id': id_hash,
                    'username': user,
                    'key_id': key_id,
                    'conf': conf,
                    'dir': dir,
                    'vers': vers,
                    'access': access,
                    'user': user
                }
                if 'true' in data['access'] or 'false' in data['access'] :
                    return data
                else: raise Exception
            except:
                if i == 0: timeout = 0.05
                if i == 1: timeout = 0.1
                if i == 2: timeout = 0.5
                if i == 3: timeout = 1
                if i == 3: timeout = 2
    except Exception as e:
        logger(inspect.currentframe().f_code.co_name)
        return 'failure'

def updateconf(dbsql):
    hostname = request.form.get('hostname')
    param = request.form.get('conf')
    value = request.form.get('val')
    block = request.form.get('block')
    data = {
        'hostname':hostname,
        'param':param,
        'value':value,
        'block':block
    }
    return updateconf_query(dbsql,data)
    return 'failure'