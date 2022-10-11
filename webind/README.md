# webind
Required Packages: python3-venv, python3-pip, python3-dev, default-libmysqlclient-dev, build-essential, libpq-dev.

Required pip modules (normally its preloaded in this project): wheel, flask, flask-mysqldb, flask-sqlalchemy, pyyaml, paramiko, psycopg2 (driver for PostgreSQL), pymysql (driver for MySQL).

After download you need to execute "configure.py" to create vritual environment (you must have python3*-venv package in your system).

TROUBLESHOOTING
- "<...> version 'GLIBC_2.26' not fouend (required by ./flask/bin/python3)". You need to check your GLIBC version by "ldd --version" command. If you have version below then 2.26, you need to update ur OS.
- "no module namaed markupsafe". Try to update pip trhough ./flask/bin/pip3 install --upgrade pip.
