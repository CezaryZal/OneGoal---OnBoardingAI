const LEGACY_GOALS_KEY = "daily-goals-v1";
const USERS_KEY = "daily-goals-users-v1";
const SESSION_KEY = "daily-goals-session-v1";

const dateFormatter = new Intl.DateTimeFormat("pl-PL", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

const shortDateFormatter = new Intl.DateTimeFormat("pl-PL", {
  day: "2-digit",
  month: "short",
});

const weekdayFormatter = new Intl.DateTimeFormat("pl-PL", {
  weekday: "short",
});

const state = {
  users: loadUsers(),
  currentUserId: loadSession(),
  authMode: "login",
  goals: {},
  selectedDate: toDateKey(new Date()),
  editingDate: null,
  toastTimeoutId: null,
};

const elements = {
  todayLabel: document.querySelector("#todayLabel"),
  layout: document.querySelector(".layout"),
  historyPanel: document.querySelector(".history-panel"),
  authPanel: document.querySelector("#authPanel"),
  authForm: document.querySelector("#authForm"),
  loginInput: document.querySelector("#loginInput"),
  passwordInput: document.querySelector("#passwordInput"),
  loginTab: document.querySelector("#loginTab"),
  registerTab: document.querySelector("#registerTab"),
  authSubmit: document.querySelector("#authSubmit"),
  authMessage: document.querySelector("#authMessage"),
  profileBar: document.querySelector("#profileBar"),
  currentUserLabel: document.querySelector("#currentUserLabel"),
  logoutButton: document.querySelector("#logoutButton"),
  goalForm: document.querySelector("#goalForm"),
  goalInput: document.querySelector("#goalInput"),
  goalDate: document.querySelector("#goalDate"),
  saveGoalButton: document.querySelector("#saveGoalButton"),
  goalStatus: document.querySelector("#goalStatus"),
  currentGoal: document.querySelector("#currentGoal"),
  selectedDateLabel: document.querySelector("#selectedDateLabel"),
  goalText: document.querySelector("#goalText"),
  doneButton: document.querySelector("#doneButton"),
  missedButton: document.querySelector("#missedButton"),
  editButton: document.querySelector("#editButton"),
  clearButton: document.querySelector("#clearButton"),
  currentStreak: document.querySelector("#currentStreak"),
  bestStreak: document.querySelector("#bestStreak"),
  completionRate: document.querySelector("#completionRate"),
  weekScore: document.querySelector("#weekScore"),
  weekStrip: document.querySelector("#weekStrip"),
  historyList: document.querySelector("#historyList"),
  historyTemplate: document.querySelector("#historyItemTemplate"),
  toast: document.querySelector("#toast"),
};

init();

function init() {
  elements.todayLabel.textContent = formatDate(state.selectedDate);
  elements.goalDate.value = state.selectedDate;
  elements.loginTab.addEventListener("click", () => setAuthMode("login"));
  elements.registerTab.addEventListener("click", () => setAuthMode("register"));
  elements.authForm.addEventListener("submit", handleAuthSubmit);
  elements.logoutButton.addEventListener("click", logout);
  elements.goalDate.addEventListener("change", handleDateChange);
  elements.goalForm.addEventListener("submit", handleGoalSubmit);
  elements.doneButton.addEventListener("click", () => updateGoalStatus("done"));
  elements.missedButton.addEventListener("click", () => updateGoalStatus("missed"));
  elements.editButton.addEventListener("click", focusGoalForEdit);
  elements.clearButton.addEventListener("click", clearAllData);

  if (!getCurrentUser()) {
    state.currentUserId = null;
    saveSession();
  }

  loadGoalsForCurrentUser();
  render();
}

function handleAuthSubmit(event) {
  event.preventDefault();

  const login = normalizeLogin(elements.loginInput.value);
  const password = elements.passwordInput.value.trim();

  if (!login || !password) {
    showAuthMessage("Podaj login i hasło.");
    return;
  }

  if (state.authMode === "register") {
    registerUser(login, password);
    return;
  }

  loginUser(login, password);
}

function registerUser(login, password) {
  const existingUser = state.users.find((user) => user.login === login);

  if (existingUser) {
    showAuthMessage("Ten login jest już zajęty.");
    return;
  }

  const user = {
    id: createId(),
    profileName: login,
    login,
    password,
    createdAt: new Date().toISOString(),
    goals: state.users.length === 0 ? loadLegacyGoals() : {},
  };

  state.users.push(user);
  state.currentUserId = user.id;
  saveUsers();
  saveSession();
  clearAuthForm();
  loadGoalsForCurrentUser();
  render();
}

function loginUser(login, password) {
  const user = state.users.find((item) => item.login === login);

  if (!user || user.password !== password) {
    showAuthMessage("Nieprawidłowy login albo hasło.");
    return;
  }

  state.currentUserId = user.id;
  saveSession();
  clearAuthForm();
  loadGoalsForCurrentUser();
  render();
}

function logout() {
  state.currentUserId = null;
  state.goals = {};
  state.editingDate = null;
  saveSession();
  render();
}

function setAuthMode(mode) {
  state.authMode = mode;
  elements.loginTab.classList.toggle("active", mode === "login");
  elements.registerTab.classList.toggle("active", mode === "register");
  elements.authSubmit.textContent = mode === "login" ? "Zaloguj" : "Utwórz konto";
  elements.passwordInput.autocomplete = mode === "login" ? "current-password" : "new-password";
  showAuthMessage("");
}

function handleDateChange(event) {
  state.selectedDate = event.target.value || toDateKey(new Date());
  state.editingDate = null;
  render();
}

function handleGoalSubmit(event) {
  event.preventDefault();

  if (!getCurrentUser()) {
    showAuthMessage("Najpierw zaloguj się albo utwórz konto.");
    return;
  }

  const text = elements.goalInput.value.trim();
  const date = elements.goalDate.value || state.selectedDate;

  if (!text) {
    return;
  }

  const previous = state.goals[date];

  if (previous && state.editingDate !== date) {
    showToast("Ten dzień ma już zdefiniowany cel. Użyj przycisku Edytuj, żeby go zmienić.");
    return;
  }

  state.goals[date] = {
    id: previous?.id || createId(),
    userId: state.currentUserId,
    date,
    text,
    status: previous?.status || "pending",
    createdAt: previous?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  state.selectedDate = date;
  state.editingDate = null;
  saveGoals();
  render();
  elements.goalInput.value = "";
}

function updateGoalStatus(status) {
  const goal = state.goals[state.selectedDate];

  if (!goal) {
    return;
  }

  goal.status = status;
  goal.updatedAt = new Date().toISOString();
  saveGoals();
  render();
}

function focusGoalForEdit() {
  const goal = state.goals[state.selectedDate];

  if (!goal) {
    return;
  }

  state.editingDate = state.selectedDate;
  elements.goalInput.value = goal.text;
  elements.goalInput.focus();
  render();
}

function clearAllData() {
  const confirmed = window.confirm("Czy na pewno chcesz usunąć wszystkie cele tego użytkownika?");

  if (!confirmed) {
    return;
  }

  state.goals = {};
  state.editingDate = null;
  saveGoals();
  render();
}

function render() {
  const currentUser = getCurrentUser();
  const selectedGoal = state.goals[state.selectedDate];

  elements.authPanel.hidden = Boolean(currentUser);
  elements.profileBar.hidden = !currentUser;
  elements.layout.hidden = !currentUser;
  elements.historyPanel.hidden = !currentUser;
  elements.currentUserLabel.textContent = currentUser?.profileName || "";
  elements.goalForm.toggleAttribute("inert", !currentUser);
  elements.clearButton.disabled = !currentUser;
  elements.goalDate.value = state.selectedDate;
  elements.selectedDateLabel.textContent = formatDate(state.selectedDate);
  elements.saveGoalButton.textContent =
    state.editingDate === state.selectedDate ? "Zapisz zmiany" : "Zapisz cel";
  elements.currentGoal.hidden = !selectedGoal;

  if (selectedGoal) {
    elements.goalText.textContent = selectedGoal.text;
  }

  renderStatus(selectedGoal?.status);
  renderSummary();
  renderWeek();
  renderHistory();
}

function renderStatus(status = "empty") {
  const labels = {
    empty: "Brak celu",
    pending: "Do sprawdzenia",
    done: "Zrobione",
    missed: "Niezrobione",
  };

  elements.goalStatus.textContent = labels[status] || labels.empty;
  elements.goalStatus.className = `status-badge ${status}`;
}

function renderSummary() {
  const goals = getGoalList();
  const finishedGoals = goals.filter((goal) => goal.status === "done" || goal.status === "missed");
  const doneGoals = goals.filter((goal) => goal.status === "done");
  const rate = finishedGoals.length ? Math.round((doneGoals.length / finishedGoals.length) * 100) : 0;

  elements.currentStreak.textContent = String(calculateCurrentStreak());
  elements.bestStreak.textContent = String(calculateBestStreak(goals));
  elements.completionRate.textContent = `${rate}%`;
}

function renderWeek() {
  elements.weekStrip.replaceChildren();

  const today = parseDateKey(toDateKey(new Date()));
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));
    return toDateKey(date);
  });

  let doneCount = 0;

  days.forEach((dateKey) => {
    const goal = state.goals[dateKey];
    const day = document.createElement("div");
    day.className = `day-dot ${goal?.status || ""}`;
    day.title = `${formatDate(dateKey)}: ${statusLabel(goal?.status)}`;
    day.textContent = weekdayFormatter.format(parseDateKey(dateKey)).replace(".", "");
    elements.weekStrip.append(day);

    if (goal?.status === "done") {
      doneCount += 1;
    }
  });

  elements.weekScore.textContent = `${doneCount}/7`;
}

