#!./flask/bin/python3

import os
import re
from itertools import islice

newpath = os.path.abspath('./flask/bin/python3')
with open('./flask/bin/pip3', 'r') as f:
    file = f.read()
    oldpath = re.search(r'.*', file)
with open('./flask/bin/pip3', 'w') as f:
    f.write(file.replace(oldpath[0],f"#!{newpath}"))
    
