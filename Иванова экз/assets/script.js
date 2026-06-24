// =========================================================
// Пассажирам.РФ — Главный скрипт
// =========================================================

// ===== БАЗОВЫЙ ПУТЬ =====
function getBasePath() {
    const path = window.location.pathname;
    if (path.includes('/assets/pages/')) return '../../';
    if (path.includes('/assets/')) return '../';
    return '';
}

// ===== ИНИЦИАЛИЗАЦИЯ АДМИНА =====
function initDefaultAdmin() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const filteredUsers = users.filter(u => u.username !== 'admin' && u.username !== 'Admin26');
    filteredUsers.push({
        username: 'Admin26',
        password: 'Demo20',
        role: 'admin',
        fullName: 'Администратор',
        createdAt: new Date().toISOString()
    });
    localStorage.setItem('users', JSON.stringify(filteredUsers));
}

// ===== АВТОВХОД =====
function checkAutoLogin() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (!currentUser || !currentUser.username) return;

    const path = window.location.pathname;
    const isAuthPage = path.endsWith('index.html') ||
                       path.endsWith('register.html') ||
                       path.endsWith('/');

    if (isAuthPage) {
        const base = getBasePath();
        if (currentUser.role === 'admin') {
            window.location.href = base + 'assets/pages/admin.html';
        } else {
            window.location.href = base + 'assets/pages/dashboard.html';
        }
    }
}

// ===== РАБОТА С ПОЛЬЗОВАТЕЛЯМИ =====
function getUsers() {
    return JSON.parse(localStorage.getItem('users') || '[]');
}

// ===== РАБОТА С ЗАЯВКАМИ =====
function getRequests() {
    return JSON.parse(localStorage.getItem('requests') || '[]');
}
function saveRequests(requests) {
    localStorage.setItem('requests', JSON.stringify(requests));
}

// Иконки для видов транспорта
const transportIcons = {
    'Автобус':     'fa-solid fa-bus',
    'Трамвай':     'fa-solid fa-train-tram',
    'Метро':       'fa-solid fa-train-subway',
    'Троллейбус':  'fa-solid fa-train',
    'Такси':       'fa-solid fa-taxi',
    'Электробус':  'fa-solid fa-charging-station'
};

// =========================================================
// АВТОРИЗАЦИЯ
// =========================================================

function loginUser() {
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    const userErr = document.getElementById('login-user-error');
    const passErr = document.getElementById('login-pass-error');

    userErr.classList.add('hidden');
    passErr.classList.add('hidden');

    if (!username) {
        userErr.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Введите логин';
        userErr.classList.remove('hidden');
        return;
    }
    if (!password) {
        passErr.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Введите пароль';
        passErr.classList.remove('hidden');
        return;
    }

    const users = getUsers();
    const user = users.find(u => u.username === username);

    if (!user) {
        userErr.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Пользователь не найден';
        userErr.classList.remove('hidden');
        return;
    }
    if (user.password !== password) {
        passErr.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Неверный пароль';
        passErr.classList.remove('hidden');
        return;
    }

    localStorage.setItem('currentUser', JSON.stringify({
        username: user.username,
        role: user.role || 'student',
        fullName: user.fullName || user.username
    }));

    showModal({
        type: 'success',
        title: 'Вход выполнен!',
        text: 'Добро пожаловать, <strong>' + (user.fullName || user.username) + '</strong>!',
        confirmText: 'Перейти',
        onConfirm: () => {
            const base = getBasePath();
            if (user.role === 'admin') {
                window.location.href = base + 'assets/pages/admin.html';
            } else {
                window.location.href = base + 'assets/pages/dashboard.html';
            }
        }
    });
}

