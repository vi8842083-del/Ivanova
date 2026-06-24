// =========================================================
// Пассажирам.РФ — Главный скрипт
// =========================================================

// ===== БАЗОВЫЙ ПУТЬ =====
function getBasePath() {
  const path = window.location.pathname;
  if (path.includes("/assets/pages/")) return "../../";
  if (path.includes("/assets/")) return "../";
  return "";
}

// ===== ИНИЦИАЛИЗАЦИЯ АДМИНА =====
function initDefaultAdmin() {
  const users = JSON.parse(localStorage.getItem("users") || "[]");

  // Удаляем старых админов (если есть)
  const filteredUsers = users.filter(
    (u) => u.username !== "admin" && u.username !== "Admin26",
  );

  // Добавляем нового админа с новыми данными
  filteredUsers.push({
    username: "Admin26",
    password: "Demo20",
    role: "admin",
    fullName: "Администратор",
    createdAt: new Date().toISOString(),
  });

  localStorage.setItem("users", JSON.stringify(filteredUsers));
}

// ===== АВТОВХОД =====
function checkAutoLogin() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
  if (!currentUser || !currentUser.username) return;

  const path = window.location.pathname;
  const isAuthPage =
    path.endsWith("index.html") ||
    path.endsWith("register.html") ||
    path.endsWith("/");

  if (isAuthPage) {
    const base = getBasePath();
    if (currentUser.role === "admin") {
      window.location.href = base + "assets/pages/admin.html";
    } else {
      window.location.href = base + "assets/pages/dashboard.html";
    }
  }
}

// ===== ПОЛУЧИТЬ ПОЛЬЗОВАТЕЛЕЙ =====
function getUsers() {
  return JSON.parse(localStorage.getItem("users") || "[]");
}

// =========================================================
// АВТОРИЗАЦИЯ
// =========================================================

function loginUser() {
  const username = document.getElementById("login-username").value.trim();
  const password = document.getElementById("login-password").value;

  const userErr = document.getElementById("login-user-error");
  const passErr = document.getElementById("login-pass-error");

  userErr.classList.add("hidden");
  passErr.classList.add("hidden");

  if (!username) {
    userErr.innerHTML =
      '<i class="fa-solid fa-circle-exclamation"></i> Введите логин';
    userErr.classList.remove("hidden");
    return;
  }
  if (!password) {
    passErr.innerHTML =
      '<i class="fa-solid fa-circle-exclamation"></i> Введите пароль';
    passErr.classList.remove("hidden");
    return;
  }

  const users = getUsers();
  const user = users.find((u) => u.username === username);

  if (!user) {
    userErr.innerHTML =
      '<i class="fa-solid fa-circle-exclamation"></i> Пользователь не найден';
    userErr.classList.remove("hidden");
    return;
  }
  if (user.password !== password) {
    passErr.innerHTML =
      '<i class="fa-solid fa-circle-exclamation"></i> Неверный пароль';
    passErr.classList.remove("hidden");
    return;
  }

  localStorage.setItem(
    "currentUser",
    JSON.stringify({
      username: user.username,
      role: user.role || "student",
      fullName: user.fullName || user.username,
    }),
  );

  showModal({
    type: "success",
    title: "Вход выполнен!",
    text:
      "Добро пожаловать, <strong>" +
      (user.fullName || user.username) +
      "</strong>!",
    confirmText: "Перейти",
    onConfirm: () => {
      const base = getBasePath();
      if (user.role === "admin") {
        window.location.href = base + "assets/pages/admin.html";
      } else {
        window.location.href = base + "assets/pages/dashboard.html";
      }
    },
  });
}

