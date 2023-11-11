/*
    @author: xhico
 */

async function clickBtn(btn) {
    // Get InnerText from btn
    let text = btn.innerText;

    // Get btn action from innerText
    let value = btn.innerText.replaceAll(" ", "_").toLowerCase();

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