function registerUser() {
    const fullname = document.getElementById('reg-fullname').value.trim();
    const username = document.getElementById('reg-username').value.trim();
    const password = document.getElementById('reg-password').value;
    const password2 = document.getElementById('reg-password2').value;

    const userErr = document.getElementById('reg-user-error');
    const passErr = document.getElementById('reg-pass-error');
    const pass2Err = document.getElementById('reg-pass2-error');

    userErr.classList.add('hidden');
    passErr.classList.add('hidden');
    pass2Err.classList.add('hidden');

    if (!fullname) {
        showModal({ type: 'warning', title: 'Внимание', text: 'Введите ваше ФИО' });
        return;
    }
    if (!username || username.length < 3) {
        userErr.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Логин минимум 3 символа';
        userErr.classList.remove('hidden');
        return;
    }
    if (!password || password.length < 6) {
        passErr.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Пароль минимум 6 символов';
        passErr.classList.remove('hidden');
        return;
    }
    if (password !== password2) {
        pass2Err.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Пароли не совпадают';
        pass2Err.classList.remove('hidden');
        return;
    }

    const users = getUsers();
    if (users.some(u => u.username === username)) {
        userErr.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Этот логин уже занят';
        userErr.classList.remove('hidden');
        return;
    }

    const newUser = {
        username, password, fullName: fullname,
        role: 'student',
        createdAt: new Date().toISOString()
    };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify({
        username: newUser.username,
        role: newUser.role,
        fullName: newUser.fullName
    }));

    showModal({
        type: 'success',
        title: 'Регистрация успешна!',
        text: 'Аккаунт создан. Переходим в личный кабинет...',
        onConfirm: () => { window.location.href = 'dashboard.html'; }
    });
}

function logout() {
    showModal({
        type: 'confirm',
        title: 'Выход из аккаунта',
        text: 'Вы уверены, что хотите выйти?',
        confirmText: 'Выйти',
        cancelText: 'Отмена',
        onConfirm: () => {
            localStorage.removeItem('currentUser');
            const base = getBasePath();
            window.location.href = base + 'index.html';
        }
    });
}

// =========================================================
// ЗАЯВКИ — СОЗДАНИЕ
// =========================================================

function createRequest() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (!currentUser.username) {
        showModal({ type: 'error', title: 'Ошибка', text: 'Сначала войдите в аккаунт' });
        return;
    }

    const transportEl = document.querySelector('input[name="transport"]:checked');
    const dateEl = document.getElementById('start-date');
    const paymentEl = document.querySelector('input[name="payment"]:checked');

    if (!transportEl) {
        showModal({ type: 'warning', title: 'Внимание', text: 'Выберите вид транспорта' });
        return;
    }
    if (!dateEl.value) {
        showModal({ type: 'warning', title: 'Внимание', text: 'Выберите дату начала обучения' });
        return;
    }
    if (!paymentEl) {
        showModal({ type: 'warning', title: 'Внимание', text: 'Выберите способ оплаты' });
        return;
    }

    // Проверка даты
    const selectedDate = new Date(dateEl.value);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    if (selectedDate < tomorrow) {
        showModal({ type: 'error', title: 'Ошибка', text: 'Дата должна быть не раньше завтрашнего дня' });
        return;
    }

    const newRequest = {
        id: Date.now(),
        userId: currentUser.username,
        userName: currentUser.fullName || currentUser.username,
        transport: transportEl.value,
        startDate: dateEl.value,
        payment: paymentEl.value,
        status: 'Новая',
        review: '',
        createdAt: new Date().toISOString()
    };

    const requests = getRequests();
    requests.push(newRequest);
    saveRequests(requests);

    showModal({
        type: 'success',
        title: 'Заявка отправлена!',
        text: 'Ваша заявка успешно создана. Ожидайте подтверждения администратора.',
        confirmText: 'В личный кабинет',
        onConfirm: () => { window.location.href = 'dashboard.html'; }
    });
}

// =========================================================
// ЗАЯВКИ — В КАБИНЕТЕ ПОЛЬЗОВАТЕЛЯ
// =========================================================

