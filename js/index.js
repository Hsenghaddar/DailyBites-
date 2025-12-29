document.addEventListener("DOMContentLoaded", function () {
    let textContainer = document.querySelector(".text-container")
    let pageElements = document.querySelectorAll(".page-transition")
    if (textContainer) {
        textContainer.classList.add("show")
    }
    setTimeout(function () {
        pageElements.forEach(function (el) {
            el.classList.add("fade-out")
        })
    }, 1200)
    function goHome() {
        const parts = window.location.pathname.split("/"); 
        const root = parts.length > 2 ? `/${parts[1]}` : "";
        window.location.href = `${root}/html/home.html`;
    }
    setTimeout(function () {
        goHome();
    }, 1200 + 400)
})