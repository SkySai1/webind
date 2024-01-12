import datetime
import logging
import os


def logger(e):
	now = datetime.datetime.now()
	logdir = os.path.dirname(os.path.abspath(__file__))+"%s" % '/logs'
	if not os.path.exists(logdir):
			os.makedirs(logdir)
	logging.basicConfig(filename=f"{logdir}/errors.log", level=logging.DEBUG)
	logging.debug(f"\n\n{now}# DEBUG:")
	logging.info(f"\n\n{now}# INFO:")
	logging.warning(f"\n\n{now}# WARNING:")
	logging.error(f"\n\n{now}# ERROR:")
	logging.exception(f"{e}")