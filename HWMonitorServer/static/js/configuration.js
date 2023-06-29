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
    document.getElementById("toggleEditConfigurationAreaBtn").disabled = true;
    document.getElementById("saveConfigJSONBtn").disabled = true;
    document.getElementById("addBotBtn").disabled = true;
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
        await showNotification("Saving Configuration", "Restarting Service", resp["status"]);
        await power("restart");
    }
}

async function manageBot(action) {
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
            botNameElem.disabled = false;
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