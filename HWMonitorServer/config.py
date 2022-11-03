import json
import os


def loadConfig():
    configFile = os.path.join(os.path.dirname(os.path.abspath(__file__)), "config.json")
    with open(configFile) as inFile:
        config = json.load(inFile)
    return config, configFile


class Config:
    config, configFile = loadConfig()

    # ConfigFile
    CONFIG_FILE = configFile

    # Environment
    RPI4_BOTS = config["RPI4"]["Bots"]
    RPI3A_BOTS = config["RPI3A"]["Bots"]
