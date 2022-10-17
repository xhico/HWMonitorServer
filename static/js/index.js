/*
    @author: xhico
 */

let config_showBots, config_showAmbient, config_showEYE, config_updateStats, config_updateBots, config_updateTime;

async function sleep(secs) {
    await new Promise(resolve => setTimeout(resolve, secs * 1000));
}

function setShowBots() {
    document.getElementById("divConfig_updateBots").hidden = !document.getElementById("config_showBots").checked;
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
    return null;
}

async function saveConfig() {
    config_showBots = document.getElementById("config_showBots").checked;
    config_showAmbient = document.getElementById("config_showAmbient").checked;
    config_showEYE = document.getElementById("config_showEYE").checked;
    await setCookie("config_showBots", config_showBots, 360);
    await setCookie("config_showAmbient", config_showAmbient, 360);
    await setCookie("config_showEYE", config_showEYE, 360);

    config_updateStats = document.getElementById("config_updateStats").checked;
    config_updateBots = document.getElementById("config_updateBots").checked;
    config_updateTime = document.getElementById("config_updateTime").value;
    await setCookie("config_updateStats", config_updateStats, 360);
    await setCookie("config_updateBots", config_updateBots, 360);
    await setCookie("config_updateTime", config_updateTime, 360);
}

async function loadConfig() {
    config_showBots = await getCookie("config_showBots");
    config_showBots = ((config_showBots === null) ? true : (config_showBots === "true"))
    document.getElementById("config_showBots").checked = config_showBots;
    config_showAmbient = await getCookie("config_showAmbient");
    config_showAmbient = ((config_showAmbient === null) ? true : (config_showAmbient === "true"))
    document.getElementById("config_showAmbient").checked = config_showAmbient;
    config_showEYE = await getCookie("config_showEYE");
    config_showEYE = ((config_showEYE === null) ? true : (config_showEYE === "true"))
    document.getElementById("config_showEYE").checked = config_showEYE;

    config_updateStats = await getCookie("config_updateStats");
    config_updateStats = ((config_updateStats === null) ? true : (config_updateStats === "true"))
    document.getElementById("config_updateStats").checked = config_updateStats;
    config_updateBots = await getCookie("config_updateBots");
    config_updateBots = ((config_updateBots === null) ? true : (config_updateBots === "true"))
    document.getElementById("config_updateBots").checked = config_updateBots;
    config_updateTime = await getCookie("config_updateTime");
    config_updateTime = ((config_updateTime === null) ? 2 : config_updateTime)
    document.getElementById("config_updateTime").value = config_updateTime;
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

    // Show navbar items
    document.getElementById("navbar_bots").hidden = !config_showBots;
    document.getElementById("navbar_ambient").hidden = !config_showAmbient;
    document.getElementById("navbar_eye").hidden = !config_showEYE;

    // Wait x secs -> Run again
    await sleep(config_updateTime);
    await updateNav();
}

window.addEventListener('DOMContentLoaded', async function main() {
    await loadConfig();
    await updateNav();
});