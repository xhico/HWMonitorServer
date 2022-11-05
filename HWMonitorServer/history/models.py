# -*- coding: utf-8 -*-
# !/usr/bin/python3

import datetime
import json
import random
import re


def getHistoricInfo(numberTime, unitTime, hwMetric):
    hours = numberTime

    # Convert to hours
    if unitTime == "day":
        hours = numberTime * 24
    elif unitTime == "week":
        hours = numberTime * 24 * 7
    startDate = datetime.datetime.now() - datetime.timedelta(hours=hours)

    # Open Historic JSON
    with open("/home/pi/HardwareHistory/HardwareHistory.json") as inFile:
        data = json.load(inFile)

    keys = [key for key in list(data[0].keys()) if key != "Date"]

    # Get only valid data
    validData = []
    for entry in data:
        if datetime.datetime.strptime(entry["Date"], "%Y/%m/%d %H:%M") >= startDate:
            entry[hwMetric]["Date"] = entry["Date"]
            validData.append(entry[hwMetric])

    # Split data
    processData = {}
    for entry in validData:
        for k, v in entry.items():
            v = round(float(re.sub(r"[a-zA-Z]", "", str(v)).strip()), 1) if k != "Date" else v
            if k in processData:
                processData[k].append(v)
            else:
                processData[k] = [v]

    # Process Data
    for k, v in processData.items():
        # Crop if > 100 entries
        totalEntries = len(processData[k])
        if totalEntries >= 100:
            to_delete = set(random.sample(range(len(processData[k])), totalEntries - 100))
            processData[k] = [x for i, x in enumerate(processData[k]) if i not in to_delete]

        # Reverse List
        processData[k] = list(reversed(v))

        # Set Averages
        if k != "Date":
            processData[k] = [processData[k], [round(sum(v) / len(v), 1) for _ in range(len(v))]]

    return keys, processData