function renderMyRequests() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (!currentUser.username) return;

    const requests = getRequests().filter(r => r.userId === currentUser.username);
    const list = document.getElementById('my-requests-list');

    // Обновляем статистику
    document.getElementById('total-requests').textContent = requests.length;
    document.getElementById('active-requests').textContent = requests.filter(r => r.status === 'Новая' || r.status === 'В обработке').length;
    document.getElementById('completed-requests').textContent = requests.filter(r => r.status === 'Завершена').length;

    if (requests.length === 0) {
        list.innerHTML = `
            <div class="empty-state animate-fade-in">
                <i class="fa-solid fa-inbox"></i>
                <p>У вас пока нет заявок</p>
                <a href="request.html" class="btn btn-primary" style="margin-top: 14px;">
                    <i class="fa-solid fa-plus"></i> Создать первую заявку
                </a>
            </div>
        `;
        return;
    }

    // Сортировка: новые сверху
    requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    list.innerHTML = '<div class="requests-grid">' + requests.map(r => {
        const statusClass = r.status === 'Новая' ? 'status-new'
                          : r.status === 'В обработке' ? 'status-process'
                          : r.status === 'Завершена' ? 'status-done'
                          : 'status-cancel';
        const icon = transportIcons[r.transport] || 'fa-solid fa-bus';
        const dateFormatted = new Date(r.startDate).toLocaleDateString('ru-RU', {
            day: '2-digit', month: 'long', year: 'numeric'
        });

        // Форма отзыва — только если статус "Завершена" и отзыва ещё нет
        let reviewBlock = '';
        if (r.status === 'Завершена' && !r.review) {
            reviewBlock = `
                <div class="review-form">
                    <textarea id="review-${r.id}" placeholder="Поделитесь впечатлениями о обучении..."></textarea>
                    <div class="review-actions">
                        <button class="btn btn-sm btn-primary" onclick="submitReview(${r.id})">
                            <i class="fa-solid fa-paper-plane"></i> Отправить отзыв
                        </button>
                    </div>
                </div>
            `;
        } else if (r.review) {
            reviewBlock = `
                <div class="review-display">
                    <strong><i class="fa-solid fa-comment"></i> Ваш отзыв:</strong>
                    ${r.review}
                </div>
            `;
        }

        return `
            <div class="request-card animate-slide-up">
                <div class="request-card-header">
                    <div class="request-transport-icon"><i class="${icon}"></i></div>
                    <div>
                        <h4>${r.transport}</h4>
                        <small>Заявка №${r.id}</small>
                    </div>
                </div>
                <div class="request-details">
                    <div class="request-detail">
                        <span class="request-detail-label">Дата начала</span>
                        <span class="request-detail-value">${dateFormatted}</span>
                    </div>
                    <div class="request-detail">
                        <span class="request-detail-label">Оплата</span>
                        <span class="request-detail-value">${r.payment}</span>
                    </div>
                </div>
                <div>
                    <span class="request-status ${statusClass}">
                        <i class="fa-solid fa-circle" style="font-size: 6px;"></i>
                        ${r.status}
                    </span>
                </div>
                ${reviewBlock}
            </div>
        `;
    }).join('') + '</div>';
}

// =========================================================
// ОТПРАВКА ОТЗЫВА
// =========================================================

function submitReview(requestId) {
    const textarea = document.getElementById('review-' + requestId);
    const text = textarea.value.trim();

    if (!text) {
        showModal({ type: 'warning', title: 'Внимание', text: 'Напишите текст отзыва' });
        return;
    }
    if (text.length < 10) {
        showModal({ type: 'warning', title: 'Внимание', text: 'Отзыв должен быть не короче 10 символов' });
        return;
    }

    const requests = getRequests();
    const request = requests.find(r => r.id === requestId);
    if (!request) return;

    request.review = text;
    request.reviewDate = new Date().toISOString();
    saveRequests(requests);

    showModal({
        type: 'success',
        title: 'Спасибо за отзыв!',
        text: 'Ваше мнение очень важно для нас 🙏',
        onConfirm: () => { renderMyRequests(); }
    });
}

// =========================================================
// ЗАЯВКИ — В АДМИНКЕ
// =========================================================

