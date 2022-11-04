# -*- coding: utf-8 -*-
# !/usr/bin/python3

import datetime
import os
import socket
import subprocess
import psutil
import requests

from HWMonitorServer.config import Config


def runBot(name):
    scriptFile = "/home/pi/" + name + "/" + name + ".py"
    cmd = " ".join(["python3", scriptFile, "&"])
    os.system(cmd)


def getBotLog(name):
    logFile = "/home/pi/" + name + "/" + name + ".log"
    logInfo = subprocess.getoutput("tail -n 30 " + logFile)
    return logInfo


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
        hostname = str(socket.gethostname()).upper()
        botsName = Config.config[hostname]["Bots"]
        d = {name: getBotInfo(name) for name in botsName}
        d["hasInfo"] = "yes"
        return d
    except Exception:
        return {"hasInfo": "None"}
