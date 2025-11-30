# MultiTetris-JS

Мультиплеерная веб-игра по мотивам классического Тетриса, разработанная с использованием React, TypeScript и WebSockets. Игра включает несколько режимов: одиночный, сражение на очки и королевская битва.

## Лабораторная работа №7 - роутинг

## Установка

### Установить зависимости (в корне MultiTetris-JS)
npm install

### Запустить приложение (в MultiTetris-JS/apps/client)
npm run dev
зайти на http://localhost:5173/

### Запуск тестов и линта (централизованно в корне MultiTetris-JS)
npm run lint
npm run test
npm run test:coverage

## Роутинг и страницы

### / - Главная страница

Краткое описание проекта и навигация по режимам игры.

![home](./images/Home.jpg)

### /profile - Профиль пользователя

Показывает информацию о пользователе, статистику и настройки.

![profile](./images/profile.jpg)

### /login - Вход и /register - Регистрация

Формы для входа и создания аккаунта.

![login](./images/login.jpg)

![register](./images/register.jpg)

### /help - Помощь и /about - О проекте

Информационные страницы с правилами игры и описанием.

![help](./images/help.jpg)

![about](./images/about.jpg)

### /solo - Одиночная игра

Режим игры против себя на время и очки.

![solo](./images/solo.jpg)

### /multiplayer - страница выбора мультиплеерного режима

![multiplayer](./images/multiplayer.jpg)

### /multiplayer/score - Сражение на очки

Игроки играют одновременно, выигрывает набравший больше очков.

![score](./images/score.jpg)

### /multiplayer/royale - Королевская битва

Один остается победителем. Игроки выбывают по мере поражения.

![royale](./images/royale.jpg)

### /leaderboard - Таблица лидеров с фильтрами (по режиму, периоду)

![leaderboard](./images/leaderboard.jpg)

### (или /404) - Страница не найдена

![error](./images/error.jpg)

### /room/:mode/:id - Игровая комната (по ID и режиму)

![room](./images/room.jpg)

### /invite/:token - Приватное приглашение в комнату

![invite](./images/invite.jpg)

### /room/:mode/:id//lobby - Игровое лобби

![lobby](./images/lobby.jpg)