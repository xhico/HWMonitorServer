# -*- coding: utf-8 -*-
# !/usr/bin/python3

import subprocess


def getTop():
    cmd = "ps -eo %cpu,%mem,pid,ppid,etime,command --sort=-%cpu | head -50"
    out = subprocess.getoutput(cmd).split("\n")

    procs = []
    for proc in out[1::]:
        proc = [item for item in proc.split(" ") if item]
        if float(proc[0]) > 0.0:
            procs.append([proc[0], proc[1], proc[2], proc[3], proc[4], " ".join(proc[5:])])

    header = [item for item in out[0].split(" ") if item]
    overview = ["-" for _ in range(len(procs[0]))]
    overview[0] = "{:.2f}".format(sum([round(float(line[0]), 2) for line in procs[1:]]))
    overview[1] = "{:.2f}".format(sum([round(float(line[1]), 2) for line in procs[1:]]))
    procs = [header, overview] + procs

    return procs
