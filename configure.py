#!/usr/bin/python3

import os
import re
import shutil
import subprocess
from subprocess import PIPE

class bcolors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'
    
### Поиск аткуальной версии python ###

def finder(fname, pattern, path):
    result = []
    for root, dirs, files in os.walk(path):
        for row in files:
            if re.match(fr'{fname}{pattern}', row):
                result.append(row)
    return result

def runcommand(cmd, args):
	if args:
		result = subprocess.run([str(cmd), str(args)], stdout=PIPE, stderr=PIPE)
	else:
		result = subprocess.run([str(cmd)], stdout=PIPE, stderr=PIPE)
	return result.stdout.decode('utf-8')

thispath = os.path.abspath('./')
if not os.path.exists(f'{thispath}/configure.py'):
    print(f'{bcolors.WARNING} You need to change your current directory to webind\'s directory')
    exit()

if os.path.exists(f'{thispath}/flask/'):
    print(f'It\'s seems you have some directory {thispath}/flask/,\n\
continue to execute the script will destroy all content in it,\n\
are you ok with that?\n(y/n)')
    while True:
        a = input()
        if a == 'y' or a == 'yes': break
        elif a == 'n' or 'no': exit()
    shutil.rmtree(f'{thispath}/flask/')

print('For next you need to create virtual environment.')

result = finder('python3','[.0-9]*$','/usr/bin/')


print('Choose one of the next version of installed python3 (with python3-venv package):')
for row in result:
    print(f'{result.index(row)}) {row}')
    check = result.__len__() - 1
while True:
    try:
        p = int(input())
        if p > check:
            print('Bad choise')
        else:
            break
    except:
        print('Incorrect input')
        exit()
pyvers = runcommand(result[p], '--version')
print('You have chosen - %s, now creating virtual environment!' % (re.sub(r'\n', '', pyvers)))
rc = subprocess.call(f"{result[p]} -m venv {thispath}/flask", shell=True)
if rc != 0:
    print('''
          Failure with creating virtual environemnt,
          you need to ensure you have installed package - python3-venv (with your choosen version of python).
          Or you can create virtual environment manually through "python3 -m venv flask" and re-execute this script.
          ''')
    exit()
print('Virtual environment was created success!')

print(f'Installing python3\'s modules from {thispath}/archive')
list = ['pip', 
        'wheel', 
        'bcrypt', 
        'cffi', 
        'SQLAlchemy',
        'click',
        'cryptography',
        'MarkupSafe',
        'PyYAML',
        'Werkzeug',
        'Flask-2',
        'Flask-MySQLdb',
        'Flask_SQLAlchemy',
        'greenlet',
        'importlib_metadata',
        'itsdangerous',
        'Jinja2',
        'mysqlclient',
        'paramiko',
        'psycopg2',
        'pycparser',
        'PyMySQL',
        'PyNaCl',
        'six',
        'typing_extensions',
        'zipp']
for string in list:
    file = finder(string, '', f'{thispath}/archive/')
    i=0
    print(f'{bcolors.HEADER}Installing {string}{bcolors.ENDC}')
    while True:
        try:
            mp = subprocess.call(f"{thispath}/flask/bin/pip3 install --upgrade {thispath}/archive/{file[i]}", shell=True)
            if mp != 0: 
                print(f'{bcolors.WARNING}Trying next:{bcolors.ENDC}')
            else:
                print(f'{bcolors.OKGREEN}{string} is Success!{bcolors.ENDC}\n')
                break
            i+=1
        except Exception as e:
            print(f'{bcolors.WARNING}Error with {string} try to install it from pypi.org{bcolors.ENDC}')
            exit()
    
print(f'{bcolors.OKBLUE}Configure was successfull! Now you can run webind.py {bcolors.ENDC}')
