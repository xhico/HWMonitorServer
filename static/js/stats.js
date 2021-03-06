/*
    @author: xhico
 */

function getVersions(JSON) {
    if (JSON["Version"]["hasInfo"] === "None") {
        document.getElementById("versionSection").hidden = true;
        return;
    }

    // Version
    let Version_Processor = JSON["Version"]["Processor"];
    let Version_Distribution = JSON["Version"]["Distribution"];
    let Version_Kernel = JSON["Version"]["Kernel"];
    let Version_Firmware = JSON["Version"]["Firmware"];
    document.getElementById("Version_Processor").innerText = Version_Processor;
    document.getElementById("Version_Distribution").innerText = Version_Distribution;
    document.getElementById("Version_Kernel").innerText = Version_Kernel;
    document.getElementById("Version_Firmware").innerText = Version_Firmware;
}

function getUptime(JSON) {
    if (JSON["Uptime"]["hasInfo"] === "None") {
        document.getElementById("UptimeSection").hidden = true;
        return;
    }

    // Uptime
    let Uptime_Date_Now = JSON["Uptime"]["Date_Now"];
    let Uptime_Boot_Time = JSON["Uptime"]["Boot_Time"];
    let Uptime_Uptime = JSON["Uptime"]["Uptime"];
    document.getElementById("Uptime_Date_Now").innerText = Uptime_Date_Now;
    document.getElementById("Uptime_Boot_Time").innerText = Uptime_Boot_Time;
    document.getElementById("Uptime_Uptime").innerText = Uptime_Uptime;
}

function getCPU(JSON) {
    if (JSON["CPU"]["hasInfo"] === "None") {
        document.getElementById("UptimeSection").hidden = true;
        return;
    }

    // CPU
    let CPU_Percentage = JSON["CPU"]["Percentage"];
    let CPU_Cores = JSON["CPU"]["Cores"];
    let CPU_Frequency = JSON["CPU"]["Frequency"];
    let CPU_PIDs = JSON["CPU"]["PIDs"];
    let CPU_Voltage = JSON["CPU"]["Voltage"];
    document.getElementById("CPU_Percentage").innerText = CPU_Percentage + " %";
    document.getElementById("CPU_Percentage").style.width = CPU_Percentage + "%";
    document.getElementById("CPU_Percentage").ariaValueNow = CPU_Percentage;
    if (CPU_Percentage < 50) {
        document.getElementById("CPU_Percentage").classList.remove("bg-warning");
        document.getElementById("CPU_Percentage").classList.remove("bg-danger");
        document.getElementById("CPU_Percentage").classList.add("bg-success");
    } else if (CPU_Percentage >= 50 && CPU_Percentage < 80) {
        document.getElementById("CPU_Percentage").classList.remove("bg-danger");
        document.getElementById("CPU_Percentage").classList.remove("bg-success");
        document.getElementById("CPU_Percentage").classList.add("bg-warning");
    } else {
        document.getElementById("CPU_Percentage").classList.remove("bg-success");
        document.getElementById("CPU_Percentage").classList.remove("bg-warning");
        document.getElementById("CPU_Percentage").classList.add("bg-danger");
    }
    document.getElementById("CPU_Percentage").style.width = CPU_Percentage + "%";
    document.getElementById("CPU_Percentage").ariaValueNow = CPU_Percentage;
    document.getElementById("CPU_Cores").innerText = CPU_Cores;
    document.getElementById("CPU_Frequency").innerText = CPU_Frequency + " MHz";
    document.getElementById("CPU_PIDs").innerText = CPU_PIDs;
    document.getElementById("CPU_Voltage").innerText = CPU_Voltage.split("V")[0] + " V";
}

function getTemperature(JSON) {
    if (JSON["Temperature"]["hasInfo"] === "None") {
        document.getElementById("TemperatureSectionSection").hidden = true;
        return;
    }

    // Temperature
    let CPU_Temperature = JSON["Temperature"]["Temperature"];
    document.getElementById("Temperature").innerText = CPU_Temperature + " ??C";

    // Add Gauge info
    let opts = {
        angle: 0.15, lineWidth: 0.44, radiusScale: 1, pointer: {length: 0.6, strokeWidth: 0.035, color: '#000000'}, limitMax: false, limitMin: false, staticZones: [{strokeStyle: "#198754", min: 30, max: 50}, {strokeStyle: "#ffc107", min: 50, max: 65}, {strokeStyle: "#dc3545", min: 65, max: 80},], highDpiSupport: true,
    };
    let target = document.getElementById('Temperature_Gauge');
    let gauge = new Gauge(target).setOptions(opts);
    gauge.maxValue = 80;
    gauge.setMinValue(30);
    gauge.animationSpeed = 1;
    gauge.set(CPU_Temperature);
}

