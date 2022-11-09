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
        if 'getservlist' in request.form.get('action'):
            return getservlist(dbsql)
        elif 'getserver' in request.form.get('action'):
            return getserv(dbsql)
    return 'nothing'
        
def serveradd(dbsql):
    try:
        host = request.form['host']
        port = request.form['port']
        user = request.form['user']
        passwd = request.form['pass']
    except Exception as e:
        logging('e', e, inspect.currentframe().f_code.co_name)
        return 'serv_field_bad'
    try:
        data = {
            "host": host,
            "port": port,
            "user": user,
            "passwd": passwd
        }
        return serveradd_proces(dbsql, data)
    except Exception as e:
        logging('e', e, inspect.currentframe().f_code.co_name)
        return 'failure'
    
def serverchange(dbsql):
    out = ''
    for key, value in request.form.items(multi=True):
            out += f"{key}: {value}'\n'"
            if not request.form.get(key): return 'empty_serv_field'
    try:
        host = request.form.get('hostname')
        newhost = request.form.get('newhostname')
        port = request.form.get('port')
        username = request.form.get('username')
        passwd = request.form.get('passwd')
        newdata = {
            "host": newhost,
            "port": port,
            "user": username,
            "passwd": passwd
        }
        status = serveradd_proces(dbsql, newdata)
        if status == 'serv_add_success':
            return serverchange_query(dbsql, host, newhost)
        return status
        #raise Exception
    except Exception as e:
        logging('e', e, inspect.currentframe().f_code.co_name)
        return 'failure'
       
def serveradd_proces(dbsql, data):
    host = data['host']
    port = data['port']
    user = data['user']
    passwd = data['passwd']
    try:
        key_id = keygen(host, port, passwd, user) 
    except Exception as e:
        logging('e', e, inspect.currentframe().f_code.co_name)
        return 'connect_failure'
    try:
        cmlist = ["echo \"connected\""]
        send_command(host, port, user, key_id, cmlist)
    except Exception as e:
        logging('e', e, inspect.currentframe().f_code.co_name)
        return 'sshkey_failure'
    cmlist = ["named -V"]
    result = send_command(host, port, user, key_id, cmlist)
    string = result[cmlist[0]].split(sep='\n')
    for row in string:
        if re.search(r'''named configuration''', row):
            named_conf = re.sub(r'\s*',"", row).split(sep=':')[-1]
        if re.search(r'BIND 9', row):
            bind_vers = re.search(r'BIND 9[\s\.\w\(\)\-\_]*',row).group(0)
    cmlist = ["python3",
            "import os",
            "if os.path.isfile('/etc/debian_version'): print('debian')",
            "elif os.path.isfile('/etc/redhat-release'): print('rhel')",
            "\n"
            ]
    result = send_command(host, port, user, key_id, cmlist)
    if 'debian' in result[cmlist[-1]]: 
        workdir='/etc/bind/'
        core='Debian'
    elif 'rhel' in result[cmlist[-1]]: 
        workdir='/var/named/'
        core='RedHat'
    else: return result[cmlist[-1]]
    cmlist = ["python3",
            "import os",
            f"ncf = os.access('{named_conf}', os.W_OK)",
            f"ncp = os.access('{workdir}', os.W_OK)",
            "if ncf is True and ncp is True: print('True')",
            "else: print('False')",
            "\n"
            ]        
    result = send_command(host, port, user, key_id, cmlist)
    string = result[cmlist[6]].split(sep='\n')
    for row in string:
        if re.search(r'^False|^True', row):
            status = row
            break
    if 'True' in status:
        cmlist = ["hostnamectl"]
        result = send_command(host, port, user, key_id, cmlist)
        string = result[cmlist[0]].split(sep='\n')
        for row in string:
            if re.search(r'''Machine ID''', row):
                machine_id = re.sub(r'\s*',"", row).split(sep=':')[1]
                break
        machine_id_hash = hashlib.sha1(machine_id.encode()).hexdigest()
        return server_insertdb(dbsql,host,core,machine_id_hash,user,key_id,named_conf, workdir, bind_vers)
    elif 'False' in status:
        return 'serv_add_permission_bad'
    return 'nothing'