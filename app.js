// Начальные демонстрационные данные
const INITIAL_DATA = [
  {
    id: "1",
    title: "Атака титанов (Attack on Titan)",
    type: "anime",
    status: "completed",
    episodesWatched: 87,
    episodesTotal: 87,
    rating: 10,
    poster: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&q=80",
    notes: "Шедевр сюжетных поворотов!",
    updatedAt: Date.now() - 1000000
  },
  {
    id: "2",
    title: "Унесенные призраками",
    type: "anime-movie",
    status: "completed",
    episodesWatched: 1,
    episodesTotal: 1,
    rating: 9.5,
    poster: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&q=80",
    notes: "Атмосферная классика Миядзаки.",
    updatedAt: Date.now() - 2000000
  },
  {
    id: "3",
    title: "Во все тяжкие (Breaking Bad)",
    type: "tv",
    status: "watching",
    episodesWatched: 42,
    episodesTotal: 62,
    rating: 9,
    poster: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&q=80",
    notes: "Отличная актерская игра.",
    updatedAt: Date.now() - 500000
  },
  {
    id: "4",
    title: "Интерстеллар",
    type: "movie",
    status: "completed",
    episodesWatched: 1,
    episodesTotal: 1,
    rating: 10,
    poster: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&q=80",
    notes: "Потрясающая музыка Ханса Циммера.",
    updatedAt: Date.now() - 300000
  }
];

// Перевод типов и статусов
const TYPE_LABELS = {
  'anime': 'Аниме-сериал',
  'anime-movie': 'Аниме-фильм',
  'tv': 'Сериал',
  'movie': 'Фильм',
  'cartoon': 'Мультфильм',
  'cartoon-series': 'Мультсериал'
};

const STATUS_LABELS = {
  'watching': 'Смотрю',
  'completed': 'Просмотрено',
  'planned': 'В планах',
  'on_hold': 'На паузе',
  'dropped': 'Брошено'
};

// Состояние приложения
let state = {
  items: JSON.parse(localStorage.getItem('aniTracker_items')) || INITIAL_DATA,
  viewMode: 'grid', // 'grid' | 'table'
  activeStatus: 'all',
  activeType: 'all',
  searchQuery: '',
  sortBy: 'updated-desc'
};

// Селекторы элементов DOM
const elements = {
  gridView: document.getElementById('gridView'),
  tableView: document.getElementById('tableView'),
  tableBody: document.getElementById('tableBody'),
  emptyState: document.getElementById('emptyState'),
  searchInput: document.getElementById('searchInput'),
  typeFilter: document.getElementById('typeFilter'),
  sortSelect: document.getElementById('sortSelect'),
  statusTabs: document.getElementById('statusTabs'),
  viewGridBtn: document.getElementById('viewGridBtn'),
  viewTableBtn: document.getElementById('viewTableBtn'),
  btnToggleStats: document.getElementById('btnToggleStats'),
  statsPanel: document.getElementById('statsPanel'),
  btnStatTotalDetails: document.getElementById('btnStatTotalDetails'),
  statTypeCountsPanel: document.getElementById('statTypeCountsPanel'),
  statTypeCounts: document.getElementById('statTypeCounts'),
  btnCloseStatTypes: document.getElementById('btnCloseStatTypes'),
  btnOpenAddModal: document.getElementById('btnOpenAddModal'),
  btnCloseModal: document.getElementById('btnCloseModal'),
  btnCancelModal: document.getElementById('btnCancelModal'),
  itemModal: document.getElementById('itemModal'),
  itemForm: document.getElementById('itemForm'),
  modalTitle: document.getElementById('modalTitle'),
  editItemId: document.getElementById('editItemId'),
  toast: document.getElementById('toast'),
  btnExport: document.getElementById('btnExport'),
  importFile: document.getElementById('importFile'),
  
  // Поля статистики
  statTotal: document.getElementById('statTotal'),
  statEpisodes: document.getElementById('statEpisodes'),
  statAvgRating: document.getElementById('statAvgRating'),
  statCompleted: document.getElementById('statCompleted'),
  heroCount: document.getElementById('heroCount')
};

// Инициализация
function init() {
  bindEvents();
  render();
}

