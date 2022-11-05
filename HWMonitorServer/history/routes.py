# -*- coding: utf-8 -*-
# !/usr/bin/python3

from flask import render_template, jsonify, Blueprint, request
import HWMonitorServer.history.models as models

history = Blueprint("history", __name__)


# ---------------------------------------------------------------------------------------------------------- #
# ---------------------------------------------------------------------------------------------------------- #

@history.route("/history")
def index():
    return render_template("history.html")


@history.route("/history/info", methods=['POST'])
def history_info():
    numberTime = request.form.get('numberTime', type=int)
    unitTime = request.form.get('unitTime', type=str)
    hwMetric = request.form.get('hwMetric', type=str)
    keys, historicInfo = models.getHistoricInfo(numberTime, unitTime, hwMetric)
    return jsonify({"info": historicInfo, "keys": keys})
