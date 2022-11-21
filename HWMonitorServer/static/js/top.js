/*
    @author: xhico
 */

async function killPID(pid) {
    let resp = await $.ajax({
        method: "post", url: "/top/kill", data: {pid: pid}, success: function (data) {
            return data;
        }
    });
    console.log(resp["status"]);

    // Show Notification
    await showNotification("PID - " + pid, resp["message"], resp["status"])
}

async function getInfo() {
    let resp = await $.ajax({
        method: "get", url: "/top/info", success: function (data) {
            return data;
        }
    });

    // Reset tableHeader && tableBody
    let tableHeader = document.getElementById("tableHeader");
    tableHeader.innerHTML = "";
    let tableBody = document.getElementById("tableBody");
    tableBody.innerHTML = "";

    for (let i = 0; i < resp.length; i++) {
        let line = resp[i];

        // Set Table
        let trElem = document.createElement("tr");
        for (let j = 0; j < line.length; j++) {
            let value = line[j];
            let elemTag = document.createElement(((i <= 1 || j === 0) ? "th" : "td"));

            // If Header or First Column
            if (i === 0) {
                elemTag.setAttribute("scope", "col");
            } else if (j === 0) {
                elemTag.setAttribute("scope", "row");
            }

            // Center every square except command
            if (j !== line.length - 2) {
                elemTag.classList.add("text-center");
            }

            // Add action btn || Normal values
            if (i > 1 && j === line.length - 1) {
                let actionBtn = document.createElement("button");
                actionBtn.type = "button";
                actionBtn.classList.add("btn", "btn-sm", "btn-danger");
                actionBtn.innerText = "KILL";
                actionBtn.onclick = function () {
                    killPID(value);
                }
                elemTag.append(actionBtn);
            } else {
                elemTag.innerText = value;
            }

            trElem.append(elemTag);
        }

        if (i === 0) {
            tableHeader.append(trElem);
        } else {
            tableBody.append(trElem);
        }
    }
}

async function updateInfo() {
    // Get TOP Info
    await getInfo();

    // Remove Loading
    await loadingScreen("remove");

    // Wait x secs -> Run again
    await sleep(config_updateTime);
    if (config_updateTOP === true) {
        await updateInfo();
    }
}

window.addEventListener('DOMContentLoaded', async function main() {
    document.getElementById("navbar_top").classList.add("active");
    await updateInfo();
});