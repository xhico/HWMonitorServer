# -*- coding: utf-8 -*-
# !/usr/bin/python3

import datetime
import json
import random
import re


def getHistoricInfo(numberTime, unitTime, hwMetric):
    hours = numberTime

    # Convert to hours -> set startDate
    if unitTime == "day":
        hours = numberTime * 24
    elif unitTime == "week":
        hours = numberTime * 24 * 7
    startDate = datetime.datetime.now() - datetime.timedelta(hours=hours)

    # Open Historic JSON
    with open("/home/pi/HardwareHistory/HardwareHistory.json") as inFile:
        data = json.load(inFile)

    # Get only valid data
    processData = {}
    for entry in data:
        if datetime.datetime.strptime(entry["Date"], "%Y/%m/%d %H:%M") >= startDate:
            entry[hwMetric]["Date"] = entry["Date"]
            for k, v in entry[hwMetric].items():
                v = round(float(re.sub(r"[a-zA-Z]", "", str(v)).strip()), 1) if k != "Date" else v
                if k in processData:
                    processData[k].append(v)
                else:
                    processData[k] = [v]

    # If processData has more than 100 entries, remove at random
    numbEntries = len(processData["Date"])
    if numbEntries > 100:
        toRemove = random.sample(range(0, numbEntries - 1), numbEntries - 100)
        for key, values in processData.items():
            # Remove unwanted values
            values = [values[i] for i in range(len(values)) if i not in toRemove]
            processData[key] = list(reversed(values))

            # Set Averages
            if key != "Date":
                processData[key] = [processData[key], [round(sum(values) / len(values), 1) for _ in range(len(values))]]

    # Get History Keys
    keys = [key for key in list(data[0].keys()) if key != "Date"]

    return keys, processData
