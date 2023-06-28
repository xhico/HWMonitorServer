# -*- coding: utf-8 -*-

from HWMonitorServer.config import Config


def getConfigContents():
    """
    Retrieves the content of the configuration file.

    Returns:
        str: The content of the configuration file.
    """
    with open(Config.configFile) as inFile:
        configContent = inFile.read()
    return configContent


def saveConfiguration(configContent):
    """
    Saves the configuration content to the configuration file.

    Args:
        configContent (str): The modified configuration content.

    Returns:
        tuple: A tuple containing the status ("success" or "error") and a message.

    Raises:
        Exception: If an error occurs while writing the configuration file.
    """
    try:
        # Write the modified configuration to the configuration file
        with open(Config.configFile, "w") as outFile:
            outFile.writelines(configContent)

        return "success", "Configuration saved successfully!"
    except Exception as ex:
        # Return an error message if an exception occurs
        return "error", str(ex)
