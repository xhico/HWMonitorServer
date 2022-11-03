# -*- coding: utf-8 -*-
# !/usr/bin/python3

import datetime
import json
import re
import socket
import subprocess
import urllib.request

import gpiozero
import psutil


def getVersions():
    try:
        return {
            "hasInfo": "Yes",
            "Processor": subprocess.getoutput("cat /proc/cpuinfo | grep Model | tail -1").split(':')[1].lstrip(),
            "Distribution": subprocess.getoutput("cat /etc/os-release | head -n 1").split('=')[1][1:-1],
            "Kernel": subprocess.getoutput("uname -msr"),
            "Firmware": re.search(r"#\d+", subprocess.getoutput("cat /proc/version")).group()
        }
    except Exception:
        return {"hasInfo": "None"}


def getUptime():
    date_now = datetime.datetime.now()
    boot_time = datetime.datetime.fromtimestamp(psutil.boot_time())
    delta_time = datetime.timedelta(seconds=(date_now - boot_time).total_seconds())
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
    except Exception:
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
    except Exception:
        return {"hasInfo": "None"}


def getTemperature():
    try:
        return {
            "hasInfo": "Yes",
            "Temperature": round(gpiozero.CPUTemperature().temperature, 2),
        }
    except Exception:
        return {"hasInfo": "None"}


def getMemory():
    try:
        return {
            "hasInfo": "Yes",
            "Percentage": round(psutil.virtual_memory().percent, 2),
            "Used": psutil.virtual_memory().used,
            "Available": psutil.virtual_memory().available,
            "Total": psutil.virtual_memory().total
        }
    except Exception:
        return {"hasInfo": "None"}


def getSDCard():
    try:
        return {
            "hasInfo": "Yes",
            "Percentage": round(psutil.disk_usage('/').percent, 2),
            "Used": psutil.disk_usage('/').used,
            "Free": psutil.disk_usage('/').free,
            "Total": psutil.disk_usage('/').total
        }
    except Exception:
        return {"hasInfo": "None"}


def get918():
    try:
        return {
            "hasInfo": "Yes",
            "Available": "Yes",
            "Percentage": round(psutil.disk_usage('/media/pi/918').percent, 2),
            "Used": psutil.disk_usage('/media/pi/918').used,
            "Free": psutil.disk_usage('/media/pi/918').free,
            "Total": psutil.disk_usage('/media/pi/918').total
        }
    except Exception:
        return {"hasInfo": "None"}


def getHostname():
    try:
        return {
            "hasInfo": "Yes",
            "Hostname": str(socket.gethostname()).upper(),
        }
    except Exception:
        return {"hasInfo": "None"}


def getWired():
    try:
        return {
            "hasInfo": "Yes",
            "IP": subprocess.getoutput("ip addr show eth0 | grep 'inet\b' | awk '{print $2}' | cut -d/ -f1"),
            "Sent": int(subprocess.getoutput("cat /sys/class/net/eth0/statistics/tx_bytes")),
            "Received": int(subprocess.getoutput("cat /sys/class/net/eth0/statistics/rx_bytes")),
            "Packets_Sent": int(subprocess.getoutput("cat /sys/class/net/eth0/statistics/rx_packets")),
            "Packets_Received": int(subprocess.getoutput("cat /sys/class/net/eth0/statistics/tx_packets")),
        }
    except Exception:
        return {"hasInfo": "None"}


def getWifi():
    try:
        return {
            "hasInfo": "Yes",
            "IP": subprocess.getoutput("ip addr show wlan0 | grep 'inet\b' | awk '{print $2}' | cut -d/ -f1"),
            "Sent": int(subprocess.getoutput("cat /sys/class/net/wlan0/statistics/tx_bytes")),
            "Received": int(subprocess.getoutput("cat /sys/class/net/wlan0/statistics/rx_bytes")),
            "Packets_Sent": int(subprocess.getoutput("cat /sys/class/net/wlan0/statistics/rx_packets")),
            "Packets_Received": int(subprocess.getoutput("cat /sys/class/net/wlan0/statistics/tx_packets")),
        }
    except Exception:
        return {"hasInfo": "None"}


def getIPAddress():
    try:
        localIP = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        localIP.connect(("8.8.8.8", 80))

        return {
            "hasInfo": "Yes",
            "Internal": localIP.getsockname()[0],
            "External": urllib.request.urlopen("https://v4.ident.me/").read().decode("utf8")
        }
    except Exception:
        return {"hasInfo": "None"}


def getAmbientHumidityTemperature():
    try:
        with open("/home/pi/HumiditySensor/HumiditySensor.json") as inFile:
            data = json.load(inFile)[0]

        return {
            "hasInfo": "Yes",
            "Date": data["date"],
            "TemperatureC": data["temp_c"],
            "TemperatureF": data["temp_f"],
            "Humidity": data["humidity"],
            "Valid": data["valid"]
        }
    except Exception:
        return {"hasInfo": "None"}


def getHWInfo():
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
            "Wifi": getWifi(),
            "IPAddress": getIPAddress()
        }
    }
