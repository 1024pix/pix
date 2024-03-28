# 55. Communication "synchrone" entre les bounded contexts 

Date : 2024-03-26

## État

Proposé

## Contexte

Pix est dans un contexte de scaling avec maintenant 8 feature teams qui travaillent ensemble sur une même base de code.
Nos équipes de developpement sont autonomes à développer des fonctionnalités de la base de données jusqu’au front.
Cependant, nous avons commencé à éprouver des difficultés à attribuer certains sujets avec certitude à une équipe plutôt qu'à une autre.
Pour apporter de la clarté sur le scope des équipes nous nous sommes lancé dans le DDD avec comme objectif de faire émerger des Bounded Contexts et les attribuer à des équipes.
Une deuxième difficulté que le pôle engineering a rencontré c’est le découpage de la base de code selon la clean architecture
avec les sujets des différentes équipes mélangés au sein de cette architecture.
Nous avons fait un ADR #51 avec une architecture cible où notre API sera découpée par Bounded Contexts et Sub Domain.

Cependant, il reste la problématique des sujets qui sont à cheval entre deux équipes sur lesquels la frontière est floue.
Ce code partagé est actuellement placé dans shared quand il a été identifié ou alors un bounded context importe directement le code d'autre bounded context.

Il y a plusieurs conséquences négatives à garder ce code dans un état partagé : 
- nécessite de la communication et du partage de connaissance
- allonge le lead time 
- perte d'engagement sur le sujet
- perte d'autonomie des équipes

Il est donc important de clarifier la responsabilité des équipes sur ces sujets.
Une attribution claire facilitera les interactions entre les équipes et les rendra explicite dans la base de code.

**Précision sur le terme "synchrone" du titre :**

Il existe deux types d’interaction entre deux bounded contexts ou sub domains : 
- J’ai besoin qu’un autre bounded context fasse une action pour moi ou me fournisse une information (ex : créer une campagne, lister les profils cibles d’une organisation, …)
- J’ai besoin de réagir à un évènement qui se passe dans un autre bounded context (ex : un utilisateur a obtenu le niveau 1 dans une compétence, un utilisateur a remis à 0 une compétence, …)

Dans cet ADR nous nous concentrons sur le premier type d’interaction.

### Solution : Utiliser des APIs internes

Il s'agit de définir une frontière entre les deux bounded contexts qui interagisse ensemble.
En règle générale, un bounded context sera en position de fournir un service à un autre bounded context.
L'API va venir expliciter ce service en définissant un contrat d'interface.

Dans le cas où ces bounded contexts appartiennent à deux équipes différentes ce contrat d'interface va apporter plusieurs avantages : 
- rendre les équipes autonomes sur le périmètre (tant que le contrat est respecté)
- réduire la charge mentale des développeurs (réduit la somme de connaissances nécessaires pour réaliser les fonctionnalités)
- clarifie l'attribution des sujets aux équipes (moins de discussions sur la prise en charge des sujets)

Pour plus de détail sur l'implémentation de cette solution se référer à la [documentation](https://1024pix.atlassian.net/wiki/spaces/EDTDT/pages/3929735180/Comment+int+ragir+entre+deux+bounded+contexts+ou+des+sous+domain) dans Confluence.

## Décision

Les équipes ExpEval, Certif et Prescription ont déjà expérimenté la mise en place d'API internes.
Lors de la phase d'expérimentation, il y a plusieurs retours négatifs qui ont été jugés acceptables (balance avantages/inconvénients) :
- Boilerplate plus important dans la couche infrastructure avec l'ajout d'injection de dépendance dans les repositories
- Sentiment de duplication de code tant que l'API n'est pas utilisée plusieurs fois
- Utilisation du nommage Repository (côté consommateur) pour du code qui ne fait pas appel à la DB est source de confusion
- Besoin de fournir des données de tests pour les consommateurs (outillage à construire)

Pour permettre à la base de code de Pix de continuer à grandir avec le nombre de développeurs croissants, il a été décidé de continuer dans cette direction.
