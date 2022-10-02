from socket import socket
import time
import paramiko

def send_command(hostname,username,port, commandlist):

       connect = paramiko.SSHClient()
       connect.set_missing_host_key_policy(paramiko.AutoAddPolicy())
       connect.connect(hostname = hostname, username = username, port = port)


       with connect.invoke_shell() as ssh:
              #ssh.send("terminal length 0\n")
              #time.sleep(1)
              #ssh.recv(3000)

              result = {}
              for command in commandlist:
                     #ssh.send('python3\n')
                     ssh.send(f'{command}\n')
                     ssh.settimeout(1)

                     output = ""
                     while True:
                            try:
                                   part = ssh.recv(3000).decode('utf-8')
                                   output += part
                                   time.sleep(0.5)
                            except:
                                   break
                     result[command] = output
       connect.close()
       return result
cmlist = ["python3","import os","print(str(os.access('/etc/bind/', os.W_OK)))"]
result = send_command('localhost','guest',22,cmlist)

for i,k in result.items():
       print(f'command {i}: {k}')