/*
    @author: xhico
 */

async function getVersions(JSON) {
    if (JSON["Version"]["hasInfo"] === "None") {
        document.querySelector("#versionSection").hidden = true;
        return;
    }

    // Version
    let Version_Processor = JSON["Version"]["Processor"];
    let Version_Distribution = JSON["Version"]["Distribution"];
    let Version_Kernel = JSON["Version"]["Kernel"];
    let Version_Firmware = JSON["Version"]["Firmware"];
    document.querySelector("#Version_Processor").innerText = Version_Processor;
    document.querySelector("#Version_Distribution").innerText = Version_Distribution;
    document.querySelector("#Version_Kernel").innerText = Version_Kernel;
    document.querySelector("#Version_Firmware").innerText = Version_Firmware;
}

async function getUptime(JSON) {
    if (JSON["Uptime"]["hasInfo"] === "None") {
        document.querySelector("#UptimeSection").hidden = true;
        return;
    }

    // Uptime
    let Uptime_Date_Now = JSON["Uptime"]["Date_Now"];
    let Uptime_Install_Date = JSON["Uptime"]["Install_Date"];
    let Uptime_Install_Uptime = JSON["Uptime"]["Install_Uptime"];
    let Uptime_Boot_Time = JSON["Uptime"]["Boot_Time"];
    let Uptime_Boot_Uptime = JSON["Uptime"]["Boot_Uptime"];
    document.querySelector("#Uptime_Date_Now").innerText = Uptime_Date_Now;
    document.querySelector("#Uptime_Install_Date").innerText = Uptime_Install_Date;
    document.querySelector("#Uptime_Install_Uptime").innerText = Uptime_Install_Uptime;
    document.querySelector("#Uptime_Boot_Time").innerText = Uptime_Boot_Time;
    document.querySelector("#Uptime_Boot_Uptime").innerText = Uptime_Boot_Uptime;
}

async function getCPU(JSON) {
    if (JSON["CPU"]["hasInfo"] === "None") {
        document.querySelector("#CPUSection").hidden = true;
        document.querySelector("#CPU_TemperatureSection").hidden = true;
        return;
    }

    // CPU
    let CPU_Percentage = JSON["CPU"]["Percentage"];
    let CPU_Cores = JSON["CPU"]["Cores"];
    let CPU_Frequency = JSON["CPU"]["Frequency"];
    let CPU_Voltage = JSON["CPU"]["Voltage"];
    document.querySelector("#CPU_Percentage").innerText = CPU_Percentage + " %";
    document.querySelector("#CPU_Percentage").style.width = CPU_Percentage + "%";
    document.querySelector("#CPU_Percentage").ariaValueNow = CPU_Percentage;
    if (CPU_Percentage < 50) {
        document.querySelector("#CPU_Percentage").classList.remove("bg-warning");
        document.querySelector("#CPU_Percentage").classList.remove("bg-danger");
        document.querySelector("#CPU_Percentage").classList.add("bg-success");
    } else if (CPU_Percentage >= 50 && CPU_Percentage < 80) {
        document.querySelector("#CPU_Percentage").classList.remove("bg-danger");
        document.querySelector("#CPU_Percentage").classList.remove("bg-success");
        document.querySelector("#CPU_Percentage").classList.add("bg-warning");
    } else {
        document.querySelector("#CPU_Percentage").classList.remove("bg-success");
        document.querySelector("#CPU_Percentage").classList.remove("bg-warning");
        document.querySelector("#CPU_Percentage").classList.add("bg-danger");
    }
    document.querySelector("#CPU_Percentage").style.width = CPU_Percentage + "%";
    document.querySelector("#CPU_Percentage").ariaValueNow = CPU_Percentage;
    document.querySelector("#CPU_Cores").innerText = CPU_Cores;
    document.querySelector("#CPU_Frequency").innerText = CPU_Frequency + " MHz";
    document.querySelector("#CPU_Voltage").innerText = CPU_Voltage + " V";

    // Temperature
    let CPU_Temperature = JSON["CPU"]["Temperature"];
    document.querySelector("#CPU_Temperature").innerText = CPU_Temperature + " °C";

    // Set Colors
    let greenColor, yellowColor, redColor;
    switch (true) {
        case (CPU_Temperature >= config_CPUTemperatureRange[0] && CPU_Temperature < config_CPUTemperatureRange[1]):
            [greenColor, yellowColor, redColor] = ["#36714B", "#F9D885", "#DD8589"];
            break;
        case (CPU_Temperature >= config_CPUTemperatureRange[1] && CPU_Temperature < config_CPUTemperatureRange[2]):
            [greenColor, yellowColor, redColor] = ["#83B092", "#F6C344", "#DD8589"];
            break;
        default:
            [greenColor, yellowColor, redColor] = ["#83B092", "#F9D885", "#CB444A"];
    }

    // Add Gauge info
    let opts = {
        angle: 0, lineWidth: 0.5, radiusScale: 1, pointer: {
            length: 0.5, strokeWidth: 0.035, color: '#000000'
        },
        limitMax: false, limitMin: false, staticZones: [
            {strokeStyle: greenColor, min: config_CPUTemperatureRange[0], max: config_CPUTemperatureRange[1]},
            {strokeStyle: yellowColor, min: config_CPUTemperatureRange[1], max: config_CPUTemperatureRange[2]},
            {strokeStyle: redColor, min: config_CPUTemperatureRange[2], max: config_CPUTemperatureRange[3]}
        ],
        highDpiSupport: true,
    };
    let target = document.querySelector("#CPU_Temperature_Gauge");
    let gauge = new Gauge(target).setOptions(opts);
    gauge.maxValue = config_CPUTemperatureRange[3];
    gauge.setMinValue(config_CPUTemperatureRange[0]);
    gauge.animationSpeed = 1;
    gauge.set(CPU_Temperature);
}

