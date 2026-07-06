const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

let ITEMS = [];
let cart = [];
let currentCategory = 'all';
let searchQuery = '';

function loadItems() {
    renderItems();
    updateCartUI();
}

function renderItems() {
    const grid = document.getElementById('itemsGrid');
    
    const filtered = ITEMS.filter(item => {
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
        const inCart = cart.some(c => c.id === item.id);
        const rarityClass = 'rarity-' + (item.rarity || 'common');
        const imageUrl = item.image || '';
        
        html += '<div class="item-card ' + rarityClass + '">';
        html += '<div class="item-image">';
        if (imageUrl) {
            html += '<img src="' + imageUrl + '" alt="' + item.name + '" onerror="this.parentElement.innerHTML='📦'">';
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
    
    const buttons = grid.querySelectorAll('.btn-add:not([disabled])');
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener('click', function(e) {
            const id = parseInt(this.getAttribute('data-id'));
            addToCart(id);
        });
    }
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
    searchQuery = document.getElementById('searchInput').value;
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
    const container = document.querySelector('.categories');
    if (container) {
        container.addEventListener('click', function(e) {
            const btn = e.target.closest('.category-btn');
            if (!btn) return;
            const allBtns = container.querySelectorAll('.category-btn');
            for (let j = 0; j < allBtns.length; j++) {
                allBtns[j].classList.remove('active');
            }
            btn.classList.add('active');
            currentCategory = btn.getAttribute('data-category');
            renderItems();
        });
    }
    
    const checkoutBtn = document.querySelector('.btn-checkout');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            checkout();
        });
    }
    
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            filterItems();
        });
    }
    
    loadItems();
    updateCartUI();
});
