/*
    @author: xhico
 */

let cronjobsJSON;

async function getCronjobs() {
    // Show Loading
    await loadingScreen("show");

    // Get Crontab Info JSON
    cronjobsJSON = await $.ajax({
        method: "get", url: "/crontab/info", success: function (data) {
            return data;
        }
    });

    // Remove Loading
    await loadingScreen("remove");
}

async function setOverview() {
    // Initialize counters
    let totalEntries = 0;
    let enabledCount = 0;
    let disabledCount = 0;

    // Loop through the response array
    for (const entry of cronjobsJSON) {
        // Increment total entries count
        totalEntries++;

        // Check the status and increment the corresponding counter
        if (entry.status === "enabled") {
            enabledCount++;
        } else if (entry.status === "disabled") {
            disabledCount++;
        }
    }

    // Add to page
    document.getElementById("overviewEnabled").innerText = enabledCount.toString();
    document.getElementById("overviewDisabled").innerText = disabledCount.toString();
    document.getElementById("overviewTotal").innerText = totalEntries.toString();
}

function createInputGroup(idx, job) {
    // Create the main div element with class "input-group" and "mb-1"
    const div = document.createElement("div");
    div.classList.add("input-group", "mb-1");

    const upBtn = document.createElement("button");
    upBtn.type = "button";
    upBtn.id = "up-job-" + idx;
    upBtn.classList.add("btn", "btn-arrow", "btn-outline-secondary");
    upBtn.innerHTML = "&#8679;"
    upBtn.disabled = job["status"] === "disabled";
    upBtn.onclick = async function () {
        let div = $(upBtn).closest(".input-group");
        div.insertBefore(div.prev());
        saveCronjobs();
    }

    const downBtn = document.createElement("button");
    downBtn.type = "button";
    downBtn.id = "down-job-" + idx;
    downBtn.classList.add("btn", "btn-arrow", "btn-outline-secondary");
    downBtn.innerHTML = "&#8681;"
    downBtn.disabled = job["status"] === "disabled";
    downBtn.onclick = function () {
        let div = $(downBtn).closest(".input-group");
        div.insertAfter(div.next());
        saveCronjobs();
    }

    div.appendChild(upBtn);
    div.appendChild(downBtn);

    // Create the input element with the "disabled" attribute
    const input = document.createElement("input");
    input.type = "text";
    input.value = job["job"];
    input.id = "input-job-" + idx;
    input.classList.add("form-control");
    input.setAttribute("aria-label", "Text input with dropdown button");
    input.disabled = true;

    // Create the button element
    const button = document.createElement("button");
    button.type = "button";
    button.id = "button-job-" + idx;
    button.classList.add("btn", "dropdown-toggle");
    button.classList.add(job["status"] === "enabled" ? "btn-success" : "btn-danger");
    button.setAttribute("data-bs-toggle", "dropdown");
    button.setAttribute("aria-expanded", "false");
    button.innerText = capitalize(job["status"]);

    // Create the dropdown menu (ul element)
    const dropdownMenu = document.createElement("ul");
    dropdownMenu.classList.add("dropdown-menu", "dropdown-menu-end");

    // Create the dropdown menu items (li elements)
    const enableItem = document.createElement("li");
    const enableButton = document.createElement("button");
    enableButton.classList.add("dropdown-item");
    enableButton.innerText = "Enable";
    enableButton.onclick = function () {
        jobAction(job, "enabled");
    };
    enableButton.disabled = job["status"] === "enabled";
    enableItem.appendChild(enableButton);

    const disableItem = document.createElement("li");
    const disableButton = document.createElement("button");
    disableButton.classList.add("dropdown-item");
    disableButton.innerText = "Disable";
    disableButton.onclick = function () {
        jobAction(job, "disabled");
    };
    disableButton.disabled = job["status"] === "disabled";
    disableItem.appendChild(disableButton);

    const dividerItem = document.createElement("li");
    const divider = document.createElement("hr");
    divider.classList.add("dropdown-divider");
    dividerItem.appendChild(divider);

    const editItem = document.createElement("li");
    const editButton = document.createElement("button");
    editButton.classList.add("dropdown-item");
    editButton.innerText = "Edit";
    editButton.onclick = function (event) {
        let inputGroupElem = $(event.target.closest(".input-group"));

        // Hide Dropdown Elems
        inputGroupElem.find(".dropdown-menu").hide();
        inputGroupElem.find(".dropdown-toggle").hide();

        // Replace the input element's disabled attribute
        inputGroupElem.find(".form-control").prop('disabled', false);

        // Create the new single button to replace the dropdown
        inputGroupElem.append($('<button>').addClass('btn btn-secondary').text('Save').on('click', saveCronjobs));
    }
    editItem.appendChild(editButton);

    // Add Remove Button
    const removeItem = document.createElement("li");
    const removeButton = document.createElement("button");
    removeButton.classList.add("dropdown-item");
    removeButton.innerText = "Remove";
    removeButton.onclick = function (event) {
        // Display a confirmation dialog
        if (confirm("Are you sure you want to remove this item?")) {
            // If confirmed, remove the item
            $(event.target.closest(".input-group")).remove();
            saveCronjobs();
        }
    }
    removeItem.appendChild(removeButton);

    // Append the input and button elements to the main div
    div.appendChild(input);
    div.appendChild(button);

    // Append the dropdown menu items to the dropdown menu
    dropdownMenu.appendChild(enableItem);
    dropdownMenu.appendChild(disableItem);
    dropdownMenu.appendChild(dividerItem);
    dropdownMenu.appendChild(editItem);
    dropdownMenu.appendChild(removeItem);

    // Append the dropdown menu to the main div
    div.appendChild(dropdownMenu);

    // Append the main div to cronjobs div
    document.getElementById("cronjobs").appendChild(div);
}

