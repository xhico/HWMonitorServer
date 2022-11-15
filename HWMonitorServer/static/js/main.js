/*
    @author: xhico
 */

let config_showBots, config_showHistory, config_showEYE, config_updateStats, config_updateBots, config_updateTOP, config_updateTime;
let hostname;

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

async function power(option, btn) {
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

function getDate() {
    let today = new Date();
    let day = checkZero(today.getDate() + "");
    let month = checkZero((today.getMonth() + 1) + "");
    let year = checkZero(today.getFullYear() + "");
    let hour = checkZero(today.getHours() + "");
    let minutes = checkZero(today.getMinutes() + "");
    let seconds = checkZero(today.getSeconds() + "");
    document.getElementById("navDateNow").innerText = year + "/" + month + "/" + day + " " + hour + ":" + minutes + ":" + seconds;
}

function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    let expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

async function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
            return c.substring(name.length, c.length);
        }
    }
    return null;
}

async function saveConfig() {
    config_showBots = document.getElementById("config_showBots").checked;
    config_showHistory = document.getElementById("config_showHistory").checked;
    config_showEYE = document.getElementById("config_showEYE").checked;
    await setCookie("config_showBots", config_showBots, 360);
    await setCookie("config_showHistory", config_showHistory, 360);
    await setCookie("config_showEYE", config_showEYE, 360);

    config_updateStats = document.getElementById("config_updateStats").checked;
    config_updateBots = document.getElementById("config_updateBots").checked;
    config_updateTOP = document.getElementById("config_updateTOP").checked;
    config_updateTime = document.getElementById("config_updateTime").value;
    await setCookie("config_updateStats", config_updateStats, 360);
    await setCookie("config_updateBots", config_updateBots, 360);
    await setCookie("config_updateTOP", config_updateTOP, 360);
    await setCookie("config_updateTime", config_updateTime, 360);
}

async function loadConfig() {
    config_updateStats = await getCookie("config_updateStats");
    config_updateStats = ((config_updateStats === null) ? true : (config_updateStats === "true"))
    document.getElementById("config_updateStats").checked = config_updateStats;

    config_updateBots = await getCookie("config_updateBots");
    config_updateBots = ((config_updateBots === null) ? true : (config_updateBots === "true"))
    document.getElementById("config_updateBots").checked = config_updateBots;

    config_updateTOP = await getCookie("config_updateTOP");
    config_updateTOP = ((config_updateTOP === null) ? true : (config_updateTOP === "true"))
    document.getElementById("config_updateTOP").checked = config_updateTOP;

    config_updateTime = await getCookie("config_updateTime");
    config_updateTime = ((config_updateTime === null) ? 2 : config_updateTime)
    document.getElementById("config_updateTime").value = config_updateTime;

    config_showBots = await getCookie("config_showBots");
    config_showBots = ((config_showBots === null) ? true : (config_showBots === "true"))
    document.getElementById("config_showBots").checked = config_showBots;

    config_showHistory = await getCookie("config_showHistory");
    config_showHistory = ((config_showHistory === null) ? true : (config_showHistory === "true"))
    document.getElementById("config_showHistory").checked = config_showHistory;

    config_showEYE = await getCookie("config_showEYE");
    config_showEYE = ((config_showEYE === null) ? true : (config_showEYE === "true"))
    document.getElementById("config_showEYE").checked = config_showEYE;
}

async function removeLoading() {
    document.getElementById("overlay").hidden = true;
}

async function showNotification(title, message, type) {
    document.getElementById("notificationTitle").innerText = title;
    document.getElementById("notificationMsg").innerText = message;
    document.getElementById("notificationPopup").classList.add((type === "success" ? "bg-success" : "bg-danger"))
    $('#notificationPopup').toast('show');
}

async function updateNav() {
    // Get Date
    getDate();

    hostname = await getHostname();
    document.title = hostname;
    document.getElementById("Hostname").innerText = hostname;

    // Show navbar items
    document.getElementById("navbar_bots").hidden = !config_showBots;
    document.getElementById("navbar_history").hidden = !config_showHistory;
    document.getElementById("navbar_eye").hidden = !config_showEYE;

    // Wait x secs -> Run again
    await sleep(config_updateTime);
    await updateNav();
}

window.addEventListener('DOMContentLoaded', async function main() {
    // Run
    await loadConfig();
    await updateNav();
});