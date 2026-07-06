// ================================================================
// 1. ИНИЦИАЛИЗАЦИЯ TELEGRAM WEB APP
// ================================================================

const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// ================================================================
// 2. ДАННЫЕ ТОВАРОВ
// ================================================================

const ITEMS = [
    // ===== НОЖИ =====
    { id: 1, name: 'Nightblade', category: 'knives', rarity: 'godly', year: 2020, price: 1500, stock: 5 },
    { id: 2, name: 'Clockwork', category: 'knives', rarity: 'godly', year: 2019, price: 1200, stock: 3 },
    { id: 3, name: 'Eternal', category: 'knives', rarity: 'godly', year: 2018, price: 1000, stock: 0 },
    { id: 4, name: 'Heartblade', category: 'knives', rarity: 'godly', year: 2016, price: 800, stock: 2 },
    { id: 5, name: 'Icebreaker', category: 'knives', rarity: 'godly', year: 2021, price: 2000, stock: 1 },
    { id: 6, name: 'Saw', category: 'knives', rarity: 'godly', year: 2018, price: 700, stock: 4 },
    { id: 7, name: 'Boneblade', category: 'knives', rarity: 'legendary', year: 2018, price: 400, stock: 6 },
    { id: 8, name: 'Corrupt', category: 'knives', rarity: 'legendary', year: 2017, price: 350, stock: 3 },
    { id: 9, name: 'Heat', category: 'knives', rarity: 'legendary', year: 2018, price: 300, stock: 5 },
    { id: 10, name: 'Seer', category: 'knives', rarity: 'legendary', year: 2016, price: 200, stock: 8 },
    { id: 11, name: 'Bioblade', category: 'knives', rarity: 'rare', year: 2018, price: 150, stock: 10 },
    { id: 12, name: 'Fang', category: 'knives', rarity: 'rare', year: 2017, price: 120, stock: 7 },
    { id: 13, name: 'Black', category: 'knives', rarity: 'common', year: 2015, price: 50, stock: 20 },
    { id: 14, name: 'Blue', category: 'knives', rarity: 'common', year: 2015, price: 50, stock: 15 },
    { id: 15, name: 'Red', category: 'knives', rarity: 'common', year: 2015, price: 50, stock: 18 },

    // ===== ПИСТОЛЕТЫ =====
    { id: 16, name: 'Luger', category: 'guns', rarity: 'godly', year: 2018, price: 1300, stock: 4 },
    { id: 17, name: 'Laser', category: 'guns', rarity: 'godly', year: 2018, price: 1100, stock: 2 },
    { id: 18, name: 'Darkbringer', category: 'guns', rarity: 'godly', year: 2019, price: 1800, stock: 3 },
    { id: 19, name: 'Lightbringer', category: 'guns', rarity: 'godly', year: 2019, price: 1600, stock: 1 },
    { id: 20, name: 'Old Glory', category: 'guns', rarity: 'godly', year: 2020, price: 900, stock: 5 },
    { id: 21, name: 'Blaster', category: 'guns', rarity: 'godly', year: 2019, price: 750, stock: 3 },
    { id: 22, name: 'Viper', category: 'guns', rarity: 'legendary', year: 2018, price: 350, stock: 6 },
    { id: 23, name: 'Spy', category: 'guns', rarity: 'legendary', year: 2019, price: 300, stock: 4 },
    { id: 24, name: 'Toxic', category: 'guns', rarity: 'rare', year: 2017, price: 150, stock: 8 },
    { id: 25, name: 'Patriot', category: 'guns', rarity: 'rare', year: 2019, price: 180, stock: 5 },
    { id: 26, name: 'Pistol', category: 'guns', rarity: 'common', year: 2015, price: 40, stock: 25 },

    // ===== ПИТОМЦЫ =====
    { id: 27, name: 'Fire Bunny', category: 'pets', rarity: 'godly', year: 2020, price: 2200, stock: 2 },
    { id: 28, name: 'Fire Cat', category: 'pets', rarity: 'godly', year: 2020, price: 2100, stock: 1 },
    { id: 29, name: 'Phoenix', category: 'pets', rarity: 'godly', year: 2020, price: 2500, stock: 0 },
    { id: 30, name: 'Ice Phoenix', category: 'pets', rarity: 'godly', year: 2020, price: 2300, stock: 3 },
    { id: 31, name: 'Sammy', category: 'pets', rarity: 'godly', year: 2020, price: 1800, stock: 2 },
    { id: 32, name: 'Deathspeaker', category: 'pets', rarity: 'godly', year: 2021, price: 2000, stock: 1 },
    { id: 33, name: 'Cat', category: 'pets', rarity: 'common', year: 2019, price: 60, stock: 30 },
    { id: 34, name: 'Dog', category: 'pets', rarity: 'common', year: 2019, price: 60, stock: 25 },
    { id: 35, name: 'Bunny', category: 'pets', rarity: 'common', year: 2019, price: 70, stock: 20 },
    { id: 36, name: 'Bear', category: 'pets', rarity: 'rare', year: 2019, price: 180, stock: 8 },
    { id: 37, name: 'Pumpkin', category: 'pets', rarity: 'common', year: 2018, price: 90, stock: 12 },
    { id: 38, name: 'Red Pumpkin', category: 'pets', rarity: 'legendary', year: 2018, price: 400, stock: 4 },
];

