# -*- coding: utf-8 -*-
# !/usr/bin/python3

# python3 -m pip install flask requests gpiozero psutil flask-cors --no-cache-dir
# python3 /home/pi/HWMonitorServer/server.py
# cls; Copy-Item .\server.py Y:\HWMonitorServer\server.py -Force; Remove-Item Y:\HWMonitorServer\templates\* -R -Force; Copy-Item .\templates\*  Y:\HWMonitorServer\templates\ -R -Force ; Remove-Item Y:\HWMonitorServer\static\* -R -Force; Copy-Item .\static\* Y:\HWMonitorServer\static\ -R -Force

import datetime
import math
import re
import socket
import subprocess
import requests
import gpiozero
import psutil
import requests
from flask import Flask, render_template, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
cors = CORS(app, resources={r"/*": {"origins": "*"}})


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


def getIPAddress():
    try:
        localIP = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        localIP.connect(("8.8.8.8", 80))

        return {
            "hasInfo": "Yes",
            "Internal": localIP.getsockname()[0],
            "External": requests.get('https://api.ipify.org').content.decode('utf8')
        }
    except:
        return {"hasInfo": "None"}


def getAmbientHumidityTemperature():
    try:
        with open('/home/pi/HumiditySensor/HumiditySensor.txt', 'r') as csvFile:
            data = csvFile.readlines()[1].split(", ")
        csvFile.close()

        return {
            "hasInfo": "Yes",
            "Date": data[0],
            "TemperatureC": data[1],
            "TemperatureF": data[2],
            "Humidity": data[3],
            "Valid": data[4]
        }
    except:
        return {"hasInfo": "None"}


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
            "Wifi": getWifi(),
            "IPAddress": getIPAddress()
        }
    }


# --------------------------------- #

def getBotInfo(name):
    pDict, proc_iter = {}, psutil.process_iter(attrs=["pid", "cmdline"])
    p = [p for p in proc_iter if name in '\t'.join(p.info["cmdline"])]
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
        pDict["Running"], pDict["info"] = "True", {"pid": pid, "cpu": round(cpu, 2), "mem": round(mem, 2), "create_time": create_time.strftime("%Y/%m/%d %H:%M:%S"), "running_time": running_time}
    else:
        pDict["Running"] = "False"

    return pDict


def getBots():
    try:
        botsName = ["HumiditySensor", "EZTV-AutoDownloader", "TV3U", "SIDEBot", "RandomF1Quotes", "RandomUrbanDictionary", "Random9GAG", "FIMDocs", "FIADocs", "WSeriesDocs", "FIAFormulaEDocs"]
        d = {name: getBotInfo(name) for name in botsName}
        d["hasInfo"] = "yes"
        return d
    except:
        return {"hasInfo": "None"}


def runBot(name):
    scriptFile = "/home/pi/" + name + "/" + name + ".py"
    logFile = "/home/pi/" + name + "/" + name + ".log"
    proc = subprocess.Popen(("python3 " + scriptFile).split(" "), stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    with open(logFile, "a") as logFile:
        logFile.writelines([line.decode("UTF-8") for line in proc.stdout])
    proc.wait()


def getBotLog(name):
    logFile = "/home/pi/" + name + "/" + name + ".log"
    with open(logFile) as logFile:
        logInfo = logFile.readlines()
        logInfo = logInfo[-30:] if len(logInfo) > 30 else logInfo

    return "".join(logInfo)


# --------------------------------- #

@app.route("/")
@app.route("/stats")
def index():
    return render_template('stats.html')


@app.route("/bots")
def bots():
    return render_template('bots.html')


@app.route("/status")
def status():
    return jsonify({"Status": "alive"})


@app.route("/hostname")
def hostname():
    return jsonify(getHostname())


@app.route("/json/hwInfo")
def hwInfo():
    return jsonify(getInfo())


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


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=7777, debug=True)
