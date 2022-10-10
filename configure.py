#!/usr/bin/python3

import os
import re
import shutil
import subprocess
from subprocess import PIPE

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
if os.path.exists(f'{thispath}/flask/'):
    print('It\'s seems you have some directory ./flask/,\n\
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

print('Installing python3\'s modules from ./archive')
pip = finder('pip','',f'{thispath}/archive/')
wheel = finder('wheel','',f'{thispath}/archive/')
rc = []
try:
    rc.append(subprocess.call(f"{thispath}/flask/bin/pip3 install --upgrade {thispath}/archive/{pip[0]}", shell=True))
    rc.append(subprocess.call(f"{thispath}/flask/bin/pip3 install --upgrade {thispath}/archive/{wheel[0]}", shell=True))
    rc.append(subprocess.call(f"{thispath}/flask/bin/pip3 install {thispath}/archive/*", shell=True))
except:
    print(f'''
Unable to install modules, check the directory ./flask/
          ''')
    exit()
    
print('Configure was successfull! Now you can run webind.py')