# -*- coding: utf-8 -*-
# !/usr/bin/python3

import os


def readCrontab():
    # Generate crontab file
    crontabFile = "/home/pi/crontab.txt"
    os.system("crontab -l > " + crontabFile)

    # Open crontab file
    with open(crontabFile) as inFile:
        cronjobs = [job.replace("\n", "") for job in inFile.readlines()]
    os.remove(crontabFile)

    # Parse jobs and their status
    cronjobs = [{"job": job, "status": "disabled" if job.startswith("#") else "enabled"} for job in cronjobs]

    return cronjobs


def saveCrontab(cronjobs):
    try:
        newCrontab = []
        for job in cronjobs:
            jobJob = job["job"]
            jobStatus = job["status"]

            if jobStatus == "disabled" and not jobJob.startswith("#"):
                jobJob = "#" + jobJob
            elif jobStatus == "enabled" and jobJob.startswith("#"):
                jobJob = jobJob[1::]
            newCrontab.append(jobJob + "\n")

        crontabFile = "/home/pi/crontab.txt"
        with open(crontabFile, "w") as outFile:
            outFile.writelines(newCrontab)

        os.system("crontab -u pi " + crontabFile)
        return "success", "Crontab saved successfully!"
    except Exception as ex:
        return "error", str(ex)
