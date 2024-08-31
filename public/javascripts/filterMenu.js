let filterBtn = document.getElementById("search-filter-btn");
const filterDiv = document.getElementsByClassName("difficulty-filters");

if (filterBtn != null) {
  filterBtn.addEventListener("click", openFilters);
}

function openFilters() {
  for (let i = 0; i < filterDiv.length; i++) {
    if (filterDiv[i].classList.contains("visible")) {
      filterDiv[i].classList.remove("visible");
    } else {
      filterDiv[i].classList.add("visible");
    }
  }
}
