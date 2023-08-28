#!/bin/bash

sudo apt install python3 python3-pip python3-setuptools python3-venv -y
python3 -m pip install flask gunicorn requests gpiozero psutil --no-cache-dir

sudo mv /home/pi/HWMonitorServer/HWMonitorServer.conf /etc/apache2/sites-available/
sudo mv /home/pi/HWMonitorServer/HWMonitorServer.socket /etc/systemd/system/
sudo mv /home/pi/HWMonitorServer/HWMonitorServer.service /etc/systemd/system/

echo "Listen 33377" | sudo tee -a /etc/apache2/ports.conf

sudo a2ensite HWMonitorServer.conf
sudo systemctl enable apache2
sudo systemctl enable HWMonitorServer.socket
sudo systemctl enable HWMonitorServer.service
sudo systemctl daemon-reload && sudo systemctl restart apache2
sudo systemctl restart HWMonitorServer
chmod +x -R /home/pi/HWMonitorServer/*