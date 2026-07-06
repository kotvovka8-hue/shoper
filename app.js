const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

let ITEMS = [];
let cart = [];
let currentCategory = 'all';
let searchQuery = '';

// ============================================================
// КОПИРОВАНИЕ В БУФЕР
// ============================================================
function copyToClipboard(text) {
    console.log('📋 Копируем:', text);
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function() {
            showToast('📋 "' + text + '" скопирован! Отправьте боту.');
            console.log('✅ Скопировано через Clipboard API');
        }).catch(function(err) {
            console.log('❌ Ошибка Clipboard API:', err);
            fallbackCopy(text);
        });
    } else {
        fallbackCopy(text);
    }
}

function fallbackCopy(text) {
    try {
        const el = document.createElement('textarea');
        el.value = text;
        el.style.position = 'fixed';
        el.style.opacity = '0';
        el.style.pointerEvents = 'none';
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        showToast('📋 "' + text + '" скопирован! Отправьте боту.');
        console.log('✅ Скопировано через fallback');
    } catch (e) {
        console.log('❌ Ошибка fallback:', e);
        showToast('❌ Не удалось скопировать. Попробуйте вручную.');
    }
}

// ============================================================
// ЗАГРУЗКА ТОВАРОВ
// ============================================================
function loadItems() {
    console.log('🔄 Загружаем товары...');
    
    if (window.ITEMS && Array.isArray(window.ITEMS) && window.ITEMS.length > 0) {
        console.log('✅ Товары из глобальной переменной:', window.ITEMS.length);
        ITEMS = window.ITEMS;
        renderItems();
        updateCartUI();
        return;
    }
    
    try {
        tg.sendData(JSON.stringify({ action: 'get_items' }));
    } catch (e) {
        console.log('❌ Ошибка отправки:', e);
        showDemoItems();
    }
}

function showDemoItems() {
    console.log('📦 Показываем демо-товары');
    ITEMS = [
        {
            "id": 1,
            "name": "Nightblade",
            "category": "knives",
            "rarity": "godly",
            "year": 2020,
            "price": 1500,
            "stock": 5,
            "image": ""
        },
        {
            "id": 2,
            "name": "Luger",
            "category": "guns",
            "rarity": "godly",
            "year": 2019,
            "price": 1200,
            "stock": 3,
            "image": ""
        }
    ];
    renderItems();
    updateCartUI();
}

tg.onEvent('web_app_data', function(data) {
    console.log('📩 Получены данные от бота:', data.data);
    try {
        const items = JSON.parse(data.data);
        if (Array.isArray(items) && items.length > 0) {
            console.log('✅ Загружено товаров:', items.length);
            ITEMS = items;
            renderItems();
            updateCartUI();
        } else {
            console.log('⚠️ Товаров нет, показываем демо');
            showDemoItems();
        }
    } catch (e) {
        console.log('❌ Ошибка парсинга:', e);
        showDemoItems();
    }
});

// ============================================================
// ОТОБРАЖЕНИЕ ТОВАРОВ
// ============================================================
function renderItems() {
    const grid = document.getElementById('itemsGrid');
    if (!grid) {
        console.log('❌ Элемент itemsGrid не найден!');
        return;
    }
    
    console.log('🎨 Рендерим товары, всего:', ITEMS.length);
    
    const filtered = ITEMS.filter(function(item) {
        const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchCategory = currentCategory === 'all' || item.category === currentCategory;
        const inStock = item.stock > 0;
        return matchSearch && matchCategory && inStock;
    });
    
    console.log('🔍 Отфильтровано:', filtered.length);
    
    if (filtered.length === 0) {
        grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px 20px;color:#8888aa;">🔍 Товаров не найдено</div>';
        return;
    }
    
    let html = '';
    for (let i = 0; i < filtered.length; i++) {
        const item = filtered[i];
        const rarityClass = 'rarity-' + (item.rarity || 'common');
        const imageUrl = item.image || '';
        const inCart = cart.some(function(c) { return c.id === item.id; });
        
        html += '<div class="item-card ' + rarityClass + '" onclick="copyToClipboard(\'' + item.name.replace(/'/g, "\\'") + '\')" style="cursor:pointer;">';
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
            html += '<div style="font-size:11px;color:#5b9e5b;margin-top:4px;">✅ В корзине</div>';
        } else {
            html += '<div style="font-size:11px;color:#8888aa;margin-top:4px;">👆 Нажмите для копирования</div>';
        }
        html += '</div>';
    }
    grid.innerHTML = html;
}

