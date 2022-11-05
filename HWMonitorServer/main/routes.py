# -*- coding: utf-8 -*-
# !/usr/bin/python3

import os
import socket

from flask import jsonify, request, Blueprint

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
    option = request.form.get('option', type=str)

    if option == "reboot" or option == "poweroff":
        os.system("sudo " + option)
        msg = {"message": "success"}
    elif option == "restart":
        os.system("sudo service HWMonitorServer restart")
        msg = {"message": "success"}
    else:
        msg = {"message": "failed"}

    msg["option"] = option
    return jsonify(msg)


@main.route("/main/status")
def json_status():
    return jsonify({"Status": "alive"})


@main.route("/main/hostname")
def json_hostname():
    return jsonify({"Hostname": str(socket.gethostname()).upper()})
