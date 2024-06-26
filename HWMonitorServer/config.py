# -*- coding: utf-8 -*-

import datetime
import json
import os
import socket


def loadConfig(hostname):
    """
    Load configuration settings from a JSON file and return the configuration dictionary and the path to the file.

    Args:
        hostname (str): String containing device hostname.

    Returns:
        tuple: A tuple containing the configuration dictionary and the absolute path to the configuration file.
    """
    # Construct the absolute path to the config file
    configFile = os.path.join(os.path.dirname(os.path.abspath(__file__)), "config_" + hostname + ".json")

    # Set default config values
    defaultConfig = {
        "InstallDate": datetime.datetime.now().strftime("%Y/%m/%d %H:%M:%S"),
        "Location": "Office",
        "UpdateTime": 2,
        "UpdateStats": True,
        "UpdateBots": False,
        "UpdateTop": True,
        "NumberOfBotsLogs": 5,
        "Eye": False,
        "Pivpn": False,
        "Ledircontroller": False,
        "CPUTemperatureRange": [20, 50, 65, 80],
        "Bots": [],
    }

    # Load the contents of the config file into a dictionary
    if os.path.exists(configFile):
        with open(configFile) as inFile:
            config = json.load(inFile)
    else:
        # If the file doesn't exist or is not valid JSON, create a new config file
        with open(configFile, "w") as outFile:
            config = defaultConfig
            json.dump(config, outFile, indent=4)

    # Check if "key" key is missing and add it if needed
    for key, val in defaultConfig.items():
        if key not in config:
            config[key] = val

    # Write the updated config back to the file
    with open(configFile, "w") as outFile:
        json.dump(config, outFile, indent=4)

    return config, configFile


class Config:
    """
    A class for loading configuration settings.

    Attributes:
        config (dict): A dictionary containing configuration settings.
        configFile (str): The absolute path to the configuration file.
        hostname (str): The current hostname in uppercase.
        botsName (list): A list of bot names.
    """

    # Get Hostname
    hostname = str(socket.gethostname()).upper()

    # Load the config file
    config, configFile = loadConfig(hostname)

    # Get installDate, the names of the bots && NumberOfBotsLogs
    installDate = config["InstallDate"]
    botsName = config["Bots"]
    NumberOfBotsLogs = config["NumberOfBotsLogs"]

    # Add CSP
    CONTENT_SECURITY_POLICY = f"default-src 'self'; script-src 'self' https://monitor.{hostname}.xhico; style-src 'self' https://monitor.{hostname}.xhico; img-src 'self' https://monitor.{hostname}.xhico;"