async function getAmbient(JSON) {
    if (JSON["Ambient"]["hasInfo"] === "None") {
        return;
    }

    // Ambient
    let Ambient_Date = JSON["Ambient"]["Date"];
    let Ambient_TemperatureC = JSON["Ambient"]["TemperatureC"];
    let Ambient_TemperatureF = JSON["Ambient"]["TemperatureF"];
    let Ambient_Humidity = JSON["Ambient"]["Humidity"];
    let Ambient_Pressure = JSON["Ambient"]["Pressure"];
    document.querySelector("#Ambient_Date").innerText = Ambient_Date;
    document.querySelector("#Ambient_TemperatureC").innerText = Ambient_TemperatureC + " ºC";
    document.querySelector("#Ambient_TemperatureF").innerText = Ambient_TemperatureF + " °F";
    document.querySelector("#Ambient_Humidity").innerText = Ambient_Humidity + " %";
    document.querySelector("#Ambient_Pressure").innerText = Ambient_Pressure !== "Not Available" ? Ambient_Pressure + " hPa" : Ambient_Pressure;
    document.querySelector("#AmbientSection").hidden = false;
}

async function getMemory(JSON) {
    if (JSON["Memory"]["hasInfo"] === "None") {
        document.querySelector("#MemorySection").hidden = true;
        return;
    }

    // Memory
    let Memory_Percentage = JSON["Memory"]["Percentage"];
    let Memory_Used = JSON["Memory"]["Used"];
    let Memory_Available = JSON["Memory"]["Available"];
    let Memory_Total = JSON["Memory"]["Total"];
    document.querySelector("#Memory_Percentage").innerText = Memory_Percentage + " %";
    document.querySelector("#Memory_Percentage").style.width = Memory_Percentage + "%";
    document.querySelector("#Memory_Percentage").ariaValueNow = Memory_Percentage;
    if (Memory_Percentage < 50) {
        document.querySelector("#Memory_Percentage").classList.remove("bg-warning");
        document.querySelector("#Memory_Percentage").classList.remove("bg-danger");
        document.querySelector("#Memory_Percentage").classList.add("bg-success");
    } else if (Memory_Percentage >= 50 && Memory_Percentage < 80) {
        document.querySelector("#Memory_Percentage").classList.remove("bg-danger");
        document.querySelector("#Memory_Percentage").classList.remove("bg-success");
        document.querySelector("#Memory_Percentage").classList.add("bg-warning");
    } else {
        document.querySelector("#Memory_Percentage").classList.remove("bg-success");
        document.querySelector("#Memory_Percentage").classList.remove("bg-warning");
        document.querySelector("#Memory_Percentage").classList.add("bg-danger");
    }
    document.querySelector("#Memory_Used").innerText = convert_size(Memory_Used);
    document.querySelector("#Memory_Available").innerText = convert_size(Memory_Available);
    document.querySelector("#Memory_Total").innerText = convert_size(Memory_Total);
}

