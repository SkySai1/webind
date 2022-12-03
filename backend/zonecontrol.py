import inspect
from flask import request, session

from backend.dbcontrol import zoneadd_query, get_zones_list, showOpts_query
from backend.function import logger

def zone(dbsql):
    if 'superadmin' in session.get('role') or 'admin' in session.get('role'):
        if 'getzones' == request.form.get('action'):
            return get_zones_list(dbsql)
        if 'show_opts' == request.form.get('action'):
            return zoneShowOpts(dbsql)
        if 'newzone' in request.form.get('action'):
            return zoneadd(dbsql)
    return 'failure'

def zoneadd(dbsql):
    try:
        if (not request.form.get('zonename') or
            not request.form.get('type')):
            return 'empty_zonetype'
        zonename = request.form.get('zonename'),
        z_type = request.form.get('type'),
        serial = request.form.get('serial'),
        ttl = request.form.get('TTL'),
        expire = request.form.get('expire'),
        refresh = request.form.get('refresh'),
        retry = request.form.get('retry'),
        
        if ('master' not in z_type[0] and
            'slave' not in z_type[0] and
            'forward' not in z_type[0]):
            return 'zone_type_bad'
        data = {
            'zonename': zonename,
            'type': z_type[0],
            'serial': serial,
            'TTL': ttl,
            'expire': expire,
            'refresh': refresh,
            'retry': retry
        }
        return zoneadd_query(dbsql, data)
    except Exception as e:
        logger(inspect.currentframe().f_code.co_name)
        return 'failure'

def zoneShowOpts(dbsql):
    try:
        data = {
            'type': 'zone'
        }
        return showOpts_query(dbsql, data)
    except Exception as e:
        logger(inspect.currentframe().f_code.co_name)
        return 'empty_serv_field'

