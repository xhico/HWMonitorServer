# -*- coding: utf-8 -*-

import datetime
import json
import os
import re
import subprocess

import gpiozero
import psutil

from HWMonitorServer import Config


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

    install_date = datetime.datetime.strptime(Config.installDate, "%Y/%m/%d %H:%M:%S")
    install_delta_time = datetime.timedelta(seconds=(date_now - install_date).total_seconds())
    install_d = {"days": install_delta_time.days}
    install_d["hours"], rem = divmod(install_delta_time.seconds, 3600)
    install_d["minutes"], install_d["seconds"] = divmod(rem, 60)

    boot_time = datetime.datetime.fromtimestamp(psutil.boot_time())
    boot_delta_time = datetime.timedelta(seconds=(date_now - boot_time).total_seconds())
    boot_d = {"days": boot_delta_time.days}
    boot_d["hours"], rem = divmod(boot_delta_time.seconds, 3600)
    boot_d["minutes"], boot_d["seconds"] = divmod(rem, 60)

    try:
        return {
            "hasInfo": "Yes",
            "Date_Now": date_now.strftime("%Y/%m/%d %H:%M:%S"),
            "Install_Date": install_date.strftime("%Y/%m/%d %H:%M:%S"),
            "Install_Uptime": "{days} days {hours}h {minutes}m {seconds}s".format(**install_d),
            "Boot_Time": boot_time.strftime("%Y/%m/%d %H:%M:%S"),
            "Boot_Uptime": "{days} days {hours}h {minutes}m {seconds}s".format(**boot_d)
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
        disk = psutil.disk_usage("/")
        return {
            "hasInfo": "Yes",
            "Percentage": round(disk.percent, 2),
            "Used": disk.used,
            "Free": disk.free,
            "Total": disk.total
        }
    except Exception:
        return {"hasInfo": "None"}


def getExternalDisks() -> dict:
    """
    Retrieves information about external disks connected to the system.

    Returns:
        dict: A dictionary containing disk information with disk objects as keys.
              Each disk object is associated with a dictionary containing details such as availability,
              usage percentage, used space, free space, and total space.
    """
    disks_info = {}
    media_pi_path = "/media/pi"

    # List directories in the specified path
    disks = [folder for folder in os.listdir(media_pi_path) if os.path.isdir(os.path.join(media_pi_path, folder))]

    # Iterate through each folder
    for folderName in disks:
        try:
            disk = psutil.disk_usage(os.path.join(media_pi_path, folderName))
            disks_info[folderName] = {
                "hasInfo": "Yes",
                "Available": "Yes",
                "Percentage": round(disk.percent, 2),
                "Used": disk.used,
                "Free": disk.free,
                "Total": disk.total
            }
        except Exception:
            disks_info[folderName] = {"hasInfo": "None"}

    return disks_info


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


def getAmbient() -> dict:
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
            - 'Pressure': A float representing the relative pressure.
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
            "Pressure": data["pressure"] if "pressure" in data.keys() else "Not Available"
        }
    except Exception as ex:
        return {"hasInfo": "None"}


def getHWInfo():
    """
    Returns a dictionary containing information about the hardware of the device.

    The dictionary contains the following keys:
    - Version: returns the version of the device
    - Uptime: returns the time since the device was last started
    - CPU: returns the CPU usage of the device
    - Ambient: returns the ambient humidity and temperature of the device
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
        "Ambient": getAmbient(),
        "Memory": getMemory(),
        "Disks": {
            "SDCard": getSDCard(),
            "ExternalDisks": getExternalDisks()
        },
        "Network": {
            "Wired": getWired(),
            "Wifi": getWifi()
        }
    }
