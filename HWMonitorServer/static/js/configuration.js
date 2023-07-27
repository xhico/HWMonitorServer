/*
    @author: xhico
 */

let configurationArea;
let actionBtns = ["configurationArea", "toggleEditConfigurationAreaBtn", "saveConfigJSONBtn",
    "manageBot", "addBotBtn", "removeBotBtn",
    "updateTime", "updateTimeBtn"];

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
    // Show Loading
    await loadingScreen("show");
    await toggleBtns(false);

    // Check if JSON is valid
    configJSON = configurationArea.value;
    try {
        configJSON = JSON.parse(configJSON);
    } catch (e) {
        await showNotification("Failed to parse JSON", "Check JSON Again", "error");
        return
    }

    // Sort the Bots array in ascending order -> ignore lower/upper cases
    configJSON.Bots.sort((a, b) => a.localeCompare(b, undefined, {sensitivity: 'base'}));

    // Save Crontab Info
    configJSON = JSON.stringify(configJSON, null, 4);
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

    // Remove Loading
    await loadingScreen("remove");
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
        if (configJSON.Bots.includes(botNameElemText)) {
            await showNotification("Duplicated Entry", "'" + botNameElemText + "' already exists", "warning");
            await toggleBtns(true);
            await toggleEditConfigurationArea();
            return
        }
        configJSON.Bots.push(botNameElemText);
    } else {
        const index = configJSON.Bots.indexOf(botNameElemText);
        if (index !== -1) {
            configJSON.Bots.splice(index, 1);
        } else {
            await showNotification("Missing value", "Failed to find '" + botNameElemText + "'", "warning");
            await toggleBtns(true);
            await toggleEditConfigurationArea();
            return
        }
    }

    // Sort the Bots array in ascending order -> ignore lower/upper cases
    configJSON.Bots.sort((a, b) => a.localeCompare(b, undefined, {sensitivity: 'base'}));

    // Add to configurationArea
    configJSON = JSON.stringify(configJSON, null, 4);
    configurationArea.value = configJSON;

    // Set number of rows
    configurationArea.setAttribute("rows", configurationArea.value.split("\n").length);

    // Save configJSON
    await saveConfigJSON();
}

async function downloadConfig() {
    // Create download btn -> click
    let configJSON = await getConfigContent(configurationArea);
    configJSON = JSON.stringify(configJSON, null, 4);
    let downloadElem = document.createElement("a");
    let crontabFile = "config_" + hostname + ".txt";
    downloadElem.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(configJSON));
    downloadElem.setAttribute("download", crontabFile);
    downloadElem.style.display = "none";
    document.body.appendChild(downloadElem);
    downloadElem.click();
    document.body.removeChild(downloadElem);
}

async function navToggle(key, btn) {
    // Convert from Object to String
    let configJSON = configurationArea.value;
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

async function setUpdateTime() {
    await toggleBtns(false);

    // Get Bot Text
    let updateTimeElem = document.getElementById("updateTime");
    updateTimeElem.disabled = true;
    let updateTimeElemText = updateTimeElem.value;

    // Check if value is not empty
    if (updateTimeElemText === "") {
        await showNotification("Invalid Value", "Update Time can't be empty", "warning");
        await toggleBtns(true);
        await toggleEditConfigurationArea();
        return
    }

    // Convert from String to Object
    configJSON = typeof configJSON === "string" ? JSON.parse(configJSON) : configJSON;

    // Add/Remove botName to configJSON
    configJSON.UpdateTime = parseInt(updateTimeElemText);

    // Add to configurationArea
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
    let configJSON = await getConfigContent(configurationArea);

    // Set NAV ToggleButtons
    for (let entry of ["history", "eye", "pivpn", "updateStats", "updateBots", "updateTop"]) {
        let entryEnabledBtn = document.getElementById(entry + "EnabledBtn");
        let entryDisabledBtn = document.getElementById(entry + "DisabledBtn");
        actionBtns.push(entry + "EnabledBtn");
        actionBtns.push(entry + "DisabledBtn");
        configJSON[capitalize(entry)] === true ? entryEnabledBtn.click() : entryDisabledBtn.click();
        entryEnabledBtn.addEventListener("change", function () {
            navToggle(capitalize(entry), this);
        });
        entryDisabledBtn.addEventListener("change", function () {
            navToggle(capitalize(entry), this);
        });
    }

    // Set configurationArea && updateTime value
    document.getElementById("updateTime").placeholder += " (" + configJSON.UpdateTime + " secs)"
    configJSON = JSON.stringify(configJSON, null, 4);
    configurationArea.value = configJSON;

    // Set number of rows
    configurationArea.setAttribute("rows", configurationArea.value.split("\n").length);

    // Remove Loading
    await loadingScreen("remove");
});