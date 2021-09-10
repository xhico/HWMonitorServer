# pip install flask --no-cache-dir
# export FLASK_APP=server
# flask run --host=0.0.0.0 --port 8814
# cls; Remove-Item Y:\RaspberryPiHWMonitorServer\static\ -R -Force -Confirm:$False; Remove-Item Y:\RaspberryPiHWMonitorServer\templates\ -R -Force -Confirm:$False; Remove-Item Y:\RaspberryPiHWMonitorServer\server.py -Force -Confirm:$False; Copy-Item .\templates\ -R Y:\RaspberryPiHWMonitorServer\; Copy-Item .\static\ -R Y:\RaspberryPiHWMonitorServer\; Copy-Item .\server.py -R Y:\RaspberryPiHWMonitorServer\;

from flask import Flask, render_template, jsonify
import subprocess
import gpiozero
import datetime
import psutil
import math
import re

app = Flask(__name__)

def convert_size(size_bytes):
   if size_bytes == 0:
       return "0B"
   size_name = ("B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB")
   i = int(math.floor(math.log(size_bytes, 1024)))
   p = math.pow(1024, i)
   s = round(size_bytes / p, 2)
   return "%s %s" % (s, size_name[i])


def getInfo():

    # VERSION
    cpu_model = subprocess.getoutput("cat /proc/cpuinfo | grep model | tail -1").split(':')[1].lstrip()
    distribution = subprocess.getoutput("cat /etc/os-release | head -n 1").split('=')[1][1:-1]
    kernel = subprocess.getoutput("uname -msr")
    firmware = re.search(r"#\d+", subprocess.getoutput("cat /proc/version")).group()

    # UPTIME
    date_now = datetime.datetime.now()
    boot_time = datetime.datetime.fromtimestamp(psutil.boot_time())
    delta_time = datetime.timedelta(seconds=(date_now - boot_time).total_seconds())
    d = {"days": delta_time.days}
    d["hours"], rem = divmod(delta_time.seconds, 3600)
    d["minutes"], d["seconds"] = divmod(rem, 60)

    x = {
        "Version": {
            "Processor": cpu_model,
            "Distribution": distribution,
            "Kernel": kernel,
            "Firmware": firmware
        },
        "Uptime": {
            "Date_Now": date_now.strftime("%Y/%m/%d %H:%M:%S"),
            "Boot_Time": boot_time.strftime("%Y/%m/%d %H:%M:%S"),
            "Uptime": ("{days} days {hours}h {minutes}m {seconds}s").format(**d)
        },
        "CPU": {
            "Percentage": round(psutil.cpu_percent(), 2),
            "Cores": psutil.cpu_count(),
            "Frequency": round(psutil.cpu_freq().current, 2),
            "Temperature": round(gpiozero.CPUTemperature().temperature, 2),
            "PIDs": len(psutil.pids())
        },
        "Memory": {
            "Percentage": round(psutil.virtual_memory().percent, 2),
            "Used": convert_size(psutil.virtual_memory().used),
            "Available": convert_size(psutil.virtual_memory().available),
            "Total": convert_size(psutil.virtual_memory().total)
        },
        "Disks": {
            "SDCard": {
                "Percentage": round(psutil.disk_usage('/').percent, 2),
                "Used": convert_size(psutil.disk_usage('/').used),
                "Free": convert_size(psutil.disk_usage('/').free),
                "Total": convert_size(psutil.disk_usage('/').total)
            },
            "918": {
                "Percentage": round(psutil.disk_usage('/media/pi/918').percent, 2),
                "Used": convert_size(psutil.disk_usage('/media/pi/918').used),
                "Free": convert_size(psutil.disk_usage('/media/pi/918').free),
                "Total": convert_size(psutil.disk_usage('/media/pi/918').total)
            },
        },
        "Network": {
            "Sent": convert_size(psutil.net_io_counters().bytes_sent),
            "Received": convert_size(psutil.net_io_counters().bytes_recv),
            "Packets_Sent": psutil.net_io_counters().packets_sent,
            "Packets_Received": psutil.net_io_counters().packets_recv,
            "Errors_Sent": psutil.net_io_counters().errin,
            "Errors_Received": psutil.net_io_counters().errout,
            "Dropped_Sent": psutil.net_io_counters().dropin,
            "Dropped_Received": psutil.net_io_counters().dropout
        }
    }

    return x

@app.route("/")
def index():
    return render_template('index.html', conf=getInfo())


@app.route("/json")
def summary():
    return jsonify(getInfo())


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8814)