function renderAdminRequests() {
    const requests = getRequests();
    const search = document.getElementById('search-request').value.toLowerCase();
    const statusFilter = document.getElementById('filter-status').value;

    const filtered = requests.filter(r => {
        const matchSearch = r.userName.toLowerCase().includes(search) ||
                           r.transport.toLowerCase().includes(search) ||
                           String(r.id).includes(search);
        const matchStatus = !statusFilter || r.status === statusFilter;
        return matchSearch && matchStatus;
    });

    const list = document.getElementById('admin-requests-list');
    if (filtered.length === 0) {
        list.innerHTML = '<div class="empty-state animate-fade-in"><i class="fa-solid fa-inbox"></i><p>Заявки не найдены</p></div>';
        return;
    }

    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    list.innerHTML = filtered.map(r => {
        const icon = transportIcons[r.transport] || 'fa-solid fa-bus';
        const dateFormatted = new Date(r.startDate).toLocaleDateString('ru-RU', {
            day: '2-digit', month: 'long', year: 'numeric'
        });
        const createdFormatted = new Date(r.createdAt).toLocaleDateString('ru-RU');

        let reviewBlock = '';
        if (r.review) {
            reviewBlock = `
                <div class="review-admin-display">
                    <strong><i class="fa-solid fa-comment"></i> Отзыв от ${new Date(r.reviewDate).toLocaleDateString('ru-RU')}:</strong>
                    ${r.review}
                </div>
            `;
        }

        return `
            <div class="admin-request-card animate-slide-up">
                <div class="request-transport-icon"><i class="${icon}"></i></div>
                <div class="admin-request-info">
                    <h4>${r.userName} — ${r.transport}</h4>
                    <div class="admin-request-meta">
                        <span><i class="fa-solid fa-calendar"></i> Начало: ${dateFormatted}</span>
                        <span><i class="fa-solid fa-credit-card"></i> ${r.payment}</span>
                        <span><i class="fa-solid fa-clock"></i> Создана: ${createdFormatted}</span>
                    </div>
                </div>
                <div class="admin-request-actions">
                    <select class="status-select" onchange="updateRequestStatus(${r.id}, this.value)">
                        <option value="Новая" ${r.status === 'Новая' ? 'selected' : ''}>🟡 Новая</option>
                        <option value="В обработке" ${r.status === 'В обработке' ? 'selected' : ''}>🔵 В обработке</option>
                        <option value="Завершена" ${r.status === 'Завершена' ? 'selected' : ''}>🟢 Завершена</option>
                        <option value="Отменена" ${r.status === 'Отменена' ? 'selected' : ''}>🔴 Отменена</option>
                    </select>
                    <button class="btn btn-sm btn-danger-outline" onclick="deleteRequest(${r.id})">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
                ${reviewBlock}
            </div>
        `;
    }).join('');
}

function updateRequestStatus(requestId, newStatus) {
    const requests = getRequests();
    const request = requests.find(r => r.id === requestId);
    if (!request) return;

    const oldStatus = request.status;
    request.status = newStatus;
    saveRequests(requests);

    const statusMessages = {
        'В обработке': { type: 'info', text: 'Заявка взята в работу' },
        'Завершена': { type: 'success', text: 'Заявка завершена. Пользователь теперь может оставить отзыв.' },
        'Отменена': { type: 'error', text: 'Заявка отменена' },
        'Новая': { type: 'info', text: 'Статус сброшен на "Новая"' }
    };

    const msg = statusMessages[newStatus];
    if (msg) {
        showModal({
            type: msg.type,
            title: 'Статус изменён',
            text: msg.text,
            onConfirm: () => {
                renderAdminRequests();
                // Обновляем статистику
                const requests = getRequests();
                document.getElementById('total-requests').textContent = requests.length;
                document.getElementById('pending-requests').textContent = requests.filter(r => r.status === 'Новая').length;
            }
        });
    }
}

