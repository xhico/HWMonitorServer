# -*- coding: utf-8 -*-

import os
import socket

from flask import jsonify, request, Blueprint

# Define a Flask Blueprint instance
main = Blueprint("main", __name__)


# ---------------------------------------------------------------------------------------------------------- #
# ---------------------------------------------------------------------------------------------------------- #

@main.after_request
def add_header(r):
    """
    Add headers to both force the latest IE rendering engine or Chrome Frame,
    and also to cache the rendered page for 10 minutes.
    """
    r.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    r.headers["Pragma"] = "no-cache"
    r.headers["Expires"] = "0"
    r.headers['Cache-Control'] = 'public, max-age=0'
    return r


@main.route("/main/power", methods=['POST'])
def json_power():
    """
    Endpoint for controlling system power.

    Args:
        option (str): Power option to execute ('reboot', 'poweroff' or 'restart').

    Returns:
        A JSON response containing a 'message' key with the operation result, and an 'option' key with the chosen option.
    """
    option = request.form.get('option', type=str)

    if option == "reboot" or option == "poweroff":
        # Execute the chosen power option using sudo privileges
        os.system("sudo " + option)
        msg = {"message": "success"}
    elif option == "restart":
        # Restart the HWMonitorServer service using sudo privileges
        os.system("sudo service HWMonitorServer restart")
        msg = {"message": "success"}
    else:
        # The option provided is not supported
        msg = {"message": "failed"}

    # Add the chosen option to the response
    msg["option"] = option
    return jsonify(msg)


@main.route("/main/status")
def json_status():
    """
    Endpoint for checking the system status.

    Returns:
        A JSON response containing a 'Status' key with the value 'alive'.
    """
    return jsonify({"Status": "alive"})


@main.route("/main/hostname")
def json_hostname():
    """
    Endpoint for retrieving the system hostname.

    Returns:
        A JSON response containing a 'Hostname' key with the value of the system hostname in uppercase.
    """
    return jsonify({"Hostname": str(socket.gethostname()).upper()})
