# -*- coding: utf-8 -*-

import copy
import datetime
import json
import re
import subprocess

import gpiozero
import psutil


def getVersions() -> dict:
    """Retrieves information about the system's CPU, operating system distribution, kernel, and firmware version.

    Returns:
        A dictionary containing system information if successful, otherwise a dictionary with 'hasInfo' set to 'None'.
    """
    try:
        return {
            "hasInfo": "Yes",
            "Processor": subprocess.getoutput("cat /proc/cpuinfo | grep Model | tail -1").split(':')[1].lstrip(),
            "Distribution": subprocess.getoutput("cat /etc/os-release | head -n 1").split('=')[1][1:-1],
            "Kernel": subprocess.getoutput("uname -msr"),
            "Firmware": re.search(r"#\d+", subprocess.getoutput("cat /proc/version")).group()
        }
    except Exception:
        return {"hasInfo": "None"}


def getUptime() -> dict:
    """Retrieves information about the system's uptime, including the current date and time, boot time, and uptime duration in days, hours, minutes, and seconds.

    Returns:
        A dictionary containing system uptime information if successful, otherwise a dictionary with 'hasInfo' set to 'None'.
    """
    date_now = datetime.datetime.now()
    boot_time = datetime.datetime.fromtimestamp(psutil.boot_time())
    delta_time = datetime.timedelta(seconds=(date_now - boot_time).total_seconds())
    d = {"days": delta_time.days}
    d["hours"], rem = divmod(delta_time.seconds, 3600)
    d["minutes"], d["seconds"] = divmod(rem, 60)

    try:
        return {
            "hasInfo": "Yes",
            "Date_Now": date_now.strftime("%Y/%m/%d %H:%M:%S"),
            "Boot_Time": boot_time.strftime("%Y/%m/%d %H:%M:%S"),
            "Uptime": "{days} days {hours}h {minutes}m {seconds}s".format(**d),
            "Uptime_Secs": delta_time.total_seconds()
        }
    except Exception:
        return {"hasInfo": "None"}


def getCPU() -> dict:
    """
    Returns a dictionary of information related to the CPU.

    Returns:
        dict: A dictionary containing CPU information.
            "hasInfo" (str): "Yes" if the information was successfully gathered, "None" otherwise.
            "Percentage" (float): Percentage of CPU usage.
            "Cores" (int): Number of CPU cores.
            "Frequency" (float): Current CPU frequency in MHz.
            "PIDs" (int): Number of currently running processes.
            "Voltage" (float): Voltage of the CPU.
            "Temperature" (float): Temperature of the CPU in degrees Celsius.
    """
    try:
        return {
            "hasInfo": "Yes",
            "Percentage": round(psutil.cpu_percent(), 2),
            "Cores": psutil.cpu_count(),
            "Frequency": round(psutil.cpu_freq().current, 2),
            "PIDs": len(psutil.pids()),
            "Voltage": float(re.search(r'\d+\.\d+', subprocess.getoutput("vcgencmd measure_volts core").split('=')[1]).group()),
            "Temperature": round(gpiozero.CPUTemperature().temperature, 2)
        }
    except Exception:
        return {"hasInfo": "None"}


def getMemory() -> dict:
    """
    Returns a dictionary of information related to the memory usage.

    Returns:
        dict: A dictionary containing memory information.
            "hasInfo" (str): "Yes" if the information was successfully gathered, "None" otherwise.
            "Percentage" (float): Percentage of memory used.
            "Used" (int): Amount of used memory in bytes.
            "Available" (int): Amount of available memory in bytes.
            "Total" (int): Total amount of memory in bytes.
    """
    try:
        return {
            "hasInfo": "Yes",
            "Percentage": round(psutil.virtual_memory().percent, 2),
            "Used": psutil.virtual_memory().used,
            "Available": psutil.virtual_memory().available,
            "Total": psutil.virtual_memory().total
        }
    except Exception:
        return {"hasInfo": "None"}


def getSDCard() -> dict:
    """Returns information about the disk usage of the root filesystem.

    Returns:
        dict: A dictionary containing information about the root filesystem's disk usage.
            The dictionary contains the following keys:
            - "hasInfo": Indicates whether the disk information was successfully obtained.
              Possible values are "Yes" or "None".
            - "Percentage": The percentage of disk usage.
            - "Used": The amount of disk space used, in bytes.
            - "Free": The amount of free disk space, in bytes.
            - "Total": The total size of the disk, in bytes.
    """
    try:
        return {
            "hasInfo": "Yes",
            "Percentage": round(psutil.disk_usage('/').percent, 2),
            "Used": psutil.disk_usage('/').used,
            "Free": psutil.disk_usage('/').free,
            "Total": psutil.disk_usage('/').total
        }
    except Exception:
        return {"hasInfo": "None"}


