const PLANS_TYPE_LABELS = {
  anime: "Аниме-сериалы",
  "anime-movie": "Аниме-фильмы",
  tv: "Сериалы",
  movie: "Фильмы",
  cartoon: "Мультфильмы",
  "cartoon-series": "Мультсериалы"
};
const PLANS_TYPE_ORDER = ["anime-movie", "anime", "movie", "tv", "cartoon", "cartoon-series"];
const STORAGE_KEY = "aniTracker_items";
const initialData = window.ANI_TRACKER_INITIAL_DATA || [];
const state = {
  items: loadItems(),
  activeType: null,
  addType: "anime-movie",
  randomType: "all",
  lastRandomId: null
};
const el = {
  categoryGrid: document.getElementById("categoryGrid"),
  plannedTotal: document.getElementById("plannedTotal"),
  recentList: document.getElementById("recentList"),
  overviewEmpty: document.getElementById("overviewEmpty"),
  typeView: document.getElementById("typeView"),
  typeTitle: document.getElementById("typeTitle"),
  typeCount: document.getElementById("typeCount"),
  titleList: document.getElementById("titleList"),
  typeEmpty: document.getElementById("typeEmpty"),
  addDialog: document.getElementById("addDialog"),
  addTypeOptions: document.getElementById("addTypeOptions"),
  addForm: document.getElementById("addForm"),
  titleInput: document.getElementById("titleInput"),
  addError: document.getElementById("addError"),
  randomDialog: document.getElementById("randomDialog"),
  randomType: document.getElementById("randomType"),
  randomPicker: document.getElementById("randomPicker"),
  randomResult: document.getElementById("randomResult"),
  randomTitle: document.getElementById("randomTitle"),
  randomMeta: document.getElementById("randomMeta"),
  randomError: document.getElementById("randomError"),
  toast: document.getElementById("plansToast")
};

function loadItems() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === null) return initialData.map(item => ({ ...item }));
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : initialData.map(item => ({ ...item }));
  } catch (error) {
    return initialData.map(item => ({ ...item }));
  }
}

function saveItems() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    return true;
  } catch (error) {
    showToast("Не удалось сохранить. Проверьте свободное место в браузере.");
    return false;
  }
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);
}

function plannedItems() {
  return state.items.filter(item => item && item.status === "planned" && typeof item.title === "string");
}

function countByType(type) {
  return plannedItems().filter(item => item.type === type).length;
}

function renderCategories() {
  const counts = PLANS_TYPE_ORDER.map(type => ({ type, count: countByType(type) }));
  el.plannedTotal.textContent = String(plannedItems().length);
  el.categoryGrid.innerHTML = counts.map((entry, index) =>
    '<button class="category-tile" type="button" data-type="' + entry.type + '" aria-label="' +
    escapeHTML(PLANS_TYPE_LABELS[entry.type]) + ', ' + entry.count + ' произведений">' +
      '<span class="category-index">0' + (index + 1) + '　/　ТИП</span>' +
      '<strong>' + escapeHTML(PLANS_TYPE_LABELS[entry.type]) + '</strong>' +
      '<small>Открыть список</small><span class="category-count">' + entry.count + '</span>' +
    '</button>'
  ).join("");
}

function renderRecent() {
  const items = plannedItems().slice().sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0)).slice(0, 5);
  el.recentList.innerHTML = items.map(item =>
    '<li><span>' + escapeHTML(item.title) + '</span><span class="recent-type">' +
    escapeHTML(PLANS_TYPE_LABELS[item.type] || "Другое") + '</span></li>'
  ).join("");
  el.overviewEmpty.classList.toggle("hidden", plannedItems().length > 0);
  el.recentList.classList.toggle("hidden", plannedItems().length === 0);
}

