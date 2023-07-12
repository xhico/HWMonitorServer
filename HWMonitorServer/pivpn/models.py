# -*- coding: utf-8 -*-

import datetime
import re
import subprocess
from HWMonitorServer.config import Config


def extractInfo(lines, start_index, delimiter):
    """
    Extracts information from lines based on a given start index and delimiter.

    Args:
        lines (list): List of lines containing the information.
        start_index (int): Index to start extracting information from.
        delimiter (str): Delimiter used to split the lines and extract information.

    Returns:
        list: Extracted information as a list of lists.
    """
    extracted_info = []
    for line in lines[start_index:]:
        info = line.strip().split(delimiter)[0]
        extracted_info.append(re.split(r"\s{2,}", info))
    return extracted_info


def getClientIdx(dictionary, name):
    """
    Returns the index of a client in the dictionary based on the client's name.

    Args:
        dictionary (dict): The dictionary containing client information.
        name (str): The name of the client to search for.

    Returns:
        str: The index of the client in the dictionary, or None if not found.
    """
    for idx, value in dictionary.items():
        if value["name"] == name:
            return idx
    return None


def remove_by_name(dictionary, name):
    """
    Removes dictionary items with a specific name from the dictionary.

    Args:
        dictionary (dict): The dictionary to remove items from.
        name (str): The name to search for in the dictionary items.

    Returns:
        None
    """
    keys_to_remove = []
    for key, value in dictionary.items():
        if isinstance(value, dict) and "name" in value and name in value["name"]:
            keys_to_remove.append(key)

    for key in keys_to_remove:
        dictionary.pop(key)


def convert_to_units(data_size):
    """
    Converts data size from different units to their corresponding units (GiB to GB, MiB to MB, KiB to KB).
    Rounds the results to two decimal places.

    Args:
        data_size (str): The data size to convert in the format 'X{unit}', where X is a float and {unit}
                         is one of 'GiB', 'MiB', or 'KiB'.

    Returns:
        str: The converted data size in the corresponding unit with two decimal places.

    Raises:
        ValueError: If the data size format is invalid.

    """

    if data_size.endswith("GiB"):
        size_in_gib = float(data_size[:-3])
        size_in_gb = round(size_in_gib * 1.073741824, 2)
        return f"{size_in_gb} GB"
    elif data_size.endswith("MiB"):
        size_in_mib = float(data_size[:-3])
        size_in_mb = round(size_in_mib * 1.048576, 2)
        return f"{size_in_mb} MB"
    elif data_size.endswith("KiB"):
        size_in_kib = float(data_size[:-3])
        size_in_kb = round(size_in_kib * 1.024, 2)
        return f"{size_in_kb} KB"
    else:
        raise ValueError("Invalid data size format. Please use 'GiB', 'MiB', or 'KiB'.")


def getPiVPNInfo():
    """
    Retrieves PiVPN information for clients.

    Returns:
        dict: Dictionary containing the PiVPN information for clients.
    """
    clients = {}

    # Get List Clients information
    list_lines = subprocess.check_output(["pivpn", "list"], universal_newlines=True).strip().split("\n")[4:]
    list_info = extractInfo(list_lines, 0, "\t")
    for idx, info in enumerate(list_info):
        status, name, expiration = info[0], info[1], datetime.datetime.strptime(info[2], "%b %d %Y").strftime("%Y/%m/%d")
        clients[idx] = {"name": name, "connected": False, "status": status, "expiration": expiration}

    # Get Connected Clients information
    client_lines = subprocess.check_output(["pivpn", "clients"], universal_newlines=True).strip().split("\n")[5:]
    clients_info = extractInfo(client_lines, 0, "\t")
    clients_info = [] if clients_info[0][0] == "No Clients Connected!" else clients_info
    for info in clients_info:
        name, remoteIP, virtualIP, bytesReceived, bytesSent = info[0], info[1], info[2], info[3], info[4]
        connectedSince = datetime.datetime.fromtimestamp(int(info[5].split(" ")[1])).strftime('%Y/%m/%d %H:%M:%S')

        idx = int(getClientIdx(clients, name))
        clients[idx]["connected"] = True
        clients[idx]["remoteIP"] = remoteIP
        clients[idx]["virtualIP"] = virtualIP
        clients[idx]["bytesReceived"] = convert_to_units(bytesReceived)
        clients[idx]["bytesSent"] = convert_to_units(bytesSent)
        clients[idx]["connectedSince"] = connectedSince

    # Remove Local Profile
    remove_by_name(clients, Config.hostname)

    # Sort by connect
    clients = list(sorted(clients.items(), key=lambda x: x[1]["connected"], reverse=True))
    clients = [c[1] for c in clients]

    return clients
