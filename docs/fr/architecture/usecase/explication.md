# Usecase — explication

Pourquoi les règles de [`README.md`](README.md) existent, ce qu'elles rapportent, et d'où elles
viennent. Cette page ne prescrit rien : les règles sont dans la référence.

## Ce que le usecase apporte

Martin, dans *Clean Architecture*, distingue deux sortes de règles. Les règles d'entreprise vivent
dans les Entities. Les règles applicatives orchestrent, et vivent dans les usecases. Le usecase est
donc une couche à part entière, et c'est cette distinction qui fonde U1.

Le usecase est en bout de chaîne : il consomme des ports et des modèles. C'est aussi le point
d'entrée unique d'une intention métier, qu'elle soit appelée par une route, un script ou un job.

La frontière avec le Domain Service vient d'Evans, *DDD*, ch. « A Model Expressed in Software » : le
Service y est défini sans état et sans I/O. Un fichier qui reçoit une I/O n'est donc pas un Domain
Service. Le test est énoncé dans [`../service-domaine/README.md`](../service-domaine/README.md).

## ROI des invariants

| Invariant | Rentabilité | Ce qu'on gagne |
| --- | --- | --- |
| **U1** aucune règle métier | **forte** | La règle est écrite une fois, là où sont ses données. Cela empêche trois usecases d'implémenter trois variantes de la même condition |
| **U9** API interne obligatoire | **forte** | Les contextes restent découplés, et le contrat entre eux reste explicite et versionnable |
| **U3** aucun import d'infrastructure | moyenne | La couche métier reste indépendante de la façon dont les données sont atteintes |
| **U2** dépendances injectées | moyenne | Le usecase est testable en substituant ses dépendances. Sous ESM, c'est la seule façon |
| **U5** aucune notion de transport | moyenne | Le même usecase sert une route, un script et un job sans adaptation |
| **U6** renvoie des objets du domaine | moyenne | La forme de l'API ne remonte pas dans le domaine |
| **U7** périmètre transactionnel | moyenne | Ce qui est atomique est connu. Sans cette réponse, chaque écriture multiple est un pari |
| **U4** une intention, un nom de verbe | moyenne | La liste des fichiers est la documentation fonctionnelle du contexte, sans coût d'écriture |
| **U8** enregistré dans l'index | hygiène | L'index reste la carte de ce que le contexte sait faire. Aucun effet à l'exécution |

U1 et U9 ont tous deux une rentabilité forte, mais pas la même vérifiabilité. U9 se vérifie par une
règle de chemin. Aucun moyen fiable ne vérifie U1.

L'ordre de mise en œuvre de [`outillage.md`](outillage.md#ordre-de-mise-en-œuvre) suit le coût, pas
ce classement.

### Ce que ces invariants n'apportent pas

Ces invariants ne disent pas si le découpage en usecases est le bon, ni si une intention métier
mérite son usecase. Un usecase par route est une convention, pas une garantie de pertinence : elle
produit aussi des usecases qui ne font que déléguer.

Ils ne disent pas non plus si le fichier devait être un usecase plutôt qu'un Domain Service. Le test
de discrimination de [`../service-domaine/README.md`](../service-domaine/README.md) répond à cette
question.

### Ce que le typage apporte

