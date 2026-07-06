const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

let ITEMS = [];
let cart = [];
let currentCategory = 'all';
let searchQuery = '';

// ============================================================
// ЗАГРУЗКА ТОВАРОВ
// ============================================================
function loadItems() {
    console.log('🔄 Загружаем товары...');
    tg.sendData(JSON.stringify({ action: 'get_items' }));
}

// Обработчик ответа от бота
tg.onEvent('web_app_data', function(data) {
    console.log('📦 Получены данные:', data.data);
    try {
        const items = JSON.parse(data.data);
        console.log('✅ Товары:', items);
        if (Array.isArray(items)) {
            ITEMS = items;
            renderItems();
            updateCartUI();
        } else {
            ITEMS = [];
            renderItems();
        }
    } catch (e) {
        console.error('❌ Ошибка:', e);
        ITEMS = [];
        renderItems();
    }
});

// ============================================================
// АВТОМАТИЧЕСКОЕ ОБНОВЛЕНИЕ
// ============================================================

document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        console.log('👁️ Обновляем...');
        loadItems();
    }
});

window.addEventListener('focus', function() {
    console.log('👁️ Фокус - обновляем...');
    loadItems();
});

// ============================================================
// ОТОБРАЖЕНИЕ ТОВАРОВ
// ============================================================
function renderItems() {
    const grid = document.getElementById('itemsGrid');
    
    console.log('🎨 Рендерим товары, всего:', ITEMS.length);
    
    const filtered = ITEMS.filter(item => {
        const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchCategory = currentCategory === 'all' || item.category === currentCategory;
        const inStock = item.stock > 0;
        return matchSearch && matchCategory && inStock;
    });
    
    console.log('🔍 Отфильтровано:', filtered.length);
    
    if (filtered.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px 20px;">
                <p style="font-size: 18px; margin-bottom: 20px;">🔍 В наличии пока нет предметов</p>
                <div style="display: flex; flex-direction: column; gap: 10px; align-items: center;">
                    <button onclick="openOrderModal()" style="padding: 14px 40px; border: none; border-radius: 12px; background: var(--button-color); color: var(--button-text-color); font-weight: 600; cursor: pointer;">
                        🔍 Не нашли нужный предмет? Закажите прямо сейчас!
                    </button>
                    <button onclick="loadItems()" style="padding: 10px 30px; border: 1px solid var(--section-separator-color); border-radius: 12px; background: transparent; color: var(--hint-color); font-weight: 500; cursor: pointer;">
                        🔄 Обновить
                    </button>
                </div>
                <p style="color: var(--hint-color); font-size: 12px; margin-top: 15px;">
                    Всего в базе: ${ITEMS.length} товаров
                </p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = filtered.map(item => {
        const inCart = cart.some(c => c.id === item.id);
        const rarityClass = `rarity-${item.rarity || 'common'}`;
        
        // Картинка теперь приходит с полным URL от бота
        const imageUrl = item.image || '';
        
        return `
            <div class="item-card ${rarityClass}">
                <div class="item-image">
                    ${imageUrl ? `<img src="${imageUrl}" alt="${item.name}" style="width:100%;height:100%;object-fit:contain;" onerror="this.parentElement.innerHTML='📦'">` : '📦'}
                </div>
                <div class="item-name">${item.name}</div>
                <div class="item-year">${item.year || ''}</div>
                <div class="item-rarity">${item.rarity || 'Common'}</div>
                <div class="item-price">💰 ${item.price} ₽</div>
                <div class="item-stock">✅ В наличии: ${item.stock}</div>
                <button class="btn-add" onclick="addToCart(${item.id})" ${inCart ? 'disabled' : ''}>
                    ${inCart ? '✅ В корзине' : '🛒 Добавить'}
                </button>
            </div>
        `;
    }).join('');
}

// ============================================================
// ПОИСК И КАТЕГОРИИ
// ============================================================
function filterItems() {
    searchQuery = document.getElementById('searchInput').value.trim();
    renderItems();
}

document.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        currentCategory = this.dataset.category;
        renderItems();
    });
});

// ============================================================
// КОРЗИНА
// ============================================================
function addToCart(itemId) {
    const item = ITEMS.find(i => i.id === itemId);
    if (!item || item.stock < 1) return;
    if (cart.some(c => c.id === itemId)) {
        showToast('Уже в корзине', 'error');
        return;
    }
    cart.push({ id: item.id, name: item.name, price: item.price });
    updateCartUI();
    renderItems();
    showToast(`${item.name} добавлен`, 'success');
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
    total.textContent = `${cart.reduce((s, c) => s + c.price, 0)} ₽`;
}

function checkout() {
    if (cart.length === 0) {
        showToast('Корзина пуста', 'error');
        return;
    }
    if (cart.length > 3) {
        showToast('Не более 3 предметов', 'error');
        return;
    }
    
    tg.sendData(JSON.stringify({
        action: 'order',
        items: cart.map(c => ({ name: c.name }))
    }));
    
    cart = [];
    updateCartUI();
    renderItems();
    showToast('Заказ оформлен!', 'success');
    setTimeout(() => tg.close(), 2000);
}

// ============================================================
// МОДАЛЬНОЕ ОКНО ЗАКАЗА
// ============================================================
function openOrderModal() {
    const modal = document.getElementById('orderModal');
    modal.classList.add('active');
    const list = document.getElementById('orderItemList');
    const outOfStock = ITEMS.filter(item => item.stock === 0);
    
    if (outOfStock.length === 0) {
        list.innerHTML = '<p style="text-align:center;color:var(--hint-color);padding:20px;">Все предметы есть в наличии</p>';
    } else {
        list.innerHTML = outOfStock.map(item => `
            <div onclick="addOrderToCart(${item.id})" style="padding:12px;background:var(--secondary-bg-color);border-radius:8px;margin-bottom:8px;cursor:pointer;display:flex;justify-content:space-between;align-items:center;">
                <span>${item.name}</span>
                <span style="color:var(--hint-color);font-size:12px;">${item.rarity}</span>
            </div>
        `).join('');
    }
}

function closeOrderModal() {
    document.getElementById('orderModal').classList.remove('active');
}

function addOrderToCart(itemId) {
    const item = ITEMS.find(i => i.id === itemId);
    if (!item) return;
    if (cart.some(c => c.id === itemId)) {
        showToast('Уже в корзине', 'error');
        return;
    }
    cart.push({ id: item.id, name: item.name, price: item.price });
    updateCartUI();
    closeOrderModal();
    showToast(`${item.name} добавлен`, 'success');
}

// ============================================================
// TOAST-УВЕДОМЛЕНИЯ
// ============================================================
function showToast(msg, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.className = `toast show ${type}`;
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => toast.classList.remove('show'), 2500);
}

// ============================================================
// ЗАПУСК ПРИ ЗАГРУЗКЕ СТРАНИЦЫ
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Страница загружена');
    loadItems();
    updateCartUI();
});