function openType(type) {
  if (!PLANS_TYPE_LABELS[type]) return;
  state.activeType = type;
  el.typeTitle.textContent = PLANS_TYPE_LABELS[type];
  renderTypeList();
  document.querySelector(".plans-recent").classList.add("hidden");
  document.querySelector(".plans-toolbar").classList.add("hidden");
  el.categoryGrid.classList.add("hidden");
  el.typeView.classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderTypeList() {
  const items = plannedItems().filter(item => item.type === state.activeType)
    .slice().sort((a, b) => a.title.localeCompare(b.title, "ru"));
  el.typeCount.textContent = String(items.length);
  el.titleList.innerHTML = items.map(item => "<li>" + escapeHTML(item.title) + "</li>").join("");
  el.typeEmpty.classList.toggle("hidden", items.length > 0);
  el.titleList.classList.toggle("hidden", items.length === 0);
}

function closeType() {
  state.activeType = null;
  el.typeView.classList.add("hidden");
  el.categoryGrid.classList.remove("hidden");
  document.querySelector(".plans-toolbar").classList.remove("hidden");
  document.querySelector(".plans-recent").classList.remove("hidden");
}

function renderAddTypes() {
  el.addTypeOptions.innerHTML = PLANS_TYPE_ORDER.map(type =>
    '<button class="type-option' + (state.addType === type ? " selected" : "") +
    '" type="button" role="radio" aria-checked="' + (state.addType === type) +
    '" data-add-type="' + type + '"><span class="radio-mark" aria-hidden="true"></span>' +
    escapeHTML(PLANS_TYPE_LABELS[type]) + '</button>'
  ).join("");
}

function openAdd() {
  el.addForm.reset();
  el.addError.classList.add("hidden");
  state.addType = state.activeType || "anime-movie";
  renderAddTypes();
  el.addDialog.showModal();
  window.setTimeout(() => el.titleInput.focus(), 0);
}

function addItem(event) {
  event.preventDefault();
  const title = el.titleInput.value.trim();
  if (!title) {
    el.addError.textContent = "Введите название произведения.";
    el.addError.classList.remove("hidden");
    el.titleInput.focus();
    return;
  }
  const duplicate = plannedItems().some(item =>
    item.type === state.addType && item.title.trim().toLocaleLowerCase("ru") === title.toLocaleLowerCase("ru")
  );
  if (duplicate) {
    el.addError.textContent = "Такое название уже есть в этой категории.";
    el.addError.classList.remove("hidden");
    el.titleInput.focus();
    return;
  }
  const id = window.crypto && crypto.randomUUID ? crypto.randomUUID() : String(Date.now());
  const item = {
    id,
    title,
    type: state.addType,
    status: "planned",
    episodesWatched: 0,
    episodesTotal: 0,
    rating: 0,
    poster: "",
    notes: "",
    updatedAt: Date.now()
  };
  state.items.unshift(item);
  if (!saveItems()) {
    state.items.shift();
    return;
  }
  el.addDialog.close();
  render();
  if (state.activeType) renderTypeList();
  showToast("Добавлено в планы");
}

function fillRandomTypes() {
  el.randomType.innerHTML = '<option value="all">Любой тип</option>' +
    PLANS_TYPE_ORDER.map(type => '<option value="' + type + '">' +
    escapeHTML(PLANS_TYPE_LABELS[type]) + '</option>').join("");
}

function openRandom() {
  el.randomPicker.classList.remove("hidden");
  el.randomResult.classList.add("hidden");
  el.randomError.classList.add("hidden");
  el.randomType.value = "all";
  el.randomDialog.showModal();
}

function chooseRandom() {
  const type = el.randomType.value;
  let candidates = plannedItems().filter(item => type === "all" || item.type === type);
  el.randomError.classList.add("hidden");
  if (!candidates.length) {
    el.randomError.textContent = type === "all"
      ? "В планах пока нет произведений. Добавьте первое в список."
      : "В этой категории пока пусто. Выберите другой тип или добавьте произведение.";
    el.randomError.classList.remove("hidden");
    return;
  }
  if (candidates.length > 1 && state.lastRandomId) {
    const withoutPrevious = candidates.filter(item => String(item.id) !== String(state.lastRandomId));
    if (withoutPrevious.length) candidates = withoutPrevious;
  }
  const chosen = candidates[Math.floor(Math.random() * candidates.length)];
  state.lastRandomId = chosen.id;
  el.randomTitle.textContent = chosen.title;
  el.randomMeta.textContent = PLANS_TYPE_LABELS[chosen.type] || "Произведение";
  el.randomPicker.classList.add("hidden");
  el.randomResult.classList.remove("hidden");
}

function showToast(message) {
  el.toast.textContent = message;
  el.toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => el.toast.classList.remove("show"), 2600);
}

function render() {
  renderCategories();
  renderRecent();
  if (state.activeType) renderTypeList();
}

document.getElementById("openAdd").addEventListener("click", openAdd);
document.getElementById("emptyAdd").addEventListener("click", openAdd);
document.getElementById("typeEmptyAdd").addEventListener("click", openAdd);
document.getElementById("openRandom").addEventListener("click", openRandom);
document.getElementById("pickRandom").addEventListener("click", chooseRandom);
document.getElementById("pickAgain").addEventListener("click", () => {
  el.randomResult.classList.add("hidden");
  el.randomPicker.classList.remove("hidden");
});
document.getElementById("showAll").addEventListener("click", () => openType("anime-movie"));
document.getElementById("backToPlans").addEventListener("click", closeType);
el.categoryGrid.addEventListener("click", event => {
  const button = event.target.closest("[data-type]");
  if (button) openType(button.dataset.type);
});
el.addTypeOptions.addEventListener("click", event => {
  const button = event.target.closest("[data-add-type]");
  if (!button) return;
  state.addType = button.dataset.addType;
  renderAddTypes();
});
el.addForm.addEventListener("submit", addItem);
document.querySelectorAll("[data-close]").forEach(button => {
  button.addEventListener("click", () => document.getElementById(button.dataset.close).close());
});
[el.addDialog, el.randomDialog].forEach(dialog => {
  dialog.addEventListener("click", event => {
    if (event.target === dialog) dialog.close();
  });
});
fillRandomTypes();
render();
