# -*- coding: utf-8 -*-
import os

from flask import render_template, Blueprint, request, jsonify

# Define a Flask Blueprint instance
ledircontroller = Blueprint("ledircontroller", __name__)


# ---------------------------------------------------------------------------------------------------------- #
# ---------------------------------------------------------------------------------------------------------- #

@ledircontroller.route("/ledircontroller")
def index():
    """
    Renders the "ledircontroller.html" template when the URL endpoint is visited.

    Returns:
        A rendered HTML template.
    """
    return render_template("ledircontroller.html")


@ledircontroller.route("/ledircontroller/btn", methods=['POST'])
def json_btn():
    """

    """
    value = request.form.get('value', type=str)
    text = request.form.get('text', type=str)

    try:
        resp = {"status": "success", "message": text + " clicked successfully"}
        os.system("python3 /home/pi/LEDIRController/LEDIRController.py " + value)
    except Exception as ex:
        resp = {"status": "error", "message": str(ex)}

    return jsonify(resp)
