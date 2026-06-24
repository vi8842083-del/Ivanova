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

// ===== РАБОТА С ДАННЫМИ =====
function getUsers() {
    return JSON.parse(localStorage.getItem('users') || '[]');
}
function getRequests() {
    return JSON.parse(localStorage.getItem('requests') || '[]');
}
function saveRequests(requests) {
    localStorage.setItem('requests', JSON.stringify(requests));
}

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
        userErr.innerHTML = 'Введите логин';
        userErr.classList.remove('hidden');
        return;
    }
    if (!password) {
        passErr.innerHTML = 'Введите пароль';
        passErr.classList.remove('hidden');
        return;
    }

    const users = getUsers();
    const user = users.find(u => u.username === username);

    if (!user) {
        userErr.innerHTML = 'Пользователь не найден';
        userErr.classList.remove('hidden');
        return;
    }
    if (user.password !== password) {
        passErr.innerHTML = 'Неверный пароль';
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
        userErr.innerHTML = 'Логин минимум 3 символа';
        userErr.classList.remove('hidden');
        return;
    }
    if (!password || password.length < 6) {
        passErr.innerHTML = 'Пароль минимум 6 символов';
        passErr.classList.remove('hidden');
        return;
    }
    if (password !== password2) {
        pass2Err.innerHTML = 'Пароли не совпадают';
        pass2Err.classList.remove('hidden');
        return;
    }

    const users = getUsers();
    if (users.some(u => u.username === username)) {
        userErr.innerHTML = 'Этот логин уже занят';
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
// СОЗДАНИЕ ЗАЯВКИ
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
        text: 'Ваша заявка успешно создана.<br>Номер заявки: <strong>№' + newRequest.id + '</strong><br><br>Ожидайте подтверждения администратора.',
        confirmText: 'Перейти в кабинет',
        onConfirm: () => {
            window.location.href = 'dashboard.html';
        }
    });

    setTimeout(() => {
        const overlay = document.getElementById('modal-overlay');
        if (overlay && overlay.classList.contains('active')) {
            window.location.href = 'dashboard.html';
        }
    }, 5000);
}

// =========================================================
// ЗАЯВКИ В КАБИНЕТЕ
// =========================================================

