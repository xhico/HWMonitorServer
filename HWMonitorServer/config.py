# -*- coding: utf-8 -*-

import json
import os
import socket


def loadConfig():
    """
    Load configuration settings from a JSON file and return the configuration dictionary and the path to the file.

    Returns:
        tuple: A tuple containing the configuration dictionary and the absolute path to the configuration file.
    """
    # Construct the absolute path to the config file
    configFile = os.path.join(os.path.dirname(os.path.abspath(__file__)), "config.json")

    # Load the contents of the config file into a dictionary
    with open(configFile) as inFile:
        config = json.load(inFile)

    return config, configFile


class Config:
    """
    A class for loading configuration settings and retrieving settings for the current hostname.

    Attributes:
        config (dict): A dictionary containing configuration settings.
        configFile (str): The absolute path to the configuration file.
        hostname (str): The current hostname in uppercase.
        botsName (list): A list of bot names associated with the current hostname.
    """

    # Load the config file and get the current hostname
    config, configFile = loadConfig()
    hostname = str(socket.gethostname()).upper()

    # Get the names of the bots associated with the current hostname
    botsName = config[hostname]["Bots"]
