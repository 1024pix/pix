# 45. Suppression logique de données avec historisation.

Date : 2023-04-04

## État

Accepté

## Contexte

Cet ADR fait suite à l'ADR 42 et le rend obsolète.

Un besoin n'avait pas été évoqué lors du recueil de besoin de l'Epix réalisé en octobre 2022
qui a remis en question la solution technique choisie dans le précédent ADR. La base de données de 
Pix est utilisée en plus des applications présentes dans le monorepo par Metabase. Dans Metabase il y a
des tableaux de bord à destination de nos partenaires et des tableaux de bord pour nos utilisateurs internes.
Ces derniers ont besoin de faire un suivi dans le temps de statistiques les aidant à accompagner nos partenaires extérieurs.
La solution technique choisie dans le précédent ADR ne garantit pas la pérennité de ces statistiques.
L'équipe Data n'est pas en mesure pour le moment de mettre à disposition des dépôts de données historisés
afin de nous permettre de découpler les usages liés aux applications à ceux liés à Metabase. En attendant le développement
de ces dépôts de données, on a choisi conjointement avec le CTriO, CPO et la team Data de mettre en place une solution
technique qui permet de prendre en compte cette contrainte supplémentaire. 

### Solution n°1 : Solution choisie dans l'ADR 42 avec possibilité de continuer à requêter les données

**Description :**

La différence avec l'ADR précédent est que les données placées dans la table de prescrits supprimés doivent continuer à être utilisable
pour le besoin d'historisation des données.

Cette solution semble complexe aussi bien du côté API que du côté utilisation sur Metabase. 

### Solution n°2 : Mise en place d'une Vue SQL view-active-organization-learners

**Description :**

Rajouter sur la table organization-learners les colonnes deletedAt et deletedBy. Créer une vue active-organization-learners qui requête
la table organization-learners avec la condition WHERE deletedAt IS NULL. Cela consiste à mettre à jour les requêtes en lecture sur la
table organization-learners pour utiliser la vue.

Cette solution est simple à mettre en place, il faut remplacer `organization-learners` par `view-active-organization-learners` sur toutes
les requêtes en lecture. Les requêtes en écriture restent inchangées. Il sera facile de retirer la vue et changer le code de l'API le
jour où une solution plus pérenne aura été mise en place pour traiter l'historisation des données.

## Décision

On a décidé avec le CPO et le CTriO ainsi que la team Data de partir sur la solution 2.
Le compte-rendu est disponible ici : https://1024pix.atlassian.net/wiki/spaces/PROD/pages/3727556629/2023-03-27+-+Instructix+Lib+ration+des+places

Les travaux de POC et de Benchmark sur la solution 2 de la team Prescription sont disponibles ici : https://1024pix.atlassian.net/wiki/spaces/DEV/pages/3727720453/Suppression+d+un+prescrit

L'ensemble des partis pris à cette décision a conscience que la solution choisie n'est pas idéale et qu'elle est de nature temporaire.
Cette décision représente un choix volontaire d'ajout de dette technique qu'il faudra résorber lorsque cela sera rendu possible par les travaux sur l'archivage intermédiaire.

## Conséquences

La team Prescription peut commencer les travaux sur la suppression des prescrits.
