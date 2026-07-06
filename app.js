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
    
    const filtered = ITEMS.filter(function(item) {
        const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchCategory = currentCategory === 'all' || item.category === currentCategory;
        const inStock = item.stock > 0;
        return matchSearch && matchCategory && inStock;
    });
    
    if (filtered.length === 0) {
        grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px 20px;color:#8888aa;">🔍 Товаров не найдено</div>';
        return;
    }
    
    var html = '';
    for (var i = 0; i < filtered.length; i++) {
        var item = filtered[i];
        var inCart = cart.some(function(c) { return c.id === item.id; });
        var rarityClass = 'rarity-' + (item.rarity || 'common');
        var imageUrl = item.image || '';
        
        html += '<div class="item-card ' + rarityClass + '">';
        html += '<div class="item-image">';
        if (imageUrl) {
            html += '<img src="' + imageUrl + '" alt="' + item.name + '" onerror="this.parentElement.innerHTML=\'📦\'">';
        } else {
            html += '📦';
        }
        html += '</div>';
        html += '<div class="item-name">' + item.name + '</div>';
        html += '<div class="item-year">' + (item.year || '') + '</div>';
        html += '<div class="item-rarity">' + (item.rarity || 'Common') + '</div>';
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
    var item = null;
    for (var i = 0; i < ITEMS.length; i++) {
        if (ITEMS[i].id === itemId) {
            item = ITEMS[i];
            break;
        }
    }
    if (!item) return;
    if (cart.some(function(c) { return c.id === itemId; })) {
        showToast('Уже в корзине');
        return;
    }
    cart.push({ id: item.id, name: item.name, price: item.price });
    updateCartUI();
    renderItems();
    showToast(item.name + ' добавлен');
}

function updateCartUI() {
    var bar = document.getElementById('cartBar');
    var count = document.getElementById('cartCount');
    var total = document.getElementById('cartTotal');
    if (cart.length === 0) {
        bar.classList.remove('active');
        return;
    }
    bar.classList.add('active');
    count.textContent = '🛒 ' + cart.length + ' товаров';
    var sum = 0;
    for (var i = 0; i < cart.length; i++) {
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
    var items = [];
    for (var i = 0; i < cart.length; i++) {
        items.push({ name: cart[i].name });
    }
    tg.sendData(JSON.stringify({
        action: 'order',
        items: items
    }));
    cart = [];
    updateCartUI();
    renderItems();
    showToast('Заказ оформлен!');
    setTimeout(function() { tg.close(); }, 2000);
}

function filterItems() {
    searchQuery = document.getElementById('searchInput').value;
    renderItems();
}

function showToast(msg) {
    var toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.className = 'toast show';
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(function() { toast.classList.remove('show'); }, 2000);
}

// Кнопки категорий
document.addEventListener('DOMContentLoaded', function() {
    var btns = document.querySelectorAll('.category-btn');
    for (var i = 0; i < btns.length; i++) {
        btns[i].addEventListener('click', function() {
            var allBtns = document.querySelectorAll('.category-btn');
            for (var j = 0; j < allBtns.length; j++) {
                allBtns[j].classList.remove('active');
            }
            this.classList.add('active');
            currentCategory = this.getAttribute('data-category');
            renderItems();
        });
    }
    loadItems();
    updateCartUI();
});