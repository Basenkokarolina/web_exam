"use strict";

const key = "?api_key=5015589a-1038-4e45-a392-49a5db29cef2";
const STORAGE_KEY = "goods";

let currentPage = 0;
let filterName = "rating_asc";

async function loadPagesInfo(currentPage, perPage, filterName) {
    try {
        const response = await
        fetch(`https://edu.std-900.ist.mospolytech.ru/exam-2024-1/api/goods${key}&per_page=${perPage}&page=${currentPage}&sort_order=${filterName}`);
        if (!response.ok) {
            throw new Error(`Ошибка загрузки: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
    }
}

export function getArray() {
    const arrayString = localStorage.getItem(STORAGE_KEY);
    return arrayString ? arrayString.split(" ").filter(item => item !== "") : [];
}

export function saveArray(array) {
    localStorage.setItem(STORAGE_KEY, array.join(" "));
}

export function isInArray(item) {
    const array = getArray();
    return array.includes(item.toString());
}

export function addToArray(item) {
    const array = getArray();
    if (!array.includes(item)) {
        array.push(item);
        saveArray(array);
    }
}

function showPopup(text) {
    const popup = document.querySelector(".popup");
    popup.innerHTML = `
        <p>${text}</p>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="close-popup bi bi-x" viewBox="0 0 16 16">
            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
        </svg>
    `;
    const closePopup = document.querySelector(".close-popup");
    popup.style.display = "flex";
    setTimeout(() => {
        popup.style.display = "none";
    }, 5000);
    closePopup.addEventListener("click", () => {
        popup.style.display = "none";
    });
}

export function removeFromArray(item) {
    const array = getArray();
    const newArray = array.filter(element => element !== item);
    saveArray(newArray);
}

export function clearArray() {
    localStorage.removeItem(STORAGE_KEY);
}

async function loadOrders() {
    try {
        const response = await fetch(`https://edu.std-900.ist.mospolytech.ru/exam-2024-1/api/goods${key}`);
        if (!response.ok) {
            throw new Error(`Ошибка загрузки: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Ошибка при загрузке данных о заказах:", error);
    }
}

function createMenuItemCard(item) {
    const card = document.createElement("div");
    card.classList.add("every-dish");
    card.setAttribute("data-id", item.id);
    if (isInArray(item.id)) {
        card.classList.add("selected");
    }
    let stars = ``;
    let price = ``;
    for (let star = 0; star < Math.floor(item.rating); star++) {
        stars +=
        `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-star-fill" viewBox="0 0 16 16">
            <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
        </svg>`;
    }
    for (let star = 0; star < 5 - Math.floor(item.rating); star++) {
        stars +=
        `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-star" viewBox="0 0 16 16">
            <path d="M2.866 14.85c-.078.444.36.791.746.593l4.39-2.256 4.389 2.256c.386.198.824-.149.746-.592l-.83-4.73 3.522-3.356c.33-.314.16-.888-.282-.95l-4.898-.696L8.465.792a.513.513 0 0 0-.927 0L5.354 5.12l-4.898.696c-.441.062-.612.636-.283.95l3.523 3.356-.83 4.73zm4.905-2.767-3.686 1.894.694-3.957a.56.56 0 0 0-.163-.505L1.71 6.745l4.052-.576a.53.53 0 0 0 .393-.288L8 2.223l1.847 3.658a.53.53 0 0 0 .393.288l4.052.575-2.906 2.77a.56.56 0 0 0-.163.506l.694 3.957-3.686-1.894a.5.5 0 0 0-.461 0z"/>
        </svg>`;
    }
    if (item.discount_price !== null) {
        price = `
            <p class="discount-price">${item.discount_price}&#x20bd;</p>
            <p class="actual-price">${item.actual_price}&#x20bd;</p>
            <p class="percent-price">-${Math.floor((item.actual_price - item.discount_price) / item.actual_price * 100)}%</p>
        `;
    } else {
        price = `
            <p class="discount-price">${item.actual_price}&#x20bd;</p>
        `;
    }
    card.innerHTML = `
        <img src="${item.image_url}" alt="${item.name}">
        <p class="name">${item.name}</p>
        <div class="mark">
        </div>
        <div class="plus">
            <div class="mark">
                <div class="mark-number">
                    ${item.rating}
                </div>
                <div class="stars">
                    ${stars}
                </div>
            </div>
            <div class="price-container">
                ${price}
            </div>
            <button class="add-button">Добавить</button>
        </div>
    `;

    return card;
}

function displayMenu(orders) {
    const gridContainer = document.querySelector(".food-grid");
    orders.forEach(order => {
        const card = createMenuItemCard(order);
        gridContainer.append(card);
    });
    const buttons = document.querySelectorAll(".add-button");
    buttons.forEach(button => {
        button.addEventListener("click", (event) => {
            addToArray(event.target.closest(".every-dish").getAttribute("data-id"));
            console.log(getArray());
            event.target.closest(".every-dish").classList.add("selected");
            showPopup("Продукт добавлен в корзину");
        });
    });
}

function loadMore() {
    currentPage += 1;
    const loadMoreButton = document.querySelector(".load-more");
    loadPagesInfo(currentPage, 6, filterName).then((response) => {
        displayMenu(response.goods);
    });
    if (!(currentPage <= 16)) {
        loadMoreButton.style.display = "none";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadMore();
    const loadMoreButton = document.querySelector(".load-more");

    loadMoreButton.addEventListener("click", loadMore);
    const filter = document.getElementById("filter");
    filter.addEventListener("change", (event) => {
        filterName = event.target.value;
        currentPage = 0;
        loadMore();
        const gridContainer = document.querySelector(".food-grid");
        gridContainer.innerHTML = "";
    });
});