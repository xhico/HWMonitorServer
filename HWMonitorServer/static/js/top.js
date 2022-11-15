/*
    @author: xhico
 */

async function getInfo() {
    let resp = await $.ajax({
        method: "get", url: "/top/info", success: function (data) {
            return data;
        }
    });

    let topInfoElem = document.getElementById("topInfo");
    topInfoElem.innerHTML = "";

    for (let i = 0; i < resp.length; i++) {
        let line = resp[i];
        let divRow = document.createElement("div");
        divRow.classList.add("row");
        if (i === 0 || i === 1) {
            divRow.classList.add("fw-bolder");
        }

        for (let j = 0; j < line.length; j++) {
            let item = line[j];
            let divItem = document.createElement("div");
            divItem.classList.add("border-start", "border-top", "border-dark");
            if (j === 5) {
                divItem.classList.add("col-6", "border-end");
            } else {
                divItem.classList.add("col");
            }

            if (i === resp.length - 1) {
                divItem.classList.add("border-bottom");
            }

            divItem.innerText = item;
            divRow.append(divItem);
        }

        topInfoElem.append(divRow);
    }
}

async function updateInfo() {
    // Get TOP Info
    await getInfo();

    // Remove Loading
    await removeLoading();

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