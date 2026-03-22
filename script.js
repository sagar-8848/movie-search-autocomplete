// ? DOM ELEMENT

const input = document.querySelector("#searchInput");
const moviesList = document.querySelector("#movies");
const showMsg = document.querySelector(".show-msg");
const cache = new Map();

// ? states

let debounceId = null;
let controller = null;
let selectedIndex = -1;

// ? render part

function renderMovies(movies) {
  moviesList.innerHTML = "";
  selectedIndex = -1;
  clearMsg();

  movies.forEach((curMovie) => {
    let div = document.createElement("div");
    div.classList.add("card-container");

    let movieId = document.createElement("h2");
    movieId.classList.add("movieId");
    movieId.textContent = `IMDB Id : ${curMovie.imdbID}`;

    let img = document.createElement("img");
    img.src =
      curMovie.Poster !== "N/A"
        ? curMovie.Poster
        : "https://via.placeholder.com/300x400?text=No+Image";

    let p = document.createElement("p");
    p.textContent = curMovie.Title;

    // ? type and year

    let type = document.createElement("h3");
    type.classList.add("movieType");
    type.textContent = `Movie Type : ${curMovie.Type}`;

    let year = document.createElement("h4");
    year.classList.add("movieYear");
    year.textContent = `Year : ${curMovie.Year}`;

    div.appendChild(img);
    div.appendChild(movieId);
    div.appendChild(p);
    div.appendChild(type);
    div.appendChild(year);
    moviesList.appendChild(div);
  });
}

// ? handle Input and call api
async function handleInput(e) {
  let query = e.target.value.trim().toLowerCase();

  clearTimeout(debounceId);

  if (!query) {
    moviesList.innerHTML = "";
    setMsg("Start Typing to Search Movies... ");
    return;
  }

  if (cache.has(query)) {
    clearMsg();
    renderMovies(cache.get(query));
    return; // no need to call the API if the l is already exists.
  }

  debounceId = setTimeout(async () => {
    // ? controller part

    if (controller) {
      controller.abort();
    }

    controller = new AbortController();
    setMsg("Searching...");
    try {
      const res = await fetch(
        `https://www.omdbapi.com/?s=${query}&apikey=434b0c29`,
        { signal: controller.signal },
      );
      const data = await res.json();

      if (!data.Search) {
        clearResults();
        setMsg("No movie found, please try again.");
        return;
      }

      cache.set(query, data.Search);
      renderMovies(data.Search);
    } catch (err) {
      if (err.name === "AbortError") {
        console.log("user cancelled the previous request");
        return;
      }
      setMsg("Something went wrong!");
      console.log(err.message);
    }
  }, 500);
}

// * handle click

function handleClick(e) {
  let titleName = e.target
    .closest(".card-container")
    .querySelector("p").textContent;
  input.value = titleName;
  selectedIndex = -1;
  clearResults();
}

// * hanlde Navigation

function handleNavigation(e) {
  const allItems = moviesList.querySelectorAll(".card-container");

  if (e.key !== "ArrowUp" && e.key !== "ArrowDown" && e.key !== "Enter") return;
  e.preventDefault();

  if (allItems.length === 0) return;

  // * Arrow Down
  if (e.key === "ArrowDown") {
    selectedIndex = (selectedIndex + 1) % allItems.length;
    highlight(allItems);
  }

  // * Arrow up

  if (e.key === "ArrowUp") {
    selectedIndex--;
    if (selectedIndex === -1) selectedIndex = allItems.length - 1;
    highlight(allItems);
  }

  // * Enter key
  if (e.key === "Enter") {
    if (selectedIndex > -1 && allItems[selectedIndex]) {
      // * // ensure selected item exists in DOM (extra safety)
      let selectedTargetTitle =
        allItems[selectedIndex].querySelector("p").textContent;
      input.value = selectedTargetTitle;
      selectedIndex = -1;
      clearResults();
    }
  }
}

input.addEventListener("keydown", handleNavigation);
input.addEventListener("input", handleInput);
moviesList.addEventListener("click", handleClick);

function setMsg(msg) {
  showMsg.textContent = msg;
}

function clearMsg() {
  showMsg.textContent = "";
}

function clearResults() {
  moviesList.innerHTML = "";
}

function highlight(allItems) {
  if (selectedIndex >= 0) {
    allItems.forEach((curMovie) => curMovie.classList.remove("active"));
    allItems[selectedIndex].classList.add("active");

    const selectedItem = allItems[selectedIndex];

    selectedItem.scrollIntoView({
      block: "center",
      behavior: "smooth",
    });
  }
}


// ? default msg

setMsg("Start Typing to Search Movies... ");