// ============================================================
// КОРЗИНА
// ============================================================
function addToCartManually(itemName) {
    const item = ITEMS.find(function(i) { return i.name === itemName; });
    if (!item) {
        showToast('❌ Товар не найден');
        return;
    }
    if (cart.some(function(c) { return c.id === item.id; })) {
        showToast('Уже в корзине');
        return;
    }
    cart.push({ id: item.id, name: item.name, price: item.price });
    updateCartUI();
    renderItems();
    showToast('✅ ' + item.name + ' добавлен в корзину');
}

function removeFromCart(itemId) {
    cart = cart.filter(function(c) { return c.id !== itemId; });
    updateCartUI();
    renderItems();
    showToast('🗑️ Товар удален из корзины');
}

function clearCart() {
    cart = [];
    updateCartUI();
    renderItems();
    showToast('🗑️ Корзина очищена');
}

function getCartTotal() {
    let total = 0;
    for (let i = 0; i < cart.length; i++) {
        total += cart[i].price;
    }
    return total;
}

function updateCartUI() {
    const bar = document.getElementById('cartBar');
    const count = document.querySelector('.cart-count');
    const total = document.querySelector('.cart-total');
    
    if (!bar || !count || !total) return;
    
    if (cart.length === 0) {
        count.textContent = '🛒 0 товаров';
        total.textContent = '0 ₽';
        return;
    }
    
    count.textContent = '🛒 ' + cart.length + ' товаров';
    total.textContent = getCartTotal() + ' ₽';
}

// ============================================================
// ПОИСК
// ============================================================
function filterItems() {
    const input = document.getElementById('searchInput');
    searchQuery = input ? input.value : '';
    renderItems();
}

// ============================================================
// КАТЕГОРИИ
// ============================================================
function setupCategories() {
    const container = document.querySelector('.categories');
    if (!container) return;
    
    const buttons = container.querySelectorAll('.category-btn');
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].onclick = function(e) {
            e.preventDefault();
            const allBtns = container.querySelectorAll('.category-btn');
            for (let j = 0; j < allBtns.length; j++) {
                allBtns[j].classList.remove('active');
            }
            this.classList.add('active');
            currentCategory = this.getAttribute('data-category');
            renderItems();
        };
    }
}

// ============================================================
// TOAST УВЕДОМЛЕНИЯ
// ============================================================
function showToast(msg) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.className = 'toast show';
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(function() {
        toast.classList.remove('show');
    }, 3000);
}

// ============================================================
// ОБНОВЛЕНИЕ ТОВАРОВ ИЗ ГЛОБАЛЬНОЙ ПЕРЕМЕННОЙ
// ============================================================
window.updateItems = function(newItems) {
    if (Array.isArray(newItems)) {
        ITEMS = newItems;
        renderItems();
        updateCartUI();
        console.log('🔄 Товары обновлены:', ITEMS.length);
    }
};

// ============================================================
// ЗАПУСК
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOM загружен!');
    setupCategories();
    
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.oninput = function() {
            filterItems();
        };
    }
    
    loadItems();
    updateCartUI();
    console.log('✅ Магазин готов!');
    console.log('📱 Telegram WebApp:', tg ? 'доступен' : 'недоступен');
});