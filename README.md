# AniTracker

[Русский](#русский) · [English](#english)

---

## Русский

AniTracker — личный список аниме, фильмов, мультфильмов и сериалов. Отмечайте статус просмотра, прогресс по сериям, оценку и заметки; ищите, фильтруйте и сортируйте коллекцию.

> Интерфейс приложения сейчас на русском. Этот README полностью доступен на русском и английском.

### Возможности

- Карточки и табличный вид.
- Поиск, фильтр по категории и статусу, сортировка.
- Учёт серий, оценок и общей статистики.
- Импорт и экспорт коллекции в JSON.

### Запуск

Это статический сайт: сборка и установка пакетов не нужны. Опубликуйте корень репозитория как статические файлы, например через GitHub Pages:

1. Откройте **Settings → Pages**.
2. В разделе **Build and deployment** выберите публикацию из ветки **main** и папки **/(root)**.
3. Сохраните настройки. Оставьте `index.html`, `app.js`, `style.css` и папку `assets/` в корне проекта.

Страница загружает шрифты Google Fonts и иконки Font Awesome из CDN. Обложки загружаются по указанным в записях URL.

### Компоненты и поток данных

- [`index.html`](index.html) содержит разметку, элементы управления и подключает стили и скрипт.
- [`style.css`](style.css) оформляет страницу и адаптирует её для мобильных экранов.
- [`app.js`](app.js) запускает приложение, хранит состояние в памяти браузера, отображает коллекцию и обрабатывает действия пользователя.
- `assets/` содержит локальные изображения интерфейса.

При открытии страницы браузер получает статические файлы сайта, затем выполняет `app.js`. После события `DOMContentLoaded` функция `init()` читает коллекцию из LocalStorage. Если сохранённых данных нет, используются демонстрационные записи `INITIAL_DATA`.

```js
items: JSON.parse(localStorage.getItem('aniTracker_items')) || INITIAL_DATA
```

Добавление, редактирование, удаление записи и изменение прогресса обновляют состояние приложения. Функция `saveData()` сохраняет коллекцию в браузере:

```js
localStorage.setItem('aniTracker_items', JSON.stringify(state.items));
```

Экспорт скачивает JSON-файл в браузере. Импорт читает выбранный локальный файл; если его содержимое — JSON-массив, он заменяет текущую коллекцию и сохраняет её в LocalStorage.

### Аутентификация, запросы и безопасность данных

В приложении **не реализована аутентификация**: нет регистрации, входа, учётных записей, сервера приложения или API для данных. Поэтому код не запрашивает, не выпускает, не хранит и не отправляет пароли, ключи API, сессионные или OAuth-токены. В коде нет потока входа и заголовка авторизации.

Запросы при работе страницы — это загрузка самой страницы и её статических файлов, шрифтов и иконок с CDN, а также изображений обложек с их URL. Они не являются запросами входа; коллекция не отправляется на сервер и не синхронизируется между устройствами.

Коллекция хранится в LocalStorage браузера для сайта под ключом `aniTracker_items`. Она доступна в том же браузерном профиле и источнике сайта, но не защищена отдельной учётной записью. Не используйте заметки для секретов. Очистка данных сайта удалит сохранённую коллекцию. Экспортируйте JSON для резервной копии; импорт заменяет текущую коллекцию целиком, поэтому перед импортом сохраните экспорт.

### Исходники

Подробнее: [`index.html`](index.html), [`app.js`](app.js) и [`style.css`](style.css).

---

## English

AniTracker is a personal watchlist for anime, films, cartoons, and TV series. Track viewing status, episode progress, ratings, and notes; search, filter, and sort your collection.

> The application interface is currently in Russian. This README is available in both Russian and English.

### Features

- Card and table views.
- Search, category and status filters, and sorting.
- Episode progress, ratings, and collection statistics.
- JSON import and export.

### Run it

This is a static website; no build step or package installation is required. Publish the repository root as static files, for example with GitHub Pages:

1. Open **Settings → Pages**.
2. Under **Build and deployment**, choose deployment from branch **main** and folder **/(root)**.
3. Save the settings. Keep `index.html`, `app.js`, `style.css`, and the `assets/` folder in the project root.

The page loads Google Fonts and Font Awesome icons from their CDNs. Poster images are loaded from the URLs saved in collection entries.

### Components and data flow

- [`index.html`](index.html) contains the markup and controls, and loads the stylesheet and script.
- [`style.css`](style.css) styles the page and adapts it for mobile screens.
- [`app.js`](app.js) starts the application, keeps in-memory browser state, renders the collection, and handles user actions.
- `assets/` contains local interface images.

When the page opens, the browser requests the static site files and then runs `app.js`. After the `DOMContentLoaded` event, `init()` reads the collection from LocalStorage. If no saved data exists, the app uses the sample entries in `INITIAL_DATA`.

```js
items: JSON.parse(localStorage.getItem('aniTracker_items')) || INITIAL_DATA
```

Adding, editing, or deleting an entry and changing episode progress update the application state. The `saveData()` function stores the collection in the browser:

```js
localStorage.setItem('aniTracker_items', JSON.stringify(state.items));
```

Export downloads a JSON file in the browser. Import reads a file selected from the device; when its contents are a JSON array, that array replaces the current collection and is saved to LocalStorage.

### Authentication, requests, and data security

**Authentication is not implemented.** There is no registration, sign-in, user account, application server, or data API. The code does not request, issue, store, or send passwords, API keys, session credentials, or OAuth tokens. There is no sign-in flow or authorization header.

Requests made while using the page load the page and its static files, fonts and icons from CDNs, and poster images from their saved URLs. These are not sign-in requests; the collection is not uploaded to an application server or synced across devices.

The collection is stored in browser LocalStorage for the site under the `aniTracker_items` key. It is available in the same browser profile and site origin, but it is not protected by a separate account. Do not use notes for secrets. Clearing the site's browser data removes the saved collection. Export JSON for a backup; importing replaces the entire current collection, so export it before importing.

### Source files

See [`index.html`](index.html), [`app.js`](app.js), and [`style.css`](style.css).
