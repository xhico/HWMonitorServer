# -*- coding: utf-8 -*-
# !/usr/bin/python3
import psutil
from flask import render_template, jsonify, Blueprint, request
import HWMonitorServer.top.models as models

top = Blueprint("top", __name__)


# ---------------------------------------------------------------------------------------------------------- #
# ---------------------------------------------------------------------------------------------------------- #

@top.route("/top")
def index():
    return render_template("top.html")


@top.route("/top/info", methods=['GET'])
def json_getTop():
    return models.getTop()


@top.route("/top/kill", methods=['POST'])
def json_killPID():
    pid = request.form.get('pid', type=int)

    try:
        psutil.Process(pid).kill()
        resp = {"status": "success", "message": str(pid) + " killed successfully"}
    except Exception as ex:
        resp = {"status": "error", "message": str(ex)}

    return jsonify(resp)
