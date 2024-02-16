/*
    @author: xhico
 */

function addProfileElem(name, profile) {
    let profileElemCol = document.createElement("div");
    profileElemCol.classList.add("col-12");

    let profileElemCard = document.createElement("div");
    profileElemCard.classList.add("card", "text-center");
    profileElemCol.appendChild(profileElemCard);

    let profileElemCardHeader = document.createElement("div");
    profileElemCardHeader.classList.add("card-header");
    profileElemCardHeader.classList.add(profile["connected"] ? "text-bg-success" : "text-bg-warning");
    profileElemCardHeader.innerText = name;
    profileElemCard.appendChild(profileElemCardHeader);

    let profileElemCardBody = document.createElement("div");
    profileElemCardBody.classList.add("card-body");
    profileElemCard.appendChild(profileElemCardBody);

    let profileElemCardFooter = document.createElement("div");
    profileElemCardFooter.classList.add("card-footer", "text-muted");
    let profileElemCardFooterSmall = document.createElement("small");
    profile["lastSeen"] = profile["lastSeen"] ? profile["lastSeen"] : "-";
    profileElemCardFooterSmall.innerHTML = "<b>Last Seen: </b>" + profile["lastSeen"]
    profileElemCardFooter.appendChild(profileElemCardFooterSmall);
    profileElemCard.appendChild(profileElemCardFooter);

    let profileElemCardEntry = document.createElement("p");
    profileElemCardEntry.classList.add("card-text");
    profileElemCardEntry.innerHTML = "<b>Remote IP: </b>" + profile["remoteIP"];
    profileElemCardEntry.hidden = !profile["remoteIP"]
    profileElemCardBody.appendChild(profileElemCardEntry);

    profileElemCardEntry = document.createElement("p");
    profileElemCardEntry.classList.add("card-text");
    profileElemCardEntry.innerHTML = "<b>Virtual IP: </b>" + profile["virtualIP"];
    profileElemCardEntry.hidden = !profile["virtualIP"]
    profileElemCardBody.appendChild(profileElemCardEntry);

    profileElemCardEntry = document.createElement("p");
    profileElemCardEntry.classList.add("card-text");
    profileElemCardEntry.innerHTML = "<b>Bytes Received: </b>" + profile["bytesReceived"];
    profileElemCardEntry.hidden = !profile["bytesReceived"]
    profileElemCardBody.appendChild(profileElemCardEntry);

    profileElemCardEntry = document.createElement("p");
    profileElemCardEntry.classList.add("card-text");
    profileElemCardEntry.innerHTML = "<b>Bytes Sent: </b>" + profile["bytesSent"];
    profileElemCardEntry.hidden = !profile["remoteIP"]
    profileElemCardBody.appendChild(profileElemCardEntry);

    let profilesElem = document.querySelector("#profiles");
    profilesElem.appendChild(profileElemCol);

}

async function loadClients(status) {
    // Show Loading
    await loadingScreen("show");

    // Clear existing profiles
    document.querySelector("#profiles").innerHTML = "";

    // Set clientsTitle
    document.querySelector("#clientsTitle").innerText = status;

    // Get PiVPN Info
    let resp = await $.ajax({
        method: "get", url: "/pivpn/info", success: function (data) {
            return data;
        }
    });

    // Filter Clients
    if (status === "Connected") {
        const connectedEntries = {};
        for (const key in resp) {
            if (resp[key]["connected"]) {
                connectedEntries[key] = resp[key];
            }
        }
        resp = connectedEntries;
    }

    // Check if no Clients
    if (Object.keys(resp).length === 0) {
        document.querySelector("#profiles").innerHTML = "<span>No Clients to show</span>";
    }

    // Set Overview
    let connectedCount = 0;
    let totalCount = 0;
    for (const name in resp) {
        totalCount++;
        connectedCount += resp[name].connected === true ? 1 : 0;
    }
    document.querySelector("#overviewBadgeConnected").innerText = connectedCount.toString();
    document.querySelector("#overviewBadgeTotal").innerText = totalCount.toString();

    // Toggle Overview Btn
    const overviewButtons = document.querySelectorAll('[id^="overviewBtn-"]');
    overviewButtons.forEach(button => {
        button.classList.remove("active");
    });
    document.querySelector("#overviewBtn-" + status).classList.add("active");

    // Add PiVPN Profiles
    for (const name in resp) {
        let profile = resp[name];
        addProfileElem(name, profile);
    }

    // Remove Loading
    await loadingScreen("remove");
}

window.addEventListener('DOMContentLoaded', async function main() {
    document.querySelector("#navbar_pivpn").classList.add("active");
    console.log("Get PiVPN info");

    // Load Clients
    await loadClients("Total");

    // Remove Loading
    await loadingScreen("remove");
});