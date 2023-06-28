/*
    @author: xhico
 */

let configurationArea;

async function loadConfigContent() {
    configurationArea.value = await $.ajax({
        method: "get", url: "/configuration/info", success: function (configContent) {
            return configContent;
        }
    });
}

async function toggleEditConfigurationArea() {
    configurationArea.disabled = !configurationArea.disabled;
}

async function saveConfigurationArea() {
    if (!configurationArea.disabled) {
        await toggleEditConfigurationArea();
    }

    // Get configContent on configurationArea.value
    let configContent = configurationArea.value;

    // Save Crontab Info
    let resp = await $.ajax({
        method: "post", url: "/configuration/save", data: {"configContent": configContent}, success: function (data) {
            return data;
        }
    });

    // Restart if success
    if (resp["status"] === "success") {
        await showNotification("Saving Configuration", "Restarting Service", resp["status"]);
        await power("restart");
    }
}

window.addEventListener('DOMContentLoaded', async function main() {
    document.getElementById("navbar_configuration").classList.add("active");
    console.log("Get configuration info");

    // Get configurationArea TextArea
    configurationArea = document.getElementById("configurationArea");

    // Load loadConfigContent
    await loadConfigContent(configurationArea);

    // Set number of rows
    let lineCount = configurationArea.value.split("\n").length;
    configurationArea.setAttribute("rows", lineCount);

    // Remove Loading
    await loadingScreen("remove");
});