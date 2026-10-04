# GuideSection schema-pass

Статус: **EXECUTABLE TEST — результат не считать evidence до фактического запуска**

Цель — сравнить два storage shape для GuideSection на закреплённом стеке
Payload 3.90.2 + Postgres 16:

1. **Array shape** — Guide содержит нелокализованный массив section rows со
   stable row ID и localized leaves.
2. **Collection shape** — GuideSection является отдельной collection и имеет
   relationship к Guide.

Проверяются:

- атомарность публикации Guide;
- стабильность section ID при save/reorder;
- независимость EN/RU;
- drafts/versioning;
- пригодность section identity для component-manifest hashing.

Запуск:

    cd spike/payload
    set -a
    source .env
    set +a
    docker compose up -d
    npm install
    npm run guide-sections

Для чистого запуска:

    docker compose down -v
    docker compose up -d
    npm run guide-sections

Ожидаемая интерпретация:

- array shape считается предпочтительным только если row IDs реально сохраняются
  при save/reorder и locale/draft/version behavior не ломается;
- separate collection должна явно показать, допускает ли Payload частичную
  публикацию siblings; если да, это архитектурная цена shape и потребуется
  дополнительная transaction/orchestration boundary;
- результат теста фиксируется отдельным EVIDENCE-документом только после
  фактического запуска.
