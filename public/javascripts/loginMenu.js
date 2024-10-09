const loginDiv = document.getElementById("login-div");
const adminLoginBtn = document.getElementById("openLoginForm");
const closeMenuBtn = document.getElementById("closeMenu");
const contentBlur = document.getElementById("content-blur");

function lockScroll() {
  // Calculate the scrollbar width
  const scrollBarWidth =
    window.innerWidth - document.documentElement.clientWidth;

  // Apply the padding equal to the scrollbar width and hide the overflow
  document.body.style.paddingRight = `${scrollBarWidth}px`;
  document.body.style.overflow = "hidden";
}

function unlockScroll() {
  // Remove the padding and allow scrolling again
  document.body.style.paddingRight = "0px";
  document.body.style.overflow = "";
}

if (adminLoginBtn != null) {
  adminLoginBtn.addEventListener("click", openSidebar);
}

if (closeMenuBtn != null) {
  closeMenuBtn.addEventListener("click", closeSidebar);
}

function openSidebar() {
  if (loginDiv.classList.contains("closed")) {
    loginDiv.style.transform = "translate(100%)";
    loginDiv.style.transition = "200ms ease-in-out";
    loginDiv.classList.toggle("open");
    loginDiv.classList.toggle("closed");
    contentBlur.classList.toggle("blur");
    lockScroll();
  }
}

function closeSidebar() {
  if (loginDiv.classList.contains("open")) {
    loginDiv.style.transform = "translate(-100%)";
    loginDiv.style.transition = "200ms ease-in-out";
    loginDiv.classList.toggle("closed");
    loginDiv.classList.toggle("open");
    contentBlur.classList.toggle("blur");
    unlockScroll();
  }
}

document.onclick = function (e) {
  if (
    !loginDiv.contains(e.target) &&
    loginDiv.classList.contains("open") &&
    !adminLoginBtn.contains(e.target)
  ) {
    console.log("clicked outside sidebar");
    closeSidebar();
  }
};
