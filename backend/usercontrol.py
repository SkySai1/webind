from flask import request

from backend.dbcontrol import *
from backend.function import logging

def users(dbsql):
    if 'superadmin' in session.get('role'):
        if 'useradd' == request.form.get('action'):
            return useradd(dbsql)
        elif 'userchange' == request.form.get('action'):
            return userchange(dbsql)
        elif 'userdel' == request.form.get('action'):
            return userdelete(dbsql)
        elif 'userfind' == request.form.get('action'):
            return usersfind(dbsql)
    return 'failure'

def useradd(dbsql):
    try:
        if not request.form.get('username') or not request.form.get('passwd'): return 'empty_login'
        if 'superadmin' == request.form.get('role'): role = 'superadmin'
        elif 'admin' == request.form.get('role'): role = 'admin'
        elif 'user' == request.form.get('role'): role = 'user'
        else: return 'bad_role'
        hashpass = hashlib.sha1(request.form['passwd'].encode()).hexdigest()
        username = request.form.get('username')
        data = {'username': username,
                'password': hashpass,
                'role': role}
        try:
            return useradd_query(dbsql, data)
        except Exception as e:
            logging('e', e, inspect.currentframe().f_code.co_name)
            return 'user_exist'
    except Exception as e:
        logging('e', e, inspect.currentframe().f_code.co_name) 
        return 'failure'

def userchange(dbsql):
    try:
        if not request.form.get('username'): return 'empty_user'
        else:
            username = request.form.get('username')
            try:
                userchange_checkuname_query(dbsql, username)
            except Exception as e:
                logging('e', e, inspect.currentframe().f_code.co_name)
                return 'failure'
        if 'on' == request.form.get('isnewpasswd') and not request.form.get('passwd'): return 'empty_field'
        elif 'on' == request.form.get('isnewusername') and not request.form.get('newusername'): return 'empty_field'
        elif 'on' == request.form.get('isnewrole') and not request.form.get('newrole'): return 'empty_field'
        elif (not request.form.get('isnewpasswd') and
              not request.form.get('isnewusername') and
              not request.form.get('isnewrole')): 
                return 'nothing_change'
        success = []
        if 'on' == request.form.get('isnewpasswd'): 
            hashpass = hashlib.sha1(request.form['passwd'].encode()).hexdigest()
            data = {'username': username,
                    'password': hashpass}
            success.append(userchange_updateupass_query(dbsql, data))
        if 'on' == request.form.get('isnewrole'):
            if 'superadmin' == request.form.get('newrole'): role = 'superadmin'
            elif 'admin' == request.form.get('newrole'): role = 'admin'
            elif 'user' == request.form.get('newrole'): role = 'user'
            else: return 'bad_role'
            data = {'username': username,
                    'role': role}
            success.append(userchange_updateurole_query(dbsql, data))
        if 'on' == request.form.get('isnewusername'):
            newusername = request.form.get('newusername')
            data = {'username': username,
                    'newusername': newusername}
            success.append(userchange_updateuname_query(dbsql, data))
        for value in success:
            if value is False: return 'change_fail'
        return 'change_success'
    except Exception as e:
        logging('e', e, inspect.currentframe().f_code.co_name)
        return 'failure'

def usersfind(dbsql):
    try:
        return usersfind_query(dbsql)
    except Exception as e: 
        logging('e', e, inspect.currentframe().f_code.co_name)
        return 'failure'

def userdelete(dbsql):
    if not request.form.get('username'): return 'empty_user'
    username = request.form.get('username')
    try:
        return userdelete_query(dbsql, username)
    except Exception as e:
        logging('e', e, inspect.currentframe().f_code.co_name)
        return 'failure'