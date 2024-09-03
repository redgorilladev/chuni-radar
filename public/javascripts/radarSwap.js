const radarContainers = document.getElementsByClassName("container-nobg");
const questionRadar = document.getElementById("question-radar");
const masterBtn = document.getElementById("masterBtn");
const expertBtn = document.getElementById("expertBtn");
const ultimaBtn = document.getElementById("ultimaBtn");

masterBtn.addEventListener("click", showMaster);
expertBtn.addEventListener("click", showExpert);

if (ultimaBtn != null) {
  ultimaBtn.addEventListener("click", showUltima);
}

window.addEventListener("load", function () {
  const diff = window.location.hash.substring(1);

  if (diff != "") {
    if (diff == "master") {
      showMaster();
    } else if (diff == "expert") {
      showExpert();
    } else if (diff == "ultima") {
      showUltima();
    }
  } else {
    questionRadar.classList.add("flex-visible");
  }
});

function showMaster() {
  let diffFound = false;
  console.log("master clicked");
  masterBtn.classList.add("active-btn", "active-master");
  expertBtn.classList.remove("active-btn", "active-expert");
  if (ultimaBtn != null) {
    ultimaBtn.classList.remove("active-btn", "active-ultima");
  }

  for (let i = 0; i < radarContainers.length; i++) {
    console.log(radarContainers[i].dataset.difficulty);
    if (radarContainers[i].dataset.difficulty == "master") {
      radarContainers[i].classList.add("flex-visible");
      diffFound = true;
    } else {
      radarContainers[i].classList.remove("flex-visible");
    }
  }

  if (!diffFound) {
    questionRadar.classList.add("flex-visible");
  } else {
    questionRadar.classList.remove("flex-visible");
  }
}

function showExpert() {
  let diffFound = false;
  console.log("expert clicked");
  expertBtn.classList.add("active-btn", "active-expert");
  masterBtn.classList.remove("active-btn", "active-master");
  if (ultimaBtn != null) {
    ultimaBtn.classList.remove("active-btn", "active-ultima");
  }

  for (let i = 0; i < radarContainers.length; i++) {
    if (radarContainers[i].dataset.difficulty == "expert") {
      radarContainers[i].classList.add("flex-visible");
      diffFound = true;
    } else {
      radarContainers[i].classList.remove("flex-visible");
    }
  }

  if (!diffFound) {
    questionRadar.classList.add("flex-visible");
  } else {
    questionRadar.classList.remove("flex-visible");
  }
}

function showUltima() {
  let diffFound = false;
  questionRadar.classList.remove("flex-visible");
  console.log("ultima clicked");
  ultimaBtn.classList.add("active-btn", "active-ultima");
  expertBtn.classList.remove("active-btn", "active-expert");
  masterBtn.classList.remove("active-btn", "active-master");

  for (let i = 0; i < radarContainers.length; i++) {
    if (radarContainers[i].dataset.difficulty == "ultima") {
      radarContainers[i].classList.add("flex-visible");
      diffFound = true;
    } else {
      radarContainers[i].classList.remove("flex-visible");
    }
  }

  if (!diffFound) {
    questionRadar.classList.add("flex-visible");
  } else {
    questionRadar.classList.remove("flex-visible");
  }
}
