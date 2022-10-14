import re
import socket
import time
import paramiko
from flask import session, request
from backend.dbcontrol import *

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