async function getSDCard(JSON) {
    if (JSON["Disks"]["SDCard"]["hasInfo"] === "None") {
        document.querySelector("#SDCardSection").hidden = true;
        return;
    }

    // Disks -> SDCard
    let Disks_SDCard_Percentage = JSON["Disks"]["SDCard"]["Percentage"];
    let Disks_SDCard_Used = JSON["Disks"]["SDCard"]["Used"];
    let Disks_SDCard_Free = JSON["Disks"]["SDCard"]["Free"];
    let Disks_SDCard_Total = JSON["Disks"]["SDCard"]["Total"];
    document.querySelector("#Disks_SDCard_Percentage").innerText = Disks_SDCard_Percentage + " %";
    document.querySelector("#Disks_SDCard_Percentage").style.width = Disks_SDCard_Percentage + "%";
    document.querySelector("#Disks_SDCard_Percentage").ariaValueNow = Disks_SDCard_Percentage;
    if (Disks_SDCard_Percentage < 50) {
        document.querySelector("#Disks_SDCard_Percentage").classList.remove("bg-warning");
        document.querySelector("#Disks_SDCard_Percentage").classList.remove("bg-danger");
        document.querySelector("#Disks_SDCard_Percentage").classList.add("bg-success");
    } else if (Disks_SDCard_Percentage >= 50 && Disks_SDCard_Percentage < 80) {
        document.querySelector("#Disks_SDCard_Percentage").classList.remove("bg-danger");
        document.querySelector("#Disks_SDCard_Percentage").classList.remove("bg-success");
        document.querySelector("#Disks_SDCard_Percentage").classList.add("bg-warning");
    } else {
        document.querySelector("#Disks_SDCard_Percentage").classList.remove("bg-success");
        document.querySelector("#Disks_SDCard_Percentage").classList.remove("bg-warning");
        document.querySelector("#Disks_SDCard_Percentage").classList.add("bg-danger");
    }
    document.querySelector("#Disks_SDCard_Used").innerText = convert_size(Disks_SDCard_Used);
    document.querySelector("#Disks_SDCard_Free").innerText = convert_size(Disks_SDCard_Free);
    document.querySelector("#Disks_SDCard_Total").innerText = convert_size(Disks_SDCard_Total);
}

async function getWired(JSON) {
    if (JSON["Network"]["Wired"]["hasInfo"] === "None") {
        document.querySelector("#WiredSection").hidden = true;
        return;
    }

    // Network -> Wired
    let Network_Wired_Sent = JSON["Network"]["Wired"]["Sent"];
    let Network_Wired_Received = JSON["Network"]["Wired"]["Received"];
    let Network_Wired_Packets_Sent = JSON["Network"]["Wired"]["Packets_Sent"];
    let Network_Wired_Packets_Received = JSON["Network"]["Wired"]["Packets_Received"];
    document.querySelector("#Network_Wired_Sent").innerText = convert_size(Network_Wired_Sent);
    document.querySelector("#Network_Wired_Received").innerText = convert_size(Network_Wired_Received);
    document.querySelector("#Network_Wired_Packets_Sent").innerText = parseInt(Network_Wired_Packets_Sent).toLocaleString();
    document.querySelector("#Network_Wired_Packets_Received").innerText = parseInt(Network_Wired_Packets_Received).toLocaleString();
}

async function getWifi(JSON) {
    if (JSON["Network"]["Wifi"]["hasInfo"] === "None") {
        document.querySelector("#WifiSection").hidden = true;
        return;
    }

    // Network -> Wifi
    let Network_Wifi_Sent = JSON["Network"]["Wifi"]["Sent"];
    let Network_Wifi_Received = JSON["Network"]["Wifi"]["Received"];
    let Network_Wifi_Packets_Sent = JSON["Network"]["Wifi"]["Packets_Sent"];
    let Network_Wifi_Packets_Received = JSON["Network"]["Wifi"]["Packets_Received"];
    document.querySelector("#Network_Wifi_Sent").innerText = convert_size(Network_Wifi_Sent);
    document.querySelector("#Network_Wifi_Received").innerText = convert_size(Network_Wifi_Received);
    document.querySelector("#Network_Wifi_Packets_Sent").innerText = parseInt(Network_Wifi_Packets_Sent).toLocaleString();
    document.querySelector("#Network_Wifi_Packets_Received").innerText = parseInt(Network_Wifi_Packets_Received).toLocaleString();
}

