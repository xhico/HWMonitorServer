# -*- coding: utf-8 -*-

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
    defaultConfig = {"Bots": [], "History": True, "Eye": False, "Pivpn": False, "UpdateTime": 2, "UpdateStats": True, "UpdateBots": True, "UpdateTop": True}

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

    # Get the names of the bots
    botsName = config["Bots"]
