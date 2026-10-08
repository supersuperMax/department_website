+++
title = '{{ replace .File.ContentBaseName "-" " " | strings.FirstUpper }}'
description = 'Кратко о мероприятии.'
# date — дата публикации (не ставьте в будущее: Hugo не публикует такие страницы)
date = '{{ .Date }}'
# eventDate — когда проходит мероприятие
eventDate = '{{ .Date }}'
# eventEnd = ''
location = ''
# registration = 'https://…'
draft = true
+++
Программа мероприятия.
