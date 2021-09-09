#!/usr/bin/env python3

import http.server  # Our http server handler for http requests
import gpiozero
import datetime
import psutil
import json
import os


def strfdelta(tdelta, fmt):
    d = {"days": tdelta.days}
    d["hours"], rem = divmod(tdelta.seconds, 3600)
    d["minutes"], d["seconds"] = divmod(rem, 60)
    return fmt.format(**d)


def getStats():

    date_now = datetime.datetime.now()
    boot_time = datetime.datetime.fromtimestamp(psutil.boot_time())
    delta_time_secs = (date_now - boot_time).total_seconds()
    delta_time = datetime.timedelta(seconds=delta_time_secs)

    x = {
        "Title": "Raspberry Pi HW Monitor",
        "Author": "xhico",
        "General": [{
            "Date Now": date_now.strftime("%Y-%m-%d %H:%M"),
            "Boot Time": boot_time.strftime("%Y-%m-%d %H:%M"),
            "Delta": strfdelta(delta_time, "{days} days {hours}:{minutes}"),
            "PIDs": len(psutil.pids())
        }],
        "CPU": [{
            "Percentage": round(psutil.cpu_percent(), 2),
            "Cores": psutil.cpu_count(),
            "Frequency (MHz)": round(psutil.cpu_freq().current, 2),
            "Temperature (C)": round(gpiozero.CPUTemperature().temperature, 2),
            "Temperature (F)": round(gpiozero.CPUTemperature().temperature * (9/5) + 32, 2)
        }],
        "Memory": [{
            "Percentage": round(psutil.virtual_memory().percent, 2),
            "Used (MB)": round(psutil.virtual_memory().used // 2**20, 2),
            "Available (MB)": round(psutil.virtual_memory().available // 2**20, 2),
            "Total (MB)": round(psutil.virtual_memory().total // 2**20, 2)
        }],
        "Network": [{
            "Sent (MB)": round(psutil.net_io_counters().bytes_sent // 2**20, 2),
            "Received (MB)": round(psutil.net_io_counters().bytes_recv // 2**20, 2),
            "Packets (Sent)": round(psutil.net_io_counters().packets_sent, 2),
            "Packets (Received)": round(psutil.net_io_counters().packets_recv, 2),
            "Errors (Sent)": round(psutil.net_io_counters().errin, 2),
            "Errors (Received)": round(psutil.net_io_counters().errout, 2),
            "Dropped (Sent)": round(psutil.net_io_counters().dropin, 2),
            "Dropped (Received)": round(psutil.net_io_counters().dropout, 2)
        }],
        "Disks": [{
            "SD Card": [{
                "Percentage": round(psutil.disk_usage('/').percent, 2),
                "Used (MB)": round(psutil.disk_usage('/').used // 2**20, 2),
                "Free (MB)": round(psutil.disk_usage('/').free // 2**20, 2),
                "Total (MB)": round(psutil.disk_usage('/').total // 2**20, 2)
            }],
            "918": [{
                "Percentage": round(psutil.disk_usage('/media/pi/918').percent, 2),
                "Used (MB)": round(psutil.disk_usage('/media/pi/918').used // 2**20, 2),
                "Free (MB)": round(psutil.disk_usage('/media/pi/918').free // 2**20, 2),
                "Total (MB)": round(psutil.disk_usage('/media/pi/918').total // 2**20, 2)
            }],
        }]
    }

    return x


class RequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):

        if self.path == '/':
            self.send_response(200)
            self.send_header('Content-Type', 'text/html')
            self.end_headers()
            with open("index.html", 'r') as f:
                output = f.read()
            f.close()
            self.wfile.write(output.encode())
        elif self.path == "/json":
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(getStats(), indent=4).encode())
        else:
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write("None".encode())
        return


if __name__ == '__main__':
    abspath = os.path.abspath(__file__)
    dname = os.path.dirname(abspath)
    os.chdir(dname)

    webServer = http.server.HTTPServer(('0.0.0.0', 8814), RequestHandler)

    try:
        print("Server started.")
        webServer.serve_forever()
    except KeyboardInterrupt:
        webServer.server_close()
        print("Server stopped.")
