/*
    @author: xhico
 */

let hostname, configJSON;
let config_updateStats, config_updateBots, config_updateTop, config_updateTime;

async function sleep(secs) {
    await new Promise(resolve => setTimeout(resolve, secs * 1000));
}

async function getHostname() {
    // Get Hostname
    if (!(hostname)) {
        let JSON = await $.ajax({
            method: "get", url: "/main/hostname", success: function (data) {
                return data;
            }
        });

        // Set Hostname
        hostname = JSON["Hostname"];
    }

    return hostname;
}

function convert_size(size_bytes) {
    let decimals = 2
    if (!+size_bytes) return '0 Bytes'
    let k = 1024
    let dm = decimals < 0 ? 0 : decimals
    let sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    let i = Math.floor(Math.log(size_bytes) / Math.log(k))
    let value = `${parseFloat((size_bytes / Math.pow(k, i)).toFixed(dm))}`
    let unit = `${sizes[i]}`;
    return value + " " + unit
}

function capitalize(string) {
    // Capitalize the first letter and concatenate with the rest of the string
    return string.charAt(0).toUpperCase() + string.slice(1);
}

async function power(option) {
    let btn = document.getElementById("power" + await capitalize(option) + "Btn")

    // Disable Btn
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span><span class="visually-hidden">Loading...</span>'

    // Do Option
    await $.ajax({method: "post", url: "/main/power", data: {option: option}});

    // Wait for alive
    do {
        try {
            let statusJSON = await $.ajax({method: "get", url: "/main/status"});
            if (statusJSON["Status"] === "alive") {
                location.reload();
            }
        } catch (e) {
            await sleep(2);
        }
    } while (1)
}

function checkZero(data) {
    if (data.length === 1) {
        data = "0" + data;
    }
    return data;
}

async function getConfigContent() {
    configJSON = JSON.parse(await $.ajax({
        method: "get", url: "/configuration/info", success: function (configContent) {
            return configContent;
        }
    }));

    // Set update configs
    config_updateStats = configJSON.UpdateStats;
    config_updateBots = configJSON.UpdateBots;
    config_updateTop = configJSON.UpdateTop;
    config_updateTime = configJSON.UpdateTime;

    // Set Hostname
    hostname = await getHostname();
    document.title += " | " + hostname;
    document.getElementById("Hostname").innerText = hostname;

    // Show navbar items
    document.getElementById("navbar_bots").hidden = !(configJSON.Bots.length !== 0);
    document.getElementById("navbar_history").hidden = !configJSON.History;
    document.getElementById("navbar_eye").hidden = !configJSON.Eye;

    return configJSON;
}

async function loadingScreen(action) {
    if (action === "show") {
        action = false;
    } else if (action === "remove") {
        action = true;
    } else {
        console.log("Wrong action - " + action);
        return
    }

    document.getElementById("overlay").hidden = action;
}

async function showNotification(title, message, type) {
    document.getElementById("notificationTitle").innerText = title;
    document.getElementById("notificationMsg").innerText = message;
    let notificationPopupElem = document.getElementById("notificationPopup");
    notificationPopupElem.className = "toast text-white";
    if (type === "error") type = "danger";
    notificationPopupElem.classList.add("bg-" + type);
    $('#notificationPopup').toast('show');
}

async function updateDate() {
    // Get Date
    let today = new Date();
    let day = checkZero(today.getDate() + "");
    let month = checkZero((today.getMonth() + 1) + "");
    let year = checkZero(today.getFullYear() + "");
    let hour = checkZero(today.getHours() + "");
    let minutes = checkZero(today.getMinutes() + "");
    let seconds = checkZero(today.getSeconds() + "");
    document.getElementById("navDateNow").innerText = year + "/" + month + "/" + day + " " + hour + ":" + minutes + ":" + seconds;

    // Wait x secs -> Run again
    await sleep(config_updateTime);
    await updateDate();
}

window.addEventListener('DOMContentLoaded', async function main() {
    // Run
    await getConfigContent();
    await updateDate();
});