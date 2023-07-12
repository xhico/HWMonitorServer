/*
    @author: xhico
 */

async function revoke() {
    let name = document.getElementById("profileName").innerText;
    console.log(name);

    $("#revokeModal").modal("hide");
}

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

window.addEventListener('DOMContentLoaded', async function main() {
    document.getElementById("navbar_pivpn").classList.add("active");
    console.log("Get PiVPN info");

    // Get PiVPN Info
    let resp = await $.ajax({
        method: "get", url: "/pivpn/info", success: function (data) {
            return data;
        }
    });

    // Add PiVPN Profiles
    for (let profile of resp) {
        addProfileElem(profile)
    }

    // Remove Loading
    await loadingScreen("remove");
});