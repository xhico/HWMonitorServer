# -*- coding: utf-8 -*-
# !/usr/bin/python3

from flask import render_template, Blueprint, jsonify
import HWMonitorServer.eye.models as models

eye = Blueprint("eye", __name__)


# ---------------------------------------------------------------------------------------------------------- #
# ---------------------------------------------------------------------------------------------------------- #

@eye.route("/eye")
def index():
    return render_template('eye.html')


@eye.route("/eye/getRecordings")
def json_getRecordings():
    return jsonify(models.getRecordings())
