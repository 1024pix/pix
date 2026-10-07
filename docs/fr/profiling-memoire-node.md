# Profilage mémoire de Node.js en production

Les métriques (`process_resident_memory_bytes`, `nodejs_heap_size_used_bytes`…)
disent *si* on fuit et *où* — tas JS ou natif. Elles ne disent pas **quel code**
alloue ce qui s'accumule. Pour ça il faut profiler les allocations du conteneur
qui fuit, pendant qu'il fuit.

Le mécanisme décrit ici permet de demander ce profil à un conteneur précis, sans
redéployer et sans accès shell au conteneur.

## Comment ça marche

```
scalingo run node scripts/take-heap-profile.js --containers web-2 --duration 5m
        │
        │  publie { requestId, containers, durationMs, requestedAt } sur Redis
        ▼
  heap-profile:request ──────────► tous les conteneurs abonnés
                                          │
                                          │ chacun compare son CONTAINER
                                          │ au sélecteur : seul web-2 poursuit
                                          ▼
                              HeapProfiler.startSampling
                                          │
                                          │  pendant la fenêtre, le conteneur
                                          │  sert le trafic normalement
                                          ▼
                              HeapProfiler.stopSampling
                                          │  gzip + base64 : quelques kilo-octets
                                          ▼
        ◄───── heap-profile:result ───────┘  { status: started }, puis { profile, … }
```

Les pièces :

| Fichier | Rôle |
| ------- | ---- |
| [`heap-profile-listener.js`](../../api/src/shared/infrastructure/heap-profile/heap-profile-listener.js) | abonnement Redis, filtrage par conteneur, publication des résultats |
| [`heap-profile-recorder.js`](../../api/src/shared/infrastructure/heap-profile/heap-profile-recorder.js) | fenêtre de profilage, compression, verrou |
| [`sampling-heap-profiler.js`](../../api/src/shared/infrastructure/heap-profile/sampling-heap-profiler.js) | dialogue avec le profileur de V8 via `node:inspector` |
| [`heap-profile-summary.js`](../../api/src/shared/infrastructure/heap-profile/heap-profile-summary.js) | agrégation de l'arbre de piles par site d'allocation |
| [`memory-breakdown.js`](../../api/src/shared/infrastructure/heap-profile/memory-breakdown.js) | décomposition du RSS avant et après la fenêtre |
| [`container-selector.js`](../../api/src/shared/infrastructure/utils/container-selector.js) | grammaire de sélection des conteneurs visés |
| [`take-heap-profile.js`](../../api/scripts/take-heap-profile.js) | script de déclenchement, à lancer dans un conteneur one-off |

Trois choix qui expliquent la forme du dispositif :

- **le déclencheur passe par Redis** parce que Scalingo ne donne pas de shell sur
  un conteneur `web` en cours d'exécution : il n'y a aucun moyen de signaler un
  process précis depuis l'extérieur. Un `pub/sub` diffuse la demande à tous les
  conteneurs, et chacun décide s'il est concerné ;
- **le profil revient par Redis lui aussi**, gzippé puis encodé en base64. Il
  pèse quelques kilo-octets : pas la peine d'un bucket pour le transporter, et
  rien à provisionner pour activer le dispositif ;
- **un accusé de démarrage est publié avant la fenêtre**, sinon le script
  attendrait cinq minutes sans savoir si un conteneur a pris la demande.

## Mise en place

```sh
scalingo -a pix-api env-set HEAP_PROFILE_ENABLED=true
```

C'est tout. `HEAP_PROFILE_ENABLED=true` ne profile rien : il met seulement les
conteneurs `web` et `worker` à l'écoute. Tant qu'aucune demande n'est publiée, le
coût est celui d'un abonnement Redis.

