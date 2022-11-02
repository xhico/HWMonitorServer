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
    size_name = ("B", "KB", "MB", "GB", "TB")
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
        botsName = ["EZTV-AutoDownloader", "TV3U", "RandomF1Quotes", "RandomUrbanDictionary", "Random9GAG", "FIMDocs", "WSeriesDocs", "FIAFormulaEDocs", "ddnsUpdater", "RaspberryPiSurveillance", "NoIpUpdater", "ipSender", "HardwareHistory"]
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


def getHistoricInfo(numberTime, unitTime, hwMetric):
    hours = numberTime

    # Convert to hours
    if unitTime == "day":
        hours = numberTime * 24
    elif unitTime == "week":
        hours = numberTime * 24 * 7
    startDate = datetime.datetime.now() - datetime.timedelta(hours=hours)

    # Open Historic JSON
    with open("/home/pi/HardwareHistory/HardwareHistory.json") as inFile:
        data = json.load(inFile)

    # Get only valid data
    validData = []
    for entry in data:
        if datetime.datetime.strptime(entry["Date"], "%Y/%m/%d %H:%M") >= startDate:
            entry[hwMetric]["Date"] = entry["Date"]
            validData.append(entry[hwMetric])

    # Split data
    processData = {}
    for entry in validData:
        for k, v in entry.items():
            v = float(re.sub(r"[a-zA-Z]", "", str(v)).strip()) if k != "Date" else v
            if k in processData:
                processData[k].append(v)
            else:
                processData[k] = [v]

    # Process Data
    for k, v in processData.items():
        # Crop if > 100 entries
        totalEntries = len(processData[k])
        if totalEntries >= 100:
            to_delete = set(random.sample(range(len(processData[k])), totalEntries - 100))
            processData[k] = [x for i, x in enumerate(processData[k]) if i not in to_delete]

        # Reverse List
        processData[k] = list(reversed(v))

        # Set Averages
        if k != "Date":
            processData[k] = [processData[k], [round(sum(v) / len(v), 1) for _ in range(len(v))]]

    return processData


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


@app.route("/history")
def view_history():
    return render_template('history.html')


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


@app.route("/json/history", methods=['POST'])
def ambientInfo():
    numberTime = request.form.get('numberTime', type=int)
    unitTime = request.form.get('unitTime', type=str)
    hwMetric = request.form.get('hwMetric', type=str)
    historicInfo = getHistoricInfo(numberTime, unitTime, hwMetric)
    return jsonify(historicInfo)


@app.route("/power", methods=['POST'])
def powerOpt():
    option = request.form.get('option', type=str)
    if option == "reboot" or option == "poweroff":
        os.system("sudo " + option)
    elif option == "restart":
        os.system("sudo service HWMonitorServer restart")
    else:
        return


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
    app.run(host="0.0.0.0")
