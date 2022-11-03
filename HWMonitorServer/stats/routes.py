# -*- coding: utf-8 -*-
# !/usr/bin/python3

from flask import render_template, jsonify, Blueprint
import HWMonitorServer.stats.models as models

stats = Blueprint("stats", __name__)


# ---------------------------------------------------------------------------------------------------------- #
# ---------------------------------------------------------------------------------------------------------- #

@stats.route("/")
@stats.route("/stats")
def index():
    return render_template("stats.html")


@stats.route("/stats/getHWInfo")
def json_getHWInfo():
    return jsonify(models.getHWInfo())


@stats.route("/stats/hostname")
def json_hostname():
    return jsonify(models.getHostname())
