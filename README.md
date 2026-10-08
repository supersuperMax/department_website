# Сайт кафедры

Статический сайт на [Hugo](https://gohugo.io) в стиле mit.edu: шапка с мега-меню, слайдер на главной, карточки новостей, анимации при прокрутке.
Сайт двуязычный (русский и английский), языки можно добавлять. Публикуется на GitHub Pages автоматически.

| Что | Чем сделано |
|---|---|
| Генератор | Hugo **0.167+** (extended не обязателен) |
| Тема | [ananke](https://github.com/gohugo-ananke/ananke) — git-подмодуль в `themes/ananke`, **не редактируется** |
| Стили | Tailwind CSS v4 + плагин Typography (Tachyons из ananke отключён) |
| Скрипты | `assets/js/main.js`, без зависимостей |
| Хостинг | GitHub Pages через GitHub Actions (`.github/workflows/hugo.yaml`) |

---

## Содержание

1. [Установка и запуск](#1-установка-и-запуск)
2. [Как устроен проект](#2-как-устроен-проект)
3. [Контент: новости с картинками](#3-контент-новости-с-картинками)
4. [Контент: остальные страницы](#4-контент-остальные-страницы)
5. [Переводы и новые языки](#5-переводы-и-новые-языки)
6. [Меню](#6-меню)
7. [Новые страницы и разделы](#7-новые-страницы-и-разделы)
8. [Анимации и поведение страниц](#8-анимации-и-поведение-страниц)
9. [Стили и шаблоны](#9-стили-и-шаблоны)
10. [Публикация на GitHub Pages](#10-публикация-на-github-pages)
11. [Частые проблемы](#11-частые-проблемы)

---

## 1. Установка и запуск

Нужно установить:

- **Hugo 0.167 или новее**: https://gohugo.io/installation/ (на Windows: `winget install Hugo.Hugo.Extended`).
- **Node.js 22.15 или новее** (рекомендуется LTS 24): https://nodejs.org. Через Node работает Tailwind.
  Hugo 0.167 не работает с более старыми версиями Node: появляется ошибка `does not provide an export named 'registerHooks'`.
- **Git**.

```bash
git clone --recurse-submodules <адрес-репозитория>
cd <папка-репозитория>
# если клонировали без --recurse-submodules:
git submodule update --init --recursive

npm install          # ставит Tailwind (один раз и после изменения package.json)
hugo server          # http://localhost:1313/<путь из baseURL>/
```

Адрес для открытия Hugo напечатает в консоли, например `http://localhost:1313/department_website/`.
Пока сервер запущен, изменения в файлах сразу видны в браузере.

Черновики (`draft = true`) по умолчанию не показываются. Чтобы их увидеть, запустите `hugo server -D`.

Сборка в папку `public/` так же, как в CI: `hugo --gc --minify`.

---

## 2. Как устроен проект

```
hugo.toml                  ← ВСЯ конфигурация: языки, меню, параметры, анимации
package.json               ← Tailwind (npm install)
assets/
  css/main.css             ← стили Tailwind, цвета, анимации
  js/main.js               ← поведение: появление при прокрутке, меню, слайдер, счётчики
  images/hero/, tiles/     ← картинки слайдера и плиток главной
content/                   ← ТЕКСТЫ САЙТА (Markdown)
  _index.ru.md / _index.en.md     ← главная (слайды, счётчики, плитки)
  about/  education/  research/  people/  news/  events/
  contacts.ru.md / contacts.en.md
i18n/ru.toml, en.toml      ← подписи интерфейса («Все новости», «Подробнее» …)
layouts/                   ← шаблоны, которые переопределяют тему ananke
  baseof.html              ← каркас каждой страницы
  home.html                ← главная
  single.html, list.html   ← обычная страница и раздел
  news/, events/, people/  ← шаблоны отдельных разделов
  _partials/               ← шапка, подвал, карточки, hero …
  _shortcodes/             ← gallery, button, lead
  _markup/render-image.html← обработка картинок из Markdown
archetypes/                ← заготовки для `hugo new`
static/                    ← файлы «как есть» (favicon, pdf …)
themes/ananke/             ← тема (подмодуль, НЕ ПРАВИТЬ)
```

Переводы хранятся **рядом друг с другом**: `index.ru.md` и `index.en.md` в одной папке.
Картинки в этой папке общие для всех языков, поэтому их не нужно копировать.

---

## 3. Контент: новости с картинками

### 3.1 Создать новость

```bash
hugo new content news/open-lab-2026
```

Появится папка `content/news/open-lab-2026/` с файлом `index.md`, заготовка взята из `archetypes/news/index.md`.
Файл без суффикса языка считается русским.

1. Переименуйте `index.md` в `index.ru.md` (так проще добавить перевод).
2. Заполните шапку файла (front matter) между `+++`:

```toml
+++
title = 'Открытие лаборатории'
description = 'Короткий анонс — виден в карточке и под заголовком.'
date = '2026-10-07T12:00:00+03:00'
draft = false            # true — черновик, на сайт не попадёт
author = 'Пресс-служба'
categories = ['Наука']
tags = ['лаборатория']
+++
```

3. Ниже `+++` напишите текст в Markdown.

> ⚠️ Если `date` в будущем, Hugo не опубликует страницу до этой даты.

### 3.2 Обложка

Положите в папку новости файл **`cover.jpg`** (подойдут и `.png`, `.webp`). Обложка автоматически:
- появляется в шапке новости с затемнением, как в ananke;
- используется в карточках на главной и в списке новостей;
- уменьшается и конвертируется в WebP.

Рекомендуемый размер: от 1600×900. Другое имя файла можно указать так: `featured_image = 'photo.jpg'`.
Затемнение обложки (0–100) задаётся параметром `cover_dimming = 40`.

### 3.3 Картинки в тексте

Положите файл в папку новости и вставьте его обычным Markdown:

```markdown
![Описание для незрячих](lab.jpg "Подпись под картинкой")
```

Картинка на отдельной строке становится `<figure>` с подписью, адаптивными размерами (srcset, WebP),
ленивой загрузкой и анимацией появления (см. `layouts/_markup/render-image.html`).
Картинки из `static/` указываются от корня без слеша: `![](images/plan.png)`.

### 3.4 Галерея

Сложите фото в подпапку, например `gallery/`, и вставьте в текст шорткод:

```markdown
{{< gallery match="gallery/*" >}}
{{< gallery match="gallery/*" cols="2" >}}   <!-- 2, 3 или 4 колонки -->
{{< gallery >}}                              <!-- все картинки папки, кроме cover -->
```

### 3.5 Перевод новости

Создайте рядом `index.en.md` с тем же набором полей. Картинки уже лежат в папке, копировать их не нужно.
Переключатель RU/EN в шапке сам поведёт на перевод. Если перевода нет, ссылка ведёт на главную страницу языка.

Пример готовой новости: `content/news/summer-school/`.

---

## 4. Контент: остальные страницы

### Главная (`content/_index.ru.md`, `_index.en.md`)

Все блоки главной настраиваются в шапке файла:

```toml
[[hero]]                                   # слайд (сколько угодно)
  image = 'images/hero/hero-1.jpg'         # путь в assets/
  title = 'Заголовок'
  text = 'Подзаголовок'
  link = '/about'                          # страница из content/
  link_text = 'Подробнее'

[[stats]]                                  # счётчик с анимацией
  value = 75
  suffix = '+'
  label = 'лет истории'

[[quicklinks]]                             # плитка
  title = 'Образование'
  text = 'Текст, который появляется при наведении'
  link = '/education'
  image = 'images/tiles/education.jpg'     # путь в assets/
```

Текст под `+++` выводится в блоке «О кафедре». Новости (3 последние) и ближайшие мероприятия подставляются автоматически.

### Сотрудники (`content/people/`)

```bash
hugo new content people/smirnov      # затем index.md → index.ru.md, добавьте cover.jpg (фото ~600×700)
```

Поля: `title` (ФИО), `position`, `degree`, `email`, `phone`, `room`, `weight` (порядок: меньше — выше).

### Мероприятия (`content/events/`)

```bash
hugo new content events/seminar-nov.ru.md
```

Поля: `eventDate` (когда проходит), `eventEnd`, `location`, `registration` (ссылка).
`date` — дата публикации, она должна быть в прошлом. Мероприятия сами делятся на «Ближайшие» и «Прошедшие».

### Обычная страница

```bash
hugo new content education/courses.ru.md
```

Полезные поля: `description`, `weight` (порядок в разделе), `toc = true` (оглавление),
`sidebar = false` (без боковой навигации), `animations = false`, `featured_image`/`cover.jpg` (обложка в шапке),
`hero_height = 'sm' | 'md' | 'lg'`.

### Шорткоды для текста

| Шорткод | Что делает |
|---|---|
| `{{< lead >}}Текст{{< /lead >}}` | крупный вводный абзац с акцентной полосой |
| `{{< button href="/contacts" >}}Написать{{< /button >}}` | кнопка; `style="outline"` — контурная |
| `{{< gallery match="gallery/*" >}}` | галерея |
| `{{< figure src="x.jpg" caption="…" >}}` | встроенный шорткод Hugo |

---

## 5. Переводы и новые языки

### Подписи интерфейса

Тексты кнопок и заголовков блоков лежат в `i18n/ru.toml` и `i18n/en.toml`. В шаблонах они вызываются как `{{ i18n "allNews" }}`.
Новый ключ нужно добавить во **все** файлы `i18n/*.toml`.

### Добавить язык (например, китайский или немецкий)

1. В `hugo.toml` раскомментируйте готовый блок `[languages.zh]` или `[languages.de]`. Заполните `title` и `params`
   (`department_short`, `university`, `description`, `address`, `date_format`).
2. Скопируйте меню: блок `[languages.en.menus]` → `[languages.zh.menus]` и переведите `name`.
3. Создайте `i18n/zh.toml`: скопируйте `i18n/en.toml` и переведите значения.
4. Добавьте переводы страниц рядом с существующими: `_index.zh.md`, `news/…/index.zh.md` и т. д.
   Непереведённые страницы в этом языке просто не появятся.
5. Переключатель языков подхватит новый язык автоматически.

Основной язык задаётся параметром `defaultContentLanguage = 'ru'`, он открывается в корне сайта. Остальные языки живут в `/en/`, `/zh/` и т. д.

---

## 6. Меню

Меню описаны в `hugo.toml` отдельно для каждого языка:

```toml
[[languages.ru.menus.main]]
  identifier = 'education'     # нужен, если у пункта будут подпункты
  name = 'Образование'
  pageRef = '/education'       # путь в content/ БЕЗ суффикса языка
  weight = 20                  # порядок

[[languages.ru.menus.main]]
  parent = 'education'         # → попадёт в выпадающее мега-меню «Образование»
  name = 'Магистратура'
  pageRef = '/education/master'
  weight = 2
```

- `main`: верхнее меню. У пунктов с подпунктами на десктопе раскрывается мега-меню,
  на мобильных появляется раскрывающийся список. В мега-меню выводится `description` страниц.
- `footer`: колонка «Разделы» в подвале.
- Для внешней ссылки используйте `url = 'https://…'` вместо `pageRef`.

---

## 7. Новые страницы и разделы

**Раздел** — это папка с `_index.<lang>.md`. Например, раздел «Проекты»:

```
content/projects/_index.ru.md      ← title, description, weight
content/projects/_index.en.md
content/projects/alpha/index.ru.md ← страницы раздела (с картинками — в папке)
```

По умолчанию раздел выводится шаблоном `layouts/list.html` (текст и сетка карточек дочерних страниц),
а страницы — шаблоном `layouts/single.html`. Чтобы у раздела был свой вид, создайте `layouts/projects/list.html`
и/или `layouts/projects/single.html`. Hugo сам выберет шаблон по имени раздела.
За основу удобно взять `layouts/news/list.html`.

Отдельный шаблон для одной страницы: во front matter `layout = 'wide'` и файл `layouts/wide.html`.

Не забудьте добавить раздел в меню (раздел 6).

---

## 8. Анимации и поведение страниц

### Настройки (`hugo.toml`)

```toml
[params.animations]
  enable = true            # выключатель всех анимаций
  reveal = true            # появление блоков при прокрутке
  viewTransitions = true   # плавный переход между страницами
  hideHeaderOnScroll = true# шапка прячется при прокрутке вниз
  heroInterval = 7000      # автопрокрутка слайдера, мс (0 — выкл.)
  counters = true          # счётчики «набегают»
```

На отдельной странице анимации отключаются так: `animations = false` во front matter.
Для пользователей с системной настройкой «уменьшить движение» (`prefers-reduced-motion`) анимации отключаются автоматически.

### Анимировать любой блок

В шаблоне или в Markdown (HTML разрешён) добавьте атрибут:

```html
<div data-animate="fade-up">…</div>                <!-- fade-up, fade-down, slide-left, slide-right, zoom-in, blur-in -->
<div data-animate="zoom-in" data-delay="300">…</div><!-- задержка, мс -->
<div data-stagger="120">                            <!-- дети появляются по очереди -->
  <div data-animate="fade-up">1</div>
  <div data-animate="fade-up">2</div>
</div>
```

### Своя анимация появления

Добавьте в `assets/css/main.css` начальное состояние. Конечное состояние (`.is-visible`) общее для всех:

```css
.js-anim [data-animate="rotate-in"] { transform: rotate(-6deg) scale(.95); }
```

После этого можно писать `data-animate="rotate-in"`.

### Своя CSS-анимация (keyframes)

В блок `@theme` в `main.css`:

```css
--animate-pulse-slow: pulse-slow 3s ease-in-out infinite;
@keyframes pulse-slow { 50% { opacity: .6; } }
```

После этого в разметке доступен класс `animate-pulse-slow`. Задержку можно задать классом `[animation-delay:.2s]`.
Hover-эффекты задаются обычными классами Tailwind: `transition`, `hover:-translate-y-1`, `group-hover:scale-105`.

### Своё поведение на JavaScript

В `assets/js/main.js` каждое поведение — это функция `init…()`. Добавьте свою функцию и вызовите её в `init()` в конце файла.
Настройки из `hugo.toml` удобно передавать через `data-*` атрибуты `<html>` в `layouts/baseof.html`
(так сделано для `data-hero-interval`). В JS они доступны как `document.documentElement.dataset`.

---

## 9. Стили и шаблоны

### Цвета и шрифты

Цвета и шрифты задаются в `assets/css/main.css`, в блоке `@theme`:

```css
--color-brand:  #111111;   /* шапка, подвал (как bg-black в ananke) */
--color-accent: #a31f34;   /* акцент: кнопки, ссылки, подчёркивания */
--font-serif:   athelas, georgia, serif;
```

Из каждого цвета автоматически получаются классы `bg-accent`, `text-accent`, `border-accent`, `bg-accent/30` и т. д.

### Классы Tailwind

Просто пишите классы в шаблонах `layouts/`. Hugo сохраняет список используемых классов в `hugo_stats.json`,
а Tailwind генерирует только нужный CSS. Конфигурационный файл Tailwind не нужен.
Текст из Markdown оформляет плагин Typography (класс `prose`).

### Тема ananke: как её менять

Файлы в `themes/ananke/` **не правим**, иначе изменения потеряются при обновлении подмодуля.
Чтобы изменить шаблон темы, скопируйте его по **тому же пути** в `layouts/` проекта: файл проекта имеет приоритет.
Так уже переопределены `baseof.html`, `home.html`, `single.html`, `list.html`, `_partials/site-style.html`
(в нём отключён Tachyons) и `_partials/head-additions.html`. Из темы используются:
логика обложек (`func/GetFeaturedImage.html`), `func/ShowDate.html`, хуки (`hook.html`), иконки соцсетей
(`social/follow.html`), подсветка кода с кнопкой «Copy», i18n-строки.

Обновить тему: `git submodule update --remote themes/ananke`. После обновления проверьте `hugo server`.

### Логотип, контакты, соцсети

- Логотип: `params.site_logo = 'images/logo.svg'` (файл в `static/images/`).
- Название, адрес, телефон, email задаются для каждого языка в `[languages.<lang>.params]`.
- Соцсети: `[params.ananke.social.follow] networks = [...]` и `[params.ananke.social.<сеть>] username = '…'`.
  Список поддерживаемых сетей: `themes/ananke/config/_default/params.toml`.

---

## 10. Публикация на GitHub Pages

1. Создайте репозиторий на GitHub и отправьте в него проект (ветка `main`).
2. **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Каждый `git push` в `main` запускает `.github/workflows/hugo.yaml`. Workflow собирает сайт с правильным
   `baseURL` (`https://<user>.github.io/<repo>/` или свой домен) и публикует его.
   Ход сборки виден на вкладке **Actions**.

`baseURL` в `hugo.toml` — это заглушка, в CI она подменяется автоматически.
Поэтому в шаблонах **все ссылки строятся через `.RelPermalink` / `relURL`** и никогда не начинаются с `/`.
Иначе на project-сайте (`/<repo>/`) ссылки сломаются.

Свой домен: файл `static/CNAME` с доменом и настройка домена в Settings → Pages.

---

## 11. Частые проблемы

| Симптом | Причина и решение |
|---|---|
| `does not provide an export named 'registerHooks'` | старый Node. Нужен ≥ 22.15, лучше LTS 24 |
| `"tailwindcss" is not whitelisted` | в `hugo.toml` должен быть блок `[security.exec]` с `'^tailwindcss$'` |
| `TAILWINDCSS: … not found` | не выполнен `npm install` |
| Страница не появляется | `draft = true`, дата в будущем или опечатка в суффиксе языка (`index.ru.md`) |
| Пустая тема / ошибки про ananke | не скачан подмодуль: `git submodule update --init --recursive` |
| Новый класс Tailwind не применился | перезапустите `hugo server` (класс попадает в `hugo_stats.json` при сборке) |
| Картинка не найдена | файл должен лежать в папке страницы (page bundle) или в `assets/` |
| На GitHub Pages нет стилей / битые ссылки | где-то ссылка начинается с `/`; используйте `relURL`/`.RelPermalink` |
