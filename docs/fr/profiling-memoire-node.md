# Profilage mémoire de Node.js en production

Les métriques (`process_resident_memory_bytes`, `nodejs_heap_size_used_bytes`…)
disent *si* le tas monte et *où* — tas JS ou natif. Elles ne disent pas **quel
code** alloue. Pour ça, l'API peut profiler en continu les allocations de
quelques conteneurs et pousser ces profils dans OpenObserve, à côté des traces.

## Comment ça marche

Sur un conteneur visé, l'API enchaîne des fenêtres courtes (30 s par défaut) de
profilage des allocations **en incluant les objets collectés**, et pousse
chaque profil au collector OpenTelemetry, qui le transmet à OpenObserve comme
profil OTLP :

```
Node (pprof alloc_space) ──POST /v1/pprof──▶ collector (receiver pprof) ──OTLP profiles──▶ OpenObserve
```

Inclure les objets collectés est ce qui rend visibles les **sauts du tas** —
plusieurs dizaines de Mo qui montent puis redescendent en quelques secondes,
un gros résultat SQL, une sérialisation : devant un saut sur la courbe du tas,
le profil de la même fenêtre dit quel code a alloué. Un profil limité aux
survivants ne les verrait pas, ces objets étant déjà collectés à la fermeture
de la fenêtre.

Les pièces :

| Fichier | Rôle |
| ------- | ---- |
| [`allocation-profile-exporter.js`](../../api/src/shared/infrastructure/heap-profile/allocation-profile-exporter.js) | boucle des fenêtres, filtrage par conteneur, envoi au collector |
| [`sampling-heap-profiler.js`](../../api/src/shared/infrastructure/heap-profile/sampling-heap-profiler.js) | dialogue avec le profileur de V8 via `node:inspector` |
| [`pprof-encoder.js`](../../api/src/shared/infrastructure/heap-profile/pprof-encoder.js) | conversion du profil V8 au format pprof |
| [`container-selector.js`](../../api/src/shared/infrastructure/utils/container-selector.js) | grammaire de sélection des conteneurs visés |

## Activation

Deux étages :

1. **la variable d'environnement** `HEAP_PROFILE_EXPORT_ENDPOINT` pointe vers le
   receiver du collector. Non posée, elle vaut `OTEL_EXPORTER_OTLP_ENDPOINT`
   suivi de `/v1/pprof`, le collector exposant le receiver pprof sur le même
   hôte. Sans aucune des deux, rien ne démarre. Avec, les process
   lancés avec `tracing*.js` (`web` et `worker`) démarrent la boucle, qui ne
   profile rien tant que le feature toggle ne vise pas leur conteneur ;
2. **le feature toggle** `heapProfileExportContainers` choisit les conteneurs
   profilés. Il est relu à chaque fenêtre : on active et coupe l'export sans
   redémarrer. Vide par défaut, il vaut `all` en review app.

```sh
# activer sur deux conteneurs
scalingo -a pix-api run npm run toggles -- -k heapProfileExportContainers -v web-2,worker-1
# couper partout
scalingo -a pix-api run npm run toggles -- -k heapProfileExportContainers -v ''
```

Le toggle prend un sélecteur, comparé au `CONTAINER` de chaque conteneur :

| Valeur | Conteneurs profilés |
| ------ | ------------------- |
| *(vide, défaut hors review app)* | aucun |
| `web-2` | `web-2` uniquement |
| `web-2,worker-1` | plusieurs conteneurs (virgules ou espaces) |
| `web` | tous les conteneurs web |
| `web-%3` | un conteneur web sur trois |
| `all` | tous les conteneurs |

Hors Scalingo, `CONTAINER` n'est pas posé et aucun sélecteur ne vise le
process : pour essayer en local, lancer l'API avec par exemple `CONTAINER=web-1`.

| Variable | Défaut | Rôle |
| -------- | ------ | ---- |
| `HEAP_PROFILE_EXPORT_ENDPOINT` | `$OTEL_EXPORTER_OTLP_ENDPOINT/v1/pprof` | URL du receiver, ex. `http://otel-collector:4040/v1/pprof` |
| `HEAP_PROFILE_EXPORT_WINDOW` | `30s` | durée d'une fenêtre, donc résolution temporelle des profils |
| `HEAP_PROFILE_SAMPLING_INTERVAL` | `524288` | un échantillon par tranche de N octets alloués |

L'export ne dépend pas du feature toggle `isOpenTelemetryEnabled` : il a le sien.

## Côté collector

Le signal profiles est en alpha : il faut lancer le collector avec
`--feature-gates=+service.profilesSupport` (testé avec `otelcol-contrib` 0.153.0).

Le pprof ne porte pas de ressource OpenTelemetry : l'API envoie le service et le
conteneur dans des en-têtes, que le collector recopie en attributs.

