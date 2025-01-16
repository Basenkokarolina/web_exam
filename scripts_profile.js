"use strict";

const key = "?api_key=5015589a-1038-4e45-a392-49a5db29cef2";

function getListDishes(order, dishes) {
    let stringDishes = "";
    const dishesType = ["soup_id", "main_course_id", "salad_id", "drink_id", "dessert_id"];
    dishesType.forEach(type => {
        if (order[type] !== null) {
            stringDishes += `${dishes.find(dish => dish.id === order[type]).name}, `;
        }
    });
    return stringDishes;
}

function getOneDish(dishes, dish_id) {
    if (dish_id === null) {
        return "";
    }
    return `${dishes.find(dish => dish.id === dish_id).name} (${dishes.find(dish => dish.id === dish_id).price}₽)`;
}

function getPriceDishes(order, dishes) {
    let dishesPrice = 0;
    const dishesType = ["soup_id", "main_course_id", "salad_id", "drink_id", "dessert_id"];
    dishesType.forEach(type => {
        if (order[type] !== null) {
            dishesPrice += dishes.find(dish => dish.id === order[type]).price;
        }
    });
    return dishesPrice;
}

function formatDate(inputDate) {
    const date = new Date(inputDate);

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day}.${month}.${year}`;
}

async function loadProducts() {
    try {
        const response = await fetch(`https://edu.std-900.ist.mospolytech.ru/exam-2024-1/api/goods${key}`);
        if (!response.ok) {
            throw new Error(`Ошибка загрузки: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
    }
}

async function loadOrders() {
    try {
        const response = await fetch(`https://edu.std-900.ist.mospolytech.ru/exam-2024-1/api/orders${key}`);
        if (!response.ok) {
            throw new Error(`Ошибка загрузки: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
    }
}


function initializeOrdersTable() {
    const orderRow = document.querySelector(".orders");
    let rowCounter = 1;
    loadProducts().then((products) => {
        loadOrders().then((orders) => {
            orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            orders.forEach(order => {
                let listOfProducts = "";
                let price = 0;
                order.good_ids.forEach((good_id) => {
                    products.forEach((product) => {
                        if (product.id === good_id) {
                            listOfProducts += product.name + ",<br>";
                            if (product.discount_price !== null) {
                                price += product.discount_price;
                            } else {
                                price += product.actual_price;
                            }
                        }
                    });
                });
                let disSum = 0;
                disSum += 200;
                const selectedDate = new Date(order.delivery_date);
                const dayOfWeek = selectedDate.getDay();
                if (dayOfWeek === 0 || dayOfWeek === 6) {
                    disSum += 300;
                } else if (order.delivery_interval === "18:00-22:00") {
                    disSum += 200;
                }
                price += disSum;
                listOfProducts.slice(0, -2);
                const trRow = document.createElement("tr");
                trRow.innerHTML = `
                    <td>${rowCounter}</td>
                    <td>${formatDate(order.created_at)}</td>
                    <td>${listOfProducts}</td>
                    <td>${price}₽</td>
                    <td>${formatDate(order.delivery_date)}<br>${order.delivery_interval}</td>
                    <td>
                      <span class="show" data-id="${order.id}">👁️</span>
                      <span class="edit" data-id="${order.id}">🖊️</span>
                      <span class="clear" data-id="${order.id}">🗑️</span>
                    </td>
                `;
                orderRow.append(trRow);
                rowCounter += 1;
            });
        });
    });
}

document.addEventListener("DOMContentLoaded", () => {
    initializeOrdersTable();
});