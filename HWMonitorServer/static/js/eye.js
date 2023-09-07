/*
    @author: xhico
 */

let recordingsJSON;

function formatDate(inputDate) {
    let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    // Split the inputDate by "-"
    let parts = inputDate.split("-");

    // Check the length of the parts array
    if (parts.length === 2) {
        let [year, month] = parts.map(Number);
        return months[month - 1] + " " + year;
    } else if (parts.length === 3) {
        let [year, month, day] = parts.map(Number);
        day = day.toString().length === 1 ? "0" + day : day;
        return day + " " + months[month - 1] + " " + year;
    } else {
        return "Invalid date format";
    }
}

async function setSelectOverview() {
    // Add months to select overview
    let months = [...new Set(Object.keys(recordingsJSON).map(date => date.substring(0, 7)))];
    let selectElement = document.getElementById("overviewMonthSelect");
    for (let month of months) {
        let newOption = document.createElement("option");
        newOption.value = month;
        newOption.text = formatDate(month);
        selectElement.appendChild(newOption);
    }
}

async function setOverviewMonth() {
    // Clear Overview Month
    let overviewListGroup = document.getElementById("overviewListGroup");
    overviewListGroup.innerHTML = "";

    // Get Value of Month
    let monthValue = document.getElementById("overviewMonthSelect").value;

    // Filter recordingsJSON to only get the Month
    let filteredRecordings = {};
    Object.keys(recordingsJSON).filter(key => key.startsWith(monthValue)).forEach(key => {
        filteredRecordings[key] = recordingsJSON[key];
    });

    // Set Overview Counters
    for (let [day, recordings] of Object.entries(filteredRecordings)) {
        // Create the button element with classes
        let button = document.createElement("button");
        button.setAttribute("type", "button");
        button.classList.add("list-group-item", "list-group-item-action", "list-group-item-success", "d-flex", "justify-content-between", "align-items-center");
        button.id = "overviewBtn-" + day;
        button.innerText = formatDate(day);
        button.onclick = function () {
            createRecordingCards(day);
        }

        // Create the span element with classes "badge", "bg-success", and "rounded-pill"
        let badgeSpan = document.createElement("span");
        badgeSpan.classList.add("badge", "bg-success", "rounded-pill");
        badgeSpan.textContent = recordings.length;

        // Append the span element to the button element
        button.appendChild(badgeSpan);

        // Append the button element to the document body (or any other desired parent element)
        overviewListGroup.appendChild(button);
    }

    // Load Last Recordings
    let lastDayName = Object.keys(filteredRecordings)[0];
    await createRecordingCards(lastDayName);
}

async function createRecordingCards(lastDayName) {
    // Clear
    let recordingsDiv = document.getElementById("recordings");
    recordingsDiv.innerHTML = "";

    // Toggle Overview Btn
    const overviewButtons = document.querySelectorAll('[id^="overviewBtn-"]');
    overviewButtons.forEach(button => {
        button.classList.remove("active");
    });
    document.getElementById("overviewBtn-" + lastDayName).classList.add("active");

    // Set dayFolderName
    document.getElementById("dayFolderName").innerText = formatDate(lastDayName);

    // Create Recs Cards
    for (let recName of recordingsJSON[lastDayName].sort()) {

        // Set cardTitleText
        let cardTitleText = recName.replace(lastDayName + "_", "").replace(".mp4", "").replaceAll("-", ":");
        cardTitleText = cardTitleText.startsWith("0") ? cardTitleText + " AM" : cardTitleText + " PM";

        // Create the outermost div element with class "col"
        const colDiv = document.createElement("div");
        colDiv.classList.add("col");

        // Create the card div element with class "card"
        const cardDiv = document.createElement("a");
        cardDiv.href = "javascript:void(0)";
        cardDiv.style.textDecoration = "none";
        cardDiv.style.transition = "background-color 0.3s ease";
        cardDiv.classList.add("card");
        cardDiv.addEventListener("mouseover", () => {
            cardDiv.classList.add("bg-body-secondary");
        });
        cardDiv.addEventListener("mouseout", () => {
            cardDiv.classList.remove("bg-body-secondary");
        });
        cardDiv.onclick = () => {
            document.getElementById("recordingModalTitle").innerText = cardTitleText;
            let video = document.createElement("video");
            video.id = "recVideo";
            video.style.width = "100%";
            video.setAttribute("controls", "controls");

            let source = document.createElement("source");
            source.setAttribute("src", "/static/_RECORDINGS/" + lastDayName + "/" + recName);
            source.setAttribute("type", "video/mp4");
            video.appendChild(source);

            document.getElementById("recBody").append(video);
            $("#recordingModal").modal("show");
            video.play();
        };

        // Create the svg element with the specified attributes
        const img = document.createElement("img");
        img.setAttribute("src", "/static/_RECORDINGS/" + lastDayName + "/" + recName.replace(".mp4", ".png"));
        img.classList.add("card-img-top");
        img.alt = "Thumbnail - " + recName;

        // Create the card-body div element
        const cardBodyDiv = document.createElement("div");
        cardBodyDiv.classList.add("card-body");

        // Create the h5 element with class "card-title" and text content "Card title"
        const cardTitle = document.createElement("h5");
        cardTitle.classList.add("card-title");
        cardTitle.textContent = cardTitleText;

        // Append the h5 element to the card-body div element
        cardBodyDiv.appendChild(cardTitle);

        // Append the svg and card-body div elements to the card div element
        cardDiv.appendChild(img);
        cardDiv.appendChild(cardBodyDiv);

        // Append the card div element to the outermost div element
        colDiv.appendChild(cardDiv);

        // Append the outermost div element to the recordingsDiv
        recordingsDiv.appendChild(colDiv);
    }
}

document.getElementById("recordingModal").addEventListener("hidden.bs.modal", event => {
    document.getElementById("recVideo").remove();
});

document.getElementById("overviewMonthSelect").addEventListener("change", function () {
    setOverviewMonth();
});

window.addEventListener("DOMContentLoaded", async function main() {
    document.getElementById("navbar_eye").classList.add("active");

    // Get Recordings Info JSON
    console.log("Get Recordings Info JSON");
    recordingsJSON = await $.ajax({
        method: "get", url: "/eye/getRecordings", success: function (data) {
            return data;
        }
    });

    // Reverse recordingsJSON
    recordingsJSON = Object.fromEntries(Object.entries(recordingsJSON).reverse());

    // Set Overview
    await setSelectOverview();
    await setOverviewMonth();

    // Remove Loading
    await loadingScreen("remove");
});