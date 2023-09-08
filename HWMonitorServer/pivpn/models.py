# -*- coding: utf-8 -*-

import datetime
import subprocess

import pytz


def convertTime(input_string):
    """
    Convert a date string from one time zone to another.

    Args:
        input_string (str): Input date string in the format "d %b %Y, %H:%M, %Z".

    Returns:
        str: Converted date string in the format "%Y/%m/%d %H:%M:%S".
    """
    # Define time zones
    input_timezone = pytz.timezone("Europe/Lisbon")
    output_timezone = pytz.timezone("UTC")

    # Convert input string to datetime object
    input_datetime = datetime.datetime.strptime(input_string, "%d %b %Y, %H:%M, %Z")
    input_datetime = input_timezone.localize(input_datetime)

    # Convert to output time zone (UTC)
    output_datetime = input_datetime.astimezone(output_timezone)

    # Format the output datetime
    output_string = output_datetime.strftime("%Y/%m/%d %H:%M:%S")
    return output_string


def process_list(output):
    """
    Process the output of 'pivpn list' command and extract information about VPN lists.

    Args:
        output (str): Output of the 'pivpn list' command.

    Returns:
        dict: A dictionary containing VPN list information.
    """
    lists = {}
    lines = output.strip().split('\n')
    for line in lines[2:-1]:
        parts = line.split()
        name = parts[0]
        public_key = parts[1]
        creation_date = convertTime(' '.join(parts[2:]))
        lists[name] = {"public_key": public_key, "creation_date": creation_date}
    return lists


def process_clients(output):
    """
    Process the output of 'pivpn clients' command and extract information about VPN clients.

    Args:
        output (str): Output of the 'pivpn clients' command.

    Returns:
        dict: A dictionary containing VPN client information.
    """
    clients = {}
    lines = output.strip().split('\n')
    for line in lines[2:-1]:
        parts = line.split()
        name = parts[0]
        remoteIP = parts[1]
        virtualIP = parts[2]
        bytesReceived = parts[3]
        bytesSent = parts[4]
        lastSeen = ' '.join(parts[5:])
        lastSeen = datetime.datetime.strptime(lastSeen, "%b %d %Y - %H:%M:%S").strftime("%Y/%m/%d %H:%M:%S") if lastSeen != "(not yet)" else lastSeen
        connected = False if lastSeen == "(not yet)" else (datetime.datetime.now() - datetime.datetime.strptime(lastSeen, "%Y/%m/%d %H:%M:%S")).total_seconds() < 120
        clients[name] = {"remoteIP": remoteIP, "virtualIP": virtualIP, "bytesReceived": bytesReceived, "bytesSent": bytesSent, "lastSeen": lastSeen, "connected": connected}
    return clients


def getPiVPNInfo():
    """
    Get merged information about VPN lists and clients using 'pivpn list' and 'pivpn clients' commands.

    Returns:
        dict: A dictionary containing merged VPN information.
    """
    list_info = process_list(subprocess.check_output(["pivpn", "list"], universal_newlines=True))
    client_info = process_clients(subprocess.check_output(["pivpn", "clients"], universal_newlines=True))
    merged_clients_info = {key: {**list_info[key], **client_info[key]} for key in list_info}
    return merged_clients_info