Les ports déclarés rendent vérifiable ce que le usecase appelle sur ses dépendances. Une méthode
absente ou mal nommée devient une erreur de compilation. Sans typage, elle échoue à l'exécution.
Le typage ne vérifie rien tant que les ports et les modèles sont en JavaScript. La forme est dans
[`outillage.md`](outillage.md#vérifier-par-le-typage).

## Les décisions et leur histoire

### L'injection des dépendances

L'ADR 46 décide l'injection des dépendances. Son motif : sous ESM, les exports d'un module sont
immuables, donc une dépendance importée ne peut pas être remplacée par une doublure de test. Ce motif
est technique, pas stylistique. C'est l'origine de U2, et de U3 qui en est le corollaire côté
fichier.

### Le périmètre transactionnel

1. L'**ADR 9**, « Transactions métier », a d'abord fixé la forme des transactions.
2. L'**ADR 25**, « Précision sur les transactions et les événements métier », remplace l'ADR 9. Sa
   décision est plus étroite que son titre : elle porte sur les événements dans les transactions. Elle
   interdit les événements dans une transaction. Son motif est mesuré : des deadlocks constatés en
   production, qui épuisaient le pool de connexions.
3. Le critère de U7, échouer ensemble ou indépendamment, vient des conséquences de l'ADR 25.
4. La connexion à la base passe par `DomainTransaction`, sans apparaître dans la signature. C'est
   `I12` de [`../repository/README.md`](../repository/README.md), et son histoire est dans
   [`../repository/explication.md`](../repository/explication.md#la-connexion-par-domaintransaction).
   La contrepartie est qu'un usecase ne dit pas s'il s'exécute dans la transaction d'un appelant :
   c'est `X3` de [`../repository/ecarts.md`](../repository/ecarts.md).

**Sur plusieurs Aggregates.** L'ADR 25 retient la transaction qui en couvre plusieurs quand les
écritures doivent échouer ensemble. C'est une position différente de celle de Vernon, dont la règle 4
prône la cohérence différée entre Aggregates. Le choix est instruit sous `A7` de
[`../racine-agregat/README.md`](../racine-agregat/README.md) et `X4` de
[`../racine-agregat/ecarts.md`](../racine-agregat/ecarts.md).

### La communication entre contextes

L'ADR 55 décide des APIs internes synchrones entre contextes. Ses coûts sont listés et acceptés :

- complexité supplémentaire dans l'infrastructure, par l'injection de dépendances dans les
  repositories ;
- données de test à fournir aux consommateurs ;
- volume de code répétitif, et duplication possible des modèles.

Le 2026-09-24, l'équipe a précisé la forme : un usecase ne reçoit jamais une API interne directement.
Elle passe par un repository du contexte, qui est l'Anticorruption Layer. C'est U9, et l'écart `X6`
de [`ecarts.md`](ecarts.md) décrit le code qui ne suit pas encore cette forme.

### Le usecase obligatoire

L'ADR 20 rend le usecase obligatoire, même quand il ne fait que déléguer. Le bénéfice est que le
point d'entrée est toujours au même endroit. C'est pourquoi `X5` de [`ecarts.md`](ecarts.md) n'appelle
aucune correction.

### Entrées et dépendances, et le typage

La séparation des entrées et des dépendances en deux objets est une décision de lisibilité, pas une
conséquence de la migration TypeScript. Avec un seul objet, le typage reste possible et correct, mais
la signature ne distingue toujours pas les deux. Les deux sujets sont indépendants : voir `X4` de
[`ecarts.md`](ecarts.md).

## La théorie des écarts

### X1. La règle métier vit dans le usecase

Martin distingue les règles d'entreprise, qui vivent dans les Entities, des règles applicatives, qui
orchestrent. Fowler nomme le symptôme obtenu quand la distinction tombe : le modèle anémique.

Vu depuis l'Entity, le même écart a pour symptôme le modèle vide. Il est énoncé dans ce dossier, où se
trouve le fichier fautif, et [`../entite/README.md`](../entite/README.md) y renvoie.

### X2. Le usecase renvoie un objet façonné pour la réponse HTTP

La mise en forme pour un consommateur appartient à la couche externe. Martin la traite sous
*Presenters and Humble Objects*.

### X3. Le fichier de câblage des usecases importe l'infrastructure

Clean Architecture place le câblage dans une couche externe, jamais dans le domaine.

### X4. Dépendances et entrées métier sont mélangées

La théorie ne dit rien directement. L'écart porte sur la lisibilité de la frontière, pas sur un livre.

### X5. Un usecase réduit à un seul appel de repository

Un usecase réalise une intention. Une délégation n'en est pas une.

### X6. Une API interne est injectée directement dans le usecase

Un contexte qui consomme un voisin traduit le modèle de ce voisin à sa frontière, pour que ce modèle
n'entre pas dans le sien : c'est l'Anticorruption Layer d'Evans. L'ADR 55 place cette traduction dans
un repository du contexte consommateur. Voir aussi `X6` de
[`../repository/ecarts.md`](../repository/ecarts.md) et
[`../repository/explication.md`](../repository/explication.md#x6-lanticorruption-layer).

## Sources

Bibliographie et liens dans `../references-ddd.md`. Sources primaires des conventions Pix : les ADR
de `docs/adr/`.

| Invariant | Source | Où vérifier |
| --- | --- | --- |
| Le usecase comme couche | Martin, *Clean Architecture*, ch. « Business Rules » : distinction *Entities* / *Use Cases* | le livre de 2017 ; billet « The Clean Architecture » gratuit |
| **U1** aucune règle métier | Martin, même ch. : les règles d'entreprise sont dans les Entities, les règles applicatives dans les usecases. Fowler, « AnemicDomainModel », pour le symptôme inverse | bliki gratuit |
| **U2** dépendances injectées | Martin, ch. « The Dependency Inversion Principle ». Pix : **ADR 46**, avec son motif ESM | ADR 46 |
| **U3** aucun import d'infrastructure | Martin, « The Clean Architecture » : la règle de dépendance | billet gratuit |
| **U4** une intention, un fichier | Pix : **ADR 20** pour le caractère obligatoire, **ADR 51** pour l'arborescence. Le nommage par verbe n'a **aucune source** | ADR 20 et 51 |
| **U5** aucune notion de transport, **U6** renvoie des objets du domaine | Martin, ch. « Presenters and Humble Objects » | le livre de 2017 |
| **U7** périmètre transactionnel | Pix : **ADR 25**, qui remplace l'ADR 9 et interdit les événements dans une transaction, sur un motif mesuré : des deadlocks en production. Le critère échouer-ensemble / indépendamment vient de ses conséquences. Vernon, règle 4, pour la cohérence différée | ADR 25 ; dddcommunity.org |
| **U8** enregistré dans l'index | **aucune source** : outillage Pix | — |
| **U9** API interne obligatoire | Pix : **ADR 55**, qui décide les APIs internes synchrones et énumère les coûts acceptés | ADR 55 |
| Le discriminant avec le Domain Service | Evans, *DDD*, ch. « A Model Expressed in Software » : le Service y est défini sans état et sans I/O | *DDD Reference* |

**U8 n'a aucune source.** Le nommage par verbe de U4 n'en a pas non plus : l'ADR 20 ne source que le
caractère obligatoire du usecase. Quatre invariants renvoient directement à un ADR Pix : U2, U4, U7
et U9. Ils sont donc contestables sur pièces plutôt que par appel à une autorité.
