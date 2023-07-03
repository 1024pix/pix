# 18. Spécifier la version de NodeJS

Date : 2020-01-18

## État

Amendé par [0049-specifier-version-nodejs.md][0049]

[0049]: ./0049-specifier-version-nodejs.md

## Contexte

Sur ce projet, nous avons besoin de :

- savoir quelle version de NodeJS est utilisée sur chaque environnement (intégration, recette, production)
- garantir une stabilité de la plateforme, en intégrant les versions les plus à jour, testées

Il existe un mécanisme natif pour indiquer la version souhaitée :

- nominal, dans la section `engines` des fichiers `package.json`
- local, ex dans le fichier `.nvmrc`
- CI, dans la section image du fichier `.circleci/config.yml`

Cette spécification de version existe en 2 syntaxes, ainsi deux solutions s'offrent à nous :

Spécifier le numéro de version complet jusqu'au patch (ex : `1.2.3`), ce qui permet

- d'utiliser la même version de NodeJS sur l'ensemble des contextes (local, CI, PAAS)
- d'utiliser la même version de NodeJS sur l'ensemble des applications

Spécifier un intervalle de version jusqu'à la majeure (ex : `1.x.x`), ce qui permet

- d'automatiser les montées de version (délégué au gestionnaire de version local, CI, PAAS)

### Solution n°1 : Spécifier un numéro de version complet

**Description**

Cette solution consiste à spécifier le numéro de version complet jusqu'au patch (ex: `1.2.3`).

**Avantage(s):**

- est compréhensible par tous les développeurs
- maitrise complète sur la release : la version utilisée ne change pas, à moins d'une modification de code

**Inconvénient(s):**

- retarde les montées de version si les images Docker exactes ne sont pas disponibles dans la CI
- expose aux failles de sécurité car le patch n'est appliqué que si les développeurs surveillent les version NodeJS
- contraint le choix des outils du développeur (image Docker, package manager natif de l'OS ou cross-platform)

### Solution n°2 : Spécifier un intervalle de version

#### Description

##### PAAS

Spécifier un intervalle de version (ex jusqu'à la majeure : `1.x.x`) dans le `package.json`
Le PAAS assure un service de résolution des intervalles lors du Build (ex : semver.io)

##### Local

Spécifier un intervalle de version dans le fichier `.nvmrc `
Le gestionnaire de version utilise le package [semver](https://github.com/semver/semver), différent du service de
résolution que le PAAS ([semver.io](https://github.com/nvm-sh/nvm/issues/321))

##### CI

S'assurer que

- la CI dispose de tags vers des images Docker
- ces tags sont équivalents à l'intervalle de version

Par exemple, le tag CircleCI `lts` pointe vers la dernière version de la release LTS.

Cependant, il y a plusieurs dépendances à satisfaire :

- la version de NodeJS dans l'image API (équipe CircleCI)
- la version de NodeJS dans l'image Front (équipe CircleCI)
- la version de NodeJS dans l'image du navigateur des tests E2E (équipe Cypress)

Cela implique que, lors de la publication d'une nouvelle version par les mainteneurs de NodeJS,
un délai s'écoule jusqu'à ce que ces deux équipes aient testé et publié ces deux images. Pendant
ce temps, la version sur le PAAS et la CI ne sont plus synchronisées. Dans le cas de Cypress, le délai
avant publication d'une nouvelle image est de l'ordre de plusieurs semaines.

#### Avantage(s)

- utiliser les nouvelles versions au plus tôt
- utiliser les nouvelles versions sans intervention manuelle
- diminue l'exposition aux failles de sécurité
- ne contraint pas le choix des outils du développeur (image Docker, package manager natif de l'OS ou cross-platform)

#### Inconvénient(s):

- moins compréhensible (nécessite de faire la résolution de version)
- n'offre pas la maitrise complète sur la release (la version change dès publication d'une version de l'intervalle)
- expose à des désynchronisations de version

## Décision

Les critères suivants sont les plus importants :

- diminue l'exposition aux failles de sécurité
- ne contraint pas le choix des outils du développeur (image Docker, package manager natif de l'OS ou cross-platform)

En conséquence, nous spécifions le numéro de version majeure uniquement (ex : `1.*.*`)

Voir aussi la discussion de la [PR 2360](https://github.com/1024pix/pix/pull/2360)

⚠ Circle CI ne publie que des tags de version complète (ex : `1.2.3`) sur ses images Docker.
On gardera donc une spécification complète.

## Conséquences

A chaque nouvelle version majeure LTS de NodeJS éligible, la spécifier dans le repository.

En complément, utiliser le package `check-engine` sur le hook d'installation pour refuser l'installation des packages
si la version de NodeJS n'est pas celle attendue

````shell
"preinstall": "npx check-engine",
````

