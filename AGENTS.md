# AGENTS.md

Сайт кафедры МГУ: Hugo 0.167 + тема ananke (git-подмодуль) + Tailwind CSS v4, языки ru (основной) и en, хостинг на GitHub Pages.
Подробная инструкция для людей лежит в `README.md`. Этот файл — правила для агентов, работающих с кодом.

## Setup commands

```bash
npm install                      # Tailwind (обязательно перед первой сборкой)
hugo server                      # dev, http://localhost:1313/department_website/
hugo server -D                   # с черновиками
hugo --gc --minify               # прод-сборка в public/
hugo --gc --minify --baseURL https://user.github.io/repo/ -d /tmp/out   # проверка подпути GH Pages
hugo new content news/<slug>     # новость-бандл (archetypes/news/), затем index.md → index.ru.md
```

Требуется Node ≥ 22.15. В Hugo 0.167 ESM-хук использует `module.registerHooks`, на Node 22.13 сборка Tailwind падает.

## Architecture

- **Вся конфигурация в одном `hugo.toml`**: языки (`[languages.xx]` с `params` и `menus`), `[params.animations]`,
  настройки Tailwind (`build.buildStats`, `cachebusters`, mount `hugo_stats.json`), `[security.exec]` (разрешён `tailwindcss`).
- **Тема `themes/ananke` не редактируется.** Всё, что меняется, переопределяется в `layouts/` по тому же пути.
  Переопределены `baseof`, `home`, `single`, `list`, `taxonomy`, `term`, `404`, `_partials/site-style.html`
  (Tachyons отключён, из CSS темы остались только `_code.css`, `_social-icons.css`, `_hugo-internal-templates.css`)
  и `_partials/head-additions.html` (подключает `assets/js/main.js`).
  Из темы переиспользуются: `func/GetFeaturedImage*.html`, `func/ShowDate.html`, `hook.html` и хуки, `social/follow.html`,
  `_markup/render-codeblock.html`, `site-scripts.html` (кнопка «Copy» у кода), i18n-строки.
- **Шаблоны** используют новую систему Hugo (≥0.146): `layouts/<section>/list.html|single.html`, `_partials/`, `_shortcodes/`, `_markup/`.
  - `_partials/header.html`: верхняя полоса, меню `main` с мега-панелями (у пунктов с `parent`), мобильная панель.
  - `_partials/page-hero.html`: шапка страницы; обложка с затемнением (ananke-стиль) или тёмная полоса.
  - `_partials/cards/{news,event,person}.html`, `card-image.html`: карточки; картинки через `.Fill … webp`.
  - `_partials/lang-switcher.html`: `hugo.Sites` + `.AllTranslations`, новые языки подхватываются сами.
  - `_markup/render-image.html`: картинки из Markdown → `<figure>` + srcset WebP (page bundle → `assets/` → `static/`).
- **Контент**: переводы по имени файла (`index.ru.md` + `index.en.md` в одной папке, ресурсы общие).
  `contentDir` не используется. Файл без суффикса считается `ru`. Разделы: about, education, research, people, news, events, contacts.
  Главная настраивается через front matter `content/_index.<lang>.md` (`hero`, `stats`, `quicklinks`; пути картинок в `assets/`).
- **Стили**: `assets/css/main.css` (`@import "tailwindcss"`, `@plugin typography`, `@source "hugo_stats.json"`, токены в `@theme`:
  `brand`, `accent`, `paper`, шрифты, `--animate-*`). Tailwind собирается в `templates.Defer` (так рекомендует Hugo).
- **JS**: `assets/js/main.js`, модули `init*()`: reveal (`data-animate`, `data-delay`, `data-stagger`), шапка, мега-меню,
  мобильное меню, hero-слайдер, счётчики (`data-count-to`). Настройки передаются через `data-*` на `<html>` (`baseof.html`).

## Rules

1. **Ссылки только относительные к baseURL**: `.RelPermalink`, `relURL`/`relLangURL` от пути **без** ведущего `/`,
   в меню `pageRef`. Строка `href="/…"` ломает project-сайт на GitHub Pages (`/<repo>/…`).
2. **Не использовать классы Tachyons** (`pa3`, `w-100`, `f4`…): он не подключён. Только Tailwind.
3. Классы Tailwind должны встречаться в шаблонах **целиком** (Hugo собирает их в `hugo_stats.json`).
   Нельзя собирать имя класса из частей, например `bg-{{ $color }}`. Для динамики используйте `dict` с полными именами
   (см. `page-hero.html`, `gallery.html`) или inline `style`.
4. **Контент зеркальный**: меняете или добавляете страницу в `*.ru.md` — сделайте `*.en.md` (и другие включённые языки).
   Новые строки интерфейса добавляйте в **каждый** `i18n/*.toml`, в шаблоне — `{{ i18n "key" }}`, без хардкода текста.
5. Новые пункты меню добавляйте в `menus` **каждого** языка в `hugo.toml`.
6. В комментариях шаблонов `{{/* … */}}` не должно быть `*/` внутри (например, глобов `*cover*/*`): это ломает парсинг.
7. `else with` допустим только внутри `with`, а не после `if`.
8. Анимации должны уважать `prefers-reduced-motion` и `params.animations.enable`. Без JS контент должен быть виден
   (скрытие `[data-animate]` срабатывает только под классом `.js-anim`).
9. События: `date` — дата публикации, должна быть в прошлом, иначе Hugo не опубликует страницу. Дата мероприятия хранится в `eventDate`.
10. Подмодуль ananke обновляется только через `git submodule update --remote`.

## Testing

1. `hugo --gc` проходит без `ERROR`/`WARN` (deprecation-предупреждения тоже исправляем).
2. `hugo server`: открываются `/`, `/en/`, `/news/`, страница новости, `/people/`, `/events/`, `/contacts/`.
   Видны меню и карточки, переключатель языка ведёт на перевод.
3. Прод-сборка с `--baseURL https://user.github.io/repo/`: в HTML нет `href`/`src`, начинающихся с `/`, но не с `/repo/`.
4. Деплой выполняет `.github/workflows/hugo.yaml` (Hugo 0.167.0 extended, Node 24, `npm ci`, `--baseURL` из configure-pages).

## Boundaries

- **Always**: перед сдачей работы запускать `hugo --gc`; править WARN и deprecation тоже.
- **Never**: редактировать `themes/ananke`; ставить `href="/…"` / `src="/…"` без учёта baseURL; хардкодить строки UI вместо `{{ i18n "key" }}`.