```yaml
receivers:
  pprof:
    server:
      endpoint: 0.0.0.0:4040
      include_metadata: true

processors:
  resource/pprof:
    attributes:
      - key: service.name
        from_context: metadata.x-service-name
        action: upsert
      - key: scalingo.container
        from_context: metadata.x-scalingo-container
        action: upsert

exporters:
  otlp_http/openobserve:
    profiles_endpoint: https://<openobserve>/api/<org>/v1/profiles
    headers:
      Authorization: Basic <…>
      stream-name: default

service:
  pipelines:
    profiles:
      receivers: [pprof]
      processors: [resource/pprof]
      exporters: [otlp_http/openobserve]
```

Ne pas ajouter de labels aux échantillons pprof : OpenObserve rejette alors le
lot (`dictionary.attribute_table[0] must be the zero value`).

## Lire les profils

OpenObserve range un profil à plat, une ligne par pile : colonnes `stack`
(feuille en tête, frames séparées par `;`), `value` (octets alloués pendant la
fenêtre), `profile_type` (`alloc_space`), `service_name`, `scalingo_container`.
Chaque frame porte son fichier et sa ligne, relatifs à la racine de l'API :
`from;getResults (src/prescription/…/get-results.js:10);…`.

Les piles qui ont le plus alloué sur un conteneur, autour d'un saut :

```sql
SELECT stack, sum(value) AS bytes
FROM "default"
WHERE profile_type = 'alloc_space' AND scalingo_container = 'web-3'
GROUP BY stack
ORDER BY bytes DESC
LIMIT 20
```

La page *Profiles* d'OpenObserve affiche les mêmes données en flamegraph.

## Coût

Un profil échantillonné n'intercepte qu'une allocation par tranche de
`samplingInterval` octets, et n'en retient que la pile d'appels. Rien à voir avec
un snapshot du tas, qui construit en mémoire le graphe complet des objets avant
d'émettre le moindre octet.

À tas identique (~250 Mo répartis en 1,5 million de petits objets, Node 24) :

| | `v8.getHeapSnapshot()` | profil échantillonné |
| --- | --- | --- |
| sortie | 411 Mo, soit 56 Mo gzippés | 14 Ko, soit 1,4 Ko gzippé |
| durée | 19 s | ~100 ms, à l'arrêt du profileur |
| gel de la boucle d'événements | 13 s **d'un seul tenant** | non mesurable |
| pic RSS | +2 438 Mo, qui ne redescendent pas | +0 Mo |

C'est cette colonne de gauche qui a fait écarter les snapshots : sur un conteneur
au bord de sa limite, un snapshot déclenchait très probablement l'OOM kill qu'on
cherchait à comprendre.

