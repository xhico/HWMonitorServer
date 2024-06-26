# -*- coding: utf-8 -*-

from HWMonitorServer.config import Config
from flask import Flask


def create_app(config_class=Config):
    """
    This function creates and configures a Flask application.
    :param config_class: configuration class to use, defaults to Config
    :return: Flask application instance
    """

    # create a Flask application instance
    app = Flask(__name__)

    # load configuration from the provided configuration class
    app.config.from_object(Config)

    # import and register blueprints for each app module
    from HWMonitorServer.main.routes import main
    app.register_blueprint(main)

    from HWMonitorServer.stats.routes import stats
    app.register_blueprint(stats)

    from HWMonitorServer.bots.routes import bots
    app.register_blueprint(bots)

    from HWMonitorServer.history.routes import history
    app.register_blueprint(history)

    from HWMonitorServer.crontab.routes import crontab
    app.register_blueprint(crontab)

    from HWMonitorServer.top.routes import top
    app.register_blueprint(top)

    from HWMonitorServer.eye.routes import eye
    app.register_blueprint(eye)

    from HWMonitorServer.pivpn.routes import pivpn
    app.register_blueprint(pivpn)

    from HWMonitorServer.configuration.routes import configuration
    app.register_blueprint(configuration)

    from HWMonitorServer.ledircontroller.routes import ledircontroller
    app.register_blueprint(ledircontroller)

    # return the Flask application instance
    return app
