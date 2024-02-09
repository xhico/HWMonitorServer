#!/bin/bash

sudo apt install python3 python3-pip python3-setuptools python3-venv -y
sudo apt install raspberrypi-sys-mods -y
python3 -m pip install -r /home/pi/HWMonitorServer/requirements.txt --no-cache-dir

echo """
<VirtualHost *:80>
	ServerName monitor.$(hostname).xhico
	Redirect permanent / https://monitor.$(hostname).xhico
</VirtualHost>

<VirtualHost *:443>
    ServerName monitor.$(hostname).xhico
    ErrorLog /var/www/HWMonitorServer-error.log
    CustomLog /var/www/HWMonitorServer-access.log combined

    <Proxy *>
        Order deny,allow
        Allow from all
    </Proxy>
    ProxyPreserveHost On

    <Location "/">
        ProxyPass unix:/run/HWMonitorServer.sock|http://127.0.0.1/
        ProxyPassReverse unix:/run/HWMonitorServer.sock|http://127.0.0.1/
    </Location>

    SSLEngine on
    SSLCertificateFile /home/pi/certs/$(hostname).crt
    SSLCertificateKeyFile /home/pi/certs/$(hostname).key
</VirtualHost>
"""  | sudo tee /etc/apache2/sites-available/HWMonitorServer.conf

sudo mv /home/pi/HWMonitorServer/HWMonitorServer.socket /etc/systemd/system/
sudo mv /home/pi/HWMonitorServer/HWMonitorServer.service /etc/systemd/system/

sudo a2ensite HWMonitorServer.conf
sudo systemctl enable apache2
sudo systemctl daemon-reload && sudo systemctl restart apache2
sudo systemctl restart HWMonitorServer
if [ -d "/home/pi/RaspberryPiSurveillance/" ]; then
  ln -s /home/pi/RaspberryPiSurveillance/_RECORDINGS/ /home/pi/HWMonitorServer/HWMonitorServer/static/
fi
chmod +x -R /home/pi/HWMonitorServer/*