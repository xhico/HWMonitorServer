/*
    @author: xhico
 */

let hostname, configJSON;
let config_updateStats, config_updateBots, config_updateTop, config_updateTime;
let config_CPUTemperatureRange;

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

    // Set CPU Gauge Temperature Range
    config_CPUTemperatureRange = configJSON.CPUTemperatureRange;

    // Set Hostname
    hostname = await getHostname();
    document.title = document.title.includes("|") ? document.title : document.title + " | " + hostname
    document.getElementById("Hostname").innerText = hostname;

    // Show navbar items
    document.getElementById("navbar_bots").hidden = !(configJSON.Bots.length !== 0);
    document.getElementById("navbar_eye").hidden = !configJSON.Eye;
    document.getElementById("navbar_pivpn").hidden = !configJSON.Pivpn;
    document.getElementById("navbar_ledircontroller").hidden = !configJSON.Ledircontroller;

    // Show Room Name
    document.getElementById("navLocation").innerText = configJSON.Location;

    return configJSON;
}

async function loadingScreen(action) {
    if (action === "show") {
        action = false;
    } else if (action === "remove") {
        action = true;
    } else {
        console.log("Wrong loadingScreen action - " + action);
        return
    }

    document.getElementById("overlay").hidden = action;
}

async function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomString = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        randomString += characters.charAt(randomIndex);
    }

    return randomString;
}

async function showNotification(title, message, type) {
    const randomString = await generateRandomString(8);

    // Create the outer div element
    const notificationPopup = document.createElement("div");
    notificationPopup.id = randomString;
    notificationPopup.classList.add("toast", "text-white");
    if (type === "error") type = "danger";
    notificationPopup.classList.add("bg-" + type);
    notificationPopup.setAttribute("role", "alert");
    notificationPopup.setAttribute("aria-live", "assertive");
    notificationPopup.setAttribute("aria-atomic", "true");

    // Create the div for the toast header
    const toastHeader = document.createElement("div");
    toastHeader.classList.add("toast-header");

    // Create the strong element for the title
    const notificationTitle = document.createElement("strong");
    notificationTitle.id = "notificationTitle";
    notificationTitle.classList.add("me-auto");
    notificationTitle.innerText = title;

    // Create the button element for closing the toast
    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.classList.add("btn-close");
    closeButton.setAttribute("data-bs-dismiss", "toast");
    closeButton.setAttribute("aria-label", "Close");

    // Create the div for the toast message
    const notificationMsg = document.createElement("div");
    notificationMsg.id = "notificationMsg";
    notificationMsg.classList.add("toast-body");
    notificationMsg.innerText = message;

    // Append elements to construct the desired structure
    toastHeader.appendChild(notificationTitle);
    toastHeader.appendChild(closeButton);
    notificationPopup.appendChild(toastHeader);
    notificationPopup.appendChild(notificationMsg);

    // Append the notificationPopup to the document body (or any other desired parent element)
    document.getElementById("notificationContainer").appendChild(notificationPopup);

    // Create eventListener
    document.getElementById(randomString).addEventListener('hide.bs.toast', function () {
        document.getElementById(randomString).remove();
    });

    // Show Notification
    $('#' + randomString).toast('show');
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
