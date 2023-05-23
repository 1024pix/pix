# Shared Ember Addon

Date : 2023-05-23


## État

En cours


## Contexte

Le contexte est la non-duplication de code dans le développement d'applications Ember.

Actuellement nous avons créé un composant LanguageSwitcher qui doit être utilisé dans 3 applications Pix (Pix App, Pix Orga, Pix Certif). Nous n'avons pas d'autre moyen que de dupliquer le composant et les tests associés sur les 3 applications, ce qui peut amener à des difficultés sur la maintenance du code.

Pix UI ne semble pas fait pour accueillir certaines choses de plus haut niveau que des *molécules* (exemple : le LanguageSwitcher) ou des *organismes* (exemple : les formulaires de connexion) et on doit donc trouver une solution différente de l'utilisation directe de Pix UI.

Une question clé est de définir quelles sont les règles régissant quel composant peut rentrer dans Pix UI ou non.


## Propositions

Toutes ces propositions utilisent la notion d'addon Ember, aussi il faut donc définir de quoi il s'agit. Un addon Ember est :
* une notion technique définie de base par le framework Ember
* un répertoire contenant du code qui sera chargé automatiquement par convention par Ember

### Solution n°1 : Étendre l'utilisation de Pix UI

Mettre tous les composants dans Pix UI, y compris les composants de plus haut niveau comme les *molécules* (exemple : le LanguageSwitcher) ou les *organismes* (exemple : les formulaires de connexion) dans Pix UI.

**Avantage(s) :**

* Facilité de mise en oeuvre, le cadre de Pix UI étant déjà existant il suffit de continuer à l'utiliser pour les nouveaux composants à factoriser

**Inconvénient(s) :**

* Couplage encore plus fort à Ember qui empêchant définitivement d'utiliser Pix UI dans d'autres contextes que les applications Ember, comme par exemple dans les contextes des pix-sites, des pix-tutos ou de nouveaux usages

### Solution n°2 : Ember in-repo Addon

Une solution est de créer un addon dans chaque application Ember dans le répertoire `shared` ad hoc, et on synchronise le contenu des addons de chaque application Ember par copier-coller.

**Avantage(s) :**

* Facilité de mise à jour en synchronisant manuellement par copier-coller uniquement les répertoires `shared` de chaque application Ember, au lieu de choisir uniquement certains fichiers jugés intéressants à synchronisés avec risque d'en oublier.

**Inconvénient(s) :**

* Ne répond pas à la totalité de la problématique : 
   * Duplication de code
   * Risque fort de désynchronisation du code puisque la synchronisation se fait manuellement selon le bon vouloir et la rigueur des développeurs

### Solution n°3 : NPM Addon

Créer un nouveau repository Git et publier un nouveau paquet NPM versionné sur https://www.npmjs.com/ (comme l'est [Pix UI](https://www.npmjs.com/package/@1024pix/pix-ui)).

La responsabilité de la mise à jour incombe à l'équipe/développeur qui fait la montée de version vers l'addon Ember.

**Avantage(s) :**

* Non-duplication de code
* Pratique classique et standard
* Permet de gérer des versions différentes dans chaque application
* Permet de ne pas augmenter la dépendance de Pix UI vers Ember

**Inconvénient(s) :**

* Publier sur un dépôt NPM demande une action supplémentaire
* Action supplémentaire (montée de version) à réaliser pour bénéficier de corrections ou de nouvelles fonctionnalités et nécessité d'effectuer des tests de non-régression

### Solution n°4 : Mono-repo Shared Addon

**Description**

Créer un addon Ember dans le repo global Pix qui sera importé dans les 3 applications.

On indique dans le `package.json` de chaque application Ember la liste des différents addons qui se trouvent dans le mono-repo.

La responsabilité de la mise à jour de tout le code incombe à l'équipe/développeur qui fait la modification de l'addon Ember.

**Avantage(s) :**

* Non-duplication de code
* Expérience développeur améliorée de par la facilité d'implémentation
* Les applications sont toujours à jour avec l'addon, et quand il y a des incompatibilités elles se manifestent immédiatement et donc feedback-loop plus rapide et donc tests de non-régression simplifiés
* Permet de ne pas augmenter la dépendance de Pix UI vers Ember

**Inconvénient(s) :**

* Montée de version synchrone, forcée pour toutes les équipes
* Aucune action supplémentaire à accomplir pour avoir la dernière version du code


## Décision

Cette solution sera à utiliser par exemple avec le composant LanguageSwitcher.
TODO
