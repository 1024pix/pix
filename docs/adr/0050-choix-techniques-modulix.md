# 50. Choix techniques Modulix

Date : 2023-08-08

## État

Accepté

## Contexte

Modulix est un projet de Pix dont le but est le développement de compétences numériques de nos utilisateurs.
Il s'agit d'une beta Pix, dont le but est de sortir un MVP pour décembre 2023.

### Solution n°1 : Intégrer Modulix dans Pix App

**Description :**

Cette solution consiste à ajouter du code dans Pix App pour intégrer les nouveaux besoins de Modulix.
À l'instar de l'Espace Surveillant sur Pix Certif, Modulix serait de nouvelles pages de Pix App.

**Avantages :**

- Pas d'initialisation de projet
- Mutualisation du code :
  - Réutilisation de composantes de Pix App dans Modulix (connexion, etc.)
  - Réutilisation de la connexion, cela évite donc d'avoir une dépendance avec une Feature Team pour la mettre en place
- Unique point d'entrée pour les utilisateurs où ceux-ci pourront accéder à toutes les fonctionnalités de Pix :
  - Développement de compétences numériques
  - Evaluation
  - Certification
- Une seule application à maintenir

**Inconvénients :**

- Ajout de complexité à Pix App
- Probable difficulté à modulariser Pix App aux besoins de Modulix
- Interactions et dépendances avec les équipes travaillant sur Pix App (cross bounded context)

### Solution n°2 : Créer une nouvelle application (hors stack Pix et hors monorepo)

**Description :**

Cette solution consiste à créer une nouvelle application sans réutiliser
l’existant (côté interface utilisateur).

**Avantages :**

- Départ d'une page blanche - pas de legacy à gérer - pas de cadre imposé par l'existant
- Possibilité d'explorer de nouvelles technos
- Adaptation de l'architecture, tests, CI, repo aux besoins de Modulix

**Inconvénients :**

- Phase d'initialisation
  - Discussions avec le pôle Engineering pour le choix des technos
  - Temps de recherche long pour l'archi, tests, CI, repo
  - Si techno inconnue, besoin de monter en compétence
  - Mettre en place toutes les briques nécessaires à la création d'une application (repo, tests, CI, CD, DNS, etc.)
- Design system incompatible (exploration éventuelle sur les web components)
- Pas de mutualisation du code : fonctionnalités de Pix App non réutilisables dans Modulix et inversement

### Solution n°3 : S'inspirer de Pix App pour faire Modulix (Application dans le monorepo Pix)

**Description :**

Cette solution consiste à créer une nouvelle application s'inspirant de Pix App sur la même stack technique et dans le
monorepo.

**Avantages :**

- Initialisation plus facile par rapport à celle de la solution n°2
- Développement sans impact sur les autres équipes et fonctionnalités de Pix App
- Réutilisation des fonctionnalités applicables de Pix App
- Utilisation des composants du Design system
- Liberté de création, car pas de cadre imposé par l'existant

**Inconvénients :**

- Mise en place d'une nouvelle application
- Difficulté d'extraction des fonctionnalités (effet pelote de laine)
- Effort à faire pour mutualiser les devs avec Pix App à terme - aucun mécanisme de modularisation de fonctionnalités
  côté Pix (ex : connexion, etc.)

## Décision

Nous décidons de choisir la solution n°1 : Intégrer Modulix dans Pix App.
En effet, cette solution permet de démarrer le MVP rapidement et si le besoin évolue nous pouvons toujours prendre le
temps de sortir les fonctionnalités dans une nouvelle application (solution n°3).
De plus, cette solution peut faciliter l'usage de la plateforme pour nos utilisateurs en restant sur une unique
application.

Contrairement à Pix 1D nous nous adressons aux mêmes utilisateurs que ceux qui évaluent leurs compétences et passent
la certification. Également, Modulix ne nécessite pas de design très différent de l'existant, bénéficier de Pix UI dans ce cas est un avantage.

## Conséquences

Cette décision implique que nous allons devoir ajouter du code dans Pix App pour intégrer les nouveaux besoins de
Modulix.