function deleteRequest(requestId) {
    showModal({
        type: 'confirm',
        title: 'Удалить заявку?',
        text: 'Это действие нельзя отменить.',
        confirmText: 'Удалить',
        cancelText: 'Отмена',
        onConfirm: () => {
            let requests = getRequests();
            requests = requests.filter(r => r.id !== requestId);
            saveRequests(requests);
            renderAdminRequests();
            const requestsNew = getRequests();
            document.getElementById('total-requests').textContent = requestsNew.length;
            document.getElementById('pending-requests').textContent = requestsNew.filter(r => r.status === 'Новая').length;
            showModal({ type: 'success', title: 'Удалено', text: 'Заявка успешно удалена' });
        }
    });
}

// =========================================================
// ПАРОЛЬ
// =========================================================

function togglePassword(inputId, btn) {
    const input = document.getElementById(inputId);
    const icon = btn.querySelector('i');
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// =========================================================
// МОДАЛЬНЫЕ ОКНА
// =========================================================

function showModal(options) {
    const overlay = document.getElementById('modal-overlay');
    if (!overlay) {
        alert(options.title + '\n\n' + options.text);
        if (options.onConfirm) options.onConfirm();
        return;
    }

    const bar = document.getElementById('modal-bar');
    const icon = document.getElementById('modal-icon');
    const title = document.getElementById('modal-title');
    const text = document.getElementById('modal-text');
    const actions = document.getElementById('modal-actions');

    const icons = {
        info:    'fa-solid fa-circle-info',
        success: 'fa-solid fa-circle-check',
        error:   'fa-solid fa-circle-xmark',
        warning: 'fa-solid fa-triangle-exclamation',
        confirm: 'fa-solid fa-circle-question'
    };

    const type = options.type || 'info';
    bar.className = 'modal-top-bar ' + type;
    icon.className = 'modal-icon ' + type;
    icon.innerHTML = '<i class="' + icons[type] + '"></i>';
    title.textContent = options.title || '';
    text.innerHTML = options.text || '';
    actions.innerHTML = '';

    if (type === 'confirm') {
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'btn btn-secondary';
        cancelBtn.innerHTML = '<i class="fa-solid fa-xmark"></i> ' + (options.cancelText || 'Отмена');
        cancelBtn.onclick = () => {
            closeModal();
            if (options.onCancel) options.onCancel();
        };

        const confirmBtn = document.createElement('button');
        confirmBtn.className = 'btn btn-danger';
        confirmBtn.innerHTML = '<i class="fa-solid fa-check"></i> ' + (options.confirmText || 'Подтвердить');
        confirmBtn.onclick = () => {
            closeModal();
            if (options.onConfirm) options.onConfirm();
        };

        actions.appendChild(cancelBtn);
        actions.appendChild(confirmBtn);
    } else {
        const okBtn = document.createElement('button');
        const btnClass = type === 'error' ? 'btn btn-danger'
                       : type === 'success' ? 'btn btn-success'
                       : type === 'warning' ? 'btn btn-warning'
                       : 'btn';
        okBtn.className = btnClass;
        okBtn.innerHTML = '<i class="fa-solid fa-check"></i> ОК';
        okBtn.onclick = () => {
            closeModal();
            if (options.onConfirm) options.onConfirm();
        };
        actions.appendChild(okBtn);
    }

    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const overlay = document.getElementById('modal-overlay');
    if (!overlay) return;
    overlay.classList.remove('active');
    document.body.style.overflow = '';
}

function closeModalOutside(e) {
    if (e.target === e.currentTarget) closeModal();
}

// =========================================================
// ЗАГЛУШКИ ДЛЯ КУРСОВ
// =========================================================

function startCourse(id) {
    showModal({
        type: 'success',
        title: 'Курс начат!',
        text: 'Желаем успехов в обучении! 🚀',
        onConfirm: () => {}
    });
}

// =========================================================
// ИНИЦИАЛИЗАЦИЯ
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
    initDefaultAdmin();
    checkAutoLogin();

    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); loginUser(); }
        });
    }

    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); registerUser(); }
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });
});