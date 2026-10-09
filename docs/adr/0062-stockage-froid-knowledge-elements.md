# 62. Stockage froid des knowledge-elements

Date : 2026-10-09

## État

En étude

## Contexte

La migration de `knowledge-elements` vers `knowledge-state` retire le besoin de lire
`knowledge-elements` en live pour un utilisateur. `knowledge-state` suffit à servir l'application. Deux besoins
restent cependant, distincts :

1. **Le passif** : la table `knowledge-elements` contient aujourd'hui environ 5 milliards de lignes. Une fois un
   utilisateur migré, ses lignes ne servent plus la production mais doivent être conservées pour des usages
   d'agrégation (recherche sur les parcours d'apprentissage, tuning de l'algorithme de calibration, audits). Il faut les
   sortir de la base de production sans interrompre le service.
2. **Le flux** : chaque réponse continue de produire l'évènement "un utilisateur a répondu à un skill, voici le statut
   qui en résulte". Pour un utilisateur migré, cet évènement n'a plus besoin d'être écrit dans la table de production,
   mais doit être acheminé en continu vers le stockage retenu s'il doit rester disponible pour l'agrégation.

Le profil d'accès attendu sur ce stockage est de l'agrégation (scans larges, `group by`), jamais une lecture qui va chercher une seule ligne précise — c'est ce critère qui doit guider le choix, pas l'existant.

Le projet dispose déjà d'un précédent directement comparable : l'ADR [0060](../../adr/0060-production-de-donnees-a-mettre-a-disposition.md)
décrit l'architecture retenue pour la mise à disposition de données froides (réplication vers un datamart dédié,
pilotée par l'API MaDDo). Le mécanisme de réplication qui y est décrit (`api/src/maddo/domain/usecases/extract-transform-and-load-data.ts`,
un `COPY ... FROM STDIN` streamé entre deux bases Postgres) est un point de départ direct pour la Solution 1
ci-dessous.

## Solutions envisagées

### Solution 1 : table dédiée dans une base relationnelle (OLTP) séparée de la prod

Réutilisation du mécanisme déjà en place pour MaDDo (ADR 0060) : les lignes migrées sont déplacées par lots vers une
table d'une base dédiée (ex. le `datawarehouse` existant) via `COPY ... FROM STDIN`, puis supprimées de la production
par petits batches. Les nouveaux évènements d'un utilisateur migré sont ensuite insérés directement dans cette table
froide au fil de l'eau.

#### Avantages

- Aucune nouvelle technologie, aucun nouvel outillage ; compétences déjà présentes dans l'équipe.
- Requêtable immédiatement avec le même langage (SQL) que le reste du produit.

#### Inconvénients

- Un moteur relationnel classique (row store) n'est pas pensé pour l'agrégation à très grande échelle : au-delà de
  quelques centaines de millions de lignes sur une même table, la documentation PostgreSQL recommande elle-même le
  partitionnement déclaratif pour garder les index et le `VACUUM` gérables. Sur 5 milliards de lignes, une table non
  partitionnée est hors des clous recommandés (cf. documentation PostgreSQL, chapitre *Table Partitioning*).
- Un insert synchrone vers la base froide dans le chemin de réponse de l'utilisateur introduit un couplage de
  disponibilité qui n'existe pas aujourd'hui.

### Solution 2 : entrepôt analytique colonnaire (OLAP) — ex. ClickHouse, BigQuery, Redshift, Snowflake

Export en masse de l'historique vers l'entrepôt cible (`LOAD`/`COPY` natif selon le moteur), puis ingestion continue
des nouveaux évènements par lots bufferisés : ces moteurs déconseillent explicitement d'insérer les évènements un par
un, et recommandent de les regrouper par lots (cf. documentation ClickHouse, section *Usage Recommendations*).

#### Avantages

- Conçu nativement pour l'agrégation à grande échelle : compression colonnaire, scans de colonnes isolées très
  rapides. Les éditeurs (Snowflake, BigQuery) documentent des tables de plusieurs dizaines de milliards de lignes en
  production pour ce type d'usage.
- Alignement direct avec le profil d'accès attendu (agrégation, pas de lecture transactionnelle).

#### Inconvénients

- Nouvelle technologie 
- Mauvais choix si un besoin de relecture ligne à ligne par utilisateur apparaissait un jour (non attendu ici).

### Solution 3 : base NoSQL documentaire — ex. MongoDB

Chaque utilisateur migré devient un document contenant son historique complet ; les nouveaux évènements s'ajoutent par
`$push`.

#### Avantages

