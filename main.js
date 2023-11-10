const cardContainerEl = document.querySelector(".cards-wrapper");
const formEl = document.getElementById("filtros");
const tagsEl = document.getElementById("tags");
const paginationEl = document.getElementById("pagination");

const tags = ['2d', '3d', 'action', 'action-rpg', 'anime', 'battle-royale', 'card', 'fantasy', 'fighting', 'first-person', 'flight', 'horror', 'low-spec', 'martial-arts', 'military', 'mmo', 'mmofps', 'mmorts', 'mmorpg', 'mmotps', 'moba', 'open-world', 'pve', 'pvp', 'permadeath', 'pixel', 'racing', 'sandbox', 'sailing', 'sci-fi', 'shooter', 'side-scroller', 'social', 'space', 'sports', 'strategy', 'superhero', 'survival', 'tank', 'third-Person', 'top-down', 'turn-based', 'voxel', 'zombie'];

// Docs de la API: https://www.freetogame.com/api-doc
const API_URL = 'https://free-to-play-games-database.p.rapidapi.com/api';

let games = [];

window.onload = () => {
    getData();
}

let currentPage = 0;
let maxCount = 15;

// Se crean los checkbox de las categorías
tags.forEach(tag => {
    const container = document.createElement("div");
    container.classList.add("input-container");

    const name = "tag_" + tag;
    const input = document.createElement("input");
    input.type = "checkbox";
    input.value = tag;
    input.name = "category";
    input.id = name;

    const label = document.createElement("label");
    label.htmlFor = name;
    label.textContent = tag;

    container.append(input, label);
    tagsEl.appendChild(container);
});

formEl.addEventListener("submit", (e) => {
    e.preventDefault();
    const result = {};
    // Se obtienen los datos del formulario y se guardan en un objeto
    const data = new FormData(formEl);
    for (const entry of data.entries()) {
        const [key, value] = entry;
        result[key] ? result[key].push(value) : result[key] = [value];
    }
    // La API tiene paths distintos si se filtra por una o más categorías
    const path =  result.category?.length > 1 ? "filter" : "games";
    let query = Object.keys(result).map(key => key + '=' + result[key].join(".")).join("&"); 
    if (path === "filter") query = query.replace('category', 'tag');
    getData(path, query);
});

// Obtención de juegos de la API
async function getData(path, query) {
    const url = query ? `${API_URL}/${path}?${query}` : API_URL + '/games';
    // Proxy para evitar el error de CORS
    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': '1347b36a4fmsh51e1008dbe358acp1d8e93jsn27717e92c222',
            'X-RapidAPI-Host': 'free-to-play-games-database.p.rapidapi.com'
        }
    };
    const data = await fetch(url, options);
    games = await data.json();
    createPagination();
    renderGames();
}

function createPagination() {
    // Crea las páginas para navegar entre los juegos
    // La API no tiene forma de pedir una cantidad específica de juegos (trae todos los que encuentra), así que se hace la paginación manualmente
    currentPage = 0;
    paginationEl.innerHTML = "";

    if(games.length >= maxCount) {
        const pages = Math.ceil(games.length / maxCount);
        const pagination = document.createElement("div");
        pagination.classList.add("pagination");
        for (let i = 0; i < pages; i++) {
            const page = document.createElement("span");
            page.classList.add("page");
            page.textContent = i + 1;
            page.addEventListener("click", () => {
                cardContainerEl.scrollIntoView();
                currentPage = i;
                renderGames();
            });
            pagination.append(page);
        }
        paginationEl.appendChild(pagination);
    }
}

function renderGames() {
    cardContainerEl.innerHTML = "";
    // Si no se encontraron juegos se devuelve un objeto con status 0
    if (games.status === 0) {
        const mensaje = document.createElement("div");
        mensaje.classList.add("mensaje");
        mensaje.textContent = "No se encontraron juegos que cumplan con los filtros seleccionados";
        cardContainerEl.append(mensaje);
        return;
    }
    const start = currentPage * maxCount;
    const end = start + maxCount;
    for (let i = start; i < end; i++) {
        const game = games[i];
        if (game) {
            const card = createCard(game);
            cardContainerEl.append(card);
        }
    }
    const cardDescriptions = document.querySelectorAll(".card-description");
    cardDescriptions.forEach((element) => {
        element.addEventListener("wheel", (e) => {
            element.scrollBy(0, e.deltaY);
            e.preventDefault();
        });
    });
}

// Crea la tarjeta con info del juego
function createCard(game) {
    const card = document.createElement("div");
    card.classList.add("card");

    const imgContainer = document.createElement("div");
    imgContainer.classList.add("card-img-container");

    const img = document.createElement("img");
    img.classList.add("card-img");
    img.src = game.thumbnail;
    img.alt = "Imagen del juego " + game.title;

    imgContainer.append(img);

    const contentContainer = document.createElement("div");
    contentContainer.classList.add("card-content-container");

    const title = document.createElement("h3");
    title.classList.add("card-title");
    title.textContent = game.title;

    const description = document.createElement("p");
    description.classList.add("card-description");
    description.textContent = game.short_description;

    const genrePlatformContainer = document.createElement("div");
    genrePlatformContainer.classList.add("card-genre-platform-container");

    const genre = document.createElement("span");
    genre.classList.add("card-genre");
    genre.textContent = game.genre;

    const platform = document.createElement("p");
    platform.classList.add("card-platform");
    platform.textContent = game.platform;

    genrePlatformContainer.append(genre, platform);

    contentContainer.append(title, description, genrePlatformContainer);

    const verMasContainer = document.createElement("div");
    verMasContainer.classList.add("ver-mas-container");

    const lordIconLink = document.createElement("a");
    lordIconLink.classList.add("card-link");

    const lordIcon = document.createElement("lord-icon");
    lordIcon.src = "https://cdn.lordicon.com/mfmkufkr.json";
    lordIcon.setAttribute("trigger", "hover");
    lordIcon.setAttribute("colors", "primary:#ffffff");
    lordIcon.style.width = "20px";
    lordIcon.style.height = "20px";
    lordIcon.style.colors = "#ffffff";
    lordIcon.classList.add("card-link-icon");

    lordIconLink.appendChild(lordIcon);
    verMasContainer.appendChild(lordIconLink);

    card.append(imgContainer, contentContainer, verMasContainer);
    return card;
}


//al presionar el div con clase filter-header quiero que el formulario con clase filtros pase a tener la propiedad display flex
const filterHeader = document.querySelector(".filter-header");
const filtros = document.querySelector(".filtrosDropdown");

filterHeader.addEventListener("click", () => {
    filtros.classList.toggle("show");
});