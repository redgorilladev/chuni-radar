const loginDiv = document.getElementById("login-div");
const adminLoginBtn = document.getElementById("openLoginForm");

if (adminLoginBtn != null) {
  adminLoginBtn.addEventListener("click", () => {
    if (loginDiv.classList.contains("closed")) {
      loginDiv.style.transform = "translate(105%)";
      loginDiv.style.transition = "200ms ease-in-out";
      loginDiv.classList.add("open");
      loginDiv.classList.remove("closed");
    } else {
      loginDiv.style.transform = "translate(-100%)";
      loginDiv.style.transition = "200ms ease-in-out";
      loginDiv.classList.add("closed");
      loginDiv.classList.remove("open");
    }
  });
}
