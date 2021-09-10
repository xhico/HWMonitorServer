window.addEventListener('DOMContentLoaded', async event => {
    // Get JSON
    let JSON = await $.get("/json", function (result) {
        return result;
    });

    // Version
    let Version_Processor = JSON["Version"]["Processor"];
    let Version_Distribution = JSON["Version"]["Distribution"];
    let Version_Kernel = JSON["Version"]["Kernel"];
    let Version_Firmware = JSON["Version"]["Firmware"];
    document.getElementById("Version_Processor").innerText = Version_Processor;
    document.getElementById("Version_Distribution").innerText = Version_Distribution;
    document.getElementById("Version_Kernel").innerText = Version_Kernel;
    document.getElementById("Version_Firmware").innerText = Version_Firmware;


    // Uptime
    let Uptime_Date_Now = JSON["Uptime"]["Date_Now"];
    let Uptime_Boot_Time = JSON["Uptime"]["Boot_Time"];
    let Uptime_Uptime = JSON["Uptime"]["Uptime"];
    document.getElementById("Uptime_Date_Now").innerText = Uptime_Date_Now;
    document.getElementById("Uptime_Boot_Time").innerText = Uptime_Boot_Time;
    document.getElementById("Uptime_Uptime").innerText = Uptime_Uptime;


    // CPU
    let CPU_Percentage = JSON["CPU"]["Percentage"];
    let CPU_Cores = JSON["CPU"]["Cores"];
    let CPU_Frequency = JSON["CPU"]["Frequency"];
    let CPU_PIDs = JSON["CPU"]["PIDs"];
    document.getElementById("CPU_Percentage").innerText = CPU_Percentage + " %";
    document.getElementById("CPU_Percentage").style.width = CPU_Percentage + "%";
    document.getElementById("CPU_Percentage").ariaValueNow = CPU_Percentage;
    document.getElementById("CPU_Cores").innerText = CPU_Cores;
    document.getElementById("CPU_Frequency").innerText = CPU_Frequency;
    document.getElementById("CPU_PIDs").innerText = CPU_PIDs;


    // Temperature
    let CPU_Temperature = JSON["CPU"]["Temperature"];
    document.getElementById("CPU_Temperature").innerText = CPU_Temperature + " °C";
    document.getElementById("CPU_Temperature").style.width = CPU_Temperature + "%";
    document.getElementById("CPU_Temperature").ariaValueNow = CPU_Temperature;


    // Memory
    let Memory_Percentage = JSON["Memory"]["Percentage"];
    let Memory_Used = JSON["Memory"]["Used"];
    let Memory_Available = JSON["Memory"]["Available"];
    let Memory_Total = JSON["Memory"]["Total"];
    document.getElementById("Memory_Percentage").innerText = Memory_Percentage + " %";
    document.getElementById("Memory_Percentage").style.width = Memory_Percentage + "%";
    document.getElementById("Memory_Percentage").ariaValueNow = Memory_Percentage;
    document.getElementById("Memory_Used").innerText = Memory_Used;
    document.getElementById("Memory_Available").innerText = Memory_Available;
    document.getElementById("Memory_Total").innerText = Memory_Total;


    // Disks -> SDCard
    let Disks_SDCard_Percentage = JSON["Disks"]["SDCard"]["Percentage"];
    let Disks_SDCard_Used = JSON["Disks"]["SDCard"]["Used"];
    let Disks_SDCard_Free = JSON["Disks"]["SDCard"]["Free"];
    let Disks_SDCard_Total = JSON["Disks"]["SDCard"]["Total"];
    document.getElementById("Disks_SDCard_Percentage").innerText = Disks_SDCard_Percentage + " %";
    document.getElementById("Disks_SDCard_Percentage").style.width = Disks_SDCard_Percentage + "%";
    document.getElementById("Disks_SDCard_Percentage").ariaValueNow = Disks_SDCard_Percentage;
    document.getElementById("Disks_SDCard_Used").innerText = Disks_SDCard_Used;
    document.getElementById("Disks_SDCard_Free").innerText = Disks_SDCard_Free;
    document.getElementById("Disks_SDCard_Total").innerText = Disks_SDCard_Total;

    // Disks -> 918
    let Disks_918_Percentage = JSON["Disks"]["918"]["Percentage"];
    let Disks_918_Used = JSON["Disks"]["918"]["Used"];
    let Disks_918_Free = JSON["Disks"]["918"]["Free"];
    let Disks_918_Total = JSON["Disks"]["918"]["Total"];
    document.getElementById("Disks_918_Percentage").innerText = Disks_918_Percentage + " %";
    document.getElementById("Disks_918_Percentage").style.width = Disks_918_Percentage + "%";
    document.getElementById("Disks_918_Percentage").ariaValueNow = Disks_918_Percentage;
    document.getElementById("Disks_918_Used").innerText = Disks_918_Used;
    document.getElementById("Disks_918_Free").innerText = Disks_918_Free;
    document.getElementById("Disks_918_Total").innerText = Disks_918_Total;


    // Network
    let Network_Sent = JSON["Network"]["Sent"];
    let Network_Received = JSON["Network"]["Received"];
    let Network_Packets_Sent = JSON["Network"]["Packets_Sent"];
    let Network_Packets_Received = JSON["Network"]["Packets_Received"];
    let Network_Errors_Sent = JSON["Network"]["Errors_Sent"];
    let Network_Errors_Received = JSON["Network"]["Errors_Received"];
    let Network_Dropped_Sent = JSON["Network"]["Dropped_Sent"];
    let Network_Dropped_Received = JSON["Network"]["Dropped_Received"];
    document.getElementById("Network_Sent").innerText = Network_Sent;
    document.getElementById("Network_Received").innerText = Network_Received;
    document.getElementById("Network_Packets_Sent").innerText = Network_Packets_Sent;
    document.getElementById("Network_Packets_Received").innerText = Network_Packets_Received;
    document.getElementById("Network_Errors_Sent").innerText = Network_Errors_Sent;
    document.getElementById("Network_Errors_Received").innerText = Network_Errors_Received;
    document.getElementById("Network_Dropped_Sent").innerText = Network_Dropped_Sent;
    document.getElementById("Network_Dropped_Received").innerText = Network_Dropped_Received;



});