function registerUser() {
  const fullname = document.getElementById("reg-fullname").value.trim();
  const username = document.getElementById("reg-username").value.trim();
  const password = document.getElementById("reg-password").value;
  const password2 = document.getElementById("reg-password2").value;

  const userErr = document.getElementById("reg-user-error");
  const passErr = document.getElementById("reg-pass-error");
  const pass2Err = document.getElementById("reg-pass2-error");

  userErr.classList.add("hidden");
  passErr.classList.add("hidden");
  pass2Err.classList.add("hidden");

  if (!fullname) {
    showModal({ type: "warning", title: "Внимание", text: "Введите ваше ФИО" });
    return;
  }
  if (!username || username.length < 3) {
    userErr.innerHTML =
      '<i class="fa-solid fa-circle-exclamation"></i> Логин минимум 3 символа';
    userErr.classList.remove("hidden");
    return;
  }
  if (!password || password.length < 6) {
    passErr.innerHTML =
      '<i class="fa-solid fa-circle-exclamation"></i> Пароль минимум 6 символов';
    passErr.classList.remove("hidden");
    return;
  }
  if (password !== password2) {
    pass2Err.innerHTML =
      '<i class="fa-solid fa-circle-exclamation"></i> Пароли не совпадают';
    pass2Err.classList.remove("hidden");
    return;
  }

  const users = getUsers();
  if (users.some((u) => u.username === username)) {
    userErr.innerHTML =
      '<i class="fa-solid fa-circle-exclamation"></i> Этот логин уже занят';
    userErr.classList.remove("hidden");
    return;
  }

  const newUser = {
    username,
    password,
    fullName: fullname,
    role: "student",
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  localStorage.setItem("users", JSON.stringify(users));
  localStorage.setItem(
    "currentUser",
    JSON.stringify({
      username: newUser.username,
      role: newUser.role,
      fullName: newUser.fullName,
    }),
  );

  showModal({
    type: "success",
    title: "Регистрация успешна!",
    text: "Аккаунт создан. Переходим в личный кабинет...",
    onConfirm: () => {
      window.location.href = "dashboard.html";
    },
  });
}

function logout() {
  showModal({
    type: "confirm",
    title: "Выход из аккаунта",
    text: "Вы уверены, что хотите выйти?",
    confirmText: "Выйти",
    cancelText: "Отмена",
    onConfirm: () => {
      localStorage.removeItem("currentUser");
      const base = getBasePath();
      window.location.href = base + "index.html";
    },
  });
}

// ===== ПОКАЗАТЬ/СКРЫТЬ ПАРОЛЬ =====
function togglePassword(inputId, btn) {
  const input = document.getElementById(inputId);
  const icon = btn.querySelector("i");
  if (input.type === "password") {
    input.type = "text";
    icon.classList.remove("fa-eye");
    icon.classList.add("fa-eye-slash");
  } else {
    input.type = "password";
    icon.classList.remove("fa-eye-slash");
    icon.classList.add("fa-eye");
  }
}

// =========================================================
// МОДАЛЬНЫЕ ОКНА
// =========================================================

function showModal(options) {
  const overlay = document.getElementById("modal-overlay");
  if (!overlay) {
    alert(options.title + "\n\n" + options.text);
    if (options.onConfirm) options.onConfirm();
    return;
  }

  const bar = document.getElementById("modal-bar");
  const icon = document.getElementById("modal-icon");
  const title = document.getElementById("modal-title");
  const text = document.getElementById("modal-text");
  const actions = document.getElementById("modal-actions");

  const icons = {
    info: "fa-solid fa-circle-info",
    success: "fa-solid fa-circle-check",
    error: "fa-solid fa-circle-xmark",
    warning: "fa-solid fa-triangle-exclamation",
    confirm: "fa-solid fa-circle-question",
  };

  const type = options.type || "info";
  bar.className = "modal-top-bar " + type;
  icon.className = "modal-icon " + type;
  icon.innerHTML = '<i class="' + icons[type] + '"></i>';
  title.textContent = options.title || "";
  text.innerHTML = options.text || "";
  actions.innerHTML = "";

  if (type === "confirm") {
    const cancelBtn = document.createElement("button");
    cancelBtn.className = "btn btn-secondary";
    cancelBtn.innerHTML =
      '<i class="fa-solid fa-xmark"></i> ' + (options.cancelText || "Отмена");
    cancelBtn.onclick = () => {
      closeModal();
      if (options.onCancel) options.onCancel();
    };

    const confirmBtn = document.createElement("button");
    confirmBtn.className = "btn btn-danger";
    confirmBtn.innerHTML =
      '<i class="fa-solid fa-check"></i> ' +
      (options.confirmText || "Подтвердить");
    confirmBtn.onclick = () => {
      closeModal();
      if (options.onConfirm) options.onConfirm();
    };

    actions.appendChild(cancelBtn);
    actions.appendChild(confirmBtn);
  } else {
    const okBtn = document.createElement("button");
    const btnClass =
      type === "error"
        ? "btn btn-danger"
        : type === "success"
          ? "btn btn-success"
          : type === "warning"
            ? "btn btn-warning"
            : "btn";
    okBtn.className = btnClass;
    okBtn.innerHTML = '<i class="fa-solid fa-check"></i> ОК';
    okBtn.onclick = () => {
      closeModal();
      if (options.onConfirm) options.onConfirm();
    };
    actions.appendChild(okBtn);
  }

  overlay.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  const overlay = document.getElementById("modal-overlay");
  if (!overlay) return;
  overlay.classList.remove("active");
  document.body.style.overflow = "";
}

function closeModalOutside(e) {
  if (e.target === e.currentTarget) closeModal();
}

// =========================================================
// ФУНКЦИИ ДЛЯ DASHBOARD (заглушки)
// =========================================================

function continueCourse(id) {
  showModal({
    type: "info",
    title: "Загрузка курса",
    text: "Подготавливаем материалы... Скоро функционал будет доступен!",
    onConfirm: () => {},
  });
}

function startCourse(id) {
  showModal({
    type: "success",
    title: "Курс начат!",
    text: "Желаем успехов в обучении! 🚀",
    onConfirm: () => {},
  });
}

function viewCertificate(id) {
  showModal({
    type: "success",
    title: "Поздравляем!",
    text: "Вы успешно завершили курс. Сертификат готов к скачиванию!",
    confirmText: "Скачать PDF",
    onConfirm: () => {
      showModal({
        type: "info",
        title: "Скоро",
        text: "Функция скачивания будет добавлена позже",
      });
    },
  });
}

// =========================================================
// ИНИЦИАЛИЗАЦИЯ
// =========================================================
document.addEventListener("DOMContentLoaded", () => {
  initDefaultAdmin();
  checkAutoLogin();

  // Enter для форм
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        loginUser();
      }
    });
  }

  const registerForm = document.getElementById("register-form");
  if (registerForm) {
    registerForm.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        registerUser();
      }
    });
  }

  // Escape закрывает модалку
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
});
// =========================================================
// ЗАЯВКИ И ОТЗЫВЫ (ДОБАВИТЬ В КОНЕЦ ФАЙЛА)
// =========================================================

