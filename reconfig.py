#!./flask/bin/python3

import os
import re
from itertools import islice

def replacer(newstring, pattern, filepath):
    with open(f'{filepath}', 'r') as f:
        lines=[]
        file=''
        lines=f.read().split('\n')
        for line in lines:
            if re.match(fr"{pattern}", line):
                string = re.sub(fr"{pattern}", "", line)
            file += f'{line}\n'
        #print(file)
    if string:
        with open(f'{filepath}', 'w') as f:
            newfile = re.sub(fr"{string}",f"{newstring}", file)
            #print(newfile)
            f.write(newfile)
        print(f'Файл {filepath} - скоректирован успешно!')
    else: print(f'Файл {filepath} - файл поврежден!')

#Замену пути до python в pip
newpath = os.path.abspath('./flask/bin/python')
replacer(newpath,'#!','./flask/bin/pip')

#Замену пути до python в pip3
newpath = os.path.abspath('./flask/bin/python3')
replacer(newpath,'#!','./flask/bin/pip3')

#Замена директории виртуального окружения в activate
newpath = os.path.abspath('./flask/')
replacer(newpath,'VIRTUAL_ENV=|\"','./flask/bin/activate')

#Замена директории виртуального окружения в activate.csh
newpath = os.path.abspath('./flask/')
replacer(newpath,'setenv VIRTUAL_ENV |\"','./flask/bin/activate.csh')

#Замена директории виртуального окружения в activate.fish
newpath = os.path.abspath('./flask/')
replacer(newpath,'set -gx VIRTUAL_ENV |\"','./flask/bin/activate.fish')