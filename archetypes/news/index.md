+++
title = '{{ replace .File.ContentBaseName "-" " " | strings.FirstUpper }}'
description = 'Одно-два предложения: показываются в карточке новости и под заголовком.'
date = '{{ .Date }}'
draft = true
author = ''
categories = ['Новости']
tags = []
# Обложка: положите в эту папку файл cover.jpg (или .png/.webp) — он подхватится сам.
# cover_dimming = 60   # затемнение обложки, 0..100
+++
Текст новости.

<!-- Картинка из этой же папки (подпись в кавычках необязательна): -->
<!-- ![Описание картинки](photo.jpg "Подпись") -->

<!-- Галерея из подпапки gallery/: -->
<!-- {{< gallery match="gallery/*" >}} -->
