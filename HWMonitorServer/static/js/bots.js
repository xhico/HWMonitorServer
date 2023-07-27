/*
    @author: xhico
 */

async function action(value, name) {
    let resp = await $.ajax({
        method: "post", url: "/bots/action", data: {value: value, name: name}, success: function (data) {
            return data;
        }
    });
    console.log(resp["status"]);

    // Show Notification
    await showNotification("Bot - " + name, resp["message"], resp["status"])

    // Show log if necessary
    if (resp["action"] === "log") {
        document.getElementById("modalTitle").innerText = name;
        document.getElementById("modalBodyText").innerText = decodeURI(resp["info"]);
        $("#botLogModal").modal("show");
    }
}

function createBot(name) {
    // Skip if already created
    if (document.getElementById("bot_" + name)) {
        return
    }

    // Create element
    let botElem = document.createElement("div");
    let divOne, divTwo, divThree, pElem, w100, btnOne, btnTwo, aOne;

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

    pElem = document.createElement("p");
    pElem.classList.add("col");
    pElem.innerHTML = "Running Time: <b><span id=\"" + name + "_running_time\">-</span></b>"
    divTwo.appendChild(pElem);


    divThree = document.createElement("div");
    divThree.classList.add("text-center", "my-2");
    botElem.appendChild(divThree);

    btnOne = document.createElement("button");
    btnOne.classList.add("btn", "btn-danger", "m-1");
    btnOne.id = name + "_stop";
    btnOne.innerText = "Stop";
    btnOne.onclick = function () {
        action("stop", name)
    }
    divThree.appendChild(btnOne);

    btnTwo = document.createElement("button");
    btnTwo.classList.add("btn", "btn-success", "m-1");
    btnTwo.id = name + "_start";
    btnTwo.innerText = "Start";
    btnTwo.onclick = function () {
        action("start", name)
    }
    divThree.appendChild(btnTwo);

    aOne = document.createElement("a");
    aOne.classList.add("btn", "btn-secondary", "m-1");
    aOne.innerText = "View Log";
    aOne.onclick = function () {
        action("log", name)
    }
    aOne.href = "javascript:void(0);";
    divThree.appendChild(aOne);

    // Append to contentDiv
    document.getElementById("content").appendChild(botElem);
}

function setBot(JSON, name) {
    let running = JSON[name]["Running"];
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
        await createBot(botName);
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