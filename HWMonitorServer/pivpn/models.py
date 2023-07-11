# -*- coding: utf-8 -*-

import subprocess
import re


def getPiVPNInfo():
    """
    Retrieves the info of the pivpn.

    Returns:
        str: The content of the pivpn info.
    """

    clients = []
    lines = subprocess.check_output(["pivpn", "clients"], universal_newlines=True).strip().split("\n")[5:]
    for client in [line.split("\t")[0] for line in lines]:
        name, remoteIP, virtualIP, bytesReceived, bytesSent, connectedSince = re.split("\s+", client)[0:6]
        clients.append({"name": name, "remoteIP": remoteIP, "virtualIP": virtualIP, "bytesReceived": bytesReceived, "bytesSent": bytesSent, "connectedSince": connectedSince})
    return clients
