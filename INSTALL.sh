#!/bin/bash

sudo apt install python3 python3-pip python3-setuptools python3-venv -y
python3 -m pip install flask gunicorn requests gpiozero psutil --no-cache-dir

echo """
<VirtualHost *:80>
    ServerName monitor.$(hostname).xhico
    ErrorLog ${APACHE_LOG_DIR}/HWMonitorServer-error.log
    CustomLog ${APACHE_LOG_DIR}/HWMonitorServer-access.log combined

    <Proxy *>
        Order deny,allow
        Allow from all
    </Proxy>
    ProxyPreserveHost On

    <Location "/">
        ProxyPass unix:/run/HWMonitorServer.sock|http://127.0.0.1/
        ProxyPassReverse unix:/run/HWMonitorServer.sock|http://127.0.0.1/
    </Location>
</VirtualHost>
"""  | sudo tee -a /etc/apache2/sites-available/HWMonitorServer.conf

sudo mv /home/pi/HWMonitorServer/HWMonitorServer.socket /etc/systemd/system/
sudo mv /home/pi/HWMonitorServer/HWMonitorServer.service /etc/systemd/system/

sudo a2ensite HWMonitorServer.conf
sudo systemctl enable apache2
sudo systemctl enable HWMonitorServer.socket
sudo systemctl enable HWMonitorServer.service
sudo systemctl daemon-reload && sudo systemctl restart apache2
sudo systemctl restart HWMonitorServer
chmod +x -R /home/pi/HWMonitorServer/*