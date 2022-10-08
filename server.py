# -*- coding: utf-8 -*-
# !/usr/bin/python3

# python3 -m pip install flask gunicorn requests gpiozero psutil --no-cache-dir


import datetime
import math
import os
import random
import re
import socket
import subprocess
import json
import gpiozero
import psutil
import requests
from glob import glob
from flask import Flask, render_template, jsonify, request

app = Flask(__name__)


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
            "Used": convert_size(psutil.virtual_memory().used),
            "Available": convert_size(psutil.virtual_memory().available),
            "Total": convert_size(psutil.virtual_memory().total)
        }
    except Exception:
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
    except Exception:
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
            "Sent": convert_size(subprocess.getoutput("cat /sys/class/net/eth0/statistics/tx_bytes")),
            "Received": convert_size(subprocess.getoutput("cat /sys/class/net/eth0/statistics/rx_bytes")),
            "Packets_Sent": subprocess.getoutput("cat /sys/class/net/eth0/statistics/rx_packets"),
            "Packets_Received": subprocess.getoutput("cat /sys/class/net/eth0/statistics/tx_packets"),
        }
    except Exception:
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
    except Exception:
        return {"hasInfo": "None"}


def getIPAddress():
    try:
        localIP = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        localIP.connect(("8.8.8.8", 80))

        return {
            "hasInfo": "Yes",
            "Internal": localIP.getsockname()[0],
            "External": requests.get('https://api.ipify.org').content.decode('utf8')
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


# --------------------------------- #

def getBotInfo(name):
    pDict, proc_iter = {}, psutil.process_iter(attrs=["pid", "cmdline"])
    p = [p for p in proc_iter if name + ".py" in '\t'.join(p.info["cmdline"])]
    if len(p) != 0:
        p = p[0]
        pid = p.pid
        cpu = p.cpu_percent()
        mem = p.memory_percent()
        create_time = datetime.datetime.fromtimestamp(p.create_time())
        running_time = datetime.timedelta(seconds=(datetime.datetime.now() - create_time).total_seconds())
        d = {"days": running_time.days}
        d["hours"], rem = divmod(running_time.seconds, 3600)
        d["minutes"], d["seconds"] = divmod(rem, 60)
        running_time = "{days} days {hours}h {minutes}m {seconds}s".format(**d)
        pDict["Running"], pDict["info"] = "True", {"pid": pid, "cpu": round(cpu, 2), "memory": round(mem, 2), "create_time": create_time.strftime("%Y/%m/%d %H:%M:%S"), "running_time": running_time}
    else:
        pDict["Running"] = "False"

    return pDict


def getBots():
    try:
        botsName = ["EZTV-AutoDownloader", "TV3U", "RandomF1Quotes", "RandomUrbanDictionary", "Random9GAG", "FIMDocs", "WSeriesDocs", "FIAFormulaEDocs", "ddnsUpdater", "RaspberryPiSurveillance", "NoIpUpdater"]
        d = {name: getBotInfo(name) for name in botsName}
        d["hasInfo"] = "yes"
        return d
    except Exception:
        return {"hasInfo": "None"}


def runBot(name):
    scriptFile = "/home/pi/" + name + "/" + name + ".py"
    cmd = " ".join(["python3", scriptFile, "&"])
    os.system(cmd)
    


def getBotLog(name):
    logFile = "/home/pi/" + name + "/" + name + ".log"
    logInfo = subprocess.getoutput("tail -n 30 " + logFile)
    return logInfo


# --------------------------------- #


def getAmbientInfo(numberTime, unitTime):
    hours = numberTime

    # Convert to hours
    if unitTime == "day":
        hours = numberTime * 24
    elif unitTime == "week":
        hours = numberTime * 24 * 7
    startDate = datetime.datetime.now() - datetime.timedelta(hours=hours)

    # Read JSON File
    with open("/home/pi/HumiditySensor/HumiditySensor.json") as inFile:
        data = json.load(inFile)

    # Get valid data and inside timeframe
    temp_cInfo, humidityInfo = [], []
    avgTemp_c, avgHumidity, countTemp_c, countHumidity = 0, 0, 0, 0

    for entry in data:
        entryDate = datetime.datetime.strptime(entry["date"], "%Y/%m/%d %H:%M")

        if entryDate >= startDate and entry["valid"] == "True":
            temp_cInfo.append([entry["date"], float(entry["temp_c"])])
            humidityInfo.append([entry["date"], float(entry["humidity"])])
            avgTemp_c += float(entry["temp_c"])
            avgHumidity += float(entry["humidity"])
            countTemp_c += 1
            countHumidity += 1

    # Crop if > 100 entries
    totalEntries = len(temp_cInfo)
    if totalEntries >= 100:
        to_delete = set(random.sample(range(len(temp_cInfo)), totalEntries - 100))
        temp_cInfo = [x for i, x in enumerate(temp_cInfo) if i not in to_delete]
        to_delete = set(random.sample(range(len(humidityInfo)), totalEntries - 100))
        humidityInfo = [x for i, x in enumerate(humidityInfo) if i not in to_delete]
    temp_cInfo, humidityInfo = list(reversed(temp_cInfo)), list(reversed(humidityInfo))

    avgTemp_c = [[temp_cInfo[i][0], round(avgTemp_c / countTemp_c, 1)] for i in range(len(temp_cInfo))]
    avgHumidity = [[humidityInfo[i][0], round(avgHumidity / countHumidity, 1)] for i in range(len(humidityInfo))]

    return temp_cInfo, humidityInfo, avgTemp_c, avgHumidity


def getRecordings():
    RECORDINGS_FOLDER = "/home/pi/RaspberryPiSurveillance/_RECORDINGS/"
    allFiles = [file for x in os.walk(RECORDINGS_FOLDER) for file in glob(os.path.join(x[0], '*.mp4'))]
    allFiles = [file.replace(RECORDINGS_FOLDER, "").replace(".mp4", "") for file in allFiles]
    allFiles = sorted(allFiles, reverse=True)

    _recInfo = []
    for idx, rec in enumerate(allFiles):
        info = {"idx": idx, "rec": rec, "name": datetime.datetime.strptime(rec.split("/")[-1], "%Y-%m-%d_%H-%M-%S").strftime('%Y-%m-%d %H:%M:%S')}
        info["TODAY"] = True if datetime.datetime.now().strftime("%Y-%m-%d") in info["name"] else False
        _recInfo.append(info)

    return _recInfo


# --------------------------------- #


@app.route("/")
@app.route("/stats")
def view_index():
    return render_template('stats.html')


@app.route("/bots")
def view_bots():
    return render_template('bots.html')


@app.route("/ambient")
def view_ambient():
    return render_template('ambient.html')


@app.route("/eye")
def view_eye():
    return render_template('eye.html', recInfo=getRecordings())


@app.route("/status")
def status():
    return jsonify({"Status": "alive"})


@app.route("/hostname")
def hostname():
    return jsonify(getHostname())


@app.route("/json/hwInfo")
def hwInfo():
    return jsonify(getHWInfo())


@app.route("/json/botsInfo")
def botsInfo():
    return jsonify(getBots())


@app.route("/bots/action", methods=['POST'])
def action():
    value = request.form.get('value', type=str)
    name = request.form.get('name', type=str)

    info = ""
    if value == "kill":
        allBots = getBots()
        pid = int(allBots[name]["info"]["pid"])
        psutil.Process(pid).kill()
    elif value == "run":
        runBot(name)
    elif value == "log":
        info = getBotLog(name)

    return jsonify({"message": "success", "action": value, "info": info})


@app.route("/json/ambientInfo", methods=['POST'])
def ambientInfo():
    numberTime = request.form.get('numberTime', type=int)
    unitTime = request.form.get('unitTime', type=str)
    temp_cInfo, humidityInfo, avgTemp_c, avgHumidity = getAmbientInfo(numberTime, unitTime)
    return jsonify({"temp_c": [temp_cInfo, avgTemp_c], "humidity": [humidityInfo, avgHumidity]})


@app.after_request
def add_header(r):
    """
    Add headers to both force the latest IE rendering engine or Chrome Frame,
    and also to cache the rendered page for 10 minutes.
    """
    r.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    r.headers["Pragma"] = "no-cache"
    r.headers["Expires"] = "0"
    r.headers['Cache-Control'] = 'public, max-age=0'
    return r


if __name__ == '__main__':
    app.run()