// ================================================================
// 3. СОСТОЯНИЕ ПРИЛОЖЕНИЯ
// ================================================================

let cart = [];
let currentCategory = 'all';
let searchQuery = '';

// ================================================================
// 4. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ================================================================

function getItemEmoji(item) {
    if (item.category === 'knives') return '🔪';
    if (item.category === 'guns') return '🔫';
    if (item.category === 'pets') return '🐾';
    return '📦';
}

// ================================================================
// 5. ОТОБРАЖЕНИЕ ТОВАРОВ
// ================================================================

function renderItems() {
    const grid = document.getElementById('itemsGrid');

    const filtered = ITEMS.filter(item => {
        const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchCategory = currentCategory === 'all' || item.category === currentCategory;
        return matchSearch && matchCategory;
    });

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1;">
                <div class="emoji">🔍</div>
                <p>Ничего не найдено</p>
                <p style="font-size: 14px; margin-top: 4px;">Попробуйте изменить поиск или категорию</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = filtered.map(item => {
        const inCart = cart.some(c => c.itemId === item.id);
        const stockStatus = item.stock > 0 ? `✅ В наличии: ${item.stock}` : '❌ Нет в наличии';
        const stockClass = item.stock > 0 ? '' : 'out';
        const rarityClass = `rarity-${item.rarity || 'common'}`;

        return `
            <div class="item-card ${rarityClass}">
                <div class="item-image">${getItemEmoji(item)}</div>
                <div class="item-name">${item.name}</div>
                <div class="item-year">${item.year || ''}</div>
                <div class="item-rarity">${item.rarity || 'Common'}</div>
                <div class="item-price">💰 ${item.price} ₽</div>
                <div class="item-stock ${stockClass}">${stockStatus}</div>
                <button class="btn-add"
                        onclick="addToCart(${item.id})"
                        ${item.stock < 1 || inCart ? 'disabled' : ''}>
                    ${inCart ? '✅ В корзине' : '🛒 Добавить'}
                </button>
            </div>
        `;
    }).join('');
}

// ================================================================
// 6. ФИЛЬТРАЦИЯ И ПОИСК
// ================================================================

function filterItems() {
    searchQuery = document.getElementById('searchInput').value.trim();
    renderItems();
}

// ================================================================
// 7. КАТЕГОРИИ (табы)
// ================================================================

document.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        currentCategory = this.dataset.category;
        renderItems();
    });
});

// ================================================================
// 8. КОРЗИНА
// ================================================================

