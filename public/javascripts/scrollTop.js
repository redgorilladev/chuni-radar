let scrollTop = document.getElementById("scroll-top-btn");

scrollTop.addEventListener("click", toTop);

window.onscroll = function () {
  scrollFunction();
};

function scrollFunction() {
  if (
    document.body.scrollTop > 300 ||
    document.documentElement.scrollTop > 300
  ) {
    scrollTop.style.display = "block";
  } else {
    scrollTop.style.display = "none";
  }
}

function toTop() {
  // For Safari
  document.body.scrollTo({
    top: 0,
    left: 0,
    behavior: "smooth",
  });

  // For Chrome, Firefox, IE and Opera
  document.documentElement.scrollTo({
    top: 0,
    left: 0,
    behavior: "smooth",
  });
}
