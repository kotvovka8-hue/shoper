// ================================================================
// 1. ИНИЦИАЛИЗАЦИЯ TELEGRAM WEB APP
// ================================================================

const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// ================================================================
// 2. ДАННЫЕ ТОВАРОВ (ЗАГРУЗКА С СЕРВЕРА)
// ================================================================

let ITEMS = [];
let cart = [];
let currentCategory = 'all';
let searchQuery = '';
let isOrderModalOpen = false;

// Загружаем данные с сервера бота
async function loadItems() {
    try {
        const response = await fetch('/api/items');
        ITEMS = await response.json();
        renderItems();
        updateCartUI();
    } catch (error) {
        console.error('Ошибка загрузки товаров:', error);
        // Используем данные по умолчанию
        ITEMS = [];
    }
}

// ================================================================
// 3. ОТОБРАЖЕНИЕ ТОВАРОВ
// ================================================================

function renderItems() {
    const grid = document.getElementById('itemsGrid');
    
    const filtered = ITEMS.filter(item => {
        const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchCategory = currentCategory === 'all' || item.category === currentCategory;
        // Показываем только товары с наличием > 0
        const inStock = item.stock > 0;
        return matchSearch && matchCategory && inStock;
    });
    
    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1;">
                <div class="emoji">🔍</div>
                <p>Ничего не найдено в наличии</p>
                <p style="font-size: 14px; margin-top: 8px; color: var(--hint-color);">
                    Попробуйте заказать недостающий предмет!
                </p>
                <button class="btn-order" onclick="openOrderModal()" style="margin-top: 16px; padding: 12px 30px; border: none; border-radius: 12px; background: var(--button-color); color: var(--button-text-color); font-weight: 600; cursor: pointer;">
                    🔍 Не нашли нужный предмет? Закажите прямо сейчас!
                </button>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = filtered.map(item => {
        const inCart = cart.some(c => c.id === item.id);
        const rarityClass = `rarity-${item.rarity || 'common'}`;
        const imageUrl = item.image ? `/${item.image}` : '';
        
        return `
            <div class="item-card ${rarityClass}">
                <div class="item-image">
                    ${imageUrl ? `<img src="${imageUrl}" alt="${item.name}" style="width: 100%; height: 100%; object-fit: contain;">` : getItemEmoji(item)}
                </div>
                <div class="item-name">${item.name}</div>
                <div class="item-year">${item.year || ''}</div>
                <div class="item-rarity">${item.rarity || 'Common'}</div>
                <div class="item-price">💰 ${item.price} ₽</div>
                <div class="item-stock">✅ В наличии: ${item.stock}</div>
                <button class="btn-add"
                        onclick="addToCart(${item.id})"
                        ${inCart ? 'disabled' : ''}>
                    ${inCart ? '✅ В корзине' : '🛒 Добавить'}
                </button>
            </div>
        `;
    }).join('');
    
    // Добавляем кнопку "Заказать" после списка
    const orderBtn = document.createElement('div');
    orderBtn.style.cssText = 'grid-column: 1/-1; text-align: center; margin-top: 20px;';
    orderBtn.innerHTML = `
        <button class="btn-order" onclick="openOrderModal()" style="padding: 14px 40px; border: none; border-radius: 12px; background: var(--button-color); color: var(--button-text-color); font-weight: 600; font-size: 16px; cursor: pointer;">
            🔍 Не нашли нужный предмет? Закажите прямо сейчас!
        </button>
    `;
    grid.appendChild(orderBtn);
}

// ================================================================
// 4. МОДАЛЬНОЕ ОКНО ЗАКАЗА
// ================================================================

function openOrderModal() {
    isOrderModalOpen = true;
    const modal = document.getElementById('orderModal');
    modal.classList.add('active');
    
    // Показываем только товары, которых нет в наличии
    const outOfStockItems = ITEMS.filter(item => item.stock === 0);
    
    const list = document.getElementById('orderItemList');
    if (outOfStockItems.length === 0) {
        list.innerHTML = '<p style="text-align: center; color: var(--hint-color); padding: 20px;">Все предметы есть в наличии!</p>';
    } else {
        list.innerHTML = outOfStockItems.map(item => `
            <div class="item-option" onclick="addOrderToCart(${item.id})" style="padding: 12px; background: var(--secondary-bg-color); border-radius: 8px; margin-bottom: 8px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; transition: 0.2s;">
                <span>${item.name}</span>
                <span style="color: var(--hint-color); font-size: 12px;">${item.rarity}</span>
            </div>
        `).join('');
    }
    
    // Кнопка закрытия
    document.querySelector('.modal-close').onclick = () => closeOrderModal();
}

function closeOrderModal() {
    isOrderModalOpen = false;
    document.getElementById('orderModal').classList.remove('active');
}

function addOrderToCart(itemId) {
    const item = ITEMS.find(i => i.id === itemId);
    if (!item) return;
    
    if (cart.some(c => c.id === itemId)) {
        showToast('⏳ Уже в корзине', 'error');
        return;
    }
    
    cart.push({
        id: item.id,
        name: item.name,
        price: item.price
    });
    
    updateCartUI();
    closeOrderModal();
    showToast(`✅ ${item.name} добавлен в корзину`, 'success');
}

// ================================================================
// 5. КОРЗИНА И ОФОРМЛЕНИЕ ЗАКАЗА
// ================================================================

function addToCart(itemId) {
    const item = ITEMS.find(i => i.id === itemId);
    if (!item || item.stock < 1) return;
    
    if (cart.some(c => c.id === itemId)) {
        showToast('⏳ Уже в корзине', 'error');
        return;
    }
    
    cart.push({
        id: item.id,
        name: item.name,
        price: item.price
    });
    
    updateCartUI();
    renderItems();
    showToast(`✅ ${item.name} добавлен в корзину`, 'success');
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

function checkout() {
    if (cart.length === 0) {
        showToast('❌ Корзина пуста', 'error');
        return;
    }
    
    if (cart.length > 3) {
        showToast('❌ Не более 3 предметов за раз!', 'error');
        return;
    }
    
    const orderData = {
        action: 'order',
        items: cart.map(c => ({ name: c.name })),
        total: cart.reduce((sum, c) => sum + c.price, 0),
        userId: tg.initDataUnsafe?.user?.id || 0,
        username: tg.initDataUnsafe?.user?.username || 'без username'
    };
    
    tg.sendData(JSON.stringify(orderData));
    
    cart = [];
    updateCartUI();
    renderItems();
    showToast('✅ Заказ оформлен!', 'success');
    
    setTimeout(() => {
        tg.close();
    }, 2000);
}

// ================================================================
// 6. ЗАГРУЗКА ПРИЛОЖЕНИЯ
// ================================================================

document.addEventListener('DOMContentLoaded', function() {
    loadItems();
    updateCartUI();
    
    // Подписываемся на изменение темы Telegram
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
});

console.log('🔪 MM2 Shop Mini App загружен!');
