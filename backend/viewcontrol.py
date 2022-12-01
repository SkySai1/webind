import inspect
from flask import request, session

from backend.dbcontrol import get_views_list, newView_query, deleteView_query, viewNewOpt_query, viewRemoveOpt_query, viewUpdateOpt_query, viewShowOpts_query
from backend.function import logger

def view(dbsql):
    if 'superadmin' in session.get('role') or 'admin' in session.get('role'):
        if 'getviews' in request.form.get('action'):
            return get_views_list(dbsql)
        if 'new' == request.form.get('action'):
            return newView(dbsql)
        if 'delete' in request.form.get('action'):
            return deleteView(dbsql)
        if 'newopt' == request.form.get('action'):
            return viewNewOpt(dbsql)
        if 'show_opts' == request.form.get('action'):
            return viewShowOpts(dbsql)
        if 'update_opt' == request.form.get('action'):
            return viewUpdateOpt(dbsql)
        if 'remove_opt' == request.form.get('action'):
            return viewRemoveOpt(dbsql)
    return 'failure'


def newView(dbsql):
    for key, value in request.form.items(multi=True):
        if not request.form.get(key): 
            return 'empty_serv_field'
    try:
        data = {
            'name': request.form['name'],
            'alias': request.form['alias']
        }
    except Exception as e:
        logger(inspect.currentframe().f_code.co_name)
        return 'empty_serv_field'
    return newView_query(dbsql, data)

def deleteView(dbsql):
    id = request.form.get('id')
    if id: return deleteView_query(dbsql, id)
    else: return 'failure'
    
def viewNewOpt(dbsql):
    for key, value in request.form.items(multi=True):
        if not request.form.get(key): 
            return 'empty_serv_field'
    data = {
        'viewID' : request.form.get('viewID'),
        'config': request.form.get('name'),
        'value': request.form.get('value')
    }
    return viewNewOpt_query(dbsql, data)

def viewUpdateOpt(dbsql):
    try:
        data = {
            'viewID': request.form['id'],
            'config': request.form['name'],
            'value': request.form['value']
        }
        return viewUpdateOpt_query(dbsql, data)
    except Exception as e:
        logger(inspect.currentframe().f_code.co_name)
        return 'empty_serv_field'

def viewRemoveOpt(dbsql):
    try:
        data = {
            'name': request.form['name'],
            'id': request.form['id']
        }
        return viewRemoveOpt_query(dbsql, data)
    except Exception as e:
        logger(inspect.currentframe().f_code.co_name)
        return 'empty_serv_field'

def viewShowOpts(dbsql):
    try:
        data = {
            'type': 'view'
        }
        return viewShowOpts_query(dbsql, data)
    except Exception as e:
        logger(inspect.currentframe().f_code.co_name)
        return 'empty_serv_field'
