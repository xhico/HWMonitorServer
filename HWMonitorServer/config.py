import json
import os
import socket


def loadConfig():
    configFile = os.path.join(os.path.dirname(os.path.abspath(__file__)), "config.json")
    with open(configFile) as inFile:
        config = json.load(inFile)
    return config, configFile


class Config:
    config, configFile = loadConfig()
    hostname = str(socket.gethostname()).upper()

    # Get Bots
    botsName = config[hostname]["Bots"]
