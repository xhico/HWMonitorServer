# -*- coding: utf-8 -*-

import json

from flask import render_template, jsonify, Blueprint, request

import HWMonitorServer.crontab.models as models

# Define a Flask Blueprint instance
crontab = Blueprint("crontab", __name__)


# ---------------------------------------------------------------------------------------------------------- #
# ---------------------------------------------------------------------------------------------------------- #

@crontab.route("/crontab")
def index():
    """Render an HTML template named 'crontab.html'."""
    return render_template("crontab.html")


@crontab.route("/crontab/info")
def crontab_info():
    """Return crontab information in JSON format."""
    return jsonify(models.readCrontab())


@crontab.route("/crontab/save", methods=["POST"])
def crontab_save():
    """Save crontab information sent through a POST request in JSON format."""

    # Retrieve the crontab information sent through the POST request.
    cronjobs = request.form.get("cronjobs", type=str)

    # Convert the crontab information from string to JSON format.
    cronjobs = json.loads(cronjobs)

    # Save the crontab information and get the status and message.
    status, message = models.saveCrontab(cronjobs)

    # Return the status and message in JSON format.
    return jsonify({"status": status, "message": message})
