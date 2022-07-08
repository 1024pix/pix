# 34. ADR Typage de l’API avec Typescript

## État

En cours d'expérimentation

## Contexte

Actuellement, l’API est écrite en langage `Javascript`. Ce langage ne permet pas de manière simple de faire de la vérification de type statique (static type-checking).

Après un sondage soumis aux équipes techniques, voici un regroupement des douleurs ressenties au développement sur l'API :

- les tests peuvent ne pas être fiables (Duck Typing);
- les modèles peuvent être mal utilisés ou instanciés partiellement (utilisation du même modèle dans des contextes très différents, ce qui complique les évolutions ou encore des attributs à moitiés utilisés etc.);
- les types des variables qu’on manipule ne sont pas explicites, cela peut être source de frustration et d’erreurs au runtime (pas de type-checking lors du build);

De plus, l'absence d'autocomplétion fais perdre du temps et de l'énergie car cela demande d'aller chercher soit même les informations (sur les attributs / les paramètres du constructeur des modèles, les arguments / les types de retour des fonctions etc.).

## Solutions possibles

Afin de répondre à ces douleurs nous avons exploré différentes solutions : 

### Solution 1 : ne rien mettre en place, laisser la configuration d'autocomplétion à la charge de chacun selon leur outils

##### Pros

- Rien à faire

##### Cons

- Aucun alignement entre les équipes techniques
- Difficulté de trouver des outils performants

### Solution 2 : mettre en place de la JS doc / TS doc

Cette solution a déjà été explorée dans le passé mais abandonnée (par manque d'activité). 

<span style="text-decoration: underline">Documentation des travaux</span>
- https://1024pix.atlassian.net/wiki/spaces/DEV/pages/985366543/2019-09-09+Essai+de+Typescript+sur+l+API+-+1+X
- https://1024pix.atlassian.net/wiki/spaces/DEV/pages/2603221009/2021-04-15+Plan+pour+ajouter+progressivement+de+la+v+rification+de+types+non+intrusive+dans+api+lib+domain

<span style="text-decoration: underline">Pull Request</span> : https://github.com/1024pix/pix/pull/2897

##### Pros

- Autocomplétion
- Documentation de type non intrusive

##### Cons

- Pas de type-checking
- Syntaxe "détachée du code" (sous forme de commentaire décalé par rapport aux déclarations)
- Ajout de dette technique

### Solution 3 : mettre du TypeScript

<span style="text-decoration: underline">Documentation des travaux</span> : https://1024pix.atlassian.net/wiki/spaces/DEV/pages/3456434231/Typescript 
<span style="text-decoration: underline">Pull Request</span> : https://github.com/1024pix/pix/pull/4569 

##### Pros

- Autocompletion
- Type-checking (vérification de la cohérence des types)
- Contrôle des impacts en temps réel lors de modifications (ex: modification d'une signature de méthode)
- Navigation dans le code est plus aisée (on trouve plus facilement une implémentation d'une fonction)
- Outil populaire (facilitera probablement les recrutements, beaucoup de documentation et communauté active)

##### Cons

- Verbeux
- Ajout de dette technique
- Expertise des développeurs.euses sur le sujet

## Décision

Afin de répondre à la non documentation de notre code, nous n'avons pas pu tout naturellement choisir la solution 1 qui était de ne rien faire.

La solution 2 déjà explorée par le passé avait déjà été délaissé. Elle apportait des contraintes à la maintenance car elle était soumise à des oublis potentiels ou à des erreurs humaines.

C'est la solution 3 qui sera la plus pérenne. Elle permettra de faciliter la maintenance sur du long terme malgré un coup d'entrée qui sera comblé par un accompagnement de l'équipe TypeScript.

## Conséquences

#### Accompagnement des équipes :
 - Dojos
 - Channel dédié aux problématiques TypeScript (#tech-typescript sur Slack)
 - Pair/mob programming possible avec les membres de l'équipe TypeScript (@team-typescript sur Slack)
 - Il y aura une PR qui montrera une migration complète de l'api : repository, usecase, controller, router

#### Migration de l'api :
 - Étape 1 : migrer les repositories et ses tests
 - Étape 2 : migrer les usecases et ses tests uniquement si les repositories associés sont migrés
 - Étape 3 : migrer les controllers + routers et les tests uniquement si les usecases associés sont migrés
