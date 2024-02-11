# -*- coding: utf-8 -*-

import psutil
from flask import render_template, jsonify, Blueprint, request

import HWMonitorServer.top.models as models

# Define a Flask Blueprint instance
top = Blueprint("top", __name__)


# ---------------------------------------------------------------------------------------------------------- #
# ---------------------------------------------------------------------------------------------------------- #

@top.route("/top")
def index():
    """
    This function renders the top.html template

    Returns:
    - render_template: renders the top.html template
    """
    return render_template("top.html")


@top.route("/top/info", methods=['GET'])
def json_getTop():
    """
    This function returns the top processes sorted by CPU percentage usage

    Returns:
    - models.getTop(): the top processes sorted by CPU percentage usage
    """
    return models.getTop()


@top.route("/top/kill", methods=['POST'])
def json_killPID():
    """
    This function kills a process based on the PID specified in the POST request.

    Args:
    - pid: the PID of the process to kill

    Returns:
    - jsonify(resp): a JSON object containing the status of the request and a message describing the result
    """
    pid = request.form.get('pid', type=int)

    try:
        psutil.Process(pid).kill()
        resp = {"status": "success", "message": str(pid) + " killed successfully"}
    except Exception as ex:
        resp = {"status": "error", "message": str(ex)}

    return jsonify(resp)
