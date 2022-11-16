import inspect
from flask import request, session

from backend.dbcontrol import get_views_list, newView_query, deleteView_query
from backend.function import logger

def view(dbsql):
    if 'superadmin' in session.get('role') or 'admin' in session.get('role'):
        if 'getviews' in request.form.get('action'):
            return get_views_list(dbsql)
        if 'new' in request.form.get('action'):
            return newView(dbsql)
        if 'delete' in request.form.get('action'):
            return deleteView(dbsql)
    return 'failure'


def newView(dbsql):
    for key, value in request.form.items(multi=True):
        if not request.form.get(key): 
            return 'empty_serv_field'
    data = {
        'name': request.form.get('name'),
        'alias': request.form.get('alias')
    }
    return newView_query(dbsql, data)

def deleteView(dbsql):
    id = request.form.get('id')
    if id: return deleteView_query(dbsql, id)
    else: return 'failure'
    