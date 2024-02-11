# -*- coding: utf-8 -*-

from flask import render_template, Blueprint, jsonify

import HWMonitorServer.eye.models as models

# Define a Flask Blueprint instance
eye = Blueprint("eye", __name__)


# ---------------------------------------------------------------------------------------------------------- #
# ---------------------------------------------------------------------------------------------------------- #

@eye.route("/eye")
def index():
    """Render the eye.html template"""
    return render_template('eye.html')


@eye.route("/eye/getRecordings")
def json_getRecordings():
    """Return the JSON representation of recordings fetched from the database."""
    # Get recordings from the database using models.getRecordings() function
    recordings = models.getRecordings()

    # Return the JSON representation of recordings using Flask's jsonify() function
    return jsonify(recordings)
