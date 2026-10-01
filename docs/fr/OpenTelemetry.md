# Traces, métriques et logs avec OpenTelemetry

L'API est instrumentée avec OpenTelemetry : elle produit des traces (requêtes HTTP, requêtes SQL,
appels sortants, jobs PgBoss, cas d'usage et repositories via `tracing.spanify`), des métriques et
des logs, et les envoie à un backend OTLP.

Le SDK est démarré par le préchargement `tracing.js`, déjà présent dans les scripts npm
(`npm run dev`, `npm start`, `npm run start:job`…). Ce qui s'active et se désactive, c'est
**l'envoi des données**, piloté par le feature toggle `isOpenTelemetryEnabled` — à chaud, sans
redémarrer l'API.

## Tester en dev

Démarrer Jaeger, qui sert de backend de traces, et Redis, qui stocke les feature toggles :

```
docker compose -f compose.yaml -f compose.opentelemetry.yaml up -d jaeger redis
```

Dans le fichier [`api/.env`](../../api/.env), décommenter la variable `OTEL_EXPORTER_OTLP_ENDPOINT`
depuis le fichier [`api/sample.env`](../../api/sample.env) :

```
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
```

Démarrer l'API, puis activer l'envoi des données :

```
npm run toggles -- --key isOpenTelemetryEnabled --value true
```

L'API n'a pas besoin d'être redémarrée : elle logue `OpenTelemetry data export is now enabled` et
les premières données partent au batch suivant (environ 5 s pour les traces, 30 s pour les
métriques).

Visionner les traces sur Jaeger http://localhost:16686/, en choisissant le service `pix-api`
(ou `pix-api-worker`, `pix-api-maddo`, `pix-api-maddo-worker` selon le process).

Pour couper l'envoi :

```
npm run toggles -- --key isOpenTelemetryEnabled --value false
```

Et pour vérifier l'état courant du toggle :

```
npm run toggles -- --list
```

## Bon à savoir

Le toggle est stocké dans Redis, donc sa valeur survit aux redémarrages, et le changement est
propagé à tous les process abonnés (web, worker) via le pubsub Redis. En local, Redis est donc
indispensable : sans `REDIS_URL`, le stockage des feature toggles est en mémoire et chaque process
a sa propre copie, que le script ne peut pas modifier.

En dev la valeur par défaut est `false`, il faut donc l'activer explicitement. Sur les review apps
elle est à `true` par défaut (`devDefaultValues.reviewApp`).

Quand le toggle est à `false`, les traces, métriques et logs continuent d'être collectés : seul
l'envoi est coupé, par les exporters (voir
`api/src/shared/infrastructure/open-telemetry/gated-exporter.js`). C'est ce qui permet de basculer
sans redémarrage. À l'inverse, l'instrumentation Hapi et les proxies `tracing.spanify` ne sont
posés qu'au démarrage : un process lancé sans le préchargement `tracing.js` ne produira rien, quel
que soit le toggle.

Jaeger ne stocke que des traces. Comme l'API exporte aussi des métriques et des logs, la
configuration [`jaeger.yaml`](../../jaeger.yaml) ajoute deux pipelines qui les absorbent, sans quoi
chaque export répondrait 404 et remplirait les logs de l'API d'erreurs. Pour regarder réellement
les métriques et les logs en local, il faut un backend OTLP complet (un collecteur OpenTelemetry
suivi d'un Prometheus et d'un Loki, par exemple) plutôt que Jaeger seul.
