# 1. Spécifier la version de NodeJS

Date : 2020-01-18

## État

Accepté

## Contexte

Sur ce projet, nous avons besoin de :
- savoir quelle version de NodeJS est utilisée sur chaque environnement (intégration, recette, production)
- garantir une stabilité de la plateforme, en intégrant les versions les plus à jour, testées 

Il existe un mécanisme natif pour indiquer la version souhaitée 
- nominal, dans la section engines des fichiers package.json
- local, ex dans le fichier `.nvmrc`
- CI, dans la section image du fichier `.circleci/config.yml`

Cette spécification de version existe en 2 syntaxes, ainsi deux solutions s'offrent à nous :

Spécifier le numéro de version complet jusqu'au patch (ex : `1.2.3`), ce qui permet
- d'utiliser la même version de NodeJS sur l'ensemble des contextes (local, CI, PAAS)
- d'utiliser la même version de NodeJS sur l'ensemble des applications

Spécifier un intervalle de version jusqu'à la majeure (ex : `1.x.x`), ce qui permet
- d'automatiser les montées de version (délégué au gestionnaire de version local, CI, PAAS)


### Spécifier un numéro de version complet

Cette solution consiste à spécifier le numéro de version complet jusqu'au patch (ex: `1.2.3`).

Elle
- est compréhensible par tous les développeurs
- offre la maitrise complète sur la release (seul un développeur déclenche une montée de version)

### Spécifier un intervalle de version

#### Implémentation

#### PAAS
Spécifier un intervalle de version (ex jusqu'à la majeure : `1.x.x`) dans le `package.json`
Le PAAS assure un service de résolution des intervalles lors du Build (ex : semver.io)

#### Local
Spécifier un intervalle de version dans le fichier `.nvmrc `
Le gestionnaire de version utilise le package [semver](https://github.com/semver/semver), différent du service de résolution que le PAAS ([semver.io](https://github.com/nvm-sh/nvm/issues/321))

#### CI
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

#### Bilan

Avantages :
- permet d'utiliser les nouvelles versions au plus tôt
- permet d'utiliser les nouvelles versions sans intervention manuelle
  
Inconvénients :
- est moins compréhensible (nécessite de faire la résolution de version)
- n'offre pas la maitrise complète sur la release (la version change dès publication d'une version de l'intervalle)
- expose à des désynchronisations de version

## Décision

Les critères suivants sont plébiscités :
- simplicité de compréhension
- caractère volontaire de la montée de version

En conséquence, nous spécifions le numéro de version complet jusqu'au patch (ex : `1.2.3`)

Voir aussi la discussion de la [PR 2360](https://github.com/1024pix/pix/pull/2360)

## Conséquences
A chaque nouvelle version de NodeJS éligible, notamment les corrections de sécurité, spécifier la version complète.

En complément, utiliser le package `check-engine` sur le hook d'installation pour refuser l'installation des packages 
si la version de NodeJS n'est pas celle attendue
````shell
"preinstall": "npx check-engine",
````

