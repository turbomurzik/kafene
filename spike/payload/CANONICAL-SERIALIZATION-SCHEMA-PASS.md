# Canonical serialization schema-pass

Статус: **EXECUTABLE TEST — результат не считать evidence до фактического запуска**

Цель — проверить versioned serialization contract, на котором будут строиться
verification component hashes и generation input hashes.

Тестируемый contract:

- `hash_spec_version = kafene-canonical-json-v1`;
- object keys сортируются детерминированно;
- strings нормализуются в Unicode NFC;
- `null` является явным значением;
- object field со значением `undefined` трактуется как отсутствующее поле;
- `undefined` внутри array запрещён и приводит к fail-closed error;
- array order сохраняется и считается semantic;
- finite numbers сериализуются JSON-детерминированно; `-0` нормализуется в `0`;
- NaN/Infinity запрещены;
- rich-text сериализуется как структурированный JSON tree, а не rendered HTML/text;
- object-key order внутри rich-text не влияет на hash;
- semantic child order rich-text влияет на hash.

Этот schema-pass не определяет, **какие поля** входят в конкретный
VerificationRecord component. Он проверяет только deterministic serialization
уже выбранного component value.

Запуск из `spike/payload`:

    npm run canonical-serialization

БД и Docker для этого теста не нужны.

Результат становится EVIDENCE только после фактического запуска и фиксации
PASS/FAIL output.
