# -*- coding: utf-8 -*-

import HWMonitorServer.stats.models as models
from flask import render_template, jsonify, Blueprint

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
