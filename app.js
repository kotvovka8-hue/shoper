const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

let ITEMS = [
  {
    "id": 3,
    "name": "Ice Phoenix",
    "category": "pets",
    "rarity": "godly",
    "year": 2017,
    "price": 19,
    "stock": 3,
    "image": "https://kotvovka8-hue.github.io/shoper/images/ice_phoenix_1783378948.jpg",
    "created": "2026-07-07T02:02:28.255498"
  }
];
let currentCategory = 'all';
let searchQuery = '';

function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function() {
            showToast('📋 Название скопировано! Отправьте его боту.');
        });
    } else {
        const el = document.createElement('textarea');
        el.value = text;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        showToast('📋 Название скопировано! Отправьте его боту.');
    }
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
        const rarityClass = 'rarity-' + (item.rarity || 'common');
        const imageUrl = item.image || '';
        
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
        html += '<div style="font-size:11px;color:#8888aa;margin-top:4px;">👆 Нажмите для копирования</div>';
        html += '</div>';
    }
    grid.innerHTML = html;
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
    toast._timeout = setTimeout(function() { toast.classList.remove('show'); }, 3000);
}

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

function setupSearch() {
    const input = document.getElementById('searchInput');
    if (!input) return;
    input.oninput = function() {
        filterItems();
    };
}

document.addEventListener('DOMContentLoaded', function() {
    setupCategories();
    setupSearch();
    renderItems();
    console.log('✅ Магазин загружен!');
});
