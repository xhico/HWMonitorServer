/*
    @author: xhico
 */

async function clickBtn(btn) {
    // Get text from btn value
    let text = btn.value;

    // Get btn value from value
    let value = text.replaceAll(" ", "_").toLocaleLowerCase();

    // Show Loading
    await loadingScreen("show");

    // Run Action
    let resp = await $.ajax({
        method: "post", url: "/ledircontroller/btn", data: {value: value, text: text}, success: function (data) {
            return data;
        }
    });

    // Remove Loading
    await loadingScreen("remove");

    // Show Notification
    await showNotification("Button - " + text, resp["message"], resp["status"])
}

window.addEventListener('DOMContentLoaded', async function main() {
    document.getElementById("navbar_ledircontroller").classList.add("active");

    // Remove Loading
    await loadingScreen("remove");
});