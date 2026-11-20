# Environnement local Kubernetes avec Tilt (POC)

Ce dossier contient les manifestes Kubernetes et les Dockerfiles qui permettent de lancer toute la stack Pix (API, fronts, Postgres, Redis, s3-mock, Mailpit) dans un cluster local, piloté par [Tilt](https://tilt.dev) via le `Tiltfile` à la racine du dépôt.

Ce guide décrit le lancement sur un cluster **minikube démarré avec le driver `docker`**.

## Prérequis

- [Docker](https://docs.docker.com/engine/install/)
- [minikube](https://minikube.sigs.k8s.io/docs/start/)
- [kubectl](https://kubernetes.io/docs/tasks/tools/)
- [Tilt](https://docs.tilt.dev/install.html)

## Démarrer le cluster

```bash
minikube start --driver=docker
```

Le cluster doit disposer de suffisamment de ressources : les builds Ember des 5 fronts tournent dans le daemon Docker de minikube et sont gourmands. Si vous limitez le cluster (`--cpus`, `--memory`), prévoyez large (8 Go de mémoire au minimum).

Vérifiez que `kubectl` pointe bien sur minikube :

```bash
kubectl config current-context   # doit afficher : minikube
```

## Lancer Tilt

Depuis la racine du dépôt :

```bash
tilt up
```

Puis ouvrir l'interface Tilt sur http://localhost:10350.

Il n'y a **pas besoin** de faire `eval $(minikube docker-env)` ni de registry : Tilt détecte le contexte `minikube` et construit les images directement dans le daemon Docker de minikube. C'est ce qui permet aux manifestes d'utiliser `imagePullPolicy: Never`.

Au premier lancement :

- les images de l'API et des 5 fronts sont construites (compter plusieurs minutes) ;
- l'initContainer `db-migrate` du pod `api` crée la base `pix` et joue les migrations ; il est relancé à chaque démarrage du pod et ne fait rien si la base est à jour.

## Accéder aux applications

Tilt ouvre des port-forwards vers `localhost` :

| Ressource | URL                       |
| --------- | ------------------------- |
| API       | http://localhost:3000/api |
| App       | http://localhost:4200     |
| Orga      | http://localhost:4201     |
| Admin     | http://localhost:4202     |
| Certif    | http://localhost:4203     |
| Junior    | http://localhost:4205     |
| Postgres  | `localhost:5432`          |
| Redis     | `localhost:6379`          |

Chaque front est servi par nginx et redirige `/api/` vers le service `api` du cluster.

## Données de test (seeds)

La ressource `db-seed` (label `tools`) n'est pas lancée automatiquement. Déclenchez-la depuis l'interface Tilt ou avec :

```bash
tilt trigger db-seed
```

Elle recharge le référentiel depuis le LCMS (`npm run cache:refresh`), vide les tables puis rejoue les seeds (`npm run db:reload`). Elle peut être relancée autant de fois que nécessaire.

### Choix du LCMS

Par défaut, l'API utilise le LCMS minimal (`k8s/api/configmap.yaml`). Si le fichier `api/.env` existe et définit des variables `LCMS_API_URL`, `LCMS_API_KEY`, `LCMS_API_OAUTH_BASIC_TOKEN` ou `LCMS_API_RELEASE_ID`, le `Tiltfile` les injecte dans le Secret `api-lcms` (non versionné), qui surcharge la configmap. On utilise ainsi le même LCMS qu'en local hors Kubernetes. Après une modification de `api/.env`, la ressource `api-lcms` est réappliquée automatiquement ; redémarrez le pod `api` pour qu'il prenne les nouvelles valeurs.

Le fichier `api/.env` n'est jamais embarqué dans l'image de l'API (`ignore` dans le `Tiltfile`).

> ⚠️ Avec le LCMS minimal, le seed de l'équipe certification échoue (`Cannot read properties of undefined (reading 'areaId')`) : la configuration de scoring référence les 16 compétences Pix, alors que ce référentiel n'en contient que 6. Utilisez un LCMS complet via `api/.env`.

## Persistance et remise à zéro

Postgres et Redis stockent leurs données dans des volumes `hostPath` (`/opt/pix/postgres`, `/opt/pix/redis`) **à l'intérieur du nœud minikube** (le conteneur Docker `minikube`). Les données :

- survivent à `tilt down` et à `minikube stop` / `minikube start` ;
- sont perdues avec `minikube delete`.

Pour repartir d'une base vide sans supprimer le cluster :

```bash
kubectl -n pix scale deploy/api --replicas=0
kubectl -n pix exec deploy/postgres -- psql -U postgres -c "DROP DATABASE pix WITH (FORCE);"
kubectl -n pix scale deploy/api --replicas=1   # l'initContainer recrée et migre la base
```

## Arrêter

```bash
tilt down       # supprime les ressources du namespace pix (les données restent sur le nœud)
minikube stop   # arrête le cluster
```

## Limitations connues

- L'Ingress (`k8s/routes/httproutes.yaml`, hôtes `*.dev.pix.fr`) nécessite l'addon `ingress` de minikube (`minikube addons enable ingress`) et des entrées `/etc/hosts` vers `minikube ip`. Ce mode n'a pas été testé ; les port-forwards ci-dessus suffisent.
- OpenTelemetry n'est pas configuré : il n'y a pas de collecteur dans le cluster et l'export est piloté par le feature toggle `isOpenTelemetryEnabled`.
- Les fronts sont servis sous forme de build statique (`ember build`) par nginx : une modification de code déclenche un rebuild complet de l'image (pas de live reload).