function renderHistory() {
  elements.historyList.replaceChildren();

  const items = getGoalList()
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 14);

  if (!items.length) {
    const empty = document.createElement("p");
    empty.className = "history-empty";
    empty.textContent = getCurrentUser()
      ? "Nie ma jeszcze zapisanych celów. Dodaj pierwszy cel na dziś."
      : "Zaloguj się albo utwórz konto, żeby zobaczyć swoje cele.";
    elements.historyList.append(empty);
    return;
  }

  items.forEach((item) => {
    const node = elements.historyTemplate.content.firstElementChild.cloneNode(true);
    node.querySelector("time").dateTime = item.date;
    node.querySelector("time").textContent = shortDateFormatter.format(parseDateKey(item.date));
    node.querySelector("p").textContent = item.text;

    const badge = node.querySelector("span");
    badge.textContent = statusLabel(item.status);
    badge.className = item.status;

    elements.historyList.append(node);
  });
}

function getGoalList() {
  return Object.entries(state.goals)
    .map(([date, goal]) => ({ date, ...goal }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function calculateCurrentStreak() {
  const today = parseDateKey(toDateKey(new Date()));
  let cursor = new Date(today);
  const todayGoal = state.goals[toDateKey(cursor)];

  if (todayGoal?.status === "missed") {
    return 0;
  }

  if (todayGoal?.status !== "done") {
    cursor.setDate(cursor.getDate() - 1);
  }

  let streak = 0;

  while (state.goals[toDateKey(cursor)]?.status === "done") {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

function calculateBestStreak(goals) {
  let best = 0;
  let current = 0;
  let previousDate = null;

  goals.forEach((goal) => {
    if (goal.status !== "done") {
      current = 0;
      previousDate = goal.date;
      return;
    }

    if (!previousDate || daysBetween(previousDate, goal.date) === 1) {
      current += 1;
    } else {
      current = 1;
    }

    best = Math.max(best, current);
    previousDate = goal.date;
  });

  return best;
}

function daysBetween(startDate, endDate) {
  const start = parseDateKey(startDate);
  const end = parseDateKey(endDate);
  return Math.round((end - start) / 86400000);
}

function statusLabel(status) {
  const labels = {
    pending: "Do sprawdzenia",
    done: "Zrobione",
    missed: "Niezrobione",
  };

  return labels[status] || "Brak celu";
}

function getCurrentUser() {
  return state.users.find((user) => user.id === state.currentUserId) || null;
}

function loadGoalsForCurrentUser() {
  const currentUser = getCurrentUser();
  state.goals = currentUser?.goals || {};
}

function saveGoals() {
  const currentUser = getCurrentUser();

  if (!currentUser) {
    return;
  }

  currentUser.goals = state.goals;
  saveUsers();
}

function loadUsers() {
  try {
    const users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    return Array.isArray(users) ? users : [];
  } catch {
    return [];
  }
}

function loadLegacyGoals() {
  try {
    return JSON.parse(localStorage.getItem(LEGACY_GOALS_KEY)) || {};
  } catch {
    return {};
  }
}

function saveUsers() {
  localStorage.setItem(USERS_KEY, JSON.stringify(state.users));
}

function loadSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY)) || null;
  } catch {
    return null;
  }
}

function saveSession() {
  if (state.currentUserId) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(state.currentUserId));
    return;
  }

  localStorage.removeItem(SESSION_KEY);
}

function normalizeLogin(login) {
  return login.trim().toLowerCase();
}

function createId() {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function showAuthMessage(message) {
  elements.authMessage.textContent = message;
}

function showToast(message) {
  window.clearTimeout(state.toastTimeoutId);
  elements.toast.textContent = message;
  elements.toast.hidden = false;
  elements.toast.classList.add("visible");

  state.toastTimeoutId = window.setTimeout(() => {
    elements.toast.classList.remove("visible");
    elements.toast.hidden = true;
  }, 3600);
}

function clearAuthForm() {
  elements.authForm.reset();
  showAuthMessage("");
}

function formatDate(dateKey) {
  return dateFormatter.format(parseDateKey(dateKey));
}

function toDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateKey(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}
