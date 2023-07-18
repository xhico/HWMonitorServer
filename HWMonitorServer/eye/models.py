# -*- coding: utf-8 -*-

import os


def getRecordings():
    """
    This function retrieves all recordings in a specified folder and returns them in a dictionary.

    Returns:
    recordings (dict): A dictionary containing all recordings in the specified folder.
    """

    # Specify the folder where recordings are located
    recordingsFolder = "/home/pi/RaspberryPiSurveillance/_RECORDINGS/"

    # Retrieve all subfolders (i.e., each day's folder) within the specified folder
    subFolders = [f for f in os.listdir(recordingsFolder) if os.path.isdir(os.path.join(recordingsFolder, f))]

    # Retrieve all recordings for each day and add them to the dictionary
    recordingsInfo = {}
    for day in subFolders:
        recFiles = [file for file in os.listdir(os.path.join(recordingsFolder, day)) if file.endswith(".mp4")]
        if len(recFiles) != 0:
            recordingsInfo[day] = [file for file in recFiles]

    return recordingsInfo
