/*
    @author: xhico
 */

let configurationArea, configJSON;

async function getConfigContent() {
    return await $.ajax({
        method: "get", url: "/configuration/info", success: function (configContent) {
            return configContent;
        }
    });
}

async function toggleEditConfigurationArea() {
    configurationArea.disabled = !configurationArea.disabled;
}

async function saveConfigJSON() {
    if (!configurationArea.disabled) {
        await toggleEditConfigurationArea();
    }

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
        await showNotification("Saving Configuration", "Restarting Service", "success");
        await power("restart");
    }
}

async function addBot() {
    let botNameElem = document.getElementById("addBotText");
    botNameElem.disabled = true;
    let botNameElemText = botNameElem.value;

    // Convert from String to Object
    configJSON = typeof configJSON === "string" ? JSON.parse(configJSON) : configJSON;

    // Add botName to configJSON
    configJSON.Bots.push(botNameElemText);

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
    configJSON = await getConfigContent(configurationArea);
    configJSON = JSON.parse(configJSON);
    configJSON = JSON.stringify(configJSON, null, 4);
    configurationArea.value = configJSON;

    // Set number of rows
    configurationArea.setAttribute("rows", configurationArea.value.split("\n").length);

    // Remove Loading
    await loadingScreen("remove");
});