| Variable | Défaut | Rôle |
| -------- | ------ | ---- |
| `HEAP_PROFILE_ENABLED` | `false` | met le conteneur à l'écoute des demandes |
| `HEAP_PROFILE_SAMPLING_INTERVAL` | `524288` | un échantillon par tranche de N octets alloués |
| `HEAP_PROFILE_DEFAULT_DURATION` | `5m` | fenêtre par défaut, quand la demande n'en porte pas |
| `HEAP_PROFILE_MAX_DURATION` | `30m` | fenêtre maximale, quelle que soit la demande |
| `HEAP_PROFILE_MAX_REQUEST_AGE` | `30s` | au-delà, une demande reçue est jugée périmée et ignorée |

## Prendre un profil

```sh
scalingo -a pix-api run node scripts/take-heap-profile.js \
  --containers web-2 --duration 5m --reason "RSS qui monte depuis ce matin" \
  | tee /tmp/profilage.log
```

Le script affiche l'accusé de démarrage, puis, à la fermeture de la fenêtre, le
profil et ses plus gros sites d'allocation :

```
web-2 : profilage démarré
web-2 : profil reçu (1243 échantillons, tas 412.0 Mo → 487.3 Mo), écrit dans /tmp/web-2-2026-09-30T10-12-03.heapprofile
   1.   38.5 Mo  buildLearnerRow (file:///app/src/prescription/.../learner-repository.js:214)
   2.   12.1 Mo  push (natif:1)
   …

----- DÉBUT PROFIL web-2 (gzip+base64) -----
H4sIAAAAAAAAA+xdW3PbOJb+K1N+2qly…
----- FIN PROFIL web-2 -----
```

Le conteneur visé journalise la même chose, ses dix premiers sites compris — ce
qui reste la trace si la sortie du script a été perdue :

```sh
scalingo -a pix-api logs --lines 200 | grep heap-profile
```

### Récupérer le fichier

Un conteneur one-off disparaît avec son système de fichiers : le fichier écrit
par le script y est inutilisable. Le bloc base64 de la sortie standard est ce qui
sort du conteneur, à reconstituer en local :

```sh
sed -n '/----- DÉBUT PROFIL/,/----- FIN PROFIL/p' /tmp/profilage.log \
  | sed '1d;$d' | tr -d '\r\n' | base64 -d | gunzip > web-2.heapprofile
```

### Sélecteurs

Le sélecteur est comparé au `CONTAINER` de chaque conteneur abonné :

| `--containers` | Conteneurs visés |
| -------------- | ---------------- |
| `web-2` | `web-2` uniquement |
| `web-2,worker-1` | plusieurs conteneurs |
| `web` | tous les conteneurs web |
| `web-%3` | un conteneur web sur trois |
| `all` | tous les conteneurs |

Profiler coûte peu, mais un profil ne se lit que rapporté à un conteneur : viser
`all` produit autant de profils mélangés dans la même sortie, dont un seul
concerne le conteneur qui fuit.

### Statuts possibles

| `status` | Signification |
| -------- | ------------- |
| `started` | la fenêtre est ouverte sur ce conteneur ; le profil suivra |
| `done` | profil dans `profile`, gzippé et encodé en base64 |
| `skipped` + `in-progress` | une fenêtre est déjà ouverte sur ce process |
| `failed` | le profilage a échoué, `error` porte le message |

Aucune réponse du tout : soit `HEAP_PROFILE_ENABLED` n'est pas à `true`, soit le
sélecteur ne correspond à aucun conteneur, soit les conteneurs visés tournent
encore sur une version de l'API antérieure à ce dispositif.

## Exploiter un profil

Les dix premiers sites affichés par le script suffisent souvent. Pour le reste,
dans Chrome : *DevTools* → onglet *Memory* → *Load profile* → le
`.heapprofile`. Deux vues utiles :

- **Heavy (Bottom Up)** : les sites d'allocation classés par taille, et pour
  chacun les chemins d'appel qui y mènent. C'est la vue qui répond à « qui
  alloue ce qui s'accumule » ;
- **Tree (Top Down)** : l'arbre depuis la racine, pour rattacher un site à une
  route, un job ou un `setInterval`.

