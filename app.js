// ============================================================
// ИНИЦИАЛИЗАЦИЯ TELEGRAM
// ============================================================
const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

console.log('🚀 Приложение запущено!');

// ============================================================
// ДАННЫЕ
// ============================================================
let ITEMS = [];
let cart = [];
let currentCategory = 'all';
let searchQuery = '';

// ============================================================
// ЗАГРУЗКА ТОВАРОВ
// ============================================================
function loadItems() {
    console.log('📦 Загружаем товары...');
    tg.sendData(JSON.stringify({ action: 'get_items' }));
}

// Обработчик ответа от бота
tg.onEvent('web_app_data', function(data) {
    console.log('📩 Получены данные:', data.data);
    try {
        const items = JSON.parse(data.data);
        if (Array.isArray(items)) {
            ITEMS = items;
            console.log('✅ Загружено товаров:', ITEMS.length);
            renderItems();
            updateCartUI();
        } else {
            console.log('⚠️ Неверный формат данных');
            ITEMS = [];
            renderItems();
        }
    } catch (e) {
        console.error('❌ Ошибка парсинга:', e);
        ITEMS = [];
        renderItems();
    }
});

// ============================================================
// ОТОБРАЖЕНИЕ ТОВАРОВ
// ============================================================
function renderItems() {
    console.log('🎨 Рендерим товары...');
    const grid = document.getElementById('itemsGrid');
    if (!grid) {
        console.error('❌ Элемент itemsGrid не найден!');
        return;
    }
    
    // Фильтрация
    const filtered = ITEMS.filter(function(item) {
        const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchCategory = currentCategory === 'all' || item.category === currentCategory;
        const inStock = item.stock > 0;
        return matchSearch && matchCategory && inStock;
    });
    
    console.log('🔍 Отфильтровано:', filtered.length, 'из', ITEMS.length);
    
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
        html += '<button class="btn-add" data-id="' + item.id + '">';
        if (inCart) {
            html += '✅ В корзине';
        } else {
            html += '🛒 Добавить';
        }
        html += '</button>';
        html += '</div>';
    }
    grid.innerHTML = html;
    
    // Назначаем обработчики для кнопок "Добавить"
    const buttons = grid.querySelectorAll('.btn-add');
    console.log('🔘 Найдено кнопок добавления:', buttons.length);
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener('click', function(e) {
            e.stopPropagation();
            const id = parseInt(this.getAttribute('data-id'));
            console.log('🛒 Нажата кнопка добавления для ID:', id);
            addToCart(id);
        });
    }
}

// ============================================================
// КОРЗИНА
// ============================================================
function addToCart(itemId) {
    console.log('➕ Добавляем в корзину ID:', itemId);
    
    // Находим товар
    let item = null;
    for (let i = 0; i < ITEMS.length; i++) {
        if (ITEMS[i].id === itemId) {
            item = ITEMS[i];
            break;
        }
    }
    
    if (!item) {
        console.log('❌ Товар не найден!');
        return;
    }
    
    if (cart.some(function(c) { return c.id === itemId; })) {
        showToast('Уже в корзине');
        return;
    }
    
    cart.push({ id: item.id, name: item.name, price: item.price });
    console.log('🛒 В корзине:', cart.length, 'товаров');
    updateCartUI();
    renderItems();
    showToast(item.name + ' добавлен');
}

function updateCartUI() {
    const bar = document.getElementById('cartBar');
    const count = document.getElementById('cartCount');
    const total = document.getElementById('cartTotal');
    
    if (!bar || !count || !total) {
        console.error('❌ Элементы корзины не найдены!');
        return;
    }
    
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
    console.log('💳 Оформление заказа...');
    
    if (cart.length === 0) {
        showToast('Корзина пуста');
        return;
    }
    
    if (cart.length > 3) {
        showToast('Не более 3 предметов');
        return;
    }
    
    const items = cart.map(function(c) { return { name: c.name }; });
    console.log('📤 Отправляем заказ:', items);
    
    tg.sendData(JSON.stringify({
        action: 'order',
        items: items
    }));
    
    cart = [];
    updateCartUI();
    renderItems();
    showToast('Заказ оформлен!');
    
    setTimeout(function() {
        tg.close();
    }, 2000);
}

// ============================================================
// ПОИСК
// ============================================================
function filterItems() {
    const input = document.getElementById('searchInput');
    searchQuery = input ? input.value : '';
    console.log('🔍 Поиск:', searchQuery);
    renderItems();
}

// ============================================================
// TOAST УВЕДОМЛЕНИЯ
// ============================================================
function showToast(msg) {
    console.log('💬 Тоast:', msg);
    const toast = document.getElementById('toast');
    if (!toast) {
        console.error('❌ Элемент toast не найден!');
        return;
    }
    toast.textContent = msg;
    toast.className = 'toast show';
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(function() {
        toast.classList.remove('show');
    }, 2000);
}

// ============================================================
// КАТЕГОРИИ
// ============================================================
function setupCategories() {
    const container = document.querySelector('.categories');
    if (!container) {
        console.error('❌ Контейнер категорий не найден!');
        return;
    }
    
    console.log('🔘 Настраиваем категории...');
    const buttons = container.querySelectorAll('.category-btn');
    console.log('🔘 Найдено кнопок категорий:', buttons.length);
    
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener('click', function(e) {
            e.stopPropagation();
            console.log('🔘 Нажата категория:', this.textContent);
            
            // Убираем активный класс у всех
            const allBtns = container.querySelectorAll('.category-btn');
            for (let j = 0; j < allBtns.length; j++) {
                allBtns[j].classList.remove('active');
            }
            this.classList.add('active');
            
            currentCategory = this.getAttribute('data-category');
            console.log('📂 Категория:', currentCategory);
            renderItems();
        });
    }
}

// ============================================================
// КНОПКА ОФОРМЛЕНИЯ
// ============================================================
function setupCheckout() {
    const btn = document.querySelector('.btn-checkout');
    if (!btn) {
        console.error('❌ Кнопка оформления не найдена!');
        return;
    }
    
    console.log('💳 Настраиваем кнопку оформления...');
    btn.addEventListener('click', function(e) {
        e.stopPropagation();
        console.log('💳 Нажата кнопка оформления');
        checkout();
    });
}

// ============================================================
// ПОИСК
// ============================================================
function setupSearch() {
    const input = document.getElementById('searchInput');
    if (!input) {
        console.error('❌ Поле поиска не найдено!');
        return;
    }
    
    console.log('🔍 Настраиваем поиск...');
    input.addEventListener('input', function(e) {
        console.log('🔍 Поиск:', this.value);
        filterItems();
    });
}

// ============================================================
// ЗАПУСК
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOM загружен!');
    
    // Настраиваем все элементы
    setupCategories();
    setupCheckout();
    setupSearch();
    
    // Загружаем товары
    loadItems();
    updateCartUI();
    
    console.log('✅ Приложение готово!');
});

// Отлавливаем ошибки
window.onerror = function(msg, url, line, col, error) {
    console.error('❌ Ошибка:', msg, 'в строке:', line);
    return false;
};

console.log('✅ Скрипт загружен!');
