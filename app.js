const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

let ITEMS = [
    {
        "id": 1,
        "name": "TestKnife",
        "category": "knives",
        "rarity": "godly",
        "year": 2024,
        "price": 100,
        "stock": 5,
        "image": ""
    }
];
let cart = [];
let currentCategory = 'all';
let searchQuery = '';

function loadItems() {
    renderItems();
    updateCartUI();
}

function renderItems() {
    const grid = document.getElementById('itemsGrid');
    if (!grid) return;
    
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
    
    let html = '';
    for (let i = 0; i < filtered.length; i++) {
        const item = filtered[i];
        const inCart = cart.some(function(c) { return c.id === item.id; });
        const rarityClass = 'rarity-' + (item.rarity || 'common');
        const imageUrl = item.image || '';
        
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
        html += '<button class="btn-add" onclick="addToCart(' + item.id + ')">';
        if (inCart) {
            html += '✅ В корзине';
        } else {
            html += '🛒 Добавить';
        }
        html += '</button>';
        html += '</div>';
    }
    grid.innerHTML = html;
}

function addToCart(itemId) {
    let item = null;
    for (let i = 0; i < ITEMS.length; i++) {
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
    const bar = document.getElementById('cartBar');
    const count = document.getElementById('cartCount');
    const total = document.getElementById('cartTotal');
    if (!bar || !count || !total) return;
    
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
        items: cart.map(function(c) { return { name: c.name }; })
    }));
    cart = [];
    updateCartUI();
    renderItems();
    showToast('Заказ оформлен!');
    setTimeout(function() { tg.close(); }, 2000);
}

function filterItems() {
    const input = document.getElementById('searchInput');
    searchQuery = input ? input.value : '';
    renderItems();
}

function showToast(msg) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.className = 'toast show';
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(function() { toast.classList.remove('show'); }, 2000);
}

// ========== КАТЕГОРИИ ==========
function setupCategories() {
    const container = document.querySelector('.categories');
    if (!container) {
        console.log('❌ Контейнер категорий не найден!');
        return;
    }
    
    const buttons = container.querySelectorAll('.category-btn');
    console.log('🔘 Найдено кнопок категорий:', buttons.length);
    
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('🔘 Нажата категория:', this.textContent);
            
            const allBtns = container.querySelectorAll('.category-btn');
            for (let j = 0; j < allBtns.length; j++) {
                allBtns[j].classList.remove('active');
            }
            this.classList.add('active');
            currentCategory = this.getAttribute('data-category');
            console.log('📂 Категория:', currentCategory);
            renderItems();
        };
    }
}

// ========== КНОПКА ОФОРМЛЕНИЯ ==========
function setupCheckout() {
    const btn = document.querySelector('.btn-checkout');
    if (!btn) {
        console.log('❌ Кнопка оформления не найдена!');
        return;
    }
    btn.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('💳 Оформление заказа');
        checkout();
    };
}

// ========== ПОИСК ==========
function setupSearch() {
    const input = document.getElementById('searchInput');
    if (!input) {
        console.log('❌ Поле поиска не найдено!');
        return;
    }
    input.oninput = function() {
        console.log('🔍 Поиск:', this.value);
        filterItems();
    };
}

// ========== ЗАПУСК ==========
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOM загружен!');
    setupCategories();
    setupCheckout();
    setupSearch();
    loadItems();
    updateCartUI();
    console.log('✅ Приложение готово!');
});

console.log('✅ Скрипт загружен!');
