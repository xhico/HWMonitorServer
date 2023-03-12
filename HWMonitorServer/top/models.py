# -*- coding: utf-8 -*-

import subprocess


def getTop():
    """Get the top 50 processes by CPU usage.

    Returns:
        A list of lists representing the top 50 processes by CPU usage, where each inner list contains:
        - %CPU usage
        - %MEM usage
        - PID (process ID)
        - PPID (parent process ID)
        - Elapsed time since the process started
        - User who started the process
        - Command that started the process
        - The PID again (useful for sorting)

    Example:
    [['%CPU', '%MEM', 'PID', 'PPID', 'ETIME', 'USER', 'COMMAND', 'PID'],
     ['-----', '-----', '---', '----', '-----', '----', '-------', '---'],
     ['12.3', '1.0', '1234', '5678', '00:03:27', 'john', '/usr/bin/python /path/to/script.py', '1234'],
     ['8.5', '0.5', '5678', '8765', '00:12:42', 'jane', '/usr/bin/python /path/to/script2.py', '5678'],
     ...
    ]
    """
    cmd = "ps -eo %cpu,%mem,pid,ppid,etime,user,command --sort=-%cpu | head -50"
    out = subprocess.getoutput(cmd).split("\n")

    procs = []
    for proc in out[1:]:
        proc = [item for item in proc.split(" ") if item]
        if float(proc[0]) > 0.0:
            procs.append([proc[0], proc[1], proc[2], proc[3], proc[4], proc[5], " ".join(proc[6:]), proc[2]])

    # Add header and overview rows
    header = [item.upper() for item in out[0].split(" ") if item]
    header.append("ACTION")
    overview = ["-" for _ in range(len(procs[0]))]
    overview[0] = "{:.2f}".format(sum([round(float(line[0]), 2) for line in procs[1:]]))
    overview[1] = "{:.2f}".format(sum([round(float(line[1]), 2) for line in procs[1:]]))
    procs = [header, overview] + procs

    return procs
