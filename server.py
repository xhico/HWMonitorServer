# -*- coding: utf-8 -*-
# !/usr/bin/python3

from HWMonitorServer import create_app

app = create_app()

if __name__ == '__main__':
    app.run()
    # app.run(host='0.0.0.0', port=5000, debug=True)
