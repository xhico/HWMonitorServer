/*
    @author: xhico
 */

let configurationArea;

async function toggleEditConfigurationArea() {
    configurationArea.disabled = !configurationArea.disabled;
}


async function saveConfigJSON() {
    // Show Loading
    await loadingScreen("show");

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
        await showNotification("Configuration saved successfully", "Restarting Device", resp["status"]);
        await power("restart");
    }

    // Remove Loading
    await loadingScreen("remove");
}

async function manageBot(action) {
    // Get Bot Text
    let botNameElem = document.querySelector("#manageBot");
    let botNameElemText = botNameElem.value;

    // Check fo valid chars
    if (botNameElemText === "" || !/^[a-zA-Z0-9_\-]+$/.test(botNameElemText)) {
        await showNotification("Failed to " + action + " bot", "Name contains invalid characters or empty", "error");
        return
    }

    // Convert from String to Object
    configJSON = typeof configJSON === "string" ? JSON.parse(configJSON) : configJSON;

    // Add/Remove botName to configJSON
    if (action === "add") {
        if (configJSON.Bots.includes(botNameElemText)) {
            await showNotification("Duplicated Entry", "'" + botNameElemText + "' already exists", "error");
            return
        }
        configJSON.Bots.push(botNameElemText);
    } else {
        const index = configJSON.Bots.indexOf(botNameElemText);
        if (index !== -1) {
            configJSON.Bots.splice(index, 1);
        } else {
            await showNotification("Missing value", "Failed to find '" + botNameElemText + "'", "error");
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
    let crontabFile = "config_" + hostname + ".json";
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

    // Get Bot Text
    let updateTimeElem = document.querySelector("#updateTime");
    let updateTimeElemText = updateTimeElem.value;

    // Check if value is not empty
    if (updateTimeElemText === "" || !/^[0-9]+$/.test(updateTimeElemText)) {
        await showNotification("Failed to set UpdateTime", "UpdateTime contains invalid characters or empty", "error");
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

async function setNumberOfBotsLogs() {
    // Get Bot Text
    let numberOfBotsLogsElem = document.querySelector("#numberOfBotsLogs");
    let numberOfBotsLogsText = numberOfBotsLogsElem.value;

    // Check fo valid chars
    if (numberOfBotsLogsText === "" || !/^[a-zA-Z0-9_\-]+$/.test(numberOfBotsLogsText)) {
        await showNotification("Failed to set NumberOfBotsLogs", "NumberOfBotsLogs contains invalid characters or empty", "error");
        return
    }

    // Convert from String to Object
    configJSON = typeof configJSON === "string" ? JSON.parse(configJSON) : configJSON;

    // Add/Remove botName to configJSON
    configJSON.NumberOfBotsLogs = parseInt(numberOfBotsLogsText);

    // Add to configurationArea
    configJSON = JSON.stringify(configJSON, null, 4);
    configurationArea.value = configJSON;

    // Set number of rows
    configurationArea.setAttribute("rows", configurationArea.value.split("\n").length);

    // Save configJSON
    await saveConfigJSON();
}

async function setLocation() {
    // Get Bot Text
    let locationElem = document.querySelector("#location");
    let locationText = locationElem.value;
    console.log(locationText);

    // Check fo valid chars
    if (locationText === "" || !/^[a-zA-Z0-9_\- ]+$/.test(locationText)) {
        await showNotification("Failed to set Location", "Location contains invalid characters or empty", "error");
        return
    }

    // Convert from String to Object
    configJSON = typeof configJSON === "string" ? JSON.parse(configJSON) : configJSON;

    // Add/Remove Location to configJSON
    configJSON.Location = locationText;

    // Add to configurationArea
    configJSON = JSON.stringify(configJSON, null, 4);
    configurationArea.value = configJSON;

    // Set number of rows
    configurationArea.setAttribute("rows", configurationArea.value.split("\n").length);

    // Save configJSON
    await saveConfigJSON();
}

window.addEventListener('DOMContentLoaded', async function main() {
    document.querySelector("#navbar_configuration").classList.add("active");
    console.log("Get configuration info");

    // Get configurationArea TextArea
    configurationArea = document.querySelector("#configurationArea");

    // Get configJSON
    let configJSON = await getConfigContent(configurationArea);

    // Set Navigation/Auto-Update ToggleButtons
    for (let entry of ["eye", "pivpn", "ledircontroller", "updateStats", "updateBots", "updateTop"]) {
        let entryEnabledBtn = document.querySelector("#" + entry + "EnabledBtn");
        let entryDisabledBtn = document.querySelector("#" + entry + "DisabledBtn");
        configJSON[capitalize(entry)] === true ? entryEnabledBtn.click() : entryDisabledBtn.click();
        entryEnabledBtn.addEventListener("change", function () {
            navToggle(capitalize(entry), this);
        });
        entryDisabledBtn.addEventListener("change", function () {
            navToggle(capitalize(entry), this);
        });
    }

    // Set updateTime && numberOfBotsLogs && location && configurationArea
    document.querySelector("#updateTime").placeholder += " (" + configJSON.UpdateTime + " secs)"
    document.querySelector("#numberOfBotsLogs").placeholder += " (" + configJSON.NumberOfBotsLogs + " logs)"
    document.querySelector("#location").placeholder += " (" + configJSON.Location + ")"

    // Change configJSON to String
    configJSON = JSON.stringify(configJSON, null, 4);
    configurationArea.value = configJSON;

    // Set number of rows of configurationArea
    configurationArea.setAttribute("rows", configurationArea.value.split("\n").length);

    // Remove Loading
    await loadingScreen("remove");
});