# 41. Suppression logique de données.

Date : 2023-01-23

## État

En cours.

## Contexte

Le métier souhaite pouvoir supprimer des prescrits d'une organisation.
Ceux-ci, ainsi que ses participations, ne seront plus visibles dans l'application, mais l'on souhaite conserver l'
ensemble des données le concernant.
Les données des prescrits supprimés ne seront plus utilisées dans aucun contrôle métier dans l'application.
La suppression est définitive ; le métier n'a pas exprimé le besoin d'un retour arrière.
Le métier souhaite conserver la date et l'auteur de la suppression.
Un prescrit peut réintégrer l'organisation, mais en tant que nouveau prescrit (les anciennes participations ne sont
toujours pas visibles de l'organisation).

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

### Solution n°2 : Déplacement des données dans une table d'archivage

**Description**

Le déplacement de l'enregistrement du prescrit vers une table d'archivage permet d'extraire les prescrits supprimés.

**Avantages:**

Aucune incidence sur les fonctionnalités existantes et à venir concernant les prescrits actifs.
Diminution de la volumétrie de la table des prescrits actifs si la fonctionnalité est utilisée en masse.

**Inconvénients:**

Il faut trouver une stratégie pour le stockage des données qu'on veut archiver.
Il y a deux solutions:

- La création d'une copie de la table d'origine avec les mêmes colonnes. Cette approche implique de faire des migrations sur
la table des données archivées quand une colonne est rajoutée dans la table d'origine pour rester cohérent.

- Il est possible de sérialiser les données dans une colonne de la table d'archivage. La sérialisation des données peut rendre
l'exploitation plus complexe (requêtes moins évidentes à faire). En cas d'ajout de colonnes dans la table d'origine il
n'y a pas besoin de faire de nouvelles migrations. Par contre les anciennes lignes n'auront pas les informations des
nouvelles colonnes dans la colonne sérialisée.

Quand les données archivées ont des ids étant des références dans d'autres tables les contraintes de clés
étrangères peuvent casser.

Il est possible de : 
- Supprimer les clés étrangères => Moins de sécurité si des modifications sont faites hors processus applicatif.
- Créer une table intermédiaire et lister tous les ids existants pour les clés étrangères.
exemple :https://stackoverflow.com/questions/10068033/postgresql-foreign-key-referencing-primary-keys-of-two-different-tables)
- Créer une contrainte conditionelle i.e. n'existe que si certaines conditions sont remplies.
  `CREATE UNIQUE INDEX ${NEW_CONSTRAINT_NAME} ON "${CAMPAIGNPARTICIPATIONS_TABLE}" ("${CAMPAIGNID_COLUMN}", "${USERID_COLUMN}" ) WHERE "${ISIMPROVED_COLUMN}" IS FALSE;`

## Décision


## Conséquences