function renderMyRequests() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (!currentUser.username) return;

    const requests = getRequests().filter(r => r.userId === currentUser.username);
    const list = document.getElementById('my-requests-list');
    if (!list) return;

    const totalEl = document.getElementById('total-requests');
    const activeEl = document.getElementById('active-requests');
    const completedEl = document.getElementById('completed-requests');
    if (totalEl) totalEl.textContent = requests.length;
    if (activeEl) activeEl.textContent = requests.filter(r => r.status === 'Новая' || r.status === 'В обработке').length;
    if (completedEl) completedEl.textContent = requests.filter(r => r.status === 'Завершена').length;

    if (requests.length === 0) {
        list.innerHTML = `
            <div class="empty-state animate-fade-in">
                <p>У вас пока нет заявок</p>
                <a href="request.html" class="btn btn-primary" style="margin-top: 14px;">
                    Создать первую заявку
                </a>
            </div>
        `;
        return;
    }

    requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    list.innerHTML = '<div class="requests-grid">' + requests.map(r => {
        const statusClass = r.status === 'Новая' ? 'status-new'
                          : r.status === 'В обработке' ? 'status-process'
                          : r.status === 'Завершена' ? 'status-done'
                          : 'status-cancel';
        const dateFormatted = new Date(r.startDate).toLocaleDateString('ru-RU', {
            day: '2-digit', month: 'long', year: 'numeric'
        });

        let reviewBlock = '';
        if (r.status === 'Завершена' && !r.review) {
            reviewBlock = `
                <div class="review-form">
                    <textarea id="review-${r.id}" placeholder="Поделитесь впечатлениями о обучении..."></textarea>
                    <div class="review-actions">
                        <button class="btn btn-sm btn-primary" onclick="submitReview(${r.id})">
                            Отправить отзыв
                        </button>
                    </div>
                </div>
            `;
        } else if (r.review) {
            reviewBlock = `
                <div class="review-display">
                    <strong>Ваш отзыв:</strong>
                    ${r.review}
                </div>
            `;
        }

        return `
            <div class="request-card animate-slide-up">
                <div class="request-card-header">
                    <h4>${r.transport}</h4>
                    <small>Заявка №${r.id}</small>
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
        text: 'Ваше мнение очень важно для нас',
        onConfirm: () => { renderMyRequests(); }
    });
}

// =========================================================
// ЗАЯВКИ В АДМИНКЕ
// =========================================================

function renderAdminRequests() {
    const requests = getRequests();
    const searchEl = document.getElementById('search-request');
    const statusEl = document.getElementById('filter-status');
    if (!searchEl || !statusEl) return;

    const search = searchEl.value.toLowerCase();
    const statusFilter = statusEl.value;

    const filtered = requests.filter(r => {
        const matchSearch = r.userName.toLowerCase().includes(search) ||
                           r.transport.toLowerCase().includes(search) ||
                           String(r.id).includes(search);
        const matchStatus = !statusFilter || r.status === statusFilter;
        return matchSearch && matchStatus;
    });

    const list = document.getElementById('admin-requests-list');
    if (!list) return;

    if (filtered.length === 0) {
        list.innerHTML = '<div class="empty-state animate-fade-in"><p>Заявки не найдены</p></div>';
        return;
    }

    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    list.innerHTML = filtered.map(r => {
        const dateFormatted = new Date(r.startDate).toLocaleDateString('ru-RU', {
            day: '2-digit', month: 'long', year: 'numeric'
        });
        const createdFormatted = new Date(r.createdAt).toLocaleDateString('ru-RU');

        let reviewBlock = '';
        if (r.review) {
            reviewBlock = `
                <div class="review-admin-display">
                    <strong>Отзыв от ${new Date(r.reviewDate).toLocaleDateString('ru-RU')}:</strong>
                    ${r.review}
                </div>
            `;
        }

        return `
            <div class="admin-request-card animate-slide-up">
                <div class="admin-request-info">
                    <h4>${r.userName} — ${r.transport}</h4>
                    <div class="admin-request-meta">
                        <span>Начало: ${dateFormatted}</span>
                        <span>${r.payment}</span>
                        <span>Создана: ${createdFormatted}</span>
                    </div>
                </div>
                <div class="admin-request-actions">
                    <select class="status-select" onchange="updateRequestStatus(${r.id}, this.value)">
                        <option value="Новая" ${r.status === 'Новая' ? 'selected' : ''}>Новая</option>
                        <option value="В обработке" ${r.status === 'В обработке' ? 'selected' : ''}>В обработке</option>
                        <option value="Завершена" ${r.status === 'Завершена' ? 'selected' : ''}>Завершена</option>
                        <option value="Отменена" ${r.status === 'Отменена' ? 'selected' : ''}>Отменена</option>
                    </select>
                    <button class="btn btn-sm btn-danger-outline" onclick="deleteRequest(${r.id})">
                        Удалить
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
                updateAdminStats();
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
            updateAdminStats();
            showModal({ type: 'success', title: 'Удалено', text: 'Заявка успешно удалена' });
        }
    });
}

function updateAdminStats() {
    const users = getUsers();
    const requests = getRequests();
    const totalUsersEl = document.getElementById('total-users');
    const totalRequestsEl = document.getElementById('total-requests');
    const pendingEl = document.getElementById('pending-requests');
    if (totalUsersEl) totalUsersEl.textContent = users.length;
    if (totalRequestsEl) totalRequestsEl.textContent = requests.length;
    if (pendingEl) pendingEl.textContent = requests.filter(r => r.status === 'Новая').length;
}

// =========================================================
// ПАРОЛЬ
// =========================================================

function togglePassword(inputId, btn) {
    const input = document.getElementById(inputId);
    if (input.type === 'password') {
        input.type = 'text';
        btn.textContent = '🔒';
    } else {
        input.type = 'password';
        btn.textContent = '👁';
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
    const title = document.getElementById('modal-title');
    const text = document.getElementById('modal-text');
    const actions = document.getElementById('modal-actions');

    const type = options.type || 'info';
    bar.className = 'modal-top-bar ' + type;
    title.textContent = options.title || '';
    text.innerHTML = options.text || '';
    actions.innerHTML = '';

    if (type === 'confirm') {
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'btn btn-secondary';
        cancelBtn.innerHTML = options.cancelText || 'Отмена';
        cancelBtn.onclick = () => {
            closeModal();
            if (options.onCancel) options.onCancel();
        };

        const confirmBtn = document.createElement('button');
        confirmBtn.className = 'btn btn-danger';
        confirmBtn.innerHTML = options.confirmText || 'Подтвердить';
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
        okBtn.innerHTML = options.confirmText || 'ОК';
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
// КУРСЫ (заглушки)
// =========================================================

function startCourse(id) {
    showModal({
        type: 'success',
        title: 'Курс начат!',
        text: 'Желаем успехов в обучении!',
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