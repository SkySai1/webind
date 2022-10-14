from flask import session, request
import paramiko

from backend.dbcontrol import *
from backend.sshjob import *

def server(dbsql):
    if 'superadmin' in session.get('role'):
        if 'serveradd' in request.form.get('action'):
            return serveradd(dbsql)
    return 'nothing'
        
def serveradd(dbsql):
    try:
        host = request.form['host']
        port = request.form['port']
        user = request.form['user']
        passwd = request.form['pass']
    except Exception as e:
        return str(e)
        #return 'serv_field_bad'
    try:
        cmlist = ["named -V"]
        result = send_command(host, port, user, passwd ,cmlist)
        string = result[cmlist[0]].split(sep='\n')
        for row in string:
            if re.search(r'''named configuration''', row):
                ncf = re.sub(r'\s*',"", row).split(sep=':')
                break
        wd = re.sub(r'[\w._-]*$', '', ncf[1])
        cmlist = ["python3",
                "import os",
                f"ncf = os.access('{ncf[1]}', os.W_OK)",
                f"ncp = os.access('{wd}', os.W_OK)",
                "if ncf is True and ncp is True: print('True')",
                "else: print('False')",
                "\n"
                ]        
        result = send_command(host, port, user, passwd ,cmlist)
        string = result[cmlist[6]].split(sep='\n')
        for row in string:
            if re.search(r'^False|^True', row):
                status = row
                break
        if 'True' in status:
            return server_insertdb(dbsql,host,user,ncf[1], wd)
        elif 'False' in status:
            return 'serv_add_permission_bad'
        return 'nothing'
    except Exception as e:
        return str(e)