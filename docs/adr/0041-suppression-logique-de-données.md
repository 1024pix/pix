# 41. Suppression logique de données.

Date : 2023-02-08

## État

Accepté

## Contexte

Les prescrits supprimés, ainsi que leurs participations (la fonctionnalité permettant la suppression de participations existe déjà), ne seront plus visibles dans l'application, mais l'on souhaite
conserver l'ensemble des données les concernant pour plusieurs raisons :

- faciliter la résolution d'un contentieux ;
- mise à disposition des données à l'usage de la recherche ;
- ...

Il n'existe pour le moment aucun mécanisme dans le cycle de vie de la donnée pour répondre à ces besoins.
Ils seront adressés par le chantier de l'archivage intermédiaire. Le cadrage fonctionnel de cette Epix n'est pas encore finalisé.
L'Epix sur la suppression d'un prescrit ne peut pas être déprioriser car beaucoup d'autres sujets en dépendent.
Nous devons donc trouver une solution temporaire satisfaisante qui répond à plusieurs critères :

- bloquer le moins de solutions possibles pour l'archivage intermédiaire ;
- demande un effort minimum ;
- facile à refactorer ;

La solution choisie sera temporaire et il y aura un travail de refactoring à faire sur la fonctionnalité de suppression d'un prescrit lorsque la solution d'archivage intermédiaire aura été déterminée.

Voici les règles métiers qui s'appliquent aux données des prescrits qui sont supprimées :

- Les données des prescrits supprimés ne seront plus utilisées dans aucun contrôle métier dans l'application ;
- La suppression est définitive ; il n'a pas été exprimé le besoin d'un retour arrière ;
- La date et l'auteur de la suppression sont enregistrés ;
- Un utilisateur peut réintégrer l'organisation, mais en tant que nouveau prescrit (les anciennes participations ne sont plus visibles de l'organisation) ;

### Solution n°1 : Ajout d'un indicateur de suppression sur la table des prescrits

**Description :**

L'ajout d'informations dans la table contenant les prescrits indiquant si ils sont supprimés :

- date de suppression
- utilisateur ayant réalisé la suppression

**Avantages :**

Une seule table à maintenir : toutes les modifications sont appliquées aux prescrits supprimés et conserve le contrôle d'intégrité des données.

**Inconvénients :**

Cette solution introduit un couplage fort entre la suppression d'un prescrit et l'ensemble des fonctionnalités concernant les prescrits :

- Modification des l'ensemble des cas d'usages existants impliquant les prescrits non supprimés ;
- Prise en compte des prescrits supprimés pour l'ensemble des nouveaux cas d'usages ;
- Risque de régression en cas d'oubli ;
- Risque d'afficher des données que les utilisateurs ne doivent plus voir ;

La notion de prescrit englobe un nombre important cas d'usages par conséquent les travaux engendrés par cette solution seront longs et fastidieux.

Cette solution implique aussi des inconvénients techniques :

- Il faudra mettre à jour les index existants pour exclure les prescrits supprimés ;
- Il faudra faire évoluer la contrainte d'unicité puisqu'un utilisateur doit pouvoir réintégré les organisations en tant qu'un nouveau prescrit ;
- La table ne fait que grossir en volumétrie ;

### Solution n°2 : Déplacement des données dans une copie de la table d'origine pour d'archivage

**Description :**

Déplacer les prescrits vers une table dédiée (archivage) lors de leur suppression.
Cette table ne contiendra que les prescrits supprimés.
La table des prescrits ne contiendra que les prescrits actifs.

La table d'archivage contiendra les deux colonnes suivantes en supplément de celles présentes dans la table d'origine :

- date de suppression
- utilisateur ayant réalisé la suppression

**Avantages :**

- Aucune incidence sur les fonctionnalités existantes concernant les prescrits actifs ;
- Facilite les futurs développement de fonctionnalités sur les prescrits actifs ;
- Diminution de la volumétrie de la table des prescrits ;

**Inconvénients :**

Cette approche implique de faire des migrations sur la table des données archivées en même temps que sur la table d'origine pour rester cohérent.
Il y aura un travail à faire pour rendre ces données de nouveau utilisables si on souhaite réaliser des fonctionnalités sur les prescrits supprimés (ce qui n'est pas le cas à date).

### Solution n°3 : Déplacement des données dans une table d'archivage sous format JSON

**Description :**

Déplacer les prescrits vers une table dédiée (archivage) lors de leur suppression.
Cette table ne contiendra que les prescrits supprimés.
La table des prescrits ne contiendra que les prescrits actifs.

La table d'archivage contiendra les données sérialisées des prescrits supprimés aussi les deux colonnes suivantes :

- date de suppression
- utilisateur ayant réalisé la suppression

**Avantages :**

- Aucune incidence sur les fonctionnalités existantes concernant les prescrits actifs ;
- Facilite les futurs développement de fonctionnalités sur les prescrits actifs ;
- Diminution de la volumétrie de la table des prescrits ;
- Pas besoin de faire de migration sur la table contenant les prescrits supprimés ;

**Inconvénients :**

- La sérialisation des données peut rendre l'exploitation plus complexe (requêtes moins évidentes à faire) ;
- Les données au fur et mesure des évolutions sur la table de prescrits actifs auront de moins en moins de cohérence dans la table contenant les prescrits supprimés ;
- Il y aura un travail à faire pour rendre ces données de nouveau utilisables (encore plus important que dans la solution 2) si on souhaite réaliser des fonctionnalités sur les prescrits supprimés (ce qui n'est pas le cas à date) ;

## Décision

C'est le déplacement des données dans une table d'archivage (solution 2) qui a été choisie pour les raisons suivantes :

- Pas d'impact sur les fonctionnalités existantes et futures ;
- Solution qui ne restreint pas les choix possibles pour la réalisation de l'archivage intermédiaire ;
- Permet à l'équipe Accès d'avancer sur l'exploration de l'archivage intermédiaire et en parallèle à l'équipe Prescription d'avancer sur la suppression de prescrits ;

## Conséquences

L'équipe Prescription peut commencer son épix sur la suppression de prescrits.
