# -*- coding: utf-8 -*-

import datetime
import json
import random


def getHistoricInfo(numberTime: int, unitTime: str, hwMetric: str):
    """
    Given a number of time units, a time unit, and a hardware metric,
    returns the history of the metric in the form of a dictionary.

    Args:
        numberTime (int): number of time units
        unitTime (str): time unit ("day", "week")
        hwMetric (str): hardware metric to retrieve

    Returns:
        list: list of dictionary of metric history

    """

    # Convert to hours -> set startDate
    hours = numberTime
    if unitTime == "day":
        hours = numberTime * 24
    elif unitTime == "week":
        hours = numberTime * 24 * 7
    startDate = datetime.datetime.now() - datetime.timedelta(hours=hours)

    # Retrieve Historic JSON
    with open("/home/pi/HardwareHistory/saved_info.json") as inFile:
        data = list(reversed(json.load(inFile)["SAVED_INFO"]))

    # Get available metrics
    availableMetrics = [key for key in data[0].keys() if key != "Date"]

    # Filter data by startDate
    data = [{entry["Date"]: entry[hwMetric]} for entry in data if datetime.datetime.strptime(entry["Date"], "%Y/%m/%d %H:%M") >= startDate]

    # Decrease data size
    maxItems = 50
    if len(data) > maxItems:
        indices_to_remove = random.sample(range(len(data)), len(data) - maxItems)
        indices_to_remove.sort(reverse=True)
        for index in indices_to_remove:
            data.pop(index)

    # Calculate averages
    result = {"timestamps": []}
    key_averages = {}
    for entry in data:
        timestamp = next(iter(entry))
        result["timestamps"].append(timestamp)
        for key, value in entry[timestamp].items():
            if key not in result:
                result[key] = []
                key_averages[key] = 0.0
            result[key].append(value)

    # Add Averages to Results
    for key in key_averages:
        avgValue = round(sum(result[key]) / len(result[key]), 2)
        if avgValue != 0:
            key_averages[key] = avgValue
            result[key + "_avg"] = [key_averages[key]] * len(result[key])
        else:
            del result[key]

    return availableMetrics, result