// Привязка событий
function bindEvents() {
  // Действия карточек и строк таблицы
  elements.gridView.addEventListener('click', handleItemAction);
  elements.tableBody.addEventListener('click', handleItemAction);

  // Закрытие модального окна по клику на затемнение и клавише Escape
  elements.itemModal.addEventListener('click', (e) => {
    if (e.target === elements.itemModal) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !elements.itemModal.classList.contains('hidden')) closeModal();
  });

  // Поиск и фильтрация
  elements.searchInput.addEventListener('input', (e) => {
    state.searchQuery = e.target.value.toLowerCase();
    render();
  });

  elements.typeFilter.addEventListener('change', (e) => {
    state.activeType = e.target.value;
    render();
  });

  elements.sortSelect.addEventListener('change', (e) => {
    state.sortBy = e.target.value;
    render();
  });

  elements.statusTabs.addEventListener('click', (e) => {
    if (e.target.classList.contains('tab-btn')) {
      document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
      e.target.classList.add('active');
      state.activeStatus = e.target.dataset.status;
      render();
    }
  });

  // Переключение вида (Сетка/Таблица)
  elements.viewGridBtn.addEventListener('click', () => setViewMode('grid'));
  elements.viewTableBtn.addEventListener('click', () => setViewMode('table'));

  // Переключение общей статистики.
  elements.btnToggleStats.addEventListener('click', () => {
    const isHidden = elements.statsPanel.classList.toggle('hidden');
    elements.btnToggleStats.setAttribute('aria-expanded', String(!isHidden));
    if (isHidden) {
      elements.statTypeCountsPanel.classList.add('hidden');
      elements.btnStatTotalDetails.setAttribute('aria-expanded', 'false');
    }
  });

  // Карточка «Всего тайтлов» раскрывает количество записей по основным типам.
  elements.btnStatTotalDetails.addEventListener('click', () => {
    const isHidden = elements.statTypeCountsPanel.classList.toggle('hidden');
    elements.btnStatTotalDetails.setAttribute('aria-expanded', String(!isHidden));
    if (!isHidden) renderStatTypeCounts();
  });

  elements.btnCloseStatTypes.addEventListener('click', () => {
    elements.statTypeCountsPanel.classList.add('hidden');
    elements.btnStatTotalDetails.setAttribute('aria-expanded', 'false');
  });

  // Модальное окно
  elements.btnOpenAddModal.addEventListener('click', () => openModal());
  elements.btnCloseModal.addEventListener('click', closeModal);
  elements.btnCancelModal.addEventListener('click', closeModal);
  elements.itemForm.addEventListener('submit', handleFormSubmit);

  // Импорт / Экспорт
  elements.btnExport.addEventListener('click', exportData);
  elements.importFile.addEventListener('change', importData);
}

// Единая обработка действий: редактировать, удалить, добавить серию.
function handleItemAction(event) {
  const button = event.target.closest('[data-action]');
  if (!button) return;

  const id = button.dataset.id;
  switch (button.dataset.action) {
    case 'episode': incrementEpisode(id); break;
    case 'edit': openModal(id); break;
    case 'delete': deleteItem(id); break;
  }
}

// Защищаем текстовые значения при построении HTML из пользовательских данных.
function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>\"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;', "'": '&#39;'
  })[char]);
}

// Оценка хранится числом с точностью до десятых и ограничивается диапазоном 0–10.
function normalizeRating(value) {
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed)) return 0;
  return Math.round(Math.min(10, Math.max(0, parsed)) * 10) / 10;
}

function formatRating(value) {
  return normalizeRating(value).toFixed(1).replace('.', ',');
}

// Установка режима просмотра
function setViewMode(mode) {
  state.viewMode = mode;
  if (mode === 'grid') {
    elements.viewGridBtn.classList.add('active');
    elements.viewTableBtn.classList.remove('active');
    elements.gridView.classList.remove('hidden');
    elements.tableView.classList.add('hidden');
  } else {
    elements.viewTableBtn.classList.add('active');
    elements.viewGridBtn.classList.remove('active');
    elements.tableView.classList.remove('hidden');
    elements.gridView.classList.add('hidden');
  }
}

// Сохранение в LocalStorage
function saveData() {
  localStorage.setItem('aniTracker_items', JSON.stringify(state.items));
}