- Schéma flexible, pas de migration de schéma pour un besoin futur.
- Le modèle "un document = un historique utilisateur" correspond à la forme actuelle de la donnée.

#### Inconvénients

- L'agrégation inter-documents nécessite le framework d'agrégation de Mongo, présenté par l'éditeur lui-même comme
  adapté à des agrégations modérées, pas comme une alternative à un entrepôt analytique (cf. documentation MongoDB,
  *Aggregation Pipeline*).
- Moins pertinent que les solutions 2 ou 5 pour un besoin déclaré d'agrégation massive transverse.

### Solution 4 : base NoSQL large-colonne — ex. Cassandra/ScyllaDB

Écriture append-only partitionnée par `userId`, migration du passif par bulk-loading natif (`sstableloader`).

#### Avantages

- Excellent en écriture massive continue, scalabilité horizontale native (cas d'usage d'origine : la boîte de
  réception Facebook, cf. Lakshman & Malik, *Cassandra: A Decentralized Structured Storage System*, 2009/2010).

#### Inconvénients

- Les agrégations transverses (hors clé de partition) sont son point faible documenté.
- Complexité opérationnelle (cluster à gérer) difficilement justifiable sans besoin d'écriture déjà hors de portée des solutions 1 et 2.

### Solution 5 : fichiers Parquet sur stockage objet (data lake)

Export de l'historique en fichiers Parquet partitionnés (par date ou par cohorte de migration) ; les nouveaux
évènements sont bufferisés par fenêtre de temps avant écriture, le format étant immuable une fois écrit.

#### Avantages

- Le moins coûteux à l'échelle, découplé de toute base de données à faire grossir.
- Interrogeable directement par des moteurs sans serveur dédié (DuckDB, Trino, Athena), sans engagement fort envers un éditeur.

#### Inconvénients

- Pas de mise à jour ligne par ligne : une correction demande de réécrire le fichier concerné.
- Demande un minimum d'outillage (job d'export, catalogue de schéma), même réduit.

### Solution 6 : event sourcing — un log d'évènements comme source de vérité

Approche alternative : au lieu de choisir où stocker des lignes, l'évènement "réponse donnée" devient la source de
vérité (ex. un topic Kafka à rétention longue), et `knowledge-elements`, `knowledge-state`, ainsi que toute table
d'agrégation, deviennent des projections reconstruites à partir de ce log — pattern décrit par Martin Fowler
(*Event Sourcing*) et popularisé par Greg Young dans l'écosystème CQRS. Le passif est rejoué une fois dans le log ; les nouveaux évènements y sont publiés en continu, pour tous les utilisateurs.

#### Avantages

- Rejouable à volonté : toute nouvelle projection peut être reconstruite depuis zéro sans dépendre d'un calcul déjà
  fait ailleurs.
- Les docs de travail local `docs/fr/poc-eda/` (précédemment produites par l'équipe) portaient déjà sur une
  architecture évènementielle pour ce produit.

#### Inconvénients

- Changement de paradigme le plus lourd des six solutions : courtier d'évènements à opérer, discipline de
  versionnement de schéma, "état courant" toujours reconstruit plutôt que lu directement.
- Coût opérationnel et courbe d'apprentissage réels.

## Décision

*(proposition, à valider — l'état de cet ADR est "En étude")*

Les solutions 2 (OLAP colonnaire) et 5 (Parquet) sont les mieux proportionnées au besoin tel qu'il est formulé
(stockage froid + agrégation) : ce sont les deux seules dont la documentation éditeur confirme explicitement qu'elles
sont taillées pour ce volume et ce profil de requête, sans réclamer une nouvelle discipline d'architecture.

La solution 6 (event sourcing) n'est pas écartée mais n'est pas retenue par défaut : elle ne répond pas qu'à
l'archivage, elle change la nature de ce qu'est `knowledge-state` (une projection, pas une vérité), ce qui dépasse le
périmètre de cette décision. Elle mériterait un ADR dédié si un besoin de rejouabilité multi-consommateurs était
confirmé indépendamment du sujet de l'archivage.

## Conséquences

- Choix à confirmer entre les solutions 2 et 5 avant implémentation (dépend notamment de l'existence ou non d'un outil
  BI déjà en place côté Data).
- Un composant de bufferisation des nouveaux évènements est nécessaire dans les deux cas (ni l'un ni l'autre n'accepte
  un insert unitaire par réponse).
- La suppression du passif de la table de production (`knowledge-elements`) devra être faite par lots, après
  confirmation que l'export vers le stockage choisi est complet et vérifié (checksum ou comptage par cohorte).
