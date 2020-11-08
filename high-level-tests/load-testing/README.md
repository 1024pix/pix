# Génération des JDD

## fichier SIECLE

Déterminer l'UAJ de l'organisation (par défaut, 1237457A).

``` sql
SELECT o.id, o.name, o."externalId" AS UAJ
FROM organizations o
WHERE o."isManagingStudents" = true ORDER BY o.id
``` 
Déterminer le volume à générer (par défaut, 5)  

Exécuter `npm run import-schooling-registration:generate-bulk-data <NOMBRE_UTILISATEURS> <UAI_ORGANISATION>`
Exemple  
- `npm run import-schooling-registration:generate-bulk-data 4000 1237457A`
- `npm run import-schooling-registration:generate-bulk-data`

Vous obtenez le message suivant et un fichier est généré (10 Mb pour 4000 utilisateurs)
``` shell script
Generating SIECLE file on organization 1237457A for 4000 users
SIECLE file for 4000 users in file SIECLE-organization-1237457A-4000-users.xml
```

Le fichier est 
- généré dans le dossier `load-testing` 
- non versionné si porte l'extension `.xml`

Note : vous pouvez sauvegarder les paramètres dans un fichier `.env` (voir `sample.env`)

# Exécution des tests

## Pré-requis :

Faire tourner l'API en désactivant reCAPTCHA et MailJet. [PR #478](https://github.com/1024pix/pix/pull/478)

## Procédure :

```
npm ci
npm start
npm report
```

# Import schooling-registration

## Configurer

Déterminer la volumétrie du fichier souhaité, ex 500 utilisateurs

Créer un `.env` avec le contenu suivant 
```` shell script
SCHOOLING_REGISTRATION_USER_COUNT=500
SCHOOLING_REGISTRATION_FILE_NAME=SIECLE.xml
SCHOOLING_REGISTRATION_UAJ=1237457A
````

Créer un `.env.api` en mentionant 
- comme serveur 
- dans les sources de données PostgreSQL et Redis
- le nom du service docker-compose  (database et cache, respectivement)

Exemple
````shell script
DATABASE_URL=postgresql://postgres@database:5432/pix
REDIS_URL=redis://cache:6379
````

## Allouer des ressources
Vérifier 
- le nombre de CPU disponibles: `lscpu | egrep 'CPU\(s\):'`
- la mémoire vive disponible: `cat /proc/meminfo | grep MemTotal:`

Allouer une partie (50 % ?) de ces ressources dans `docker-compose.yml`

Exemple
* 8 CPU
* 16 Go RAM

Allouer
* 5.5 CPU
* 10 Go RAM

```` yaml
  api:
    deploy:
      resources:
        limits:
         memory: 8g
         cpus: "3"

  cache:
    deploy:
      resources:
        limits:
          memory: 50m
          cpus: "0.5"

  database:
    deploy:
      resources:
        limits:
          memory: 2g
          cpus: "2"         
         
````


## Builder l'APi à tester
Builder l'image manuellement
```
cd ../../api
docker build --tag api-local --file ../high-level-tests/load-testing/Dockerfile
cd ../high-level-tests/load-testing
```

## Exécuter

Exécuter les tests
```
npm run start:import-schooling-registration  
```

Consulter le rapport JSON
```
cat report/index.json
``` 

## Monitorer
Suivre l'avancement des tests
````
Started phase 0, duration: 10s @ 19:21:49(+0100) 2020-11-06
Report @ 19:21:59(+0100) 2020-11-06
Elapsed time: 10 seconds
  Scenarios launched:  9
  Scenarios completed: 0
  Requests completed:  2
  RPS sent: 1.23
  Request latency:
    min: 75.6
    max: 603.7
    median: 339.6
    p95: 603.7
    p99: 603.7
  Codes:
    200: 2
  Errors:
    ECONNRESET: 1

````

Dans une autre fenêtre, ouvrir le monitoring Docker
````
docker stats
CONTAINER ID        NAME                      CPU %               MEM USAGE / LIMIT   MEM %               NET I/O             BLOCK I/O           PIDS
4a6aa8cb2e52        load-testing_cache_1      0.08%               1.559MiB / 50MiB    3.12%               7.51kB / 28.8kB     0B / 0B             4
4a32eb562cce        load-testing_database_1   40.43%              17.23MiB / 2GiB     0.84%               200MB / 120MB       0B / 346MB          11
e5ad8e754ce8        load-testing_api_1        72.31%              2.615GiB / 8GiB     32.69%              4.96GB / 209MB      0B / 8.19kB         22
````

Dans une autre fenêtre, consulter les logs des services
````
docker-compose logs --follow api
api_1       | 201106/185552.187, (1604688952187:e5ad8e754ce8:17:kh6m354a:18496) [response,api,user] http://e5ad8e754ce8:3000: get /api/users/me {} 200 (28256ms)
api_1       | 201106/185552.188, (1604688952188:e5ad8e754ce8:17:kh6m354a:18497) [response,api,user] http://e5ad8e754ce8:3000: get /api/users/me {} 200 (28256ms)
````


## Tirer conclusions

Consulter le rapport HTML
```
npm run report
``` 
Si 
- trop de perte de connexion `ECONNRESET`
- l'un des conteneurs sort en OOM (celui qui lance les tests inclus)
````shell script 
<--- Last few GCs --->
[79111:0x2e46770]   546213 ms: Mark-sweep 2045.1 (2051.1) -> 2045.0 (2051.1) MB, 53.2 / 0.0 ms  (average mu = 0.299, current mu = 0.000) last resort GC in old space requested
[79111:0x2e46770]   546265 ms: Mark-sweep 2045.0 (2051.1) -> 2045.0 (2051.1) MB, 52.4 / 0.0 ms  (average mu = 0.178, current mu = 0.000) last resort GC in old space requested
<--- JS stacktrace --->
````
Alors ajuster la charge dans `scenarios/signup-and-placement.yml`

## Développer
Vérifier que l'API a démarré
```
curl --silent http://localhost:3000/api | jq .
```

Vérifier que la BDD est connectée à l'API a démarré
```
curl --silent http://localhost:3000/api/healthcheck/db | jq .
```

Vérifier que la BDD est connectée à l'API a démarré
```
curl --silent http://localhost:3000/api/healthcheck/redis | jq .
```

Si erreur, consulter les logs
```
docker-compose logs api
```

Se connecter à l'API à des fins d'analyse
```
docker-compose exec api sh
env
psql $DATABASE_URL
SELECT id, email FROM users WHERE email = 'sco.admin@example.net';
```
