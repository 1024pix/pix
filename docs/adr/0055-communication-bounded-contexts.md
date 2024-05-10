# 55. Communication "séquentielle" entre les contextes fonctionnels

Date : 2024-03-26

## État

Proposé

## Contexte

Pix est dans un contexte de changement d'échelle, avec maintenant 8 feature teams qui travaillent ensemble sur une même base de code.
Nos équipes de développement sont autonomes à développer des fonctionnalités de la base de données jusqu’au front.
Cependant, nous avons commencé à éprouver des difficultés à attribuer certains sujets avec certitude à une équipe plutôt qu'à une autre.
Pour apporter de la clarté sur le périmètre des équipes nous nous sommes lancé dans le [DDD (Domain-driven design)](https://fr.wikipedia.org/wiki/Conception_pilot%C3%A9e_par_le_domaine) avec comme objectif de faire émerger des contextes fonctionnels et attribuer la maintenance de ces contextes à une équipes.

Une deuxième difficulté que nous rencontrons est celle de faire des changements techniques qui impliquent des tables centrales de Pix ('target-profiles', 'organization-learners', ...) car il y a un couplage entre les fonctionnalités au niveau de la base de données (chaque équipe code ses propres repositories avec des requêtes ou jointures sur des tables d'autres domaines).

Cela a plusieurs conséquences :
- une durée très longue pour adresser ce genre de chantier (plusieurs mois pour la conception et le développement)
- un changement technique sur la base de données peut avoir des impacts non maitrisés sur plusieurs fonctionnalités
- une rigidification du schéma de base de données

Cela va plus loin, car en dehors de l'applicatif ce problème existe aussi mais **hors scope de l'ADR** sur :
- les boards Metabase
- les dépôts de données Data

Une troisième difficulté que le pôle engineering a rencontrée, c'est le découpage de la base de code selon la [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html) avec les sujets des différentes équipes mélangés au sein de cette architecture.
Nous avons fait un ADR [#51](https://github.com/1024pix/pix/blob/dev/docs/adr/0051-nouvelle-arborescence-api.md) avec une architecture cible où notre API sera découpée par contextes fonctionnels et sous-contextes.

Cependant, il reste la problématique des sujets qui sont à cheval entre deux équipes, pour lesquelles la frontière est floue.
Ce code partagé est actuellement placé dans différents dossiers nommés `shared` quand il a été identifié comme mélangeant plusieurs contextes fonctionnels.

Il y a plusieurs conséquences négatives à garder ce code dans un état partagé :

- nécessite de la communication et du partage de connaissances qui, s'ils sont réalisés, entraînent une surcharge cognitive, et dans le cas contraire, risquent d'occasionner des anomalies ou incohérences.
- allonge les délais de mise en oeuvre
- perte d'engagement sur le sujet
- perte d'autonomie des équipes

Il est donc important de clarifier qu'elles sont les équipes mainteneuses sur ces sujets.
Une attribution claire facilitera les interactions entre les équipes et les rendra explicites dans la base de code.

**Précision sur le terme "séquentielle" du titre :**

Il existe deux types d’interaction entre deux contextes fonctionnels ou sous-contextes :

- Séquentielle : J’ai besoin qu’un autre contexte fasse un traitement pour moi ou me fournisse une information (ex : créer une campagne, lister les profils cibles d’une organisation, …)
- Événementielle : J’ai besoin de réagir à un événement qui se passe dans un autre contexte fonctionnel (ex : un utilisateur a obtenu le niveau 1 dans une compétence, un utilisateur a remis à 0 une compétence, …)

Dans cet ADR nous nous concentrons sur le premier type d’interaction.

### Solution : Utiliser des APIs internes

Il s'agit de définir une frontière entre les deux contextes fonctionnels qui interagissent ensemble.
En règle générale, un contexte fonctionnel sera en position de fournir un service à un autre contexte fonctionnel.
L'API va venir expliciter ce service en définissant un contrat d'interface.

Dans le cas où ces contextes fonctionnels appartiendraient à deux équipes différentes, ce contrat d'interface va apporter plusieurs avantages :

- rendre les équipes autonomes sur le périmètre (tant que le contrat est respecté)
- réduire la charge mentale des développeurs (réduit la somme de connaissances nécessaires pour réaliser les fonctionnalités)
- clarifie l'attribution des sujets aux équipes (moins de discussions sur la prise en charge des sujets)
éviter les effets de bords d'une modification dans un contexte qui en impact un autre

Pour plus de détails sur l'implémentation de cette solution se référer à la [documentation](https://1024pix.atlassian.net/wiki/spaces/EDTDT/pages/3929735180/Comment+int+ragir+entre+deux+bounded+contexts+ou+des+sous+domain) dans Confluence.

## Décision

Les équipes ExpEval, Certif et Prescription ont déjà expérimenté la mise en place d'API internes.
Lors de la phase d'expérimentation, il y a plusieurs retours négatifs qui ont été jugés acceptables (balance avantages/inconvénients) :

- Ajout de complexité dans la couche infrastructure avec l'ajout d'injection de dépendances dans les repositories
- Besoin de fournir des moyens de créer des données de tests pour les consommateurs
- Augmentation du volume de code via les boilerplate et la duplication possible des modeles dans les differents contextes

Pour permettre à la base de code de Pix de continuer à grandir avec le nombre de développeurs croissants, il a été décidé d'adopter le principe d'API internes synchrones.
