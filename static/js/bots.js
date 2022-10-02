/*
    @author: xhico
 */

let alreadyCreatedBots = false;


async function setBot(botsName) {
    for (let i = 0; i < botsName.length; i++) {
        let name = botsName[i];

        // Create element
        let botElem = document.createElement("div");
        let divOne, divTwo, divThree, pElem, w100, btnOne, btnTwo, aOne;

        botElem.classList.add("col-xl-3", "col-md-6", "border-bottom", "border-end");

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
        btnOne.id = name + "_kill";
        btnOne.innerText = "Kill";
        btnOne.onclick = function () {
            action("kill", name)
        }
        divThree.appendChild(btnOne);

        btnTwo = document.createElement("button");
        btnTwo.classList.add("btn", "btn-success", "m-1");
        btnTwo.id = name + "_run";
        btnTwo.innerText = "Run";
        btnTwo.onclick = function () {
            action("run", name)
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
    alreadyCreatedBots = true;
}

function getBot(JSON, name) {
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
    document.getElementById(name + "_kill").disabled = ((running === "False"));
    document.getElementById(name + "_run").disabled = ((running === "True"));
}

async function action(value, name) {
    $.ajax({
        method: "post", url: "/bots/action", data: {value: value, name: name}, success: function (response) {
            if (response["action"] === "log") {
                $('#botLogModal').modal('show');
                document.getElementById("modalTitle").innerText = name;
                document.getElementById("modalBodyText").innerText = decodeURI(response["info"]);
            }
        }
    });
}

window.addEventListener('DOMContentLoaded', async function main() {
    console.log("---------------------");
    document.getElementById("navbar_bots").classList.add("active");

    // Create sections
    console.log("Create Sections");
    let botsName = ["EZTV-AutoDownloader", "TV3U", "RandomF1Quotes", "RandomUrbanDictionary", "Random9GAG", "FIMDocs", "WSeriesDocs", "FIAFormulaEDocs", "ddnsUpdater", "RaspberryPiSurveillance", "NoIpUpdater"]
    if (alreadyCreatedBots === false) {
        await setBot(botsName);
    }

    // Get Bots Info JSON
    console.log("Get Bots Info JSON");
    let JSON = await $.ajax({
        method: "get", url: "/json/botsInfo", success: function (data) {
            return data;
        }
    });

    // Get Bots
    for (let i = 0; i < botsName.length; i++) {
        let name = botsName[i];
        getBot(JSON, name);
    }

    // Wait 2 secs -> Run again
    await new Promise(r => setTimeout(r, 2000));
    await main();
});