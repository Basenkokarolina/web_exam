"use strict";

const key = "?api_key=5015589a-1038-4e45-a392-49a5db29cef2";

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

async function loadOrder(prId) {
    try {
        const response = await fetch(`https://edu.std-900.ist.mospolytech.ru/exam-2024-1/api/goods/${prId}${key}`);
        if (!response.ok) {
            throw new Error(`Ошибка загрузки: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Ошибка при загрузке данных о заказах:", error);
    }
}

async function formSend(order_id) {
    const form = document.querySelector(".form-modal");
    const formButton = document.querySelector(".btn-primary");
    const key = `?api_key=5015589a-1038-4e45-a392-49a5db29cef2`;
    const formData = new FormData(form);
    const date = new Date(form.delivery_date.value);
    const formattedDate = `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}`;
    formData.set("delivery_date", formattedDate);
    try {
        const response = await
        fetch(`https://edu.std-900.ist.mospolytech.ru/exam-2024-1/api/orders/${order_id}${key}`, {
            method: "PUT",
            body: formData
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error);
        }
        const result = await response.json();
        window.location.reload();
    } catch (error) {
        showPopup(`Ошибка при редактировании заказа: ${error}`, "error");
    }
}

async function formSendDelete(order_id) {
    const key = `?api_key=5015589a-1038-4e45-a392-49a5db29cef2`;
    try {
        const response = await
        fetch(`https://edu.std-900.ist.mospolytech.ru/exam-2024-1/api/orders/${order_id}${key}`, {
            method: "DELETE"
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error);
        }
        const result = await response.json();
        window.location.reload();
    } catch (error) {
        showPopup(`Ошибка при удалении заказа: ${error}`, "error");
    }
}

function formListener(order_id) {
    const form = document.querySelector(".form-modal");
    const formButton = document.querySelector(".btn-primary");
    formButton.addEventListener("click", (event) => {
        event.preventDefault();
        formSend(order_id).then();
    });
}

