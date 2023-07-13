/*
    @author: xhico
 */

function addProfileElem(profile) {
    let profileElemCol = document.createElement("div");
    profileElemCol.classList.add("col");

    let profileElemCard = document.createElement("div");
    profileElemCard.classList.add("card", "text-center");
    profileElemCol.appendChild(profileElemCard);

    let profileElemCardHeader = document.createElement("div");
    profileElemCardHeader.classList.add("card-header");
    if (profile["connected"]) {
        profileElemCardHeader.classList.add("text-bg-success");
    } else if (!profile["connected"] && profile["status"] === "Valid") {
        profileElemCardHeader.classList.add("text-bg-warning");
    } else {
        profileElemCardHeader.classList.add("text-bg-danger");
    }
    profileElemCardHeader.innerHTML = "<b>" + profile["name"] + "</b>";
    profileElemCard.appendChild(profileElemCardHeader);

    let profileElemCardBody = document.createElement("div");
    profileElemCardBody.classList.add("card-body");
    profileElemCard.appendChild(profileElemCardBody);

    let profileElemCardFooter = document.createElement("div");
    profileElemCardFooter.classList.add("card-footer", "text-muted");
    let profileElemCardFooterSmall = document.createElement("small");
    profile["connectedSince"] = profile["connectedSince"] ? profile["connectedSince"] : "-";
    profileElemCardFooterSmall.innerHTML = "<b>Connected Since: </b>" + profile["connectedSince"]
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

    profileElemCardEntry = document.createElement("p");
    profileElemCardEntry.classList.add("card-text");
    profileElemCardEntry.innerHTML = "<b>Status: </b>" + profile["status"];
    profileElemCardBody.appendChild(profileElemCardEntry);

    profileElemCardEntry = document.createElement("p");
    profileElemCardEntry.classList.add("card-text");
    profileElemCardEntry.innerHTML = "<b>Expiration: </b>" + profile["expiration"];
    profileElemCardBody.appendChild(profileElemCardEntry);

    let profileElemCardRevoke = document.createElement("button");
    profileElemCardRevoke.type = "button";
    profileElemCardRevoke.setAttribute("data-bs-toggle", "modal");
    profileElemCardRevoke.setAttribute("data-bs-target", "#revokeModal");
    profileElemCardRevoke.classList.add("btn", "btn-danger");
    profileElemCardRevoke.innerText = "Revoke";
    profileElemCardRevoke.onclick = function () {
        document.getElementById('profileName').innerText = profile["name"];
    }
    profileElemCardRevoke.disabled = profile["status"] === "Revoked";
    profileElemCardBody.appendChild(profileElemCardRevoke);

    let profilesElem = document.getElementById("profiles");
    profilesElem.appendChild(profileElemCol);

}

async function filterClients(data, filterOption) {
    if (filterOption === "Valid") {
        return data.filter(item => item.status === "Valid");
    } else if (filterOption === "Revoked") {
        return data.filter(item => item.status === "Revoked");
    } else if (filterOption === "Connected") {
        return data.filter(item => item.connected === true);
    } else {
        return data;
    }
}

async function loadClients() {
    // Show Loading
    await loadingScreen("show");

    // Clear existing profiles
    document.getElementById("profiles").innerHTML = "";

    // Get PiVPN Info
    let resp = await $.ajax({
        method: "get", url: "/pivpn/info", success: function (data) {
            return data;
        }
    });

    // Check if no Clients
    if (resp.length === 0) {
        document.getElementById("profiles").innerHTML = "<span>No Clients to show</span>";
    }

    // Set Overview
    let validCount = 0;
    let revokedCount = 0;
    let connectedCount = 0;
    let totalCount = resp.length;
    for (let entry of resp) {
        if (entry.status === "Valid") {
            validCount++;
        }
        if (entry.status === "Revoked") {
            revokedCount++;
        }
        if (entry.connected === true) {
            connectedCount++;
        }
    }
    document.getElementById("overviewValid").innerText = validCount.toString();
    document.getElementById("overviewRevoked").innerText = revokedCount.toString();
    document.getElementById("overviewConnected").innerText = connectedCount.toString();
    document.getElementById("overviewTotal").innerText = totalCount.toString();

    // Filter Clients
    let filterOption = document.getElementById("clientFilterSelect").value;
    resp = await filterClients(resp, filterOption);

    // Add PiVPN Profiles
    for (let profile of resp) {
        addProfileElem(profile);
    }

    // Remove Loading
    await loadingScreen("remove");
}

async function revokeClient(revokeBtn) {
    // Show Loading
    await loadingScreen("show");

    // Disable Btns
    revokeBtn.disabled = true;

    // Make POST Request
    let name = document.getElementById("profileName").innerText;
    await $.ajax({
        method: "post", url: "/pivpn/revoke", data: {name: name}, success: function (data) {
            return data;
        }
    });

    // Load Clients
    await loadClients();

    // Clear Btns
    $("#revokeModal").modal("hide");
    revokeBtn.disabled = false;

    // Remove Loading
    await loadingScreen("remove");
}

async function addClient(addBtn) {
    // Show Loading
    await loadingScreen("show");

    // Get Client Information
    let clientName = document.getElementById("addClientName");
    let clientPW = document.getElementById("addClientPW");
    let clientDays = document.getElementById("addClientDays");
    let clientNameValue = clientName.value;
    let clientPWValue = clientPW.value;
    let clientDaysValue = clientDays.value;

    // Check Client Information
    if (clientNameValue === "" || clientPWValue === "" || clientPWValue.length < 4 || clientDaysValue === "" || 1 > clientDaysValue > 3650) {
        await showNotification("Invalid Client Information", "Please check Name, Password (Min Length: 4), Expiration Days", "error");
    } else {
        // Disable Btns
        addBtn.disabled = true;

        // Make Post Request
        await $.ajax({
            method: "post",
            url: "/pivpn/add",
            data: {clientName: clientNameValue, clientPW: clientPWValue, clientDays: clientDaysValue},
            success: function (data) {
                return data;
            }
        });

        // Load Clients
        await loadClients();
    }

    // Clear Spinner
    addBtn.disabled = false;

    // Remove Loading
    await loadingScreen("remove");
}

window.addEventListener('DOMContentLoaded', async function main() {
    document.getElementById("navbar_pivpn").classList.add("active");
    console.log("Get PiVPN info");

    // Load Clients
    await loadClients();

    // Remove Loading
    await loadingScreen("remove");
});