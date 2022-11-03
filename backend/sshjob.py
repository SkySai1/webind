import re
import socket
import time
import paramiko
from flask import session, request
from backend.dbcontrol import *
from os import chmod
from cryptography.hazmat.primitives import serialization as crypto_serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.backends import default_backend as crypto_default_backend


def send_command(hostname, port, username, key_id, commandlist):
    path = os.path.dirname(os.path.abspath(__file__))
    key = paramiko.RSAKey.from_private_key_file(f'{path}/.ssh/{key_id}')
    
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(hostname = hostname, username = username, port = port, pkey=key)
    #client.connect(hostname=hostname, username=username, password=password, port=port, look_for_keys=False, allow_agent=False)

    with client.invoke_shell() as ssh:
            ssh.send('echo\n')
            ssh.settimeout(0.5)
            #time.sleep(0.1)
            ssh.recv(3000)
            result = {}
            for command in commandlist:
                    ssh.send(f'{command}\n')
                    #time.sleep(0.1)
                    ssh.settimeout(0.5)
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


def keygen(hostname, port, passwd, username):
    path = os.path.dirname(os.path.abspath(__file__))
    
    key = rsa.generate_private_key(
    backend=crypto_default_backend(),
    public_exponent=65537,
    key_size=2048
    )

    private_key = key.private_bytes(
    crypto_serialization.Encoding.PEM,
    crypto_serialization.PrivateFormat.TraditionalOpenSSL,
    crypto_serialization.NoEncryption()
    )

    public_key = key.public_key().public_bytes(
    crypto_serialization.Encoding.OpenSSH,
    crypto_serialization.PublicFormat.OpenSSH
    )
    
    id = hashlib.sha1(hostname.encode()).hexdigest()
    
    if not os.path.exists(f'{path}/.ssh/'):
            os.makedirs(f'{path}/.ssh')
    with open(f'{path}/.ssh/{id}','w') as file:
            file.write(private_key.decode())
    with open(f'{path}/.ssh/{id}.pub','w') as file:
            file.write(public_key.decode())
    os.chmod(f'{path}/.ssh/{id}', 0o600)
    os.chmod(f'{path}/.ssh/{id}.pub', 0o600)
    
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(hostname=hostname, username=username, password=passwd, port=port, look_for_keys=False, allow_agent=False)
    with client.invoke_shell() as ssh:
        ssh.send(f'mkdir -m 700 ~/.ssh/\n')
        time.sleep(0.1)
        ssh.send(f'echo {public_key.decode()} >> ~/.ssh/authorized_keys\n')
        time.sleep(0.1)
            
    return id
