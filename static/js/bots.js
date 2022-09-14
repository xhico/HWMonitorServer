/*
    @author: xhico
 */

function getBot(JSON, name) {
    let running = JSON[name]["Running"];
    document.getElementById(name + "_running").innerText = running;
    let pid = "-";
    let cpu = "-";
    let mem = "-";
    let create_time = "-";
    let running_time = "-";

    if (running === "True") {
        pid = JSON[name]["info"]["pid"];
        cpu = JSON[name]["info"]["cpu"];
        mem = JSON[name]["info"]["mem"];
        create_time = JSON[name]["info"]["create_time"];
        running_time = JSON[name]["info"]["running_time"];
    }

    document.getElementById(name + "_pid").innerText = pid;
    document.getElementById(name + "_cpu").innerText = cpu;
    document.getElementById(name + "_mem").innerText = mem;
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

    // Get Bots Info JSON
    console.log("Get Bots Info JSON");
    let JSON = await $.ajax({
        method: "get", url: "/json/botsInfo", success: function (data) {
            return data;
        }
    });

    // Run sections
    console.log("Run Sections");
    let botsName = ["EZTV-AutoDownloader", "TV3U", "RandomF1Quotes", "RandomUrbanDictionary", "Random9GAG", "FIMDocs", "WSeriesDocs", "FIAFormulaEDocs", "ddnsUpdater", "RaspberryPiSurveillance"]
    botsName.forEach(function (name) {
        getBot(JSON, name);
    });

    // Wait 2 secs -> Run again
    await new Promise(r => setTimeout(r, 2000));
    await main();
});