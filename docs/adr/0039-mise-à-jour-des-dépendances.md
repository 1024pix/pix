# 39. Faciliter la mise à jour des dépendances

Date : 2022-12-05

## État

Accepté

## Contexte

Actuellement, nous n'avons pas de processus de montées de versions, ce qui engendre plusieurs frustrations/douleurs :

- Aucune personne ne prend réellement le sujet
- Personne ne sait réellement comment faire : certains utilisent des outils
  comme [`npm-bump`](https://github.com/VincentHardouin/npm-bump) d'autres les font à la main

Ce manque de processus a engendré la création d'une Impact Team dans le but de rattraper notre retard. Cependant, nous
ne
souhaitons pas que cela se reproduise. Pour ce faire, nous souhaitons mettre en place un processus.

Nous ambitionnons d'automatiser le processus au maximum pour les montées de versions. Ainsi, nous distinguons plusieurs
versions différentes :

- les versions patch : qui ont pour unique but de faire fonctionner à nouveau correctement la version actuelle
- les versions mineures : dont le but est la mise à disposition de nouveautés et qui sont censés ne pas inclure de
  changements bloquants
- les versions majeures : qui elles sont bloquantes et qui nécessitent probablement une intervention humaine

Partant de ce constat, nous souhaitons utiliser un outil pour monter les versions.
Nous avons retenu [Dependabot](https://github.com/dependabot) et [Renovate](https://github.com/renovatebot/renovate) qui
sont les 2 principaux outils open source.

### Solution n°1 : Utiliser Dependabot

**Description**

Dependabot est un outil facilitant les montées de versions en créant des Pull Requests (PR) automatiquement.
Il a été acquis par GitHub en 2019.

**Avantages:**

- Racheté par GitHub et donc maintenu
- Utilisé par de nombreux projets
- Simple à mettre en place

**Inconvénients:**

- 1 PR par mise à jour de paquet, ce qui engendre beaucoup de PR par conséquent beaucoup de bruit / travail pour les
  développeurs
- Peu de configuration
- Ne supporte pas le merge automatique
- Configuration à faire sur chaque repository

### Solution n°2 : Utiliser Renovate

**Description**

Renovate est aussi un outil facilitant les montées de version. Il subit une croissance exponentielle
(cf: [star history](https://github.com/renovatebot/renovate#star-history)) et comptabilise plus de stars que
Dependabot.

**Avantages:**

- Configurable à souhait : regroupement par type de version, regroupement par app, etc
- Possibilité de faire une configuration pour tous nos repos
- Possibilité de merger automatiquement

**Inconvénient(s):**

- Compliqué à configurer, mais [la configuration a été faite](https://github.com/1024pix/renovate-config)

## Décision

Nous décidons d'utiliser Renovate pour ses avantages.
La configuration réalisée :

- Créera des PR tous les lundis matin avec le label `dependencies` dans la limite de 5 PR ouvertes
- Les versions `patch` et `minor` seront au maximum groupées ensemble
- Les PR seront groupées par "app", par sous-dossier (ex: "mon-pix", "certif", "api", …)
- Une PR de mise à jour des lockfiles sera ouverte par mois (pour mettre à jour les dépendances de nos dépendances)

## Conséquences

Une configuration Renovate va être ajoutée à tous les repositories et des PRs vont s'ouvrir au fur et à mesure de la
montée de version des paquets.
Aussi, une issue sera ouverte automatiquement
["DependencyDashboard"](https://docs.renovatebot.com/key-concepts/dashboard/), dans le but de suivre les montées de
version.
