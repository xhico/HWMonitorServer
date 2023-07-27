# -*- coding: utf-8 -*-

import subprocess
import psutil
import datetime
from HWMonitorServer.config import Config


def getBotLog(name: str) -> str:
    """
    Returns the last 30 lines of a log file for a bot with the given name.

    Args:
        name: A string representing the name of the bot.

    Returns:
        A string containing the last 30 lines of the bot's log file.
    """
    log_file = f"/home/pi/{name}/{name}.log"
    log_info = subprocess.getoutput(f"tail -n 30 {log_file}")
    return log_info


def getBotInfo(name):
    """
    Gets information about a bot process running on the system.
    :param name: the name of the bot process to retrieve information about
    :type name: str
    :return: a dictionary containing information about the bot process, or an empty dictionary if the process is not running
    :rtype: dict
    """

    # create an empty dictionary to store the process information
    pDict = {}

    # get a list of all running processes with the given name
    proc_iter = psutil.process_iter(attrs=["pid", "cmdline"])
    p = [p for p in proc_iter if name + ".py" in '\t'.join(p.info["cmdline"])]

    # if the process is running, get its information
    if len(p) != 0:
        p = p[0]
        pid = p.pid
        cpu = p.cpu_percent()
        mem = p.memory_percent()
        create_time = datetime.datetime.fromtimestamp(p.create_time())
        running_time = datetime.timedelta(seconds=(datetime.datetime.now() - create_time).total_seconds())

        # format the running time as a string
        d = {"days": running_time.days}
        d["hours"], rem = divmod(running_time.seconds, 3600)
        d["minutes"], d["seconds"] = divmod(rem, 60)
        running_time = "{days} days {hours}h {minutes}m {seconds}s".format(**d)

        # add the process information to the dictionary
        pDict["Running"], pDict["info"] = "True", {
            "pid": pid,
            "cpu": round(cpu, 2),
            "memory": round(mem, 2),
            "create_time": create_time.strftime("%Y/%m/%d %H:%M:%S"),
            "running_time": running_time
        }
    else:
        # if the process is not running, indicate that in the dictionary
        pDict["Running"] = "False"

    return pDict


def getBots():
    """
    Get information about bots specified in Config.botsName.

    Returns:
        dict: A dictionary with bot names as keys and bot information as values.
              If an error occurs, returns a dictionary with {"hasInfo": "None"}.
    """
    try:
        bots = {name: getBotInfo(name) for name in Config.botsName}
        bots["hasInfo"] = "Yes"
        return bots
    except Exception as e:
        return {"hasInfo": "None"}
