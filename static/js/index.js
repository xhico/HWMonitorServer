/*
    @author: xhico
 */

let config_updateStats, config_updateBots;

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

async function setCookie(cname, cvalue, exdays) {
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
    return "true";
}

async function saveConfig() {
    config_updateStats = document.getElementById("config_updateStats").checked;
    config_updateBots = document.getElementById("config_updateBots").checked;
    await setCookie("config_updateStats", config_updateStats, 360);
    await setCookie("config_updateBots", config_updateBots, 360);
}

async function loadConfig() {
    config_updateStats = (await getCookie("config_updateStats") === 'true');
    config_updateBots = (await getCookie("config_updateBots") === 'true');
    document.getElementById("config_updateStats").checked = config_updateStats;
    document.getElementById("config_updateBots").checked = config_updateBots;
}

async function updateNav() {
    // Get Date
    getDate();

    // Get Hostname
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

    // Wait 2 secs -> Run again
    await new Promise(r => setTimeout(r, 2000));
    await updateNav();
}

window.addEventListener('DOMContentLoaded', async function main() {
    await loadConfig();
    await updateNav();
});