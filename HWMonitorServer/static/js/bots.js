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
    let loadConfigEditBtn = document.getElementById("configEditBtn");
    let loadConfigSaveBtn = document.getElementById("configSaveBtn");
    modalBodyText.readOnly = !modalBodyText.readOnly;
    loadConfigEditBtn.hidden = !loadConfigEditBtn.hidden;
    loadConfigSaveBtn.hidden = !loadConfigSaveBtn.hidden;
}

async function saveConfig() {
    let modalBodyText = document.getElementById("modalConfigBodyText");
    let configEditBtn = document.getElementById("configEditBtn");
    let configSaveBtn = document.getElementById("configSaveBtn");
    let name = document.getElementById("modalConfigTitle").innerText;
    let value = modalBodyText.value;

    // Save Config
    let resp = await $.ajax({
        method: "post", url: "/bots/saveConfig", data: {value: value, name: name}, success: function (data) {
            return data;
        }
    });

    // Hide Modal
    modalBodyText.readOnly = !modalBodyText.readOnly;
    configEditBtn.hidden = !configEditBtn.hidden;
    configSaveBtn.hidden = !configSaveBtn.hidden;
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
    let divOne, divTwo, divThree, pElem, w100, actionBtn;

    botElem.classList.add("col-xl-3", "col-md-6", "border-bottom", "border-end");
    botElem.id = "bot_" + name;

    divOne = document.createElement("div");
    divOne.classList.add("text-center", "my-2");
    divOne.innerHTML = "<b>" + name + "</b>"
    botElem.appendChild(divOne);

    divOne = document.createElement("div");
    divOne.classList.add("text-center", "my-2");
    botElem.appendChild(divOne);

    divTwo = document.createElement("div");
    divTwo.classList.add("row", "px-4");
    divOne.appendChild(divTwo);

    pElem = document.createElement("p");
    pElem.classList.add("col");
    pElem.innerHTML = "Running: <b><span id=\"" + name + "_running\">-</span></b>"
    divTwo.appendChild(pElem);

    pElem = document.createElement("p");
    pElem.classList.add("col");
    pElem.innerHTML = "PID: <b><span id=\"" + name + "_pid\">-</span></b>"
    divTwo.appendChild(pElem);

    w100 = document.createElement("div");
    w100.classList.add("w-100");
    divTwo.appendChild(w100);

    pElem = document.createElement("p");
    pElem.classList.add("col");
    pElem.innerHTML = "CPU: <b><span id=\"" + name + "_cpu\">-</span></b>"
    divTwo.appendChild(pElem);

    pElem = document.createElement("p");
    pElem.classList.add("col");
    pElem.innerHTML = "Memory: <b><span id=\"" + name + "_memory\">-</span></b>"
    divTwo.appendChild(pElem);

    w100 = document.createElement("div");
    w100.classList.add("w-100");
    divTwo.appendChild(w100);

    pElem = document.createElement("p");
    pElem.classList.add("col");
    pElem.innerHTML = "Create Time: <b><span id=\"" + name + "_create_time\">-</span></b>"
    divTwo.appendChild(pElem);

    w100 = document.createElement("div");
    w100.classList.add("w-100");
    divTwo.appendChild(w100);

    pElem = document.createElement("p");
    pElem.classList.add("col");
    pElem.innerHTML = "Running Time: <b><span id=\"" + name + "_running_time\">-</span></b>"
    divTwo.appendChild(pElem);

    w100 = document.createElement("div");
    w100.classList.add("w-100");
    divTwo.appendChild(w100);

    pElem = document.createElement("p");
    pElem.classList.add("col");
    pElem.innerHTML = "Last Run: <b><span id=\"" + name + "_last_run\">-</span></b>"
    divTwo.appendChild(pElem);

    divThree = document.createElement("div");
    divThree.classList.add("text-center", "my-2");
    botElem.appendChild(divThree);

    actionBtn = document.createElement("button");
    actionBtn.classList.add("btn", "btn-success", "m-1");
    actionBtn.id = name + "_start";
    actionBtn.innerText = "Start";
    actionBtn.onclick = function () {
        action("start", name)
    }
    divThree.appendChild(actionBtn);

    actionBtn = document.createElement("button");
    actionBtn.classList.add("btn", "btn-danger", "m-1");
    actionBtn.id = name + "_stop";
    actionBtn.innerText = "Stop";
    actionBtn.onclick = function () {
        action("stop", name)
    }
    divThree.appendChild(actionBtn);

    actionBtn = document.createElement("button");
    actionBtn.classList.add("btn", "btn-warning", "m-1");
    actionBtn.innerText = "Config";
    actionBtn.onclick = function () {
        loadFile("Config", name);
    }
    JSON[name]["has_config"] && divThree.appendChild(actionBtn);

    actionBtn = document.createElement("button");
    actionBtn.classList.add("btn", "btn-secondary", "m-1");
    actionBtn.innerText = "Log";
    actionBtn.onclick = function () {
        loadFile("Log", name);
    }
    divThree.appendChild(actionBtn);

    actionBtn = document.createElement("button");
    actionBtn.classList.add("btn", "btn-secondary", "m-1");
    actionBtn.innerText = "Saved Info";
    actionBtn.onclick = function () {
        loadFile("SavedInfo", name);
    }
    JSON[name]["has_saved_info"] && divThree.appendChild(actionBtn);

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
        await createBot(JSON, botName);
        await setBot(JSON, botName);
    }

    // Remove Loading
    await loadingScreen("remove");

    // Wait x secs -> Run again
    await sleep(config_updateTime);
    if (config_updateBots === true) {
        await updateSections();
    }
}

window.addEventListener('DOMContentLoaded', async function main() {
    document.getElementById("navbar_bots").classList.add("active");
    await updateSections();
});