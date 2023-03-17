# 43. Choix techniques Pix1D

Date : 2023-03-17

## État

Accepté

## Contexte

Dans le cadre du plan d'investissement d'avenir (PIA), Pix doit fournir un service à destination des élèves de CM1-CM2.
Le service doit permettre aux élèves d'évaluer et d'améliorer leurs compétences numériques. Le type de service rendu est
le même que celui de Pix App, mais pour un public différent.

Le service aura une charte graphique propre, des cinématiques adaptées aux enfants (accès, enchaînement des épreuves) et
de nouvelles fonctionnalités.

La création de ce service commence par le développement d'un MVP. Il constituera la base du produit dans sa forme
pérenne.

La 1ère question qui se pose est de savoir où développer ce nouveau service dont le MVP doit être mis à disposition
après 3 mois de développement (fin juin 2023).

### Solution n°1 : Intégrer Pix1D dans Pix app

**Description :**

Cette solution consiste à adapter Pix app pour intégrer les nouveaux besoins de Pix1D.

**Avantages :**

- Pas d'initialisation de projet
- Mutualisation du code :
  - Réutilisation de composantes de Pix App dans Pix1D (cinématique, épreuves, etc.)
  - Réutilisation des développements de Pix1D dans Pix app (compatibilité tablette, indices, oralisation...)
- Interface PixApp déjà éprouvée par les élèves de CM1/CM2 lors du POC

**Inconvénients :**

- Ajout de complexité à PixApp
- Difficulté à adapter Pix App aux besoins de Pix 1D
- Risque d'introduire des bugs
- Interactions et dépendances avec les équipes travaillant sur Pix App (cross bounded context)

### Solution n°2 : Créer une nouvelle application (hors stack Pix)

**Description :**

Cette solution consiste à créer une toute nouvelle application sans réutiliser
l’existant (côté interface utilisateur).

**Avantages :**

- Départ d'une page blanche - pas de legacy à gérer - pas de cadre imposé par l'existant
- Possibilité d'explorer de nouvelles technos
- Adaptation de l'architecture, tests, CI, repo aux besoins de Pix1D

**Inconvénients :**

- Grosse phase d'initialisation
  - Discussions avec le pôle Engineering pour le choix des technos
  - Temps de recherche long pour l'archi, tests, CI, repo
  - Si techno inconnue, besoin de monter en compétence
- Design system incompatible (exploration éventuelle sur les web components)
- Pas de mutualisation du code : fonctionnalités de Pix App non réutilisables dans Pix1D et inversement

### Solution n°3 : S'inspirer de Pix App pour faire Pix 1D

**Description :**

Cette solution consiste à créer une nouvelle application s'inspirant de Pix App sur la même stack technique.

**Avantages :**

- Initialisation plus facile par rapport à celle de la solution n°2
- Développement sans impact sur les autres équipes et fonctionnalités de Pix app
- Réutilisation des fonctionnalités applicables de Pix App
- Utilisation des composants du Design system
- Liberté de création, car pas de cadre imposé par l'existant

**Inconvénients :**

- Difficulté d'extraction des fonctionnalités (effet pelote de laine)
- Effort à faire pour mutualiser les devs avec Pix APP à terme - aucun mécanisme de modularisation de fonctionnalités
  côté Pix (ex : connexion, algorithme, etc.)
- Les fonctionnalités développées dans Pix1D ne seront pas disponibles immédiatement pour les autres utilisateurs de Pix

## Décision

Après concertation avec le CTO, sponsor du projet, la décision s'est portée sur la solution n°3 qui a pour avantage de :

- nous permettre de concentrer nos efforts sur l'apport de nouvelles fonctionnalités pour le MVP dans le délai imparti
- sécuriser la production en ayant le moins d'impact possible dessus (Pix-app en particulier)
- avoir une plus grande liberté de création

## Conséquences

Cette décision a pour conséquence la création d'un nouveau projet front Ember dans le monorepo. Celui-ci pourra ainsi
utiliser l'api.

