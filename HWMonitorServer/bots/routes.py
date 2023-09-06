# -*- coding: utf-8 -*-
import json
import os

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
    The available actions are: "start", "stop".

    Returns:
        A JSON object containing information about the success or failure of the action performed.
    """
    value = request.form.get('value', type=str)
    name = request.form.get('name', type=str)

    try:
        if value == "start":
            os.system("sudo service " + name + " start")
            resp = {"status": "success", "message": "Running " + name}
        elif value == "stop":
            os.system("sudo service " + name + " stop")
            resp = {"status": "success", "message": name + " killed successfully"}
        else:
            raise Exception("Invalid Action value - " + value)
    except Exception as ex:
        resp = {"status": "error", "message": str(ex)}

    return jsonify(resp)


@bots.route("/bots/saveConfig", methods=['POST'])
def json_saveConfig():
    name = request.form.get('name', type=str)
    value = request.form.get('value', type=str)

    try:
        status, message = models.saveConfiguration(name, value)
        resp = {"status": status, "message": message}
    except Exception as ex:
        resp = {"status": "error", "message": str(ex)}

    return jsonify(resp)


@bots.route("/bots/loadFile", methods=['POST'])
def json_loadConfig():
    name = request.form.get('name', type=str)
    value = request.form.get('value', type=str)

    try:
        if value == "Log":
            info = models.getBotLog(name)
        elif value == "Config":
            info = models.getBotConfig(name)
        elif value == "SavedInfo":
            info = models.getBotSavedInfo(name)
        else:
            raise Exception("Invalid LoadFile value - " + value)
        resp = {"status": "success", "message": "Load " + value + " successfully", "info": info}
    except Exception as ex:
        resp = {"status": "error", "message": str(ex)}

    return jsonify(resp)
