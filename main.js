const cardContainerEl = document.querySelector(".cards-wrapper");
const formEl = document.getElementById("filtros");
const tagsEl = document.getElementById("tags");
const paginationEl = document.getElementById("pagination");

const tags = ['2d', '3d', 'action', 'action-rpg', 'anime', 'battle-royale', 'card', 'fantasy', 'fighting', 'first-person', 'flight', 'horror', 'low-spec', 'martial-arts', 'military', 'mmo', 'mmofps', 'mmorts', 'mmorpg', 'mmotps', 'moba', 'open-world', 'pve', 'pvp', 'permadeath', 'pixel', 'racing', 'sandbox', 'sailing', 'sci-fi', 'shooter', 'side-scroller', 'social', 'space', 'sports', 'strategy', 'superhero', 'survival', 'tank', 'third-Person', 'top-down', 'turn-based', 'voxel', 'zombie'];
const plataformas = ['browser', 'pc', 'all'];
const sorting = [ 'release-date', 'popularity', 'alphabetical', 'relevance'];

const API_URL = 'https://free-to-play-games-database.p.rapidapi.com/api';

let games = [];

window.onload = () => {
    getData();
}

let currentPage = 0;
let maxCount = 12;

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
    const data = new FormData(formEl);
    for (const entry of data.entries()) {
        const [key, value] = entry;
        result[key] ? result[key].push(value) : result[key] = [value];
    }
    const path =  result.category?.length > 1 ? "filter" : "games";

    let query = Object.keys(result).map(key => key + '=' + result[key].join(".")).join("&");
    if (path === "filter") query = query.replace('category', 'tag');
    getData(path, query);
});

async function getData(path, query) {
    const url = query ? `${API_URL}/${path}?${query}` : API_URL + '/games';
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
            paginationEl.appendChild(pagination);
        }
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
}

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

    const title = document.createElement("h3");
    title.classList.add("card-title");
    title.textContent = game.title;

    const description = document.createElement("p");
    description.classList.add("card-description");
    description.textContent = game.short_description;

    const genre = document.createElement("span");
    genre.classList.add("card-genre");
    genre.textContent = game.genre;

    const detailContainer = document.createElement("div");
    detailContainer.classList.add("card-detail-container");

    const platform = document.createElement("p");
    platform.classList.add("card-platform");
    platform.textContent = game.platform;

    const link = document.createElement("a");
    link.classList.add("card-link");
    link.textContent = "Ver más";
    link.href = game.freetogame_profile_url;
    link.target = "_blank";

    detailContainer.append(platform, link);

    card.append(imgContainer, title, description, genre, detailContainer);
    return card;
}