# -*- coding: utf-8 -*-
# !/usr/bin/python3

import datetime
import os
from glob import glob


def getRecordings():
    RECORDINGS_FOLDER = "/home/pi/RaspberryPiSurveillance/_RECORDINGS/"
    allFiles = [file for x in os.walk(RECORDINGS_FOLDER) for file in glob(os.path.join(x[0], '*.mp4'))]
    allFiles = [file.replace(RECORDINGS_FOLDER, "").replace(".mp4", "") for file in allFiles]
    allFiles = sorted(allFiles, reverse=True)

    _recInfo = []
    for idx, rec in enumerate(allFiles):
        info = {"idx": idx, "rec": rec, "name": datetime.datetime.strptime(rec.split("/")[-1], "%Y-%m-%d_%H-%M-%S").strftime('%Y-%m-%d %H:%M:%S')}
        info["TODAY"] = True if datetime.datetime.now().strftime("%Y-%m-%d") in info["name"] else False
        _recInfo.append(info)

    return _recInfo
