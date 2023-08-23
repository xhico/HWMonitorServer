# Set the encoding for the Python script to UTF-8
# Specify that this script should be run with Python 3

# -*- coding: utf-8 -*-
# !/usr/bin/python3

# Import the create_app function from the HWMonitorServer module
from HWMonitorServer import create_app

# Call the create_app function to create a Flask app object
app = create_app()

# Check if this script is being run as the main module
if __name__ == '__main__':
    #app.run()
    app.run(host='0.0.0.0')
