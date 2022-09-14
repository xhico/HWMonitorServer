/*
    @author: xhico
 */

function checkRPIs() {
    // Set alive Raspberry Pi's
    let rpiDict = {"RPI4": "192.168.1.14", "RPI3BA": "192.168.1.15", "RPI3BB": "192.168.1.16", "RPIZW": "192.168.1.17"}
    for (let rpiName in rpiDict) {
        let rpiIp = rpiDict[rpiName];
        $.ajax({
            method: "get", timeout: 2000, url: "http://" + rpiIp + ":7777/status", success: function (data) {
                if (data["Status"] === "alive") {
                    document.getElementById("navbar_" + rpiName).classList.add("active");
                    document.getElementById("navbar_" + rpiName).href = "http://" + rpiIp + ":7777";
                }
            }, error: function () {
                document.getElementById("navbar_" + rpiName).classList.remove("active");
                document.getElementById("navbar_" + rpiName).href = "#";
            }
        });
    }
}

function checkZero(data) {
    if (data.length === 1) {
        data = "0" + data;
    }
    return data;
}

function getDate() {
    let today = new Date();
    let day = checkZero(today.getDate() + "");
    let month = checkZero((today.getMonth() + 1) + "");
    let year = checkZero(today.getFullYear() + "");
    let hour = checkZero(today.getHours() + "");
    let minutes = checkZero(today.getMinutes() + "");
    let seconds = checkZero(today.getSeconds() + "");
    document.getElementById("datenow").innerText = year + "/" + month + "/" + day + " " + hour + ":" + minutes + ":" + seconds;
}

window.addEventListener('DOMContentLoaded', async function main() {
    // Check for alive RPIs
    checkRPIs();

    // Get Date
    getDate();

    // Get Hostname
    console.log("Get Hostname");
    let JSON = await $.ajax({
        method: "get", url: "/hostname", success: function (data) {
            return data;
        }
    });

    // Set Hostname
    let hostname = JSON["Hostname"];
    document.title = hostname;
    document.getElementById("Hostname").innerText = hostname;

    // Show Bots navbar
    if (hostname !== "RPI4") {
        document.getElementById("navbar_bots").hidden = true;
        document.getElementById("navbar_ambient").hidden = true;
    }

    // // Wait 2 secs -> Run again
    // await new Promise(r => setTimeout(r, 2000));
    // await main();
});