/*
    @author: xhico
 */

function parseDate(rec) {
    rec = rec.split("/").slice(-1).toString().replace(".mp4", "").split("_");
    let date = rec.slice(0, 1).toString().replaceAll("-", "/");
    let time = rec.slice(-1).toString().replaceAll("-", ":");
    return date + " " + time;
}

function showRec(rec) {
    let video = document.createElement("video");
    video.id = "recVideo";
    video.style.width = "100%";
    video.setAttribute("controls", "controls");

    let source = document.createElement("source");
    source.setAttribute("src", "/static/_RECORDINGS/" + rec);
    source.setAttribute("type", "video/mp4");
    video.appendChild(source);

    document.getElementById("recordingModalTitle").innerText = parseDate(rec);
    document.getElementById("recBody").append(video);
    $('#recordingModal').modal("show");
    video.play();
}

document.getElementById("recordingModal").addEventListener("hidden.bs.modal", event => {
    document.getElementById("recVideo").remove();
})

function createDay(day, recs) {
    // Create element
    let h5Elem = document.createElement("h5");
    h5Elem.classList.add("card-title");
    h5Elem.innerText = day;

    let bodyElem = document.createElement("div");
    bodyElem.classList.add("card-body");
    bodyElem.append(h5Elem);

    let listElem = document.createElement("ul");
    listElem.classList.add("list-group", "list-group-flush");
    for (let rec of recs) {
        let btn = document.createElement("button");
        btn.type = "button";
        btn.classList.add("list-group-item", "list-group-item-action");
        btn.innerText = parseDate(rec);
        btn.onclick = function () {
            showRec(rec);
        }
        listElem.append(btn);
    }

    let cardElem = document.createElement("div");
    cardElem.classList.add("card");
    cardElem.append(bodyElem);
    cardElem.append(listElem);

    let dayElem = document.createElement("div");
    dayElem.classList.add("col-xl-3", "col-md-6", "mb-4");
    dayElem.append(cardElem);
    document.getElementById("content").appendChild(dayElem);
}

window.addEventListener('DOMContentLoaded', async function main() {
    console.log("---------------------");
    document.getElementById("navbar_eye").classList.add("active");

    // Get Recordings Info JSON
    console.log("Get Recordings Info JSON");
    let JSON = await $.ajax({
        method: "get", url: "/eye/getRecordings", success: function (data) {
            return data;
        }
    });

    // Iterate over every day
    let dayFolders = Object.keys(JSON).reverse();
    for (let day of dayFolders) {
        let recs = JSON[day].sort(function (a, b) {
            return a.toLowerCase().localeCompare(b.toLowerCase());
        }).reverse();

        await createDay(day, recs);
    }

    // Remove Loading
    await removeLoading();
});