function getAmbientHumidityTemperature(JSON) {
    if (JSON["AmbientHumidityTemperature"]["hasInfo"] === "None") {
        document.getElementById("AmbientSection").hidden = true;
        return;
    }

    // Date / Humidity / Temperature
    let Ambient_Date = JSON["AmbientHumidityTemperature"]["Date"];
    let Ambient_TemperatureC = JSON["AmbientHumidityTemperature"]["TemperatureC"];
    let Ambient_TemperatureF = JSON["AmbientHumidityTemperature"]["TemperatureF"];
    let Ambient_Humidity = JSON["AmbientHumidityTemperature"]["Humidity"];
    let Ambient_Valid = JSON["AmbientHumidityTemperature"]["Valid"];
    document.getElementById("Ambient_Date").innerText = Ambient_Date;
    document.getElementById("Ambient_TemperatureC").innerText = Ambient_TemperatureC + " ??C";
    document.getElementById("Ambient_TemperatureF").innerText = Ambient_TemperatureF + " ??F";
    document.getElementById("Ambient_Humidity").innerText = Ambient_Humidity + " %";
    document.getElementById("Ambient_Valid").innerText = Ambient_Valid;
}

function getMemory(JSON) {
    if (JSON["Memory"]["hasInfo"] === "None") {
        document.getElementById("MemorySection").hidden = true;
        return;
    }

    // Memory
    let Memory_Percentage = JSON["Memory"]["Percentage"];
    let Memory_Used = JSON["Memory"]["Used"];
    let Memory_Available = JSON["Memory"]["Available"];
    let Memory_Total = JSON["Memory"]["Total"];
    document.getElementById("Memory_Percentage").innerText = Memory_Percentage + " %";
    document.getElementById("Memory_Percentage").style.width = Memory_Percentage + "%";
    document.getElementById("Memory_Percentage").ariaValueNow = Memory_Percentage;
    if (Memory_Percentage < 50) {
        document.getElementById("Memory_Percentage").classList.remove("bg-warning");
        document.getElementById("Memory_Percentage").classList.remove("bg-danger");
        document.getElementById("Memory_Percentage").classList.add("bg-success");
    } else if (Memory_Percentage >= 50 && Memory_Percentage < 80) {
        document.getElementById("Memory_Percentage").classList.remove("bg-danger");
        document.getElementById("Memory_Percentage").classList.remove("bg-success");
        document.getElementById("Memory_Percentage").classList.add("bg-warning");
    } else {
        document.getElementById("Memory_Percentage").classList.remove("bg-success");
        document.getElementById("Memory_Percentage").classList.remove("bg-warning");
        document.getElementById("Memory_Percentage").classList.add("bg-danger");
    }
    document.getElementById("Memory_Used").innerText = Memory_Used;
    document.getElementById("Memory_Available").innerText = Memory_Available;
    document.getElementById("Memory_Total").innerText = Memory_Total;
}

function getSDCard(JSON) {
    if (JSON["Disks"]["SDCard"]["hasInfo"] === "None") {
        document.getElementById("SDCardSection").hidden = true;
        return;
    }

    // Disks -> SDCard
    let Disks_SDCard_Percentage = JSON["Disks"]["SDCard"]["Percentage"];
    let Disks_SDCard_Used = JSON["Disks"]["SDCard"]["Used"];
    let Disks_SDCard_Free = JSON["Disks"]["SDCard"]["Free"];
    let Disks_SDCard_Total = JSON["Disks"]["SDCard"]["Total"];
    document.getElementById("Disks_SDCard_Percentage").innerText = Disks_SDCard_Percentage + " %";
    document.getElementById("Disks_SDCard_Percentage").style.width = Disks_SDCard_Percentage + "%";
    document.getElementById("Disks_SDCard_Percentage").ariaValueNow = Disks_SDCard_Percentage;
    if (Disks_SDCard_Percentage < 50) {
        document.getElementById("Disks_SDCard_Percentage").classList.remove("bg-warning");
        document.getElementById("Disks_SDCard_Percentage").classList.remove("bg-danger");
        document.getElementById("Disks_SDCard_Percentage").classList.add("bg-success");
    } else if (Disks_SDCard_Percentage >= 50 && Disks_SDCard_Percentage < 80) {
        document.getElementById("Disks_SDCard_Percentage").classList.remove("bg-danger");
        document.getElementById("Disks_SDCard_Percentage").classList.remove("bg-success");
        document.getElementById("Disks_SDCard_Percentage").classList.add("bg-warning");
    } else {
        document.getElementById("Disks_SDCard_Percentage").classList.remove("bg-success");
        document.getElementById("Disks_SDCard_Percentage").classList.remove("bg-warning");
        document.getElementById("Disks_SDCard_Percentage").classList.add("bg-danger");
    }
    document.getElementById("Disks_SDCard_Used").innerText = Disks_SDCard_Used;
    document.getElementById("Disks_SDCard_Free").innerText = Disks_SDCard_Free;
    document.getElementById("Disks_SDCard_Total").innerText = Disks_SDCard_Total;
}

