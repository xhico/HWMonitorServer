/*
    @author: xhico
 */

async function action(value, name) {
    // Show Loading
    await loadingScreen("show");

    // Run Action
    let resp = await $.ajax({
        method: "post", url: "/bots/action", data: {value: value, name: name}, success: function (data) {
            return data;
        }
    });

    // Remove Loading
    await loadingScreen("remove");

    // Show Notification
    await showNotification("Bot - " + name, resp["message"], resp["status"])
}

async function loadFile(value, name) {
    // Show Loading
    await loadingScreen("show");

    // Get File Content
    let resp = await $.ajax({
        method: "post", url: "/bots/loadFile", data: {name: name, value: value}, success: function (data) {
            return data;
        }
    });

    // Remove Loading
    await loadingScreen("remove");

    // Show Notification
    await showNotification("Bot - " + name, resp["message"], resp["status"])

    // Check if error
    if (resp["status"] === "error") {
        return
    }

    // Check if value is savedInfo
    if (value === "SavedInfo" && resp["info"].split("\n").length > 50) {
        const blob = new Blob([resp["info"]], {type: "application/json"});
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");
        URL.revokeObjectURL(url);
        return
    }

    // Open Modal
    document.getElementById("modal" + value + "Title").innerText = name;
    let modalBodyText = document.getElementById("modal" + value + "BodyText");
    modalBodyText.value = resp["info"];
    modalBodyText.setAttribute("rows", resp["info"].split("\n").length);
    $("#bot" + value + "Modal").modal("show");

    // Scroll to the bottom if LOG
    if (value === "Log") {
        await sleep(0.2);
        modalBodyText.scrollTop = modalBodyText.scrollHeight;
    }
}

async function editConfig() {
    let modalBodyText = document.getElementById("modalConfigBodyText");
    let configEditBtn = document.getElementById("configEditBtn");
    let configSaveBtn = document.getElementById("configSaveBtn");

    if (modalBodyText.classList.contains("bg-success")) {
        modalBodyText.classList.remove("bg-success");
        modalBodyText.classList.add("bg-danger");
    } else {
        modalBodyText.classList.remove("bg-danger");
        modalBodyText.classList.add("bg-success");
    }

    // Toggle Attributes
    modalBodyText.readOnly = !modalBodyText.readOnly;
    configEditBtn.hidden = !configEditBtn.hidden;
    configSaveBtn.hidden = !configSaveBtn.hidden;
}

async function saveConfig() {
    let modalBodyText = document.getElementById("modalConfigBodyText");
    let name = document.getElementById("modalConfigTitle").innerText;
    let value = JSON.stringify(JSON.parse(modalBodyText.value), null, 4);

    // Save Config
    let resp = await $.ajax({
        method: "post", url: "/bots/saveConfig", data: {value: value, name: name}, success: function (data) {
            return data;
        }
    });

    // Hide Modal
    $("#botConfigModal").modal("hide");

    // Show Notification
    await showNotification("Bot - " + name, resp["message"], resp["status"])
}

