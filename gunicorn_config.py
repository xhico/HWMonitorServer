import multiprocessing

"""
Configures Gunicorn server settings with default values and returns them as a dictionary.

Returns:
dict: A dictionary containing Gunicorn server configuration settings.

"""
# Determine the number of worker processes to run, based on CPU count
workers = multiprocessing.cpu_count() * 2 + 1

# Set the socket to bind the server to
bind = 'unix:HWMonitorServer.sock'

# Set the umask to use when creating new files, to ensure proper permissions
umask = 0o007

# Enable automatic code reloading when files are changed
reload = True

# Set the file paths for logging access and error messages
accesslog = 'log_gunicorn_access.txt'
errorlog = 'log_gunicorn_error.txt'
