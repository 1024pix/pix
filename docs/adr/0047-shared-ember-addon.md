# Shared Ember Addon

Date : 2023-05-23


## État

En cours


## Contexte

Le contexte est la non-duplication de code dans le développement d'applications Ember.

Actuellement nous avons créé un composant *LanguageSwitcher* qui doit être utilisé dans 3 applications Pix (Pix App, Pix Orga, Pix Certif). Nous n'avons pas d'autre moyen que de dupliquer le composant et les tests associés sur les 3 applications, ce qui amène des difficultés sur l'évolution et la maintenance du code.

Une des questions clés de cet ADR est de définir quelles sont les règles régissant quel composant peut rentrer dans Pix UI ou non.


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
* Permet de ne pas augmenter la dépendance de Pix UI vers Ember
* Pratique classique et standard
* Permet de gérer des versions différentes dans chaque application

**Inconvénient(s) :**

* Publier sur un dépôt NPM demande une action supplémentaire
* Action supplémentaire (montée de version) à réaliser pour bénéficier de corrections ou de nouvelles fonctionnalités
* Nécessité d'effectuer des tests de non-régression approfondis à chaque montée de version

### Solution n°4 : Mono-repo Shared Addon

**Description**

Créer un addon Ember dans le repo global Pix qui sera importé dans les 3 applications.

On indique dans le `package.json` de chaque application Ember la liste des différents addons qui se trouvent dans le mono-repo.

La responsabilité de la mise à jour de tout le code incombe à l'équipe/développeur qui fait la modification de l'addon Ember.

**Avantage(s) :**

* Non-duplication de code
* Permet de ne pas augmenter la dépendance de Pix UI vers Ember
* Expérience développeur améliorée de par la facilité d'implémentation
* Les applications sont toujours à jour avec l'addon, et quand il y a des incompatibilités elles se manifestent immédiatement et donc feedback-loop plus rapide et donc tests de non-régression simplifiés

**Inconvénient(s) :**

* Montée de version synchrone, forcée pour toutes les équipes
* Si le développement de l'addon est problématique sur une application, ce sont toutes les applications qui sont bloquées


## Décision

Pix UI ne semble pas fait pour accueillir certaines choses de haut niveau comme les *molécules* (exemple : le *LanguageSwitcher*) ou les *organismes* (exemple : les formulaires de connexion). On doit donc trouver une solution différente de l'utilisation directe de Pix UI.
En effet si on augmente le couplage de Pix UI à Ember cela empêcherait définitivement d'utiliser Pix UI dans d'autres contextes que les applications Ember (comme par exemple dans les contextes des pix-sites, des pix-tutos ou de nouveaux usages), évolution sur laquelle nous avons commencé des réflexions et des expérimentations.

À la question clé de définir quelles sont les règles régissant quel composant peut rentrer dans Pix UI ou non cet ADR répond :
* l'objectif de Pix UI est d'être réutilisable dans différents contextes indépendamment de la technologie utilisée (Ember.js ou autre)
* uniquement des atomes
* pas de molécules ou d'organismes
* rien qui augmente la dépendance à Ember

TODO
