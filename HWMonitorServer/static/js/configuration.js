/*
    @author: xhico
 */

let configurationArea, configJSON;
let actionBtns = ["configurationArea", "toggleEditConfigurationAreaBtn", "saveConfigJSONBtn",
    "manageBot", "addBotBtn", "removeBotBtn",
    "eyeEnabledBtn", "eyeDisabledBtn",
    "historyEnabledBtn", "historyDisabledBtn"];

async function toggleEditConfigurationArea() {
    let flag = configurationArea.disabled;
    await toggleBtns(!flag);
    configurationArea.disabled = !flag;
    document.getElementById("toggleEditConfigurationAreaBtn").disabled = !flag;
    document.getElementById("saveConfigJSONBtn").disabled = !flag;
}

async function toggleBtns(flag) {
    actionBtns.forEach(id => {
        document.getElementById(id).disabled = flag === false;
    });
}

async function saveConfigJSON() {
    await toggleBtns(false);

    // Convert from Object to String
    configJSON = configurationArea.value;

    // Check if JSON is valid
    try {
        JSON.parse(configJSON);
    } catch (e) {
        await showNotification("Failed to parse JSON", "Check JSON Again", "error");
        return
    }

    // Save Crontab Info
    let resp = await $.ajax({
        method: "post", url: "/configuration/save", data: {"configContent": configJSON}, success: function (data) {
            return data;
        }
    });

    // Restart if success
    if (resp["status"] === "success") {
        await showNotification("Saving Configuration", "Restarting Service", resp["status"]);
        await power("restart");
    }
}

async function manageBot(action) {
    await toggleBtns(false);

    // Get Bot Text
    let botNameElem = document.getElementById("manageBot");
    botNameElem.disabled = true;
    let botNameElemText = botNameElem.value;

    // Convert from String to Object
    configJSON = typeof configJSON === "string" ? JSON.parse(configJSON) : configJSON;

    // Add/Remove botName to configJSON
    if (action === "add") {
        configJSON.Bots.push(botNameElemText);
    } else {
        const index = configJSON.Bots.indexOf(botNameElemText);
        if (index !== -1) {
            configJSON.Bots.splice(index, 1);
        } else {
            await showNotification("Missing value", "Failed to find value inside JSON", "warning");
            await toggleBtns(true);
            return
        }
    }

    // Add to configurationArea
    configJSON = JSON.stringify(configJSON, null, 4);
    configurationArea.value = configJSON;

    // Set number of rows
    configurationArea.setAttribute("rows", configurationArea.value.split("\n").length);

    // Save configJSON
    await saveConfigJSON();
}

async function navToggle(key, btn) {
    // Convert from Object to String
    configJSON = configurationArea.value;
    configJSON = JSON.parse(configJSON);

    // Check which radio button was clicked
    let btnId = btn.id.trim();
    if (btnId.includes("Enabled")) {
        configJSON[key] = true;
    } else if (btnId.includes("Disabled")) {
        configJSON[key] = false;
    }

    // Set configurationArea value
    configJSON = JSON.stringify(configJSON, null, 4);
    configurationArea.value = configJSON;

    // Set number of rows
    configurationArea.setAttribute("rows", configurationArea.value.split("\n").length);

    // Save configJSON
    await saveConfigJSON();
}

window.addEventListener('DOMContentLoaded', async function main() {
    document.getElementById("navbar_configuration").classList.add("active");
    console.log("Get configuration info");

    // Get configurationArea TextArea
    configurationArea = document.getElementById("configurationArea");

    // Get configJSON
    configJSON = await getConfigContent(configurationArea);
    configJSON = JSON.parse(configJSON);

    // Set History Feature
    let historyEnabledBtn = document.getElementById("historyEnabledBtn");
    let historyDisabledBtn = document.getElementById("historyDisabledBtn");
    configJSON.History === true ? historyEnabledBtn.click() : historyDisabledBtn.click();
    historyEnabledBtn.addEventListener("change", function () {
        navToggle("History", this);
    });
    historyDisabledBtn.addEventListener("change", function () {
        navToggle("History", this);
    });

    // Set EYE Feature
    let eyeEnabledBtn = document.getElementById("eyeEnabledBtn");
    let eyeDisabledBtn = document.getElementById("eyeDisabledBtn");
    configJSON.EYE === true ? eyeEnabledBtn.click() : eyeDisabledBtn.click();
    eyeEnabledBtn.addEventListener("change", function () {
        navToggle("EYE", this);
    });
    eyeDisabledBtn.addEventListener("change", function () {
        navToggle("EYE", this);
    });

    // Set configurationArea value
    configJSON = JSON.stringify(configJSON, null, 4);
    configurationArea.value = configJSON;

    // Set number of rows
    configurationArea.setAttribute("rows", configurationArea.value.split("\n").length);

    // Remove Loading
    await loadingScreen("remove");
});