async function createBot(JSON, name) {

    // Skip if already created
    if (document.getElementById("bot_" + name)) {
        return
    }

    // Create element
    let botElem = document.createElement("div");
    let divHeader, divInfo, divInfoRow, divBtnsRow, divBtns, pElem, w100, actionBtn;

    botElem.classList.add("col-xl-3", "col-md-6", "border-bottom", "border-end");
    botElem.id = "bot_" + name;

    divHeader = document.createElement("div");
    divHeader.classList.add("text-center", "my-2");
    divHeader.innerHTML = "<b>" + name + "</b>"
    botElem.appendChild(divHeader);

    divInfo = document.createElement("div");
    divInfo.classList.add("text-center", "my-2");
    botElem.appendChild(divInfo);

    divInfoRow = document.createElement("div");
    divInfoRow.classList.add("row", "px-4");
    divInfo.appendChild(divInfoRow);

    pElem = document.createElement("p");
    pElem.classList.add("col");
    pElem.innerHTML = "Running: <b><span id=\"" + name + "_running\">-</span></b>"
    divInfoRow.appendChild(pElem);

    pElem = document.createElement("p");
    pElem.classList.add("col");
    pElem.innerHTML = "PID: <b><span id=\"" + name + "_pid\">-</span></b>"
    divInfoRow.appendChild(pElem);

    w100 = document.createElement("div");
    w100.classList.add("w-100");
    divInfoRow.appendChild(w100);

    pElem = document.createElement("p");
    pElem.classList.add("col");
    pElem.innerHTML = "CPU: <b><span id=\"" + name + "_cpu\">-</span></b>"
    divInfoRow.appendChild(pElem);

    pElem = document.createElement("p");
    pElem.classList.add("col");
    pElem.innerHTML = "Memory: <b><span id=\"" + name + "_memory\">-</span></b>"
    divInfoRow.appendChild(pElem);

    w100 = document.createElement("div");
    w100.classList.add("w-100");
    divInfoRow.appendChild(w100);

    pElem = document.createElement("p");
    pElem.classList.add("col");
    pElem.innerHTML = "Create Time: <b><span id=\"" + name + "_create_time\">-</span></b>"
    divInfoRow.appendChild(pElem);

    w100 = document.createElement("div");
    w100.classList.add("w-100");
    divInfoRow.appendChild(w100);

    pElem = document.createElement("p");
    pElem.classList.add("col");
    pElem.innerHTML = "Running Time: <b><span id=\"" + name + "_running_time\">-</span></b>"
    divInfoRow.appendChild(pElem);

    w100 = document.createElement("div");
    w100.classList.add("w-100");
    divInfoRow.appendChild(w100);

    pElem = document.createElement("p");
    pElem.classList.add("col");
    pElem.innerHTML = "Last Run: <b><span id=\"" + name + "_last_run\">-</span></b>"
    divInfoRow.appendChild(pElem);

    divBtns = document.createElement("div");
    divBtns.classList.add("text-center", "my-2");
    botElem.appendChild(divBtns);

    divBtnsRow = document.createElement("div");
    divBtnsRow.classList.add("row", "justify-content-center", "px-4");
    divBtns.appendChild(divBtnsRow);

    actionBtn = document.createElement("button");
    actionBtn.classList.add("col-3", "btn", "btn-success", "m-1");
    actionBtn.id = name + "_start";
    actionBtn.innerText = "Start";
    actionBtn.onclick = function () {
        action("start", name)
    }
    divBtnsRow.appendChild(actionBtn);

    actionBtn = document.createElement("button");
    actionBtn.classList.add("col-3", "btn", "btn-danger", "m-1");
    actionBtn.id = name + "_stop";
    actionBtn.innerText = "Stop";
    actionBtn.onclick = function () {
        action("stop", name)
    }
    divBtnsRow.appendChild(actionBtn);

    actionBtn = document.createElement("button");
    actionBtn.classList.add("col-3", "btn", "btn-secondary", "m-1");
    actionBtn.innerText = "Log";
    if (JSON[name]["has_error"]) {
        actionBtn.classList.add("position-relative");
        let span = document.createElement("span");
        span.classList.add("position-absolute", "top-0", "start-100", "translate-middle", "p-2", "bg-danger", "border", "border-light", "rounded-circle");
        let innerSpan = document.createElement("span");
        innerSpan.classList.add("visually-hidden");
        innerSpan.textContent = "New alerts";
        span.appendChild(innerSpan);
        actionBtn.appendChild(span);
    }
    actionBtn.onclick = function () {
        loadFile("Log", name);
    }
    divBtnsRow.appendChild(actionBtn);


    w100 = document.createElement("div");
    w100.classList.add("w-100");
    divBtnsRow.appendChild(w100);

    actionBtn = document.createElement("button");
    actionBtn.classList.add("col-3", "btn", "btn-warning", "m-1");
    actionBtn.innerText = "Config";
    actionBtn.onclick = function () {
        loadFile("Config", name);
    }
    JSON[name]["has_config"] && divBtnsRow.appendChild(actionBtn);

    actionBtn = document.createElement("button");
    actionBtn.classList.add("col-3", "btn", "btn-secondary", "m-1");
    actionBtn.innerText = "Info";
    actionBtn.onclick = function () {
        loadFile("SavedInfo", name);
    }
    JSON[name]["has_saved_info"] && divBtnsRow.appendChild(actionBtn);

    // Append to contentDiv
    document.getElementById("content").appendChild(botElem);
}

async function setBot(JSON, name) {
    let running = JSON[name]["Running"];
    let last_run = JSON[name]["last_run"];
    document.getElementById(name + "_running").innerText = running;
    let [pid, cpu, memory, create_time, running_time] = Array(5).fill("-");

    if (running === "True") {
        pid = JSON[name]["info"]["pid"];
        cpu = JSON[name]["info"]["cpu"];
        memory = JSON[name]["info"]["memory"];
        create_time = JSON[name]["info"]["create_time"];
        running_time = JSON[name]["info"]["running_time"];
    }

    document.getElementById(name + "_pid").innerText = pid;
    document.getElementById(name + "_cpu").innerText = cpu;
    document.getElementById(name + "_memory").innerText = memory;
    document.getElementById(name + "_create_time").innerText = create_time;
    document.getElementById(name + "_running_time").innerText = running_time;
    document.getElementById(name + "_last_run").innerText = last_run;
    document.getElementById(name + "_start").disabled = ((running === "True"));
    document.getElementById(name + "_stop").disabled = ((running === "False"));
}

async function updateSections() {
    // Get Bots Info JSON
    console.log("Get Bots Info JSON");
    let JSON = await $.ajax({
        method: "get", url: "/bots/info", success: function (data) {
            return data;
        }
    });

    // Remove hasInfo key
    let botNames = Object.keys(JSON).filter(function (e) {
        return e !== "hasInfo"
    }).sort(function (a, b) {
        return a.toLowerCase().localeCompare(b.toLowerCase());
    });

    // Iterate over every Bot
    for (let botName of botNames) {
        if (JSON[botName]["hasInfo"] === "Yes") {
            await createBot(JSON, botName);
            await setBot(JSON, botName);
        } else {
            await showNotification("Bot - " + botName, JSON[botName]["message"], "error");
        }
    }

    // Remove Loading
    await loadingScreen("remove");

    // Wait x secs -> Run again
    await sleep(config_updateTime);
    if (config_updateBots === true) {
        await updateSections();
    }
}

document.getElementById("botConfigModal").addEventListener("hidden.bs.modal", event => {
    let modalBodyText = document.getElementById("modalConfigBodyText");
    let configEditBtn = document.getElementById("configEditBtn");
    let configSaveBtn = document.getElementById("configSaveBtn");

    // Toggle Attributes
    modalBodyText.readOnly = true;
    configEditBtn.hidden = false;
    configSaveBtn.hidden = true;
    modalBodyText.classList.remove("bg-danger");
    modalBodyText.classList.add("bg-success");
});

window.addEventListener('DOMContentLoaded', async function main() {
    document.getElementById("navbar_bots").classList.add("active");
    await updateSections();
});