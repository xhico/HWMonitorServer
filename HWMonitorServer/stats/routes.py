# -*- coding: utf-8 -*-

from flask import render_template, jsonify, Blueprint
import HWMonitorServer.stats.models as models

# Define a Flask Blueprint instance
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