async function setCronjobsDiv() {
    // Set Overview
    await setOverview();

    // Set Cronjobs Group
    document.getElementById("cronjobs").innerHTML = "";
    for (let idx = 0; idx < cronjobsJSON.length; idx++) {
        let job = cronjobsJSON[idx];
        await createInputGroup(idx, job);
    }
}

async function jobAction(job, action) {
    // Set Cronjobs Group
    for (let idx = 0; idx < cronjobsJSON.length; idx++) {
        let currJob = cronjobsJSON[idx];
        if (currJob["job"] === job["job"]) {
            currJob["status"] = action;
        }
    }

    // Set Cronjobs Div
    await setCronjobsDiv();

    // Save CronjobsJSON
    await saveCronjobs();
}

async function regenerateCronjobsJSON() {
    // Generate cronjobsJSON
    let cronjobsDiv = document.getElementById("cronjobs");
    cronjobsJSON = [];
    for (let job of cronjobsDiv.children) {
        let jobJob = job.querySelector('[id^="input-job-"]').value;
        let jobStatus = job.querySelector('[id^="button-job-"]').innerText;
        cronjobsJSON.push({"job": jobJob, "status": jobStatus.toLowerCase()});
    }
}

async function saveCronjobs() {
    // Show Loading
    await loadingScreen("show");

    // Generate cronjobsJSON
    await regenerateCronjobsJSON();

    // Save Crontab Info JSON
    let resp = await $.ajax({
        method: "post", url: "/crontab/save", data: {cronjobs: JSON.stringify(cronjobsJSON)}, success: function (data) {
            return data;
        }
    });

    // Show notification
    await showNotification("Save Crontab", resp["message"], resp["status"]);

    // Add Cronjobs
    await getCronjobs();

    // Set Cronjobs Div
    await setCronjobsDiv();

    // Remove Loading
    await loadingScreen("remove");
}

async function addJob() {
    let idx = cronjobsJSON.length;
    let jobJob = document.getElementById("addCronjobInput").value;
    await createInputGroup(idx, {"job": jobJob, "status": "enabled"});

    // Save
    await saveCronjobs();

    // Close Add Modal
    $("#addModal").modal("hide");
}

async function downloadCronjobs() {
    // Generate cronjobsJSON
    await regenerateCronjobsJSON();

    // Create crontab text string
    let cronjobsTxt = "";
    for (let job of cronjobsJSON) {
        let jobJob = job["job"];
        let jobStatus = job["status"];
        cronjobsTxt += jobStatus === "enabled" ? jobJob : "#" + jobJob;
        cronjobsTxt += "\n";
    }

    // Create download btn -> click
    let downloadElem = document.createElement("a");
    let crontabFile = "crontab_" + hostname + ".txt";
    downloadElem.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(cronjobsTxt));
    downloadElem.setAttribute("download", crontabFile);
    downloadElem.style.display = "none";
    document.body.appendChild(downloadElem);
    downloadElem.click();
    document.body.removeChild(downloadElem);
}

window.addEventListener('DOMContentLoaded', async function main() {
    document.getElementById("navbar_crontab").classList.add("active");
    console.log("Get crontab info");

    // Add Cronjobs
    await getCronjobs();

    // Set Cronjobs Div
    await setCronjobsDiv();

    // Remove Loading
    await loadingScreen("remove");
});