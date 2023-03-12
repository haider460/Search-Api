const API_URL = "https://www.omdbapi.com/?apikey=485d9445&s=";

//  connect with the html tags
const searchInput = document.getElementById("search-input");
const autocompleteResults = document.getElementById("autocomplete-results");
const clearInputButton = document.getElementById("clear-input");
const selectedResults = document.getElementById("selected-results");
const clearResultsButton = document.getElementById("clear-results");
let searchHistory = JSON.parse(localStorage.getItem("searchHistory")) || [];

//  check the history if there in no hisotory then show the "No History Found"
function CheckHistory() {
  if (selectedResults.children.length === 0) {
    const noHistoryMsg = document.createElement("li");
    noHistoryMsg.classList.add("no-history");
    noHistoryMsg.textContent = "No History Found";
    selectedResults.appendChild(noHistoryMsg);
  }
}

//  handle clear input
clearInputButton.addEventListener("click", () => {
  searchInput.value = "";
  autocompleteResults.innerHTML = "";
  searchInput.focus();
});

//  stop or fetch data from api if user start and stop typing for some mille seconds
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

//  get time
const getTime = () => {
  //  convert the the time to our requirements
  let timestamp = new Date().toLocaleString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
  timestamp = timestamp.replace(/\//g, "-");
  return timestamp;
};

//  display and store the data whci we fetch form the api and
// also handle the " not found data" and "min character required"
function displaySearchResults(results, query) {
  //  create the main container for dropdown and give some style
  autocompleteResults.innerHTML = "";
  autocompleteResults.style.maxHeight = "200px";
  autocompleteResults.style.overflowY = "auto";
  autocompleteResults.style.position = "absolute";
  autocompleteResults.style.backgroundColor = "white";
  autocompleteResults.style.width = searchInput.offsetWidth + "px";
  autocompleteResults.style.top = -13 + "px";
  autocompleteResults.style.left = 0 + "px";

  //  check the api result if not found then run this functionlity
  if (!results) {
    const li = document.createElement("p");
    li.textContent = "Data not found";
    li.style.color = "gray";

    //  check the input value if there no value in the input then disappear the dropdown
    if (!query) {
      autocompleteResults.innerHTML = "";

      // check if the character less then 3 then showthe error
    } else if (query.length <= 2) {
      const li = document.createElement("li");
      li.textContent = "Please Enter minimum 3 characters";
      li.style.color = "red";
      autocompleteResults.appendChild(li);
    } else autocompleteResults.appendChild(li);
  } else {
    //  handle and manage the fetch data into li tag and style it accourding to requirments

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      const title = result.Title;
      const li = document.createElement("li");
      const index = title
        .toLowerCase()
        .indexOf(searchInput.value.toLowerCase());
      if (index !== -1) {
        li.innerHTML =
          "<span style='color: gray'>" +
          title.substring(0, index) +
          "</span>" +
          "<span style='color: black'>" +
          title.substring(index, index + searchInput.value.length) +
          "</span>" +
          "<span style='color: gray'>" +
          title.substring(index + searchInput.value.length) +
          "</span>";
      } else {
        li.style.color = "black";
        li.textContent = title;
      }

      // handle the search history. store it and diplay on the screen with time and date
      li.addEventListener("click", () => {
        const historyDiv = document.getElementsByClassName("no-history")[0];
        historyDiv?.remove();

        const selectedLi = document.createElement("li");
        const selectedDiv = document.createElement("div");
        const deleteButton = document.createElement("button");

        //  convert the the time to our requirements
        let timestamp = getTime();

        //  add the classes to the html tags and asign the data into it
        selectedLi.classList.add("selected-item");
        selectedDiv.classList.add("selected-item-details");
        deleteButton.classList.add("clear-single-history");
        selectedLi.textContent = title;
        selectedDiv.textContent = timestamp;
        deleteButton.innerHTML = "&#10006;";
        deleteButton.addEventListener("click", () => {
          selectedLi.remove();
          CheckHistory();
        });
        selectedDiv.appendChild(deleteButton);
        selectedLi.appendChild(selectedDiv);
        selectedResults.appendChild(selectedLi);
        searchHistory.push({ title, timestamp });
        localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
        autocompleteResults.innerHTML = "";
        searchInput.value = "";
      });

      autocompleteResults.appendChild(li);
    }
  }
}

// save the  history on enter button

searchInput.addEventListener("keydown", (event) => {
  if (event.keyCode === 13) {
    event.preventDefault();
    const inputValue = searchInput.value;
    console.log(inputValue?.length);
    if (inputValue.length > 2) {
      const historyDiv = document.getElementsByClassName("no-history")[0];
      historyDiv?.remove();
      const selectedLi = document.createElement("li");
      const selectedDiv = document.createElement("div");
      const deleteButton = document.createElement("button");
      //  get time
      const timestamp = getTime();
      //  add the classes to the html tags and asign the data into it
      selectedLi.classList.add("selected-item");
      selectedDiv.classList.add("selected-item-details");
      deleteButton.classList.add("clear-single-history");
      selectedLi.textContent = inputValue;
      selectedDiv.textContent = timestamp;
      deleteButton.innerHTML = "&#10006;";
      deleteButton.addEventListener("click", () => {
        selectedLi.remove();
        CheckHistory();
      });
      selectedDiv.appendChild(deleteButton);
      selectedLi.appendChild(selectedDiv);
      selectedResults.appendChild(selectedLi);
      searchHistory.push({ inputValue, timestamp });
      localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
      autocompleteResults.innerHTML = "";
      searchInput.value = "";
    }
  }
});

//  handle the search functionality
function search(event) {
  const query = event.target.value;
  fetch(`${API_URL}${query}`)
    .then((response) => response.json())
    .then((data) => {
      const results = data.Search;
      displaySearchResults(results, query);
    })
    .catch((error) => displaySearchResults(error, query));
}

//  this function handle the clear all history
function clearResults() {
  selectedResults.innerHTML = "";
  searchHistory = [];
  localStorage.removeItem("searchHistory");
  CheckHistory();
}

//  search and clear history events
searchInput.addEventListener("input", debounce(search, 100));
clearResultsButton.addEventListener("click", clearResults);
