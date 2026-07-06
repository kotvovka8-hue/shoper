cat > app.js << 'EOF'
const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

console.log('✅ Telegram WebApp загружен!');
console.log('👤 User ID:', tg.initDataUnsafe?.user?.id);

document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOM загружен!');
    document.getElementById('itemsGrid').innerHTML = '<p style="text-align:center;padding:40px;color:#8888aa;">✅ Приложение работает!</p>';
    
    // Тест кнопок категорий
    var btns = document.querySelectorAll('.category-btn');
    console.log('🔘 Найдено кнопок:', btns.length);
    for (var i = 0; i < btns.length; i++) {
        btns[i].addEventListener('click', function() {
            console.log('🔘 Нажата категория:', this.textContent);
            alert('Нажата категория: ' + this.textContent);
        });
    }
});
EOF