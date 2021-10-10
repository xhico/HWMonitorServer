# -*- coding: utf-8 -*-
# !/usr/bin/python3

# python3 -m pip install flask gpiozero psutil flask-cors --no-cache-dir
# python3 RaspberryPiHWMonitorServer/server.py

import datetime
import math
import re
import socket
import subprocess

import gpiozero
import psutil
from flask import Flask, render_template, jsonify
from flask_cors import CORS

app = Flask(__name__)
cors = CORS(app, resources={r"/*": {"origins": "*"}})


# Convert bytes to human readable sizes
def convert_size(size_bytes):
    if size_bytes == "0":
        return "0B"

    size_bytes = int(size_bytes)
    size_name = ("B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB")
    i = int(math.floor(math.log(size_bytes, 1024)))
    p = math.pow(1024, i)
    s = round(size_bytes / p, 2)
    return "%s %s" % (s, size_name[i])


def getVersions():
    try:
        return {
            "hasInfo": "Yes",
            "Processor": subprocess.getoutput("cat /proc/cpuinfo | grep model | tail -1").split(':')[1].lstrip(),
            "Distribution": subprocess.getoutput("cat /etc/os-release | head -n 1").split('=')[1][1:-1],
            "Kernel": subprocess.getoutput("uname -msr"),
            "Firmware": re.search(r"#\d+", subprocess.getoutput("cat /proc/version")).group()
        }
    except:
        return {"hasInfo": "None"}


def getUptime():
    date_now = datetime.datetime.now()
    boot_time = datetime.datetime.fromtimestamp(psutil.boot_time())
    delta_time = datetime.timedelta(
        seconds=(date_now - boot_time).total_seconds())
    d = {"days": delta_time.days}
    d["hours"], rem = divmod(delta_time.seconds, 3600)
    d["minutes"], d["seconds"] = divmod(rem, 60)

    try:
        return {
            "hasInfo": "Yes",
            "Date_Now": date_now.strftime("%Y/%m/%d %H:%M:%S"),
            "Boot_Time": boot_time.strftime("%Y/%m/%d %H:%M:%S"),
            "Uptime": "{days} days {hours}h {minutes}m {seconds}s".format(**d)
        }
    except:
        return {"hasInfo": "None"}


def getCPU():
    try:
        return {
            "hasInfo": "Yes",
            "Percentage": round(psutil.cpu_percent(), 2),
            "Cores": psutil.cpu_count(),
            "Frequency": round(psutil.cpu_freq().current, 2),
            "PIDs": len(psutil.pids()),
            "Voltage": subprocess.getoutput("vcgencmd measure_volts core").split('=')[1]
        }
    except:
        return {"hasInfo": "None"}


def getTemperature():
    try:
        return {
            "hasInfo": "Yes",
            "Temperature": round(gpiozero.CPUTemperature().temperature, 2),
        }
    except:
        return {"hasInfo": "None"}


def getMemory():
    try:
        return {
            "hasInfo": "Yes",
            "Percentage": round(psutil.virtual_memory().percent, 2),
            "Used": convert_size(psutil.virtual_memory().used),
            "Available": convert_size(psutil.virtual_memory().available),
            "Total": convert_size(psutil.virtual_memory().total)
        }
    except:
        return {"hasInfo": "None"}


def getSDCard():
    try:
        return {
            "hasInfo": "Yes",
            "Percentage": round(psutil.disk_usage('/').percent, 2),
            "Used": convert_size(psutil.disk_usage('/').used),
            "Free": convert_size(psutil.disk_usage('/').free),
            "Total": convert_size(psutil.disk_usage('/').total)
        }
    except:
        return {"hasInfo": "None"}


def get918():
    try:
        return {
            "hasInfo": "Yes",
            "Available": "Yes",
            "Percentage": round(psutil.disk_usage('/media/pi/918').percent, 2),
            "Used": convert_size(psutil.disk_usage('/media/pi/918').used),
            "Free": convert_size(psutil.disk_usage('/media/pi/918').free),
            "Total": convert_size(psutil.disk_usage('/media/pi/918').total)
        }
    except:
        return {"hasInfo": "None"}


def getHostname():
    try:
        return {
            "hasInfo": "Yes",
            "Hostname": str(socket.gethostname()).upper(),
        }
    except:
        return {"hasInfo": "None"}


def getWired():
    try:
        return {
            "hasInfo": "Yes",
            "IP": subprocess.getoutput("ip addr show eth0 | grep 'inet\b' | awk '{print $2}' | cut -d/ -f1"),
            "Sent": convert_size(subprocess.getoutput("cat /sys/class/net/eth0/statistics/tx_bytes")),
            "Received": convert_size(subprocess.getoutput("cat /sys/class/net/eth0/statistics/rx_bytes")),
            "Packets_Sent": subprocess.getoutput("cat /sys/class/net/eth0/statistics/rx_packets"),
            "Packets_Received": subprocess.getoutput("cat /sys/class/net/eth0/statistics/tx_packets"),
        }
    except:
        return {"hasInfo": "None"}


def getWifi():
    try:
        return {
            "hasInfo": "Yes",
            "IP": subprocess.getoutput("ip addr show wlan0 | grep 'inet\b' | awk '{print $2}' | cut -d/ -f1"),
            "Sent": convert_size(subprocess.getoutput("cat /sys/class/net/wlan0/statistics/tx_bytes")),
            "Received": convert_size(subprocess.getoutput("cat /sys/class/net/wlan0/statistics/rx_bytes")),
            "Packets_Sent": subprocess.getoutput("cat /sys/class/net/wlan0/statistics/rx_packets"),
            "Packets_Received": subprocess.getoutput("cat /sys/class/net/wlan0/statistics/tx_packets"),
        }
    except:
        return {"hasInfo": "None"}


def getAmbientHumidityTemperature():
    try:
        with open('/home/pi/RaspberryPiHumiditySensor/HumiditySensor.txt', 'r') as csvFile:
            data = csvFile.readlines()[1].split(",")
        csvFile.close()

        return {
            "hasInfo": "Yes",
            "Date": data[0],
            "Humidity": data[1],
            "Temperature": data[2]
        }
    except:
        return {"hasInfo": "None"}


# Get Hardware / Software Information
def getInfo():
    return {
        "Version": getVersions(),
        "Uptime": getUptime(),
        "CPU": getCPU(),
        "Temperature": getTemperature(),
        "AmbientHumidityTemperature": getAmbientHumidityTemperature(),
        "Memory": getMemory(),
        "Disks": {
            "SDCard": getSDCard(),
            "918": get918()
        },
        "Network": {
            "Info": getHostname(),
            "Wired": getWired(),
            "Wifi": getWifi()
        }
    }


@app.route("/")
def index():
    return render_template('index.html', conf=getInfo())


@app.route("/json")
def json():
    return jsonify(getInfo())


@app.route("/status")
def status():
    return jsonify({"Status": "alive"})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8888)
