# 41. Suppression logique de données.

Date : 2023-02-08

## État

Accepté

## Contexte

Les prescrits supprimés, ainsi que leurs participations, ne seront plus visibles dans l'application, mais l'on souhaite
conserver l'ensemble des données les concernant pour plusieurs raisons :

- faciliter la résolution d'un contentieux
- mise à disposition des données à l'usage de la recherche
- ...

Il n'existe pour le moment aucun mécanisme dans le cycle de vie de la donnée pour répondre à ces besoins.
Ils seront adressés par le chantier autour de l'archivage intermédiaire. Le cadrage fonctionnel de cette Epix n'est pas encore finalisé
et l'Epix sur la suppression d'un prescrit ne peut pas être déprioriser car beaucoup d'autres sujets en dépendent.
Nous devons donc trouver une solution temporaire satisfaisante qui répond à plusieurs critères :

- bloquer le moins de solutions possible pour l'archivage intermédiaire
- demande un effort minimum
- facile à refactorer

La solution choisie sera temporaire et il y aura un travail de refactoring à faire sur la fonctionnalité de suppression d'un prescrit lorsque la solution d'archivage intermédiaire aura été déterminée.

Voici les règles métiers qui s'appliquent aux données des prescrits qui sont supprimées :

- Les données des prescrits supprimés ne seront plus utilisées dans aucun contrôle métier dans l'application.
- La suppression est définitive ; il n'a pas été exprimé le besoin d'un retour arrière.
- La date et l'auteur de la suppression sont enregistrés
- Un utilisateur peut réintégrer l'organisation, mais en tant que nouveau prescrit (les anciennes participations ne sont plus visibles de l'organisation).

### Solution n°1 : Ajout d'un indicateur "supprimé"

**Description**

L'ajout d'une colonne de date ou de statut de suppression dans la table des prescrits permet d'indiquer que le prescrit
a été supprimé.

**Avantages:**

Une seule table à maintenir : toutes les modifications sont appliquées aux prescrits supprimés et les liens avec les
autres tables ne sont pas affectés.

**Inconvénients:**

Toutes les requêtes présentes et à venir sur la table des prescrits, qui ne doivent retourner que les prescrits actifs,
doivent être modifiées.
Ceci représente un couplage important avec de nombreux cas d'utilisation qui n'ont pas de lien avec le cas d'utilisation
de suppression.
Par exemple, l'affichage de la liste des prescrits, les imports, etc.

La gestion de ces impacts fait que cette solution dans son ensemble est longue à mettre en place.
Elle est également source de régression sur les fonctionnalités existantes en cas d'oubli, et de bugs sur les futures
fonctionnalités pour la même raison.

Il faudra modifier les index existants pour exclure les prescrits supprimés.

### Solution n°2 : Déplacement des données dans une copie de la table d'origine pour d'archivage

**Description**

Le déplacement de l'enregistrement du prescrit vers une table d'archivage permet d'extraire les prescrits supprimés. Création d'une copie de la table d'origine avec les mêmes colonnes.

**Avantages:**

Aucune incidence sur les fonctionnalités existantes et à venir concernant les prescrits actifs.
Diminution de la volumétrie de la table des prescrits actifs si la fonctionnalité est utilisée en masse.

**Inconvénients:**

Cette approche implique de faire des migrations sur la table des données archivées quand une colonne est rajoutée dans la table d'origine pour rester cohérent.

### Solution n°3 : Déplacement des données dans une table d'archivage sous format JSON

**Description**

Le déplacement de l'enregistrement du prescrit vers une table d'archivage permet d'extraire les prescrits supprimés.
Il est possible de sérialiser les données dans une colonne de la table d'archivage.

**Avantages:**

Aucune incidence sur les fonctionnalités existantes et à venir concernant les prescrits actifs.
Diminution de la volumétrie de la table des prescrits actifs si la fonctionnalité est utilisée en masse.

**Inconvénients:**

La sérialisation des données peut rendre l'exploitation plus complexe (requêtes moins évidentes à faire).
En cas d'ajout de colonnes dans la table d'origine il n'y a pas besoin de faire de nouvelles migrations.
Par contre les anciennes lignes n'auront pas les informations des nouvelles colonnes dans la colonne sérialisée.

## Décision

C'est le déplacement des données dans une table d'archivage (solution 2) qui a été choisie pour les raisons suivantes :

- Pas d'impact sur les fonctionnalités existantes et futures
- Pas de problématique pour l'archivage intermédiare
- Permet à l'équipe Accès d'avancer sur l'exploration de l'archivage intermédiaire et en parallèle à l'équipe Prescription d'avancer sur la suppression de prescrits.

## Conséquences

L'équipe Prescription peut commencer son épix sur la suppression de prescrits.