Ce qui apparaît dans le profil, ce sont les allocations **qui ont survécu à la
fenêtre** : V8 retire les échantillons dont l'objet a depuis été collecté. Un
site qui alloue énormément d'objets éphémères n'y figure donc pas, et c'est
voulu — il n'a rien à voir avec une fuite. Mesuré sur 200 000 objets retenus
mêlés à 2 000 000 d'objets jetés aussitôt :

| | attribué aux objets retenus | attribué aux objets jetés |
| --- | --- | --- |
| par défaut | 30,3 Mo | **0 Mo** |
| `--include-collected` | 45,1 Mo | 330,4 Mo |

D'où les deux usages :

- **traquer une fuite** : sans option. Ce qui ressort a survécu ;
- **comprendre une pression sur le GC** (beaucoup de CPU en `scavenge`, des
  pauses fréquentes) : `--include-collected`, qui rend visible le débit
  d'allocation, survivants ou pas.

### Quand le RSS ne suit pas le tas

Le profil ne voit que le tas JS. Le résultat porte donc aussi `memoryBefore` et
`memoryAfter`, une décomposition du RSS que le script résume sur une ligne :

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

C'est cette colonne de gauche qui a fait remplacer le dispositif de snapshot par
celui-ci : sur un conteneur au bord de sa limite, un snapshot déclenchait très
probablement l'OOM kill qu'on cherchait à comprendre.

Reste le coût pendant la fenêtre, qui tient à l'intervalle d'échantillonnage.
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

## Précautions

- **viser un seul conteneur**, celui dont les métriques montrent qu'il fuit ;
- **une fenêtre qui couvre la fuite** : si le RSS monte de quelques Mo par heure,
  cinq minutes ne captureront presque rien. Prendre alors une fenêtre plus
  longue (jusqu'à `HEAP_PROFILE_MAX_DURATION`), quitte à la lancer dans un
  `screen` ;
- **un seul profilage à la fois par conteneur** : V8 n'a qu'un profileur
  d'allocation par process, partagé par toutes les sessions inspector. Une
  seconde demande reçue pendant une fenêtre est refusée (`in-progress`) plutôt
  que de voler son profil à la première ;
- la fenêtre ne retarde pas l'arrêt du conteneur : son minuteur est `unref`, un
  déploiement pendant un profilage perd le profil, pas le redémarrage ;
- le script publie depuis un conteneur one-off : celui-ci ne s'écoute pas
  lui-même et n'apparaîtra jamais dans les réponses.

## Données personnelles

Un profil d'allocation ne contient **que des piles d'appels** : noms de
fonctions, URLs de scripts, numéros de ligne, et des tailles en octets. Aucun
contenu d'objet, donc ni payload de requête, ni adresse e-mail, ni jeton, ni
secret.

C'est toute la différence avec un snapshot du tas, qui est à peu de chose près un
export non filtré de ce que le conteneur manipulait à cet instant — et la raison
pour laquelle le profil peut transiter par Redis et s'afficher dans un terminal,
là où un snapshot imposait un bucket dédié à accès restreint.

## Ce que ça ne couvre pas

- le profil dit qui **alloue**, pas qui **retient**. Quand la chaîne de rétention
  est la question — « pourquoi ce cache n'est-il jamais vidé ? » — il faut un
  snapshot du tas et sa vue *Retainers*, avec le coût du tableau ci-dessus. Sur
  un conteneur de production, l'ordre à respecter est : profil d'abord, snapshot
  seulement si le profil ne suffit pas, et sur un conteneur qui peut mourir ;
- seules les allocations **faites pendant la fenêtre** sont vues : un profil ne
  dit rien de ce qui a fui avant son démarrage ;
- les conteneurs one-off, le `postdeploy` et les jobs cron ne sont pas à
  l'écoute : seuls `web` et `worker` démarrent l'abonnement ;
- un OOM kill brutal ne laisse rien : pour attraper l'état juste avant la mort,
  c'est `--heapsnapshot-near-heap-limit=1` qu'il faut, posé dans `NODE_OPTIONS`.
  Deux réserves : il s'applique à tous les conteneurs de l'application, et le
  snapshot est écrit dans le système de fichiers éphémère du conteneur, donc perdu
  avec lui.
