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