Reste le coût de l'échantillonnage, permanent sur un conteneur visé par l'export.
Mesuré sur une boucle volontairement pathologique (~17 millions de petits objets
alloués par seconde, soit bien plus que ce que fait l'API) :

| Intervalle | Débit d'allocation | Échantillons (6 s) | Taille du profil |
| ---------- | ------------------ | ------------------ | ---------------- |
| sans profileur | 17,0 M/s (référence) | — | — |
| 512 Ko (notre défaut) | 16,3 M/s, −4 % | ~450 | 20 Ko |
| 32 Ko (défaut de V8) | 13,5 M/s, −21 % | ~7 300 | 300 Ko |

Les deux intervalles désignent les mêmes sites d'allocation : le défaut de V8 ne
paie que du détail sur les sites marginaux. D'où `HEAP_PROFILE_SAMPLING_INTERVAL`
à 512 Ko, à ne baisser que si un profil revient trop pauvre.

Le délai d'attente de la boucle d'événements, lui, ne bouge pas pendant la
fenêtre : p99 à 5,8 ms sans profileur, 6,2 ms avec.

Ces mesures portent sur les seuls survivants. L'export inclut aussi les objets
collectés, que V8 doit alors garder dans le profil jusqu'à la fin de la
fenêtre : d'où des fenêtres courtes, et un export réservé à quelques
conteneurs plutôt que posé sur `all`.

## Précautions

- **viser peu de conteneurs**, ceux dont les métriques montrent des sauts ;
- le profileur de V8 est unique par process et partagé par toutes les sessions
  inspector : ne pas profiler à la main (`--inspect`) un conteneur visé ;
- la fenêtre ne retarde pas l'arrêt du conteneur : son minuteur est `unref`, un
  déploiement perd la fenêtre en cours, pas le redémarrage.

## Quand le RSS ne suit pas le tas

Le profil ne voit que le tas JS. La métrique `pix_api_process_memory_bytes`
(cf. [`memory-metrics.js`](../../api/src/shared/infrastructure/metrics/memory-metrics.js))
décompose donc le RSS en continu :

| Champ | Ce que c'est | S'il pèse lourd |
| --- | --- | --- |
| `RssFile` | binaire node, bibliothèques, fichiers mappés | rien à faire, c'est fixe |
| `heapPhysicalTotal` (détail par espace dans `heapPhysical`) | pages réservées par V8, à comparer à `heapUsed` | V8 garde le tas au niveau du dernier pic ; regarder `new_space` et `large_object_space` |
| `external`, `arrayBuffers` | Buffers hors tas : sockets, PDF, gzip | snapshot du tas, chercher les `ArrayBuffer` retenus |
| `nativeUnaccounted` | `RssAnon` moins le tas réservé et `external` : malloc natif, fragmentation, piles de threads | essayer `MALLOC_ARENA_MAX=2`, puis jemalloc |
| `VmSwap` | mémoire passée en swap | le conteneur est à l'étroit dans sa taille |

`nativeUnaccounted` est une estimation, plus parlante comparée d'un conteneur à
l'autre qu'en valeur absolue. Les champs issus de `/proc/self/status` manquent
hors Linux.

## Tester `MALLOC_ARENA_MAX` ou jemalloc sur quelques conteneurs

L'allocateur natif se choisit au démarrage du process. Le Procfile lance donc
`web` et `worker` à travers
[`with-malloc-tuning.sh`](../../api/scripts/with-malloc-tuning.sh), qui ne règle
que les conteneurs visés :

| Variable | Rôle |
| --- | --- |
| `JEMALLOC_CONTAINERS` | conteneurs qui tournent sous jemalloc (`LD_PRELOAD`), même grammaire que le feature toggle ci-dessus. Vide : aucun |
| `JEMALLOC_PATH` | chemin de la bibliothèque. Par défaut, celle que l'apt-buildpack installe d'après [`Aptfile`](../../api/Aptfile) |
| `MALLOC_CONF` | réglages de jemalloc, ignorés par glibc : peut être posée pour tous les conteneurs |
| `MALLOC_ARENA_MAX_CONTAINERS` | conteneurs visés par `MALLOC_ARENA_MAX`, même grammaire (`web-2`, `web-%3`…). Vide : aucun |
| `MALLOC_ARENA_MAX_VALUE` | nombre d'arenas, 2 par défaut |

jemalloc ignore `MALLOC_ARENA_MAX` : un conteneur visé par les deux sélecteurs ne
reçoit que jemalloc. Pour comparer les trois allocateurs en même temps, on peut
par exemple poser `JEMALLOC_CONTAINERS=web-%3` et
`MALLOC_ARENA_MAX_CONTAINERS=web-%2`.

Le réglage prend effet au prochain démarrage du conteneur. Un conteneur réglé
l'annonce dans ses logs (`web-2 : MALLOC_ARENA_MAX=2`, ou
`web-3 : jemalloc (/app/.apt/…/libjemalloc.so.2)`) ; si la bibliothèque manque, il
démarre sous glibc malloc et le dit (`jemalloc introuvable`). On compare ensuite
`native_unaccounted` et `swap` entre conteneurs réglés et non réglés, en écartant
les séries figées que le pushgateway garde pour les conteneurs arrêtés :

```promql
pix_api_process_memory_bytes{type=~"native_unaccounted|swap"}
  and on(instance) changes(pix_api_process_memory_bytes{type="rss"}[10m]) > 0
```

## Données personnelles

Un profil d'allocation ne contient **que des piles d'appels** : noms de
fonctions, URLs de scripts, numéros de ligne, et des tailles en octets. Aucun
contenu d'objet, donc ni payload de requête, ni adresse e-mail, ni jeton, ni
secret.

C'est toute la différence avec un snapshot du tas, qui est à peu de chose près un
export non filtré de ce que le conteneur manipulait à cet instant — et la raison
pour laquelle le profil peut être stocké dans OpenObserve avec les traces.

## Ce que ça ne couvre pas

- le profil dit qui **alloue**, pas qui **retient**. Quand la chaîne de rétention
  est la question — « pourquoi ce cache n'est-il jamais vidé ? » — il faut un
  snapshot du tas et sa vue *Retainers*, avec le coût du tableau ci-dessus. Sur
  un conteneur de production, l'ordre à respecter est : profil d'abord, snapshot
  seulement si le profil ne suffit pas, et sur un conteneur qui peut mourir ;
- les conteneurs one-off, le `postdeploy` et les jobs cron ne sont pas lancés
  avec `tracing*.js` : ils ne sont jamais profilés ;
- un OOM kill brutal perd la fenêtre en cours : pour attraper l'état juste avant
  la mort, c'est `--heapsnapshot-near-heap-limit=1` qu'il faut, posé dans
  `NODE_OPTIONS`. Deux réserves : il s'applique à tous les conteneurs de
  l'application, et le snapshot est écrit dans le système de fichiers éphémère
  du conteneur, donc perdu avec lui.
