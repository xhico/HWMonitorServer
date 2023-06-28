# -*- coding: utf-8 -*-

from flask import render_template, jsonify, Blueprint, request
import HWMonitorServer.configuration.models as models

# Define a Flask Blueprint instance
configuration = Blueprint("configuration", __name__)


# ---------------------------------------------------------------------------------------------------------- #
# ---------------------------------------------------------------------------------------------------------- #

@configuration.route("/configuration")
def index():
    """Render an HTML template named 'configuration.html'."""
    return render_template("configuration.html")


@configuration.route("/configuration/info", methods=['GET'])
def configuration_info():
    """
    Retrieves configuration information.

    Returns:
        A JSON response containing the configuration content.
    """
    configContent = models.getConfigContents()
    return jsonify(configContent)


@configuration.route("/configuration/save", methods=["POST"])
def configuration_save():
    """Save configuration information sent through a POST request in JSON format."""

    # Retrieve the configContent information sent through the POST request.
    configContent = request.form.get("configContent", type=str)

    # Save the configContent information and get the status and message.
    status, message = models.saveConfiguration(configContent)

    # Return the status and message in JSON format.
    return jsonify({"status": status, "message": message})
