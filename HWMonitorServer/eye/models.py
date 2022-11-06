# -*- coding: utf-8 -*-
# !/usr/bin/python3
import os


def getRecordings():
    # Get all days folders
    recordingsFolder = "/home/pi/RaspberryPiSurveillance/_RECORDINGS/"
    subFolders = [f for f in os.listdir(recordingsFolder) if os.path.isdir(os.path.join(recordingsFolder, f))]

    # Get all records for each day
    recordings = {}
    for day in subFolders:
        dayFolder = os.path.join(recordingsFolder, day)
        recs = [os.path.join(day, file) for file in os.listdir(dayFolder)]
        if len(recs) != 0:
            recordings[day] = recs

    return recordings
