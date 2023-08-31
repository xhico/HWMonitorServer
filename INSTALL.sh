#!/bin/bash

sudo apt install python3 python3-pip python3-setuptools python3-venv -y
python3 -m pip install flask gunicorn requests gpiozero psutil --no-cache-dir
sudo apt install certbot -y
mkdir -p /home/pi/certs/
openssl genrsa -out /home/pi/certs/HWMonitorServer.key 2048
openssl req -new -key /home/pi/certs/HWMonitorServer.key -out /home/pi/certs/HWMonitorServer.csr -subj "/C=PT/ST=Leiria/L=Óbidos/O=xhico/CN=HWMonitorServer@$(hostname)"
openssl x509 -req -days 365 -in /home/pi/certs/HWMonitorServer.csr -signkey /home/pi/certs/HWMonitorServer.key -out /home/pi/certs/HWMonitorServer.crt

echo """
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
    SSLCertificateFile /home/pi/certs/HWMonitorServer.crt
    SSLCertificateKeyFile /home/pi/certs/HWMonitorServer.key
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