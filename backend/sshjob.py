import re
import socket
import time
import paramiko
from flask import session, request

def send_command(hostname, port, username, password, commandlist):
    #comment
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    #client.connect(hostname = hostname, username = username, port = port)
    client.connect(hostname=hostname, username=username, password=password, port=port, look_for_keys=False, allow_agent=False)

    with client.invoke_shell() as ssh:
            ssh.send('echo\n')
            time.sleep(0.5)
            ssh.recv(3000)
            result = {}
            for command in commandlist:
                    ssh.send(f'{command}\n')
                    time.sleep(0.5)
                    ssh.settimeout(1)
                    output = ""
                    while True:
                        try:
                                part = ssh.recv(3000).decode('utf-8')
                                output += part
                        except socket.timeout:
                                break
                    result[command] = output
    client.close()
    return result


def server_add(dbsql):
    if 'superadmin' in session.get('role'):
        try:
            host = request.form['host']
            port = request.form['port']
            user = request.form['user']
            passwd = request.form['pass']
        except Exception as e:
            return str(e)
            #return 'serv_field_bad'
        try:
            #cmlist = ["python3","import os","print(str(os.access('/etc/bind/', os.W_OK)))"]
            cmlist = ["named -V"]
            result = send_command(host, port, user, passwd ,cmlist)
            str = result[cmlist[0]].split(sep='\n')
            for row in str:
                if re.search(r'''named configuration''', row):
                    nc = re.sub(r'\s*',"", row).split(sep=':')
                    return nc[1]
            return 'nothing'
        except Exception as e:
            return str(e)
        