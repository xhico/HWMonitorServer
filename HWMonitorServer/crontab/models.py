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
    cronjobs = [{"job": job.lstrip("#"), "status": "disabled" if job.startswith("#") else "enabled"} for job in cronjobs]

    return cronjobs


# Function to estimate running frequency
def estimate_frequency(entry):
    parts = entry.split()
    if len(parts) >= 6:
        if "*/" in parts[0]:
            return 1 / int(parts[0][2:])
    return 0


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

            # Set job command
            jobJob = "#" + jobJob if jobStatus == "disabled" else jobJob.lstrip("#")
            newCrontab.append(jobJob + "\n")

        # Split the entries into three groups: those starting with "@", "#", and the rest
        at_entries = [entry for entry in newCrontab if entry.startswith('@')]
        comment_entries = [entry for entry in newCrontab if entry.startswith('#')]
        non_at_comment_entries = [entry for entry in newCrontab if not (entry.startswith('@') or entry.startswith('#'))]

        # Sort each group by estimated frequency
        at_entries = sorted(at_entries, key=estimate_frequency, reverse=True)
        non_at_comment_entries = sorted(non_at_comment_entries, key=estimate_frequency, reverse=True)

        # Combine the sorted entries and add the "SHELL=/bin/bash" line at the top
        sorted_crontab_entries = at_entries + non_at_comment_entries + comment_entries

        # Save File
        crontabFile = "/home/pi/crontab.txt"
        # Write the modified crontab to the crontab file
        with open(crontabFile, "w") as outFile:
            outFile.writelines(sorted_crontab_entries)

        # Load the modified crontab into the crontab of user "pi"
        os.system("crontab -u pi " + crontabFile)
        return "success", "Crontab saved successfully!"
    except Exception as ex:
        # Return an error message if an exception occurs
        return "error", str(ex)
