# -*- coding: utf-8 -*-

import psutil
from flask import render_template, jsonify, Blueprint, request
import HWMonitorServer.bots.models as models

# Define a Flask Blueprint instance
bots = Blueprint("bots", __name__)


# ---------------------------------------------------------------------------------------------------------- #
# ---------------------------------------------------------------------------------------------------------- #

@bots.route("/bots")
def index():
    """
    Renders the "bots.html" template when the URL endpoint is visited.

    Returns:
        A rendered HTML template.
    """
    return render_template("bots.html")


@bots.route("/bots/info")
def json_botsInfo():
    """
    Retrieves information about all bots and returns it in a JSON format.

    Returns:
        A JSON object containing information about all bots.
    """
    return jsonify(models.getBots())


@bots.route("/bots/action", methods=['POST'])
def json_action():
    """
    Performs an action on a bot based on user input received from a form.
    The available actions are: "kill", "run", and "log".

    Returns:
        A JSON object containing information about the success or failure of the action performed.
    """
    value = request.form.get('value', type=str)
    name = request.form.get('name', type=str)

    try:
        if value == "kill":
            allBots = models.getBots()
            pid = int(allBots[name]["info"]["pid"])
            psutil.Process(pid).kill()
            resp = {"status": "success", "message": name + " killed successfully"}
        elif value == "run":
            models.runBot(name)
            resp = {"status": "success", "message": "Running " + name}
        elif value == "log":
            info = models.getBotLog(name)
            resp = {"status": "success", "message": "View Log successfully", "info": info}
        else:
            resp = {"status": "error", "message": "Invalid action - " + value}
        resp["action"] = value
    except Exception as ex:
        resp = {"status": "error", "message": str(ex)}

    return jsonify(resp)
