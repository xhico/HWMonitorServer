# python3 -m venv env
# source env/bin/activate
# pip install flask
# export FLASK_APP=server
# flask run --host=0.0.0.0 --port 8814
# cls; Remove-Item Y:\RaspberryPiHWMonitorServer\static\ -R -Force -Confirm:$False; Remove-Item Y:\RaspberryPiHWMonitorServer\templates\ -R -Force -Confirm:$False; Remove-Item Y:\RaspberryPiHWMonitorServer\server.py -Force -Confirm:$False; Copy-Item .\templates\ -R Y:\RaspberryPiHWMonitorServer\; Copy-Item .\static\ -R Y:\RaspberryPiHWMonitorServer\; Copy-Item .\server.py -R Y:\RaspberryPiHWMonitorServer\;

from flask import Flask, render_template
import gpiozero
import datetime
import psutil

app = Flask(__name__)


def strfdelta(tdelta, fmt):
    d = {"days": tdelta.days}
    d["hours"], rem = divmod(tdelta.seconds, 3600)
    d["minutes"], d["seconds"] = divmod(rem, 60)
    return fmt.format(**d)


@app.route("/")
def index():
    date_now = datetime.datetime.now()
    boot_time = datetime.datetime.fromtimestamp(psutil.boot_time())
    delta_time_secs = (date_now - boot_time).total_seconds()
    delta_time = datetime.timedelta(seconds=delta_time_secs)
    d = {"days": delta_time.days}
    d["hours"], rem = divmod(delta_time.seconds, 3600)
    d["minutes"], d["seconds"] = divmod(rem, 60)

    x = {
        "Title": "Raspberry Pi HW Monitor",
        "Author": "xhico",
        "General": {
            "Date_Now": date_now.strftime("%Y/%m/%d %H:%M:%S"),
            "Boot_Time": boot_time.strftime("%Y/%m/%d %H:%M:%S"),
            "Uptime": ("{days} days {hours}h {minutes}m {seconds}s").format(**d),
            "PIDs": len(psutil.pids())
        },
        "CPU": {
            "Percentage": round(psutil.cpu_percent(), 2),
            "Cores": psutil.cpu_count(),
            "Frequency": round(psutil.cpu_freq().current, 2),
            "Temperature_C": round(gpiozero.CPUTemperature().temperature, 2),
            "Temperature_F": round(gpiozero.CPUTemperature().temperature * (9/5) + 32, 2)
        },
        "Memory": {
            "Percentage": round(psutil.virtual_memory().percent, 2),
            "Used": round(psutil.virtual_memory().used // 2**20, 2),
            "Available": round(psutil.virtual_memory().available // 2**20, 2),
            "Total": round(psutil.virtual_memory().total // 2**20, 2)
        },
        "Network": {
            "Sent": round(psutil.net_io_counters().bytes_sent // 2**20, 2),
            "Received": round(psutil.net_io_counters().bytes_recv // 2**20, 2),
            "Packets_Sent": round(psutil.net_io_counters().packets_sent, 2),
            "Packets_Received": round(psutil.net_io_counters().packets_recv, 2),
            "Errors_Sent": round(psutil.net_io_counters().errin, 2),
            "Errors_Received": round(psutil.net_io_counters().errout, 2),
            "Dropped_Sent": round(psutil.net_io_counters().dropin, 2),
            "Dropped_Received": round(psutil.net_io_counters().dropout, 2)
        },
        "Disks": {
            "SD Card": {
                "Percentage": round(psutil.disk_usage('/').percent, 2),
                "Used": round(psutil.disk_usage('/').used // 2**20, 2),
                "Free": round(psutil.disk_usage('/').free // 2**20, 2),
                "Total": round(psutil.disk_usage('/').total // 2**20, 2)
            },
            "918": {
                "Percentage": round(psutil.disk_usage('/media/pi/918').percent, 2),
                "Used": round(psutil.disk_usage('/media/pi/918').used // 2**20, 2),
                "Free": round(psutil.disk_usage('/media/pi/918').free // 2**20, 2),
                "Total": round(psutil.disk_usage('/media/pi/918').total // 2**20, 2)
            },
        }
    }

    return render_template('index.html', conf=x)
