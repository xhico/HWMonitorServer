# -*- coding: utf-8 -*-

import os


def readCrontab():
    """
    Reads the crontab file of user "pi" and returns a list of dictionaries representing each cron job in the file.
    Each dictionary contains two keys: "job" (the cron job) and "status" (either "enabled" or "disabled").
    """
    # Generate crontab file
    crontabFile = "/home/pi/crontab.txt"
    os.system("crontab -l > " + crontabFile)

    # Open crontab file
    with open(crontabFile) as inFile:
        # Remove new line characters from each job in the file
        cronjobs = [job.replace("\n", "") for job in inFile.readlines()]
    # Remove the temporary crontab file
    os.remove(crontabFile)

    # Parse jobs and their status
    cronjobs = [{"job": job, "status": "disabled" if job.startswith("#") else "enabled"} for job in cronjobs]

    return cronjobs


def saveCrontab(cronjobs):
    """
    Takes a list of dictionaries representing each cron job and their status, modifies the status of each job as needed,
    saves the modified list to the crontab file of user "pi", and returns a tuple indicating the success or failure of the
    operation and a message describing the result.
    """
    try:
        newCrontab = []
        # Modify the status of each job as needed and add it to the new crontab list
        for job in cronjobs:
            jobJob = job["job"]
            jobStatus = job["status"]

            if jobStatus == "disabled" and not jobJob.startswith("#"):
                jobJob = "#" + jobJob
            elif jobStatus == "enabled" and jobJob.startswith("#"):
                jobJob = jobJob[1::]
            newCrontab.append(jobJob + "\n")

        crontabFile = "/home/pi/crontab.txt"
        # Write the modified crontab to the crontab file
        with open(crontabFile, "w") as outFile:
            outFile.writelines(newCrontab)

        # Load the modified crontab into the crontab of user "pi"
        os.system("crontab -u pi " + crontabFile)
        return "success", "Crontab saved successfully!"
    except Exception as ex:
        # Return an error message if an exception occurs
        return "error", str(ex)
