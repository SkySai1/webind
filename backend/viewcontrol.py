import inspect
from flask import request, session

from backend.dbcontrol import get_views_list
from backend.function import logger

def view(dbsql):
    if 'superadmin' in session.get('role') or 'admin' in session.get('role'):
        if 'getviews' in request.form.get('action'):
            return get_views_list(dbsql)
    return 'failure'