function getApplications() {
    return JSON.parse(localStorage.getItem("applications") || "[]");
}

function saveApplications(apps) {
    localStorage.setItem("applications", JSON.stringify(apps));
}

function submitRequest() {
    const transport = document.getElementById("req-transport").value;
    const date = document.getElementById("req-date").value;
    const payment = document.getElementById("req-payment").value;
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");

    if (!currentUser.username) {
        showModal({
            type: "error",
            title: "Ошибка",
            text: "Необходимо войти в систему"
        });
        return;
    }

    if (!date) {
        showModal({
            type: "warning",
            title: "Внимание",
            text: "Выберите дату начала обучения"
        });
        return;
    }

    const apps = getApplications();
    apps.push({
        id: Date.now(),
        username: currentUser.username,
        transport: transport,
        date: date,
        payment: payment,
        status: "Новая",
        review: ""
    });
    saveApplications(apps);

    showModal({
        type: "success",
        title: "Заявка отправлена!",
        text: "Дождитесь подтверждения от администратора.",
        onConfirm: () => {
            window.location.href = "dashboard.html";
        }
    });
}

function loadUserApplications() {
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
    const apps = getApplications();
    const userApps = apps.filter(a => a.username === currentUser.username);

    const container = document.getElementById("user-requests-list");
    if (!container) return;

    if (userApps.length === 0) {
        container.innerHTML = `<p class="text-muted" style="text-align:center; padding:20px;">У вас пока нет заявок</p>`;
        return;
    }

    container.innerHTML = userApps.map(app => `
        <div class="user-card animate-slide-up" style="margin-bottom:12px; padding:16px;">
            <div class="user-info" style="flex:1;">
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
                    <h4 style="font-size:16px;">${app.transport}</h4>
                    <span class="badge ${app.status === 'Новая' ? 'badge-student' : app.status === 'Идет обучение' ? 'badge-admin' : 'badge-protected'}">
                        ${app.status}
                    </span>
                </div>
                <p class="text-muted" style="margin:4px 0;">Дата: ${app.date}</p>
                <p class="text-muted" style="margin:0;">Оплата: ${app.payment}</p>

                ${app.status === 'Обучение завершено' ? `
                    <div style="margin-top:12px; border-top:1px solid var(--border); padding-top:12px;">
                        <label style="font-size:13px; font-weight:600; display:block; margin-bottom:6px;">Ваш отзыв:</label>
                        <textarea id="review-${app.id}" class="form-control" style="width:100%; min-height:60px; margin-bottom:8px;" placeholder="Оставьте отзыв о прохождении обучения...">${app.review || ''}</textarea>
                        <button class="btn btn-sm btn-primary" onclick="saveReview(${app.id})">
                            <i class="fa-solid fa-floppy-disk"></i> Сохранить отзыв
                        </button>
                    </div>
                ` : ''}
            </div>
        </div>
    `).join('');
}

function saveReview(id) {
    const apps = getApplications();
    const app = apps.find(a => a.id === id);
    const textarea = document.getElementById(`review-${id}`);
    if (app && textarea) {
        app.review = textarea.value;
        saveApplications(apps);
        showModal({
            type: "success",
            title: "Отзыв сохранён!",
            text: "Благодарим за обратную связь."
        });
    }
}