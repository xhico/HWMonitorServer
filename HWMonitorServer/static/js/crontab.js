/*
    @author: xhico
 */

async function saveCrontab() {
    console.log("saveCrontab");
    let jobsCounter = document.getElementById("cronjobs").children.length;
    let cronjobs = [];
    for (let i = 0; i < jobsCounter; i++) {
        let jobId = "job_" + i;
        let jobStatus = (document.getElementById("check_" + jobId).checked ? "enabled" : "disabled");
        let jobJob = document.getElementById("job_" + jobId).value;
        cronjobs.push({"job": jobJob, "status": jobStatus});
    }
    cronjobs = JSON.stringify(cronjobs);

    // Save Crontab Info
    let resp = await $.ajax({
        method: "post", url: "/crontab/save", data: {"cronjobs": cronjobs}, success: function (data) {
            return data;
        }
    });

    if (resp["status"] === "success") {
        await getCronjobs();
    }

    // Show Notification
    await showNotification("Crontab", resp["message"], resp["status"])
}

async function addJobElem(jobJob, jobStatus, jobId) {
    let inputElemOne = document.createElement("input")
    inputElemOne.classList.add("form-check-input", "mt-0");
    inputElemOne.type = "checkbox";
    inputElemOne.value = "";
    inputElemOne.id = "check_" + jobId;
    inputElemOne.checked = ((jobStatus === "enabled"));
    inputElemOne.setAttribute("aria-label", "Checkbox Enable/Disable Status");

    let divOne = document.createElement("div");
    divOne.classList.add("input-group-text");
    divOne.append(inputElemOne);

    let inputElemTwo = document.createElement("input");
    inputElemTwo.type = "text";
    inputElemTwo.classList.add("form-control");
    inputElemTwo.value = jobJob;
    inputElemTwo.disabled = true;
    inputElemTwo.id = "job_" + jobId;
    inputElemTwo.setAttribute("aria-label", "Cronjob with checkbox");

    let btnOne = document.createElement("button");
    btnOne.classList.add("btn", "btn-outline-secondary");
    btnOne.type = "button";
    btnOne.innerText = "Edit";
    btnOne.onclick = function () {
        let jobId = this.parentElement.id.replace("div_job_", "");
        let inputJob = document.getElementById("job_job_" + jobId);
        inputJob.disabled = !inputJob.disabled;
    }

    let btnTwo = document.createElement("button");
    btnTwo.classList.add("btn", "btn-outline-danger");
    btnTwo.type = "button";
    btnTwo.innerText = "X";
    btnTwo.onclick = function () {
        this.parentElement.remove();
    }

    let divTwo = document.createElement("div");
    divTwo.classList.add("input-group", "mb-3");
    divTwo.id = "div_" + jobId;
    divTwo.append(divOne);
    divTwo.append(inputElemTwo);
    divTwo.append(btnOne);
    divTwo.append(btnTwo);

    let cronjobsElem = document.getElementById("cronjobs");
    cronjobsElem.append(divTwo);
}

async function getCronjobs() {
    // Get Crontab Info JSON
    let resp = await $.ajax({
        method: "get", url: "/crontab/info", success: function (data) {
            return data;
        }
    });

    // Add Cronjobs
    let cronjobsElem = document.getElementById("cronjobs");
    cronjobsElem.innerHTML = "";
    for (let i = 0; i < resp.length; i++) {
        let job = resp[i];
        let jobJob = job["job"];
        let jobStatus = job["status"];
        let jobId = "job_" + i;
        await addJobElem(jobJob, jobStatus, jobId);
    }
}

async function addJob() {
    let jobId = "job_" + document.getElementById("cronjobs").children.length;
    let jobStatus = "enabled";
    let jobJob = "0 */1 * * python3 /home/pi/example/example.py";
    await addJobElem(jobJob, jobStatus, jobId);
    document.getElementById("job_" + jobId).disabled = false;
}

async function downloadCrontab() {
    // Get all entries
    let jobsCounter = document.getElementById("cronjobs").children.length;
    let cronjobs = "";
    for (let i = 0; i < jobsCounter; i++) {
        cronjobs += document.getElementById("job_job_" + i).value + "\n";
    }

    // Create download btn -> click
    let downloadElem = document.createElement("a");
    let crontabFile = "crontab_" + hostname + ".txt";
    downloadElem.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(cronjobs));
    downloadElem.setAttribute("download", crontabFile);
    downloadElem.style.display = "none";
    document.body.appendChild(downloadElem);
    downloadElem.click();
    document.body.removeChild(downloadElem);
}

window.addEventListener('DOMContentLoaded', async function main() {
    document.getElementById("navbar_crontab").classList.add("active");
    console.log("Get crontab info");

    // Add Cronjobs
    await getCronjobs();

    // Remove Loading
    await removeLoading();
});