function updateTotalSum(prIds) {
    let totalSum = 0, disSum = 200;
    const currentSum = document.querySelector(".final-price");
    const deliveryInterval = document.getElementById("delivery-interval");
    const dateInput = document.getElementById("input-delivery-time");
    const promises = prIds.map((prId) =>{
        return loadOrder(prId).then(order => {
            if (order.discount_price !== null) {
                totalSum += order.discount_price;
            } else {
                totalSum += order.actual_price;
            }
        });
    });
    Promise.all(promises).then(() => {
        const selectedDate = new Date(dateInput.value);
        const dayOfWeek = selectedDate.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            disSum += 300;
        } else if (deliveryInterval.value === "18:00-22:00") {
            disSum += 200;
        }
        totalSum += disSum;
        currentSum.innerHTML = `
            ${totalSum}&#x20bd;
        `;
    });
}

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
                            listOfProducts += product.name.slice(0, 20) + "...,<br>";
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
                const showIcons = document.querySelectorAll(".show");
                showIcons.forEach(icon => {
                    icon.addEventListener("click", (event) => {
                        if (icon.getAttribute("data-id") === order.id.toString()) {
                            const modalShow = document.createElement("div");
                            modalShow.classList.add("modal");
                            modalShow.innerHTML = `
                                <div class="modal-content">
                                <div class="modal-header">
                                  <h2>Просмотр заказа</h2>
                                  <span class="close">&times;</span>
                                </div>
                                <div class="modal-body">
                                  <p><strong>Дата оформления:</strong> ${formatDate(order.created_at)}</p>
                                  <p><strong>Имя получателя:</strong> ${order.full_name}</p>
                                  <p><strong>Телефон:</strong> ${order.phone}</p>
                                  <p><strong>Email:</strong> ${order.email}</p>
                                  <p><strong>Адрес доставки:</strong> ${order.delivery_address}</p>
                                  <p><strong>Дата доставки:</strong> ${formatDate(order.delivery_date)}</p>
                                  <p><strong>Время доставки:</strong> ${order.delivery_interval}</p>
                                  <p><strong>Состав заказа:</strong><br>${listOfProducts}</p>
                                  <h3>Комментарий</h3>
                                  <p>${order.comment === null ? "Комментарий не указан" : order.comment}</p>
                                  <p><strong>Стоимость:</strong> ${price}₽</p>
                                </div>
                                <div class="modal-footer">
                                  <button class="btn-secondary">ОК</button>
                                </div>
                              </div>
                            `;
                            document.body.append(modalShow);
                            modalShow.style.display = "flex";

                            const buttonClose = document.querySelectorAll(".close");
                            const okButton = document.querySelectorAll(".btn-secondary");
                            buttonClose.forEach(button => {
                                button.addEventListener("click", () => {
                                    modalShow.remove();
                                });
                            });
                            okButton.forEach(button => {
                                button.addEventListener("click", () => {
                                    modalShow.remove();
                                });
                            });
                        }
                    });
                });

                const showEdits = document.querySelectorAll(".edit");
                showEdits.forEach(icon => {
                    icon.addEventListener("click", (event) => {
                        if (icon.getAttribute("data-id") === order.id.toString()) {
                            const modalShow = document.createElement("div");
                            modalShow.classList.add("modal");
                            document.body.append(modalShow);
                            modalShow.innerHTML = `
                                <div class="modal-content">
                                <div class="modal-header">
                                  <h2>Редактирование заказа</h2>
                                  <span class="close">&times;</span>
                                </div>
                                <form class="form-modal">
                                    <div class="modal-body">
                                      <div class="form-group">
                                        <label>Имя получателя</label>
                                        <input type="text" name="full_name" value="${order.full_name}">
                                      </div>
                                      <div class="form-group">
                                        <label>Телефон</label>
                                        <input type="tel" name="phone" value="${order.phone}">
                                      </div>
                                      <div class="form-group">
                                        <label>Email</label>
                                        <input type="email" name="email" value="${order.email}">
                                      </div>
                                      <div class="form-group">
                                        <label>Адрес доставки</label>
                                        <input type="text" name="delivery_address" value="${order.delivery_address}">
                                      </div>
                                      <div class="form-group">
                                        <label>Дата доставки</label>
                                        <input type="date" name="delivery_date" id="input-delivery-time" value="${order.delivery_date}">
                                      </div>
                                      <div class="form-group">
                                        <label>Время доставки</label>
                                        <select id="delivery-interval" name="delivery_interval">
                                          <option value="08:00-12:00" ${order.delivery_interval === "08:00-12:00" ? "selected" : ""}>08:00-12:00</option>
                                          <option value="12:00-14:00" ${order.delivery_interval === "12:00-14:00" ? "selected" : ""}>12:00-14:00</option>
                                          <option value="14:00-18:00" ${order.delivery_interval === "14:00-18:00" ? "selected" : ""}>14:00-18:00</option>
                                          <option value="18:00-22:00" ${order.delivery_interval === "18:00-22:00" ? "selected" : ""}>18:00-22:00</option>
                                        </select>
                                      </div>
                                      <div class="form-group">
                                        <p><strong>Стоимость:</strong></p>
                                        <p class="final-price">${price}₽</p>
                                      </div>
                                      <div class="form-group">
                                        <label>Комментарий</label>
                                        <textarea rows="2" name="comment">${order.comment === null ? "Комментарий не указан" : order.comment}</textarea>
                                      </div>
                                </div>
                                <div class="modal-footer">
                                  <button class="btn-secondary">Отмена</button>
                                  <button class="btn-primary">Сохранить</button>
                                </div>
                                </form>
                              </div>
                            `;
                            const deliveryInterval = document.getElementById("delivery-interval");
                            const dateInput = document.getElementById("input-delivery-time");
                            deliveryInterval.addEventListener("change", () => {
                                updateTotalSum(order.good_ids);
                            });
                            dateInput.addEventListener("change", () => {
                                updateTotalSum(order.good_ids);
                            });
                            modalShow.style.display = "flex";
                            formListener(order.id);

                            const buttonClose = document.querySelectorAll(".close");
                            const okButton = document.querySelectorAll(".btn-secondary");
                            buttonClose.forEach(button => {
                                button.addEventListener("click", () => {
                                    modalShow.remove();
                                });
                            });
                            okButton.forEach(button => {
                                button.addEventListener("click", () => {
                                    modalShow.remove();
                                });
                            });
                        }
                    });
                });

                const showClears = document.querySelectorAll(".clear");
                showClears.forEach(icon => {
                    icon.addEventListener("click", (event) => {
                        if (icon.getAttribute("data-id") === order.id.toString()) {
                            const modalShow = document.createElement("div");
                            modalShow.classList.add("modal");
                            document.body.append(modalShow);
                            modalShow.innerHTML = `
                                <div class="modal-content">
                                <div class="modal-header">
                                  <h2>Удаление заказа</h2>
                                  <span class="close">&times;</span>
                                </div>
                                <div class="modal-body">
                                  <p>Вы уверены, что хотите удалить заказ?</p>
                                </div>
                                <div class="modal-footer">
                                  <button class="btn-secondary">Отмена</button>
                                  <button class="btn-danger">Да</button>
                                </div>
                              </div>
                            `;
                            modalShow.style.display = "flex";

                            const buttonClose = document.querySelectorAll(".close");
                            const okButton = document.querySelectorAll(".btn-secondary");
                            const buttonDanger = document.querySelectorAll(".btn-danger");
                            buttonClose.forEach(button => {
                                button.addEventListener("click", () => {
                                    modalShow.remove();
                                });
                            });
                            okButton.forEach(button => {
                                button.addEventListener("click", () => {
                                    modalShow.remove();
                                });
                            });
                            buttonDanger.forEach(button => {
                                button.addEventListener("click", () => {
                                    formSendDelete(order.id).then();
                                });
                            });
                        }
                    });
                });
                rowCounter += 1;
            });
        });
    });
}

document.addEventListener("DOMContentLoaded", () => {
    initializeOrdersTable();
});