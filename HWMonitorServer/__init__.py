from flask import Flask
from HWMonitorServer.config import Config


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(Config)

    from HWMonitorServer.main.routes import main
    from HWMonitorServer.stats.routes import stats
    from HWMonitorServer.bots.routes import bots
    from HWMonitorServer.history.routes import history
    from HWMonitorServer.crontab.routes import crontab
    from HWMonitorServer.top.routes import top
    from HWMonitorServer.eye.routes import eye

    app.register_blueprint(main)
    app.register_blueprint(stats)
    app.register_blueprint(bots)
    app.register_blueprint(history)
    app.register_blueprint(crontab)
    app.register_blueprint(top)
    app.register_blueprint(eye)

    return app
