# -*- coding: utf-8 -*-

import os
import subprocess
import psutil
import datetime
from HWMonitorServer.config import Config


def getBotLog(value, name):
    """
    Returns the log file for a bot with the given name, last maxCount times it ran.

    Args:
        value: A string representing the value of the bot.
        name: A string representing the name of the bot.

    Returns:
        A string containing the lines of the bot's log file, last maxCount times it ran.
    """
    log_file = f"/home/pi/{name}/{name}.log"
    log_string = subprocess.getoutput(f"cat {log_file}")

    # Split the log_string is Log
    if value == "Log":
        # Split the log string into lines and reverse it
        log_string = log_string.strip().split('\n')[::-1]

        # Find the index of the third occurrence of "[INFO] ------------"
        start_index, count, maxCount = 0, 0, Config.NumberOfBotsLogs
        while count != maxCount and start_index <= len(log_string) - 1:
            if "[INFO] ---------" in log_string[start_index]:
                count += 1
            start_index += 1

        # Get only last maxCount runs -> reverse -> toString
        log_string = "\n".join(log_string[0:start_index][::-1])

    return log_string


def getBotConfig(name):
    """
    Returns the content of a config file for a bot with the given name.

    Args:
        name: A string representing the name of the bot.

    Returns:
        A string containing the contents of the bot's config file.
    """
    config_file = f"/home/pi/{name}/config.json"
    config_file = subprocess.getoutput(f"cat {config_file}")
    return config_file


def getBotSavedInfo(name):
    """
    Returns the content of a config file for a bot with the given name.

    Args:
        name: A string representing the name of the bot.

    Returns:
        A string containing the contents of the bot's saved info file.
    """
    saved_info_file = f"/home/pi/{name}/saved_info.json"
    saved_info_file = subprocess.getoutput(f"cat {saved_info_file}")
    return saved_info_file


def checkIfError(name):
    """
    Check if there is an error in the bot log.

    Args:
        name (str): The name of the bot.

    Returns:
        bool: True if an error is found in the bot log, False otherwise.
    """
    # Get Bot Log
    log_string = getBotLog("Log", name)

    # Split the log string into lines and reverse it
    lines = log_string.strip().split('\n')[::-1]

    # Find the index of the last line with "[INFO]" and "------------"
    start_index = next((i for i, line in enumerate(lines) if "[INFO]" in line and "------------" in line), None)
    start_index = len(lines) - start_index

    # Check if there is an error in the remaining lines
    hasError = any("[ERROR]" in line for line in lines[::-1][start_index:])

    return hasError


def getRelatedProcesses(process, processName):
    relatedProcesses = [process]
    subProcesses = [subProcess for subProcess in psutil.process_iter(["pid", "ppid", "cmdline"]) if subProcess.info["ppid"] == process.info["pid"]]
    for subProcess in subProcesses:
        relatedProcesses.extend(getRelatedProcesses(subProcess, processName))
    return relatedProcesses


def getBotInfo(name):
    """
    Gets information about a bot process running on the system.
    :param name: the name of the bot process to retrieve information about
    :type name: str
    :return: a dictionary containing information about the bot process, or an empty dictionary if the process is not running
    :rtype: dict
    """

    try:
        pDict = {"Running": "False", "info": {"pid": "-", "cpu": 0.0, "memory": 0.0, "create_time": "-", "running_time": "-"}}

        # Get parent process and it's children recursively
        processes = [proc for proc in psutil.process_iter(["pid", "cmdline"]) if proc.info["cmdline"] is not None]
        processes = [proc for proc in processes if any([name in arg for arg in proc.info["cmdline"]])]
        allRelatedProcesses = []
        for process in processes:
            pDict["Running"] = "True"
            pDict["info"]["pid"] = process.pid

            create_time = datetime.datetime.fromtimestamp(process.create_time())
            pDict["info"]["create_time"] = create_time.strftime("%Y/%m/%d %H:%M:%S")

            running_time = datetime.timedelta(seconds=(datetime.datetime.now() - create_time).total_seconds())
            d = {"days": running_time.days}
            d["hours"], rem = divmod(running_time.seconds, 3600)
            d["minutes"], d["seconds"] = divmod(rem, 60)
            running_time = "{days} days {hours}h {minutes}m {seconds}s".format(**d)
            pDict["info"]["running_time"] = running_time

            allRelatedProcesses.extend(getRelatedProcesses(process, name))

        # Aggregate CPU /RAM Usage
        for process in allRelatedProcesses:
            try:
                cpuUsage = [process.cpu_percent() for _ in range(10)]
                pDict["info"]["cpu"] += (sum(cpuUsage) / len(cpuUsage)) / psutil.cpu_count()
                pDict["info"]["memory"] += process.memory_percent()
            except psutil.NoSuchProcess:
                pass

        pDict["info"]["cpu"] = round(pDict["info"]["cpu"], 2)
        pDict["info"]["memory"] = round(pDict["info"]["memory"], 2)

        # Get last run
        last_run = subprocess.getoutput("tail -n 1 /home/pi/" + name + "/" + name + ".log | cut -d ',' -f 1")
        last_run = datetime.datetime.strptime(last_run, "%Y-%m-%d %H:%M:%S").strftime("%Y/%m/%d %H:%M:%S")
        pDict["last_run"] = last_run
        pDict["has_config"] = os.path.exists(os.path.join("/home/pi/", name, "config.json"))
        pDict["has_saved_info"] = os.path.exists(os.path.join("/home/pi/", name, "saved_info.json"))
        pDict["has_error"] = checkIfError(name)
        pDict["hasInfo"] = "Yes"

    except Exception as ex:
        pDict = {"hasInfo": "None", "message": str(ex)}

    return pDict


def saveConfiguration(name, value):
    """
    Saves the configuration content to the configuration file.

    Args:
        name (str): Bot name.
        value (str): The modified configuration content.

    Returns:
        tuple: A tuple containing the status ("success" or "error") and a message.

    Raises:
        Exception: If an error occurs while writing the configuration file.
    """
    try:
        # Write the modified configuration to the configuration file
        with open(os.path.join("/home/pi/", name, "config.json"), "w") as outFile:
            outFile.writelines(value)

        return "success", "Configuration saved successfully!"
    except Exception as ex:
        # Return an error message if an exception occurs
        return "error", str(ex)
