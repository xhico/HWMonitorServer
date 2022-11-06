/*
    @author: xhico
 */


window.addEventListener('DOMContentLoaded', async function main() {
    console.log("---------------------");
    document.getElementById("navbar_eye").classList.add("active");

    // Remove Loading
    await removeLoading();
});