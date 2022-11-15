# -*- coding: utf-8 -*-
# !/usr/bin/python3

from flask import render_template, jsonify, Blueprint
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
