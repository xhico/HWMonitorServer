/*
    @author: xhico
 */

async function addProfileElem(profile) {
    let profileElemCol = document.createElement("div");
    profileElemCol.classList.add("col");

    let profileElemCard = document.createElement("div");
    profileElemCard.classList.add("card", "text-center");
    profileElemCol.appendChild(profileElemCard);

    let profileElemCardHeader = document.createElement("div");
    profileElemCardHeader.classList.add("card-header");
    profileElemCardHeader.innerText = profile["name"];
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

    let profileElemCardRemoteIP = document.createElement("p");
    profileElemCardRemoteIP.classList.add("card-text");
    profileElemCardRemoteIP.innerHTML = "<b>Remote IP: </b>" + profile["remoteIP"];
    profileElemCardBody.appendChild(profileElemCardRemoteIP);

    let profileElemCardVirtualIP = document.createElement("p");
    profileElemCardVirtualIP.classList.add("card-text");
    profileElemCardVirtualIP.innerHTML = "<b>Virtual IP: </b>" + profile["virtualIP"];
    profileElemCardBody.appendChild(profileElemCardVirtualIP);

    let profileElemCardBytesReceived = document.createElement("p");
    profileElemCardBytesReceived.classList.add("card-text");
    profileElemCardBytesReceived.innerHTML = "<b>Bytes Received: </b>" + profile["bytesReceived"];
    profileElemCardBody.appendChild(profileElemCardBytesReceived);

    let profileElemCardBytesSent = document.createElement("p");
    profileElemCardBytesSent.classList.add("card-text");
    profileElemCardBytesSent.innerHTML = "<b>Bytes Sent: </b>" + profile["bytesSent"];
    profileElemCardBody.appendChild(profileElemCardBytesSent);

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
        await addProfileElem(profile);
    }

    // Remove Loading
    await loadingScreen("remove");
});