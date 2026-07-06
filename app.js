const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

let ITEMS = [];
let cart = [];
let currentCategory = 'all';
let searchQuery = '';

function loadItems() {
    tg.sendData(JSON.stringify({ action: 'get_items' }));
}

tg.onEvent('web_app_data', function(data) {
    try {
        const items = JSON.parse(data.data);
        if (Array.isArray(items)) {
            ITEMS = items;
            renderItems();
            updateCartUI();
        }
    } catch (e) {
        console.log('Ошибка:', e);
    }
});

function renderItems() {
    const grid = document.getElementById('itemsGrid');
    const filtered = ITEMS.filter(item => item.stock > 0);
    
    if (filtered.length === 0) {
        grid.innerHTML = '<p style="text-align:center;padding:20px;color:#8888aa;">Товаров пока нет</p>';
        return;
    }
    
    let html = '';
    for (let i = 0; i < filtered.length; i++) {
        const item = filtered[i];
        const inCart = cart.some(c => c.id === item.id);
        html += '<div class="item-card">';
        html += '<div class="item-image">📦</div>';
        html += '<div class="item-name">' + item.name + '</div>';
        html += '<div class="item-price">💰 ' + item.price + ' ₽</div>';
        html += '<div class="item-stock">✅ ' + item.stock + ' шт.</div>';
        if (inCart) {
            html += '<button class="btn-add" disabled>✅ В корзине</button>';
        } else {
            html += '<button class="btn-add" onclick="addToCart(' + item.id + ')">🛒 Добавить</button>';
        }
        html += '</div>';
    }
    grid.innerHTML = html;
}

function addToCart(itemId) {
    const item = ITEMS.find(i => i.id === itemId);
    if (!item) return;
    if (cart.some(c => c.id === itemId)) {
        showToast('Уже в корзине');
        return;
    }
    cart.push({ id: item.id, name: item.name, price: item.price });
    updateCartUI();
    renderItems();
    showToast(item.name + ' добавлен');
}

function updateCartUI() {
    const bar = document.getElementById('cartBar');
    const count = document.getElementById('cartCount');
    const total = document.getElementById('cartTotal');
    if (cart.length === 0) {
        bar.classList.remove('active');
        return;
    }
    bar.classList.add('active');
    count.textContent = '🛒 ' + cart.length + ' товаров';
    let sum = 0;
    for (let i = 0; i < cart.length; i++) {
        sum += cart[i].price;
    }
    total.textContent = sum + ' ₽';
}

function checkout() {
    if (cart.length === 0) {
        showToast('Корзина пуста');
        return;
    }
    if (cart.length > 3) {
        showToast('Не более 3 предметов');
        return;
    }
    tg.sendData(JSON.stringify({
        action: 'order',
        items: cart.map(c => ({ name: c.name }))
    }));
    cart = [];
    updateCartUI();
    renderItems();
    showToast('Заказ оформлен!');
    setTimeout(() => tg.close(), 2000);
}

function filterItems() {
    searchQuery = document.getElementById('searchInput').value.toLowerCase();
    renderItems();
}

function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.className = 'toast show';
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => toast.classList.remove('show'), 2000);
}

document.addEventListener('DOMContentLoaded', function() {
    loadItems();
    updateCartUI();
});