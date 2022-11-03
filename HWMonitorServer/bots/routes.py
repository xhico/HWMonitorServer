# -*- coding: utf-8 -*-
# !/usr/bin/python3
import psutil
from flask import render_template, jsonify, Blueprint, request
import HWMonitorServer.bots.models as models

bots = Blueprint("bots", __name__)


# ---------------------------------------------------------------------------------------------------------- #
# ---------------------------------------------------------------------------------------------------------- #

@bots.route("/bots")
def index():
    return render_template("bots.html")


@bots.route("/bots/info")
def json_botsInfo():
    return jsonify(models.getBots())


@bots.route("/bots/action", methods=['POST'])
def json_action():
    value = request.form.get('value', type=str)
    name = request.form.get('name', type=str)

    info = ""
    if value == "kill":
        allBots = models.getBots()
        pid = int(allBots[name]["info"]["pid"])
        psutil.Process(pid).kill()
    elif value == "run":
        models.runBot(name)
    elif value == "log":
        info = models.getBotLog(name)

    return jsonify({"message": "success", "action": value, "info": info})
