#!flask/bin/python3
from datetime import datetime
from logging import exception
import os
import random
import secrets
import string
from venv import create
import yaml
import socket
import hashlib
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from flask_sqlalchemy import SQLAlchemy
from flask import Flask
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import Session


app = Flask(__name__)
#app.config['SQLALCHEMY_DATABASE_URI'] = "postgresql+psycopg2://bind:bind22@localhost:5432/bind"
app.config['SQLALCHEMY_DATABASE_URI'] = "mysql+pymysql://webind:webind22./@localhost:3306/webind"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = 'True'
db = SQLAlchemy(app)

Base = declarative_base()
class Users(Base):
	__tablename__ = 'Users'

	id = db.Column(db.Integer, primary_key=True)
	username = db.Column(db.String(255), unique=True)
	password = db.Column(db.String(500), nullable=False)
	role = db.Column(db.String(50), unique=True)


def engine_create():
	engine = create_engine(f'mysql+pymysql://webind:webind22./@localhost:3306/webind')
	engine.connect()
	with Session(engine) as session:
		superadmin = Users(username='admin2', password='pass', role="admin") 
		session.add(superadmin) 
		session.commit()
def dbcreate():
	db.create_all()
	hash = hashlib.sha1('admin'.encode())
	u = Users(username='admin', role='superadmin', password=hash.hexdigest())
	db.session.add(u)
	db.session.commit()

def poscon():
	engine = create_engine('postgresql+psycopg2://bind:bind22@localhost:5432/bind')
	engine.connect()
	cursor = engine.connect()
	#answer = cursor.execute("select * from \"Users\" limit 1")
	answer = cursor.execute("SELECT * FROM \"Users\" WHERE username='admin'")
	result = answer.fetchone()
	print(result)

def mycon():
	engine = create_engine('mysql+pymysql://webind:webind22./@localhost:3306/webind')
	engine.connect()
	cursor = engine.connect()
	#answer = cursor.execute("select * from \"Users\" limit 1")
	answer = cursor.execute("SELECT * FROM \"Users\" WHERE username='admin'")
	result = answer.fetchone()
	print(result)
def some():
	test = 'MySQL AND PostgreSQL'
	print(test.lower())
if 'mysql' in str(db):
	print(str(db))