def get918() -> dict:
    """Returns information about the disk usage of the /media/pi/918 directory.

    Returns:
        dict: A dictionary containing information about the /media/pi/918 directory's disk usage.
            The dictionary contains the following keys:
            - "hasInfo": Indicates whether the disk information was successfully obtained.
              Possible values are "Yes" or "None".
            - "Available": Indicates whether the /media/pi/918 directory is available.
              Possible values are "Yes" or "None".
            - "Percentage": The percentage of disk usage.
            - "Used": The amount of disk space used, in bytes.
            - "Free": The amount of free disk space, in bytes.
            - "Total": The total size of the disk, in bytes.
    """
    try:
        return {
            "hasInfo": "Yes",
            "Available": "Yes",
            "Percentage": round(psutil.disk_usage('/media/pi/918').percent, 2),
            "Used": psutil.disk_usage('/media/pi/918').used,
            "Free": psutil.disk_usage('/media/pi/918').free,
            "Total": psutil.disk_usage('/media/pi/918').total
        }
    except Exception:
        return {"hasInfo": "None"}


def getWired():
    """
    Returns a dictionary containing information about the wired network interface.
    Returns:
        dict: A dictionary containing the following keys and values:
              - "hasInfo": "Yes" if the network interface is available, "None" otherwise.
              - "IP": The IP address of the network interface.
              - "Sent": The number of bytes sent by the network interface.
              - "Received": The number of bytes received by the network interface.
              - "Packets_Sent": The number of packets sent by the network interface.
              - "Packets_Received": The number of packets received by the network interface.
    """
    try:
        return {
            "hasInfo": "Yes",
            "IP": subprocess.getoutput("ip addr show eth0 | grep 'inet\b' | awk '{print $2}' | cut -d/ -f1"),
            "Sent": int(subprocess.getoutput("cat /sys/class/net/eth0/statistics/tx_bytes")),
            "Received": int(subprocess.getoutput("cat /sys/class/net/eth0/statistics/rx_bytes")),
            "Packets_Sent": int(subprocess.getoutput("cat /sys/class/net/eth0/statistics/rx_packets")),
            "Packets_Received": int(subprocess.getoutput("cat /sys/class/net/eth0/statistics/tx_packets")),
        }
    except Exception:
        return {"hasInfo": "None"}


def getWifi():
    """
    Returns a dictionary containing information about the wireless network interface.
    Returns:
        dict: A dictionary containing the following keys and values:
              - "hasInfo": "Yes" if the network interface is available, "None" otherwise.
              - "IP": The IP address of the network interface.
              - "Sent": The number of bytes sent by the network interface.
              - "Received": The number of bytes received by the network interface.
              - "Packets_Sent": The number of packets sent by the network interface.
              - "Packets_Received": The number of packets received by the network interface.
    """
    try:
        return {
            "hasInfo": "Yes",
            "IP": subprocess.getoutput("ip addr show wlan0 | grep 'inet\b' | awk '{print $2}' | cut -d/ -f1"),
            "Sent": int(subprocess.getoutput("cat /sys/class/net/wlan0/statistics/tx_bytes")),
            "Received": int(subprocess.getoutput("cat /sys/class/net/wlan0/statistics/rx_bytes")),
            "Packets_Sent": int(subprocess.getoutput("cat /sys/class/net/wlan0/statistics/rx_packets")),
            "Packets_Received": int(subprocess.getoutput("cat /sys/class/net/wlan0/statistics/tx_packets")),
        }
    except Exception:
        return {"hasInfo": "None"}


def getAmbientHumidityTemperature() -> dict:
    """
    Reads data from a JSON file containing humidity and temperature readings from a sensor.
    Returns a dictionary containing the relevant information.

    Returns:
        dict: A dictionary containing the following keys:
            - 'hasInfo': A string indicating whether the function was able to read data from the file ('Yes') or not ('None').
            - 'Date': A string representing the date and time the data was recorded.
            - 'TemperatureC': A float representing the temperature in Celsius.
            - 'TemperatureF': A float representing the temperature in Fahrenheit.
            - 'Humidity': A float representing the relative humidity.
            - 'Valid': A boolean indicating whether the data is valid.
    """
    try:
        with open("/home/pi/HumiditySensor/saved_info.json") as inFile:
            data = json.load(inFile)[0]
        return {
            "hasInfo": "Yes",
            "Date": data["date"],
            "TemperatureC": data["temp_c"],
            "TemperatureF": data["temp_f"],
            "Humidity": data["humidity"],
            "Valid": data["valid"]
        }
    except Exception:
        return {"hasInfo": "None"}


def getHWInfo():
    """
    Returns a dictionary containing information about the hardware of the device.

    The dictionary contains the following keys:
    - Version: returns the version of the device
    - Uptime: returns the time since the device was last started
    - CPU: returns the CPU usage of the device
    - AmbientHumidityTemperature: returns the ambient humidity and temperature of the device
    - Memory: returns the memory usage of the device
    - Disks: returns a dictionary containing information about the disks on the device
        - SDCard: returns information about the SD card disk
        - 918: returns information about the 918 disk
    - Network: returns a dictionary containing information about the network
        - Wired: returns information about the wired network
        - Wifi: returns information about the WiFi network
    """

    return {
        "Version": getVersions(),
        "Uptime": getUptime(),
        "CPU": getCPU(),
        "AmbientHumidityTemperature": getAmbientHumidityTemperature(),
        "Memory": getMemory(),
        "Disks": {
            "SDCard": getSDCard(),
            "918": get918()
        },
        "Network": {
            "Wired": getWired(),
            "Wifi": getWifi()
        }
    }
