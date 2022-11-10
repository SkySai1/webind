import inspect
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

class FastTransport(paramiko.Transport):
        def __init__(self, sock):
                super(FastTransport, self).__init__(sock)
                self.window_size = 2147483647
                self.packetizer.REKEY_BYTES = pow(2, 40)
                self.packetizer.REKEY_PACKETS = pow(2, 40)

def send_command(hostname, port, username, key_id, commandlist):
    path = os.path.dirname(os.path.abspath(__file__))
    key = paramiko.RSAKey.from_private_key_file(f'{path}/.ssh/{key_id}')
    
    client = paramiko.SSHClient()
    #client = FastTransport((hostname, port))
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(hostname = hostname, username = username, port = port, pkey=key)
    #client.connect(hostname=hostname, username=username, password=password, port=port, look_for_keys=False, allow_agent=False)

    with client.invoke_shell() as ssh:
            ssh.send('echo\n')
            ssh.settimeout(0.01)
            ssh.recv(3000)
            result = []
            for command in commandlist:
                    ssh.send(f'{command}\n')
                    ssh.settimeout(0.05)
                    output = ""
                    while True:
                        try:
                                part = ssh.recv(3000).decode('utf-8')
                                output += part
                        except socket.timeout:
                                break
                    result.append(output)
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
        ).decode()

        public_key = key.public_key().public_bytes(
        crypto_serialization.Encoding.OpenSSH,
        crypto_serialization.PublicFormat.OpenSSH
        ).decode()
        id = hashlib.sha1(hostname.encode()).hexdigest()
        
        if not os.path.exists(f'{path}/.ssh/'):
                os.makedirs(f'{path}/.ssh')
        with open(f'{path}/.ssh/{id}','w') as file:
                file.write(private_key)
        with open(f'{path}/.ssh/{id}.pub','w') as file:
                file.write(public_key)
        os.chmod(f'{path}/.ssh/{id}', 0o600)
        os.chmod(f'{path}/.ssh/{id}.pub', 0o600)
        
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(hostname=hostname, username=username, password=passwd, port=port, look_for_keys=False, allow_agent=False)
        with client.invoke_shell() as ssh:
                ssh.send(f'mkdir -m 700 ~/.ssh/\n')
                ssh.settimeout(5)
                time.sleep(0.1)
                ssh.send(f'echo {public_key} >> ~/.ssh/authorized_keys\n')
                ssh.settimeout(5)
                time.sleep(0.1)
                ssh.send(f'chmod 600 ~/.ssh/authorized_keys\n')
                ssh.settimeout(5)
                time.sleep(0.1)
        return id

def try_connect(hostname, port, username, key_id):
        path = os.path.dirname(os.path.abspath(__file__))
        key = paramiko.RSAKey.from_private_key_file(f'{path}/.ssh/{key_id}')
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(hostname=hostname, username=username, port=port, pkey=key)
        with client.invoke_shell() as ssh:
                ssh.send(f'echo \'pubkey connected\'\n')
                ssh.settimeout(0.05)
                time.sleep(0.1)
