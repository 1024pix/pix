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

**4.** Utilisation.

Récupérer le prochain challenge sélectionné par l'algorithme

```bash
npm start -- --competenceId #competenceId# [--locale fr]
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
