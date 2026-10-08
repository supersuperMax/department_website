+++
title = '{{ replace .File.ContentBaseName "-" " " | strings.FirstUpper }}'
description = ''
date = '{{ .Date }}'
draft = true
weight = 10
# toc = true        # оглавление над текстом
# sidebar = false   # убрать боковую навигацию по разделу
# animations = false  # отключить анимации на этой странице
+++
Текст страницы в Markdown.
