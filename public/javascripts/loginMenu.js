document.addEventListener("DOMContentLoaded", function () {
  const loginDiv = document.getElementById("login-div");
  const adminLoginBtn = document.getElementById("openLoginForm");
  const closeMenuBtn = document.getElementById("closeMenu");
  const contentBlur = document.getElementById("content-blur");
  const loginBtn = document.getElementById("loginBtn");
  const username = document.getElementById("username");
  const password = document.getElementById("password");
  const loginForm = document.getElementById("loginForm");
  const loadingSpinner = document.querySelector(".loading-spinner");
  const message = document.getElementById("message");

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    let uValue = username.value;
    let pValue = password.value;
    console.log(uValue, pValue);
    try {
      const response = await fetch("/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uValue, pValue }),
      });

      const result = await response.json();

      if (response.ok) {
        console.log(result.message);
        message.innerText = "";
        loadingSpinner.style.display = "block";
        setTimeout(() => {
          setTimeout(() => {
            window.location.href = "/";
          }, 1000);
          message.innerText = result.message;
          message.style.color = "green";
        }, 1000);
      } else {
        console.log(result.message);
        message.innerText = "";
        loadingSpinner.style.display = "block";
        setTimeout(() => {
          message.innerText = result.message;
          message.style.color = "red";
          loadingSpinner.style.display = "none";
        }, 1000);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  });

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
      console.log("clicked menu button");
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

  if (loginBtn) {
    loginBtn.disabled = true;
  }
});

function enableLoginBtn() {
  let isValid = true;
  if (username.value === "" || username.value === null) {
    isValid = false;
  }
  if (password.value === "" || password.value === null) {
    isValid = false;
  }
  loginBtn.disabled = !isValid;
}