async function getExternalDisks(JSON) {
    let Disks_ExternalDisks = JSON["Disks"]["ExternalDisks"];

    // Create External Disk Div
    function createExternalDiskDiv(diskName) {
        // Create the main div element
        let mainDiv = document.createElement("div");
        mainDiv.id = diskName + "Section";
        mainDiv.className = "col-xl-3 col-md-6 border-bottom border-end";

        // Create the first inner div element with the image and text
        let innerDiv1 = document.createElement("div");
        innerDiv1.className = "text-center";
        let img = document.createElement("img");
        img.className = "m-2";
        img.width = 40;
        img.src = "/static/images/usb_hdd.png";
        img.alt = "External Hard Drive";
        let textNode = document.createTextNode(diskName);
        innerDiv1.appendChild(img);
        innerDiv1.appendChild(textNode);

        // Create the second inner div element with the disk information
        let innerDiv2 = document.createElement("div");
        innerDiv2.className = "text-center";
        let p1 = document.createElement("p");
        p1.className = "col";
        p1.innerHTML = "Used: <b><span id='Disks_" + diskName + "_Used'></span></b>";
        let p2 = document.createElement("p");
        p2.className = "col";
        p2.innerHTML = "Free: <b><span id='Disks_" + diskName + "_Free'></span></b>";
        let p3 = document.createElement("p");
        p3.className = "col";
        p3.innerHTML = "Total: <b><span id='Disks_" + diskName + "_Total'></span></b>";
        let divProgressBar = document.createElement("div");
        divProgressBar.className = "progress mb-4 mx-4 progress-20-height";
        let progressBar = document.createElement("div");
        progressBar.id = "Disks_" + diskName + "_Percentage";
        progressBar.className = "progress-bar";
        progressBar.setAttribute("role", "progressbar");
        progressBar.setAttribute("aria-valuemin", "0");
        progressBar.setAttribute("aria-valuemax", "100");
        divProgressBar.appendChild(progressBar);
        innerDiv2.appendChild(p1);
        innerDiv2.appendChild(p2);
        innerDiv2.appendChild(p3);
        innerDiv2.appendChild(divProgressBar);

        // Append inner divs to the main div
        mainDiv.appendChild(innerDiv1);
        mainDiv.appendChild(innerDiv2);
        return mainDiv;
    }

    // Iterate over every External Div
    for (let Disks_ExternalDisk in Disks_ExternalDisks) {

        // Get Infos
        let Disk_Info = Disks_ExternalDisks[Disks_ExternalDisk]
        let Disk_Percentage = Disk_Info["Percentage"];
        let Disk_Used = Disk_Info["Used"];
        let Disk_Free = Disk_Info["Free"];
        let Disk_Total = Disk_Info["Total"];

        // Create External Div if necessary
        let Disk_Div = document.getElementById("#" + Disks_ExternalDisk + "Section");
        if (!Disk_Div) {
            Disk_Div = createExternalDiskDiv(Disks_ExternalDisk);
        }

        // Add Disk_Div to Content Div
        document.querySelector("#content").appendChild(Disk_Div);

        // Set External Disk Info
        let diskPercentageElement = document.querySelector("#Disks_" + Disks_ExternalDisk + "_Percentage");
        diskPercentageElement.innerText = Disk_Percentage + " %";
        diskPercentageElement.style.width = Disk_Percentage + "%";
        diskPercentageElement.ariaValueNow = Disk_Percentage;
        if (Disk_Percentage < 50) {
            diskPercentageElement.classList.remove("bg-warning", "bg-danger");
            diskPercentageElement.classList.add("bg-success");
        } else if (Disk_Percentage < 80) {
            diskPercentageElement.classList.remove("bg-danger", "bg-success");
            diskPercentageElement.classList.add("bg-warning");
        } else {
            diskPercentageElement.classList.remove("bg-success", "bg-warning");
            diskPercentageElement.classList.add("bg-danger");
        }

        document.querySelector("#Disks_" + Disks_ExternalDisk + "_Used").innerText = convert_size(Disk_Used);
        document.querySelector("#Disks_" + Disks_ExternalDisk + "_Free").innerText = convert_size(Disk_Free);
        document.querySelector("#Disks_" + Disks_ExternalDisk + "_Total").innerText = convert_size(Disk_Total);
    }
}

async function updateSections() {
    // Get HW Info JSON
    console.log("Get HW Info JSON");
    let JSON = await $.ajax({
        method: "get", url: "/stats/getHWInfo", success: function (data) {
            return data;
        }
    });

    // Run sections
    getVersions(JSON);
    getUptime(JSON);
    getCPU(JSON);
    getMemory(JSON);
    getSDCard(JSON);
    getWired(JSON);
    getWifi(JSON);
    getExternalDisks(JSON);
    getAmbient(JSON);

    // Remove Loading
    await loadingScreen("remove");

    // Wait x secs -> Run again
    await sleep(config_updateTime);
    if (config_updateStats === true) {
        await updateSections();
    }
}

window.addEventListener('DOMContentLoaded', async function main() {
    document.querySelector("#navbar_stats").classList.add("active");
    await updateSections();
});