function getWired(JSON) {
    if (JSON["Network"]["Wired"]["hasInfo"] === "None") {
        document.getElementById("WiredSection").hidden = true;
        return;
    }

    // Network -> Wired
    let Network_Wired_Sent = JSON["Network"]["Wired"]["Sent"];
    let Network_Wired_Received = JSON["Network"]["Wired"]["Received"];
    let Network_Wired_Packets_Sent = JSON["Network"]["Wired"]["Packets_Sent"];
    let Network_Wired_Packets_Received = JSON["Network"]["Wired"]["Packets_Received"];
    document.getElementById("Network_Wired_Sent").innerText = Network_Wired_Sent;
    document.getElementById("Network_Wired_Received").innerText = Network_Wired_Received;
    document.getElementById("Network_Wired_Packets_Sent").innerText = Network_Wired_Packets_Sent;
    document.getElementById("Network_Wired_Packets_Received").innerText = Network_Wired_Packets_Received;
}

function getWifi(JSON) {
    if (JSON["Network"]["Wifi"]["hasInfo"] === "None") {
        document.getElementById("WifiSection").hidden = true;
        return;
    }

    // Network -> Wifi
    let Network_Wifi_Sent = JSON["Network"]["Wifi"]["Sent"];
    let Network_Wifi_Received = JSON["Network"]["Wifi"]["Received"];
    let Network_Wifi_Packets_Sent = JSON["Network"]["Wifi"]["Packets_Sent"];
    let Network_Wifi_Packets_Received = JSON["Network"]["Wifi"]["Packets_Received"];
    document.getElementById("Network_Wifi_Sent").innerText = Network_Wifi_Sent;
    document.getElementById("Network_Wifi_Received").innerText = Network_Wifi_Received;
    document.getElementById("Network_Wifi_Packets_Sent").innerText = Network_Wifi_Packets_Sent;
    document.getElementById("Network_Wifi_Packets_Received").innerText = Network_Wifi_Packets_Received;
}

function get918(JSON) {
    if (JSON["Disks"]["918"]["hasInfo"] === "None") {
        document.getElementById("918Section").hidden = true;
        return;
    }

    // Disks -> 918
    let Disks_918_Percentage = JSON["Disks"]["918"]["Percentage"];
    let Disks_918_Used = JSON["Disks"]["918"]["Used"];
    let Disks_918_Free = JSON["Disks"]["918"]["Free"];
    let Disks_918_Total = JSON["Disks"]["918"]["Total"];
    document.getElementById("Disks_918_Percentage").innerText = Disks_918_Percentage + " %";
    document.getElementById("Disks_918_Percentage").style.width = Disks_918_Percentage + "%";
    document.getElementById("Disks_918_Percentage").ariaValueNow = Disks_918_Percentage;
    if (Disks_918_Percentage < 50) {
        document.getElementById("Disks_918_Percentage").classList.remove("bg-warning");
        document.getElementById("Disks_918_Percentage").classList.remove("bg-danger");
        document.getElementById("Disks_918_Percentage").classList.add("bg-success");
    } else if (Disks_918_Percentage >= 50 && Disks_918_Percentage < 80) {
        document.getElementById("Disks_918_Percentage").classList.remove("bg-danger");
        document.getElementById("Disks_918_Percentage").classList.remove("bg-success");
        document.getElementById("Disks_918_Percentage").classList.add("bg-warning");
    } else {
        document.getElementById("Disks_918_Percentage").classList.remove("bg-success");
        document.getElementById("Disks_918_Percentage").classList.remove("bg-warning");
        document.getElementById("Disks_918_Percentage").classList.add("bg-danger");
    }
    document.getElementById("Disks_918_Used").innerText = Disks_918_Used;
    document.getElementById("Disks_918_Free").innerText = Disks_918_Free;
    document.getElementById("Disks_918_Total").innerText = Disks_918_Total;
}

window.addEventListener('DOMContentLoaded', async function main() {
    console.log("---------------------");
    document.getElementById("navbar_stats").classList.add("active");

    // Get HW Info JSON
    console.log("Get HW Info JSON");
    let JSON = await $.ajax({
        method: "get", url: "/json/hwInfo", success: function (data) {
            return data;
        }
    });

    // Run sections
    console.log("Run Sections");
    getVersions(JSON);
    getUptime(JSON);
    getCPU(JSON);
    getTemperature(JSON);
    getAmbientHumidityTemperature(JSON);
    getMemory(JSON);
    getSDCard(JSON);
    getWired(JSON);
    getWifi(JSON);
    get918(JSON);

    // Wait 2 secs -> Run again
    await new Promise(r => setTimeout(r, 2000));
    await main();
});