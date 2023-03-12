# -*- coding: utf-8 -*-

import datetime
import json
import random
import re


def getHistoricInfo(numberTime: int, unitTime: str, hwMetric: str) -> tuple:
    """
    Given a number of time units, a time unit, and a hardware metric,
    returns the history of the metric in the form of a dictionary.

    Args:
        numberTime (int): number of time units
        unitTime (str): time unit ("day", "week")
        hwMetric (str): hardware metric to retrieve

    Returns:
        tuple: tuple containing a list of keys and a dictionary of metric history

    """

    # Convert to hours -> set startDate
    hours = numberTime
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
        # Filter entries older than startDate
        if datetime.datetime.strptime(entry["Date"], "%Y/%m/%d %H:%M") >= startDate:
            entry[hwMetric]["Date"] = entry["Date"]
            for k, v in entry[hwMetric].items():
                # Parse values from string to float, round to 1 decimal place
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
