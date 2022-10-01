import multiprocessing

workers = multiprocessing.cpu_count() * 2 + 1
bind = 'unix:HWMonitorServer.sock'
umask = 0o007
reload = True

# logging
accesslog = 'log_gunicorn_access.txt'
errorlog = 'log_gunicorn_error.txt'
