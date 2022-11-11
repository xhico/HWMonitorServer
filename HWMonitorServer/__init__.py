from flask import Flask
from HWMonitorServer.config import Config


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(Config)

    from HWMonitorServer.main.routes import main
    from HWMonitorServer.stats.routes import stats
    from HWMonitorServer.bots.routes import bots
    from HWMonitorServer.history.routes import history
    from HWMonitorServer.eye.routes import eye
    from HWMonitorServer.crontab.routes import crontab

    app.register_blueprint(main)
    app.register_blueprint(stats)
    app.register_blueprint(bots)
    app.register_blueprint(history)
    app.register_blueprint(eye)
    app.register_blueprint(crontab)

    return app
