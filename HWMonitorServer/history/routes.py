# -*- coding: utf-8 -*-

from flask import render_template, jsonify, Blueprint, request
import HWMonitorServer.history.models as models

# Define a Flask Blueprint instance
history = Blueprint("history", __name__)


# ---------------------------------------------------------------------------------------------------------- #
# ---------------------------------------------------------------------------------------------------------- #

@history.route("/history")
def index():
    """
    Render the history.html template when accessing the "/history" route.
    """
    return render_template("history.html")


@history.route("/history/info", methods=['POST'])
def history_info():
    """
    Retrieve historical information from the 'models.getHistoricInfo' function using parameters passed through a POST request,
    and return it in JSON format.

    Parameters:
    -----------
    numberTime : int
        Number of time units for which to retrieve historical data.
    unitTime : str
        Time unit for which to retrieve historical data (e.g. 'days', 'weeks', 'months').
    hwMetric : str
        Name of the hardware metric to retrieve historical data for.

    Returns:
    --------
    A JSON object containing the following keys:
    'info' : list
        A list of historical data for the specified hardware metric.
    'keys' : list
        A list of the keys (e.g. dates, timestamps) corresponding to each piece of historical data.

    Raises:
    -------
    TypeError
        If the 'numberTime' parameter is not an integer, or the 'unitTime' and 'hwMetric' parameters are not strings.
    """
    numberTime = request.form.get("numberTime", type=int)
    unitTime = request.form.get("unitTime", type=str)
    hwMetric = request.form.get("hwMetric", type=str)
    availableMetrics, historicInfo = models.getHistoricInfo(numberTime, unitTime, hwMetric)
    return jsonify({"availableMetrics": availableMetrics, "historicInfo": historicInfo})