// Показ всплывающего уведомления
function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.remove('hidden');
  setTimeout(() => elements.toast.classList.add('hidden'), 3000);
}

// Главная функция рендеринга
function render() {
  let filtered = state.items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(state.searchQuery);
    const matchesStatus = state.activeStatus === 'all' || item.status === state.activeStatus;
    const matchesType = state.activeType === 'all' || item.type === state.activeType;
    return matchesSearch && matchesStatus && matchesType;
  });

  // Сортировка
  filtered.sort((a, b) => {
    switch (state.sortBy) {
      case 'rating-desc': return (b.rating || 0) - (a.rating || 0);
      case 'rating-asc': return (a.rating || 0) - (b.rating || 0);
      case 'title-asc': return a.title.localeCompare(b.title);
      case 'updated-desc':
      default:
        return (b.updatedAt || 0) - (a.updatedAt || 0);
    }
  });

  // Рендер элементов или пустого состояния
  if (filtered.length === 0) {
    elements.emptyState.classList.remove('hidden');
    elements.gridView.innerHTML = '';
    elements.tableBody.innerHTML = '';
  } else {
    elements.emptyState.classList.add('hidden');
    renderGrid(filtered);
    renderTable(filtered);
  }

  renderStats();
}

// Рендер сетки карточек
function renderGrid(items) {
  elements.gridView.innerHTML = items.map((item, index) => {
    const totalEp = Number(item.episodesTotal) > 0 ? item.episodesTotal : '?';
    const watched = Number(item.episodesWatched) || 0;
    const episodesTotal = Number(item.episodesTotal) || 0;
    const progressPercent = episodesTotal > 0 ? Math.min(100, Math.round((watched / episodesTotal) * 100)) : 0;
    const rating = normalizeRating(item.rating);
    const posterUrl = item.poster || 'https://placehold.co/300x400/123b3c/f8e4d1?text=No+cover';
    const typeLabel = TYPE_LABELS[item.type] || 'Другое';
    const statusLabel = STATUS_LABELS[item.status] || 'Не указан';

    return `
      <article class="card" style="animation-delay: ${Math.min(index, 8) * 35}ms">
        <div class="card-poster">
          <img src="${escapeHTML(posterUrl)}" alt="${escapeHTML(item.title || 'Без названия')}" loading="lazy" onerror="this.onerror=null;this.src='https://placehold.co/300x400/123b3c/f8e4d1?text=No+cover'">
          <span class="badge-type">${escapeHTML(typeLabel)}</span>
          <span class="badge-status status-${escapeHTML(item.status || 'watching')}">${escapeHTML(statusLabel)}</span>
        </div>
        <div class="card-body">
          <h3 class="card-title" title="${escapeHTML(item.title || '')}">${escapeHTML(item.title || 'Без названия')}</h3>

          <div class="rating-bar">
            <div class="rating-label">
              <i class="fa-solid fa-star"></i>
              <span>${rating > 0 ? `${formatRating(rating)} / 10` : 'Без оценки'}</span>
            </div>
            <div class="rating-track" aria-label="Оценка ${formatRating(rating)} из 10"><span style="width: ${rating * 10}%"></span></div>
          </div>

          <div class="progress-section">
            <div class="progress-info">
              <span>Прогресс</span>
              <span><b>${watched}</b> / ${totalEp} сер.</span>
            </div>
            <div class="progress-bar-bg"><div class="progress-bar-fill" style="width: ${progressPercent}%"></div></div>
          </div>

          <div class="card-actions">
            <button class="icon-btn" data-action="episode" data-id="${escapeHTML(item.id)}" title="+1 серия"><i class="fa-solid fa-plus"></i> +1 сер.</button>
            <div>
              <button class="icon-btn" data-action="edit" data-id="${escapeHTML(item.id)}" title="Редактировать" aria-label="Редактировать ${escapeHTML(item.title || '')}"><i class="fa-solid fa-pen"></i></button>
              <button class="icon-btn delete" data-action="delete" data-id="${escapeHTML(item.id)}" title="Удалить" aria-label="Удалить ${escapeHTML(item.title || '')}"><i class="fa-solid fa-trash"></i></button>
            </div>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

// Рендер таблицы
function renderTable(items) {
  elements.tableBody.innerHTML = items.map(item => {
    const totalEp = Number(item.episodesTotal) > 0 ? item.episodesTotal : '?';
    const posterUrl = item.poster || 'https://placehold.co/100x140/123b3c/f8e4d1?text=No+cover';
    const rating = normalizeRating(item.rating);
    return `
      <tr>
        <td><img class="table-thumb" src="${escapeHTML(posterUrl)}" alt="${escapeHTML(item.title || 'Без названия')}" loading="lazy" onerror="this.onerror=null;this.src='https://placehold.co/100x140/123b3c/f8e4d1?text=No+cover'"></td>
        <td><strong>${escapeHTML(item.title || 'Без названия')}</strong></td>
        <td>${escapeHTML(TYPE_LABELS[item.type] || 'Другое')}</td>
        <td><span class="badge-status status-${escapeHTML(item.status || 'watching')}">${escapeHTML(STATUS_LABELS[item.status] || 'Не указан')}</span></td>
        <td>${Number(item.episodesWatched) || 0} / ${totalEp}</td>
        <td><span class="table-rating"><i class="fa-solid fa-star"></i> ${rating > 0 ? formatRating(rating) : '—'}</span></td>
        <td>
          <button class="icon-btn" data-action="episode" data-id="${escapeHTML(item.id)}" title="+1 серия"><i class="fa-solid fa-plus"></i></button>
          <button class="icon-btn" data-action="edit" data-id="${escapeHTML(item.id)}" title="Редактировать"><i class="fa-solid fa-pen"></i></button>
          <button class="icon-btn delete" data-action="delete" data-id="${escapeHTML(item.id)}" title="Удалить"><i class="fa-solid fa-trash"></i></button>
        </td>
      </tr>
    `;
  }).join('');
}

// Расчёт и обновление общей статистики.
function renderStats() {
  const total = state.items.length;
  const totalEpisodes = state.items.reduce((acc, item) => acc + (parseInt(item.episodesWatched, 10) || 0), 0);
  const ratedItems = state.items.filter(item => Number(item.rating) > 0);
  const avgRating = ratedItems.length > 0
    ? (ratedItems.reduce((acc, item) => acc + normalizeRating(item.rating), 0) / ratedItems.length).toFixed(1)
    : '0.0';
  const completedCount = state.items.filter(item => item.status === 'completed').length;

  elements.statTotal.textContent = total;
  elements.statEpisodes.textContent = totalEpisodes;
  elements.statAvgRating.textContent = avgRating.replace('.', ',');
  elements.statCompleted.textContent = completedCount;
  if (elements.heroCount) {
    elements.heroCount.textContent = `${total} ${total === 1 ? 'запись' : (total >= 2 && total <= 4 ? 'записи' : 'записей')}`;
  }
  // Если разбивка по типам открыта, обновляем её после изменения коллекции.
  if (!elements.statTypeCountsPanel.classList.contains('hidden')) renderStatTypeCounts();
}

// Компактная разбивка коллекции по четырём основным типам.
// Считаются все записи независимо от статуса и текущих фильтров каталога.
function renderStatTypeCounts() {
  const groups = [
    {
      label: 'Фильмы',
      description: 'полнометражные фильмы',
      icon: 'fa-film',
      className: 'movies',
      matches: item => item.type === 'movie'
    },
    {
      label: 'Аниме',
      description: 'сериалы и фильмы',
      icon: 'fa-dragon',
      className: 'anime',
      matches: item => item.type === 'anime' || item.type === 'anime-movie'
    },
    {
      label: 'Мультики',
      description: 'мультфильмы и мультсериалы',
      icon: 'fa-wand-magic-sparkles',
      className: 'cartoons',
      matches: item => item.type === 'cartoon' || item.type === 'cartoon-series'
    },
    {
      label: 'Сериалы',
      description: 'телесериалы',
      icon: 'fa-tv',
      className: 'series',
      matches: item => item.type === 'tv'
    }
  ];

  const counts = groups.map(group => ({
    ...group,
    count: state.items.filter(group.matches).length
  }));

  // Для неизвестных старых/импортированных категорий добавляем отдельную строку,
  // чтобы суммы категорий не теряли такие записи.
  const knownCount = counts.reduce((sum, group) => sum + group.count, 0);
  const otherCount = Math.max(0, state.items.length - knownCount);
  if (otherCount > 0) {
    counts.push({
      label: 'Другие',
      description: 'прочие категории',
      icon: 'fa-shapes',
      className: 'other',
      count: otherCount
    });
  }

  elements.statTypeCounts.innerHTML = counts.map(group => `
    <div class="stat-type-card stat-type-${group.className}">
      <div class="stat-type-heading">
        <i class="fa-solid ${group.icon}" aria-hidden="true"></i>
        <span>${escapeHTML(group.label)}</span>
      </div>
      <strong class="stat-type-count">${group.count}</strong>
      <span class="stat-type-description">${escapeHTML(group.description)}</span>
    </div>
  `).join('');
}

// Увеличение серии на +1
function incrementEpisode(id) {
  const item = state.items.find(i => i.id === id);
  if (item) {
    item.episodesWatched++;
    if (item.episodesTotal > 0 && item.episodesWatched >= item.episodesTotal) {
      item.episodesWatched = item.episodesTotal;
      item.status = 'completed';
    } else if (item.status === 'planned') {
      item.status = 'watching';
    }
    item.updatedAt = Date.now();
    saveData();
    render();
    showToast(`Прогресс обновлен: ${item.title}`);
  }
}

// Открытие модального окна
function openModal(id = null) {
  if (id) {
    const item = state.items.find(i => i.id === id);
    if (!item) return;
    elements.modalTitle.textContent = 'Редактировать тайтл';
    elements.editItemId.value = item.id;
    document.getElementById('inputTitle').value = item.title;
    document.getElementById('selectType').value = item.type;
    document.getElementById('selectStatus').value = item.status;
    document.getElementById('inputEpisodesWatched').value = item.episodesWatched;
    document.getElementById('inputEpisodesTotal').value = item.episodesTotal;
    document.getElementById('inputRating').value = item.rating || 0;
    document.getElementById('inputPoster').value = item.poster || '';
    document.getElementById('inputNotes').value = item.notes || '';
  } else {
    elements.modalTitle.textContent = 'Добавить в список';
    elements.editItemId.value = '';
    elements.itemForm.reset();
  }
  elements.itemModal.classList.remove('hidden');
}

// Закрытие модального окна
function closeModal() {
  elements.itemModal.classList.add('hidden');
}

// Обработка формы
function handleFormSubmit(e) {
  e.preventDefault();
  
  const id = elements.editItemId.value;
  const formData = {
    title: document.getElementById('inputTitle').value.trim(),
    type: document.getElementById('selectType').value,
    status: document.getElementById('selectStatus').value,
    episodesWatched: parseInt(document.getElementById('inputEpisodesWatched').value) || 0,
    episodesTotal: parseInt(document.getElementById('inputEpisodesTotal').value) || 0,
    rating: normalizeRating(document.getElementById('inputRating').value),
    poster: document.getElementById('inputPoster').value.trim(),
    notes: document.getElementById('inputNotes').value.trim(),
    updatedAt: Date.now()
  };

  if (id) {
    const index = state.items.findIndex(i => i.id === id);
    if (index !== -1) {
      state.items[index] = { ...state.items[index], ...formData };
      showToast('Запись успешно обновлена');
    }
  } else {
    const newItem = {
      id: Date.now().toString(),
      ...formData
    };
    state.items.unshift(newItem);
    showToast('Новая запись добавлена');
  }

  saveData();
  closeModal();
  render();
}

// Удаление элемента
function deleteItem(id) {
  if (confirm('Вы уверены, что хотите удалить эту запись?')) {
    state.items = state.items.filter(i => i.id !== id);
    saveData();
    render();
    showToast('Запись удалена');
  }
}

// Экспорт JSON
function exportData() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state.items, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `anitracker_backup_${new Date().toISOString().slice(0,10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

// Импорт JSON
function importData(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(event) {
    try {
      const importedItems = JSON.parse(event.target.result);
      if (Array.isArray(importedItems)) {
        state.items = importedItems;
        saveData();
        render();
        showToast('Данные успешно импортированы!');
      } else {
        alert('Неверный формат файла!');
      }
    } catch (err) {
      alert('Ошибка при чтении файла JSON');
    }
  };
  reader.readAsText(file);
}

// Запуск при загрузке страницы
document.addEventListener('DOMContentLoaded', init);