function addToCart(itemId) {
    const item = ITEMS.find(i => i.id === itemId);
    if (!item || item.stock < 1) return;

    if (cart.some(c => c.itemId === itemId)) {
        showToast('⏳ Уже в корзине', 'error');
        return;
    }

    cart.push({ itemId: item.id, name: item.name, price: item.price });
    updateCartUI();
    renderItems();
    showToast(`✅ ${item.name} добавлен в корзину`, 'success');
}

function removeFromCart(itemId) {
    cart = cart.filter(c => c.itemId !== itemId);
    updateCartUI();
    renderItems();
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
    count.textContent = `🛒 ${cart.length} товаров`;
    const totalPrice = cart.reduce((sum, c) => sum + c.price, 0);
    total.textContent = `${totalPrice} ₽`;
}

// ================================================================
// 9. ОФОРМЛЕНИЕ ЗАКАЗА
// ================================================================

function checkout() {
    if (cart.length === 0) {
        showToast('❌ Корзина пуста', 'error');
        return;
    }

    const totalPrice = cart.reduce((sum, c) => sum + c.price, 0);
    const itemsList = cart.map(c => `• ${c.name} — ${c.price} ₽`).join('\n');

    // Проверяем наличие
    let outOfStock = false;
    cart = cart.filter(c => {
        const item = ITEMS.find(i => i.id === c.itemId);
        if (!item || item.stock < 1) {
            outOfStock = true;
            return false;
        }
        return true;
    });

    if (outOfStock) {
        showToast('⚠️ Некоторые товары закончились, обновите корзину', 'error');
        updateCartUI();
        renderItems();
        return;
    }

    // Отправляем данные боту
    const orderData = {
        items: cart,
        total: totalPrice,
        userId: tg.initDataUnsafe?.user?.id || 0,
        username: tg.initDataUnsafe?.user?.username || 'без username'
    };

    tg.sendData(JSON.stringify(orderData));

    showToast('✅ Заказ оформлен! Свяжитесь с продавцом.', 'success');

    cart = [];
    updateCartUI();
    renderItems();

    setTimeout(() => {
        tg.close();
    }, 2000);
}

// ================================================================
// 10. TOAST-УВЕДОМЛЕНИЯ
// ================================================================

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'toast show ' + type;

    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
        toast.classList.remove('show');
    }, 2500);
}

// ================================================================
// 11. ПОДПИСКА НА ИЗМЕНЕНИЕ ТЕМЫ TELEGRAM
// ================================================================

tg.onEvent('themeChanged', function() {
    document.documentElement.style.setProperty('--bg-color', tg.themeParams.bg_color || '#0d0d1a');
    document.documentElement.style.setProperty('--text-color', tg.themeParams.text_color || '#ffffff');
    document.documentElement.style.setProperty('--hint-color', tg.themeParams.hint_color || '#8888aa');
    document.documentElement.style.setProperty('--link-color', tg.themeParams.link_color || '#48dbfb');
    document.documentElement.style.setProperty('--button-color', tg.themeParams.button_color || '#48dbfb');
    document.documentElement.style.setProperty('--button-text-color', tg.themeParams.button_text_color || '#0d0d1a');
    document.documentElement.style.setProperty('--secondary-bg-color', tg.themeParams.secondary_bg_color || '#16162e');
    document.documentElement.style.setProperty('--accent-text-color', tg.themeParams.accent_text_color || '#f5a623');
    document.documentElement.style.setProperty('--section-bg-color', tg.themeParams.section_bg_color || '#1a1a3e');
    document.documentElement.style.setProperty('--section-separator-color', tg.themeParams.section_separator_color || '#2a2a4a');
});

// ================================================================
// 12. ЗАГРУЗКА ПРИЛОЖЕНИЯ
// ================================================================

document.addEventListener('DOMContentLoaded', function() {
    renderItems();
    updateCartUI();
    console.log('🔪 MM2 Shop Mini App загружен!');
    console.log(`📦 Всего предметов: ${ITEMS.length}`);
});