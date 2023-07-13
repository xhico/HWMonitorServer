# -*- coding: utf-8 -*-
import os

from flask import render_template, jsonify, Blueprint, request
import HWMonitorServer.pivpn.models as models

# Define a Flask pivpn instance
pivpn = Blueprint("pivpn", __name__)


# ---------------------------------------------------------------------------------------------------------- #
# ---------------------------------------------------------------------------------------------------------- #

@pivpn.route("/pivpn")
def index():
    """Render an HTML template named 'configuration.html'."""
    return render_template("pivpn.html")


@pivpn.route("/pivpn/info", methods=["GET"])
def pivpn_info():
    """
    Retrieves pivpn information.

    Returns:
        A JSON response containing the pivpn info.
    """
    pivpnInfo = models.getPiVPNInfo()
    return jsonify(pivpnInfo)


@pivpn.route("/pivpn/revoke", methods=["POST"])
def pivpn_revoke():
    """
    Revokes a profile from PiVPN

    Returns:
        A JSON response containing success message
    """

    name = request.form.get("name", type=str)
    os.system("pivpn revoke " + name + " -y")
    return jsonify({"message": "success"})


@pivpn.route("/pivpn/add", methods=["POST"])
def pivpn_add():
    """
    Add a profile from PiVPN

    Returns:
        A JSON response containing success message
    """

    clientName = request.form.get("clientName", type=str)
    clientPW = request.form.get("clientPW", type=str)
    clientDays = request.form.get("clientDays", type=str)
    os.system("pivpn -a -n " + clientName + " -p " + clientPW + " -d " + clientDays)
    return jsonify({"message": "success"})
