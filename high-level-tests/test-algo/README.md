Application de tests de l'algorithme adaptatif de positionnement.

# Installation

## Prérequis

**1.** Se déplacer dans le répertoire projet.

```bash
cd high-level-tests/test-algo
```

**2.** Installer les dépendances.

```bash
npm ci
```

**3.** Provisionner les variables d'environnement.

```bash
cp sample.env .env
```

Si besoin, éditer le fichier `.env` pour l'adapter à vos besoins.

## Utilisation du CLI

### Usage
Récupérer le prochain challenge sélectionné par l'algorithme

```bash
npm start -- --competenceId #competenceId# [--locale fr]
```

### Options disponibles 
- `targetProfileId`: Choix du `targetProfileId`
- `competenceId`: Choix de la compétence
- `userResult`: Choix de la réponse de l’utilisateur avec les options `['ok', 'ko', 'random', 'firstOKthenKO', 'firstKOthenOK']`
- `usersKEFile`: Possibilité d’utiliser les KE des users via les KE en json

### Format fichier.json
```json
[
  [ 
    {"source":"inferred","status":"validated","skillId":"recA","competenceId":"rec1"},
    {"source":"direct","status":"validated","skillId":"recB","competenceId":"rec1"},
    {"source":"inferred","status":"validated","skillId":"recC","competenceId":"rec1"}
  ],
  [
    {"source":"inferred","status":"validated","skillId":"recA","competenceId":"rec1"},
    {"source":"direct","status":"validated","skillId":"recB","competenceId":"rec1"},
    {"source":"inferred","status":"validated","skillId":"recC","competenceId":"rec1"}
  ]
]
```

### Exemples concrets d'usage
```bash
npm start -- --userKEFile=./usertest.json --competenceId=recABC
```
```bash
npm start -- --userResult=ok --targetProfileId=1
```

# Utiliser la data visualisation

**1.** Lancer le container permettant d'avoir Jupyter Notebook. 

```
docker compose up -d
```

**2.** Rendez-vous sur l'url [localhost:8888](http://localhost:8888). 

**3.** Choisissez le fichier `data_visualization.ipynb`

## Conseil de versionnement des fichiers `.ipynb`

Pour faciliter la lecture du diff, il est nécessaire de faire sur Jupyter Notebook  
Cell > All Output > Clear avant de commiter.  
