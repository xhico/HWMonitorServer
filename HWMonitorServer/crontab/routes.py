# -*- coding: utf-8 -*-
# !/usr/bin/python3

import json

from flask import render_template, jsonify, Blueprint, request
import HWMonitorServer.crontab.models as models

crontab = Blueprint("crontab", __name__)


# ---------------------------------------------------------------------------------------------------------- #
# ---------------------------------------------------------------------------------------------------------- #

@crontab.route("/crontab")
def index():
    return render_template("crontab.html")


@crontab.route("/crontab/info")
def crontab_info():
    return jsonify(models.readCrontab())


@crontab.route("/crontab/save", methods=["POST"])
def crontab_save():
    cronjobs = request.form.get("cronjobs", type=str)
    cronjobs = json.loads(cronjobs)
    status, message = models.saveCrontab(cronjobs)
    return jsonify({"status": status, "message": message})
