# Aggregate Root — explication

Pourquoi les règles de [`README.md`](README.md) existent, ce qu'elles rapportent, et d'où elles
viennent. Cette page ne prescrit rien : les règles sont dans la référence.

## Ce que l'Aggregate Root apporte

Un Aggregate existe parce qu'une règle porte sur plusieurs objets à la fois, et que quelqu'un doit
garantir qu'elle est vraie en permanence. La racine est ce garant. C'est la définition d'Evans, *DDD*,
ch. « The Life Cycle of a Domain Object », et la règle 1 de Vernon, « Effective Aggregate Design » :
*model true invariants in consistency boundaries*.

La différence entre une garantie et une convention fait tout l'intérêt de la catégorie. C'est ce que
protège A2 : si la frontière est contournable, la règle n'est plus qu'une convention.

### Ce que la fiche dit du code actuel

Appliquée telle quelle, cette référence déclare que peu d'objets du code sont des Aggregates : peu
ont une règle commune nommable (A1), et peu protègent leur collection interne (A2). Ce résultat est
attendu. A1 et A2 sont d'abord des **critères de classement**, pas une condamnation du code. La
notion d'Aggregate a été peu comprise jusqu'ici, et elle se trompe dans deux sens :

- **le mot sans l'Aggregate** : un dossier `aggregates/` contient des objets sans règle commune. Ce
  sont des Entities ou des read-models mal rangés, que `X1` de [`ecarts.md`](ecarts.md) reclasse ;
- **l'Aggregate sans le mot** : une règle qui porte sur plusieurs objets à la fois est écrite dans un
  usecase, faute d'une racine pour la porter. Le usecase a alors trop de logique, ce que décrit `X1`
  de `../usecase/ecarts.md`. Chacune de ces règles est un candidat à un Aggregate manquant.

La référence sert donc d'abord à trancher une question de conception, « est-ce un Aggregate ? »,
dans un sens comme dans l'autre.

### L'invariant de frontière mince

L'exemple nommable de A1 est mince : il contraint un type, pas une quantité métier. Un invariant mince
reste un invariant, mais c'est un signal. Si c'est tout ce que la frontière garantit, une question se
pose aussitôt, celle de A6 : porter cette collection vaut-il son chargement ?

### Pourquoi un Aggregate grossit

Un Aggregate grossit naturellement, parce qu'il est commode d'y ajouter ce qui est sous la main. Les
deux questions de A6 servent à freiner ce mouvement. La réponse de la littérature au coût de
chargement est de réduire l'Aggregate plutôt que de le charger partiellement : c'est la règle 2 de
Vernon, *design small aggregates*.

### A3 et le vocabulaire

A3 est l'invariant le plus souvent abandonné en pratique, parce que le découpage réel suit les besoins
de requêtage. Garder le mot « Aggregate » et multiplier les repositories vide le vocabulaire de son
sens. D'où la forme retenue : une lecture trop chère, selon une mesure, passe par un read-model.

### Le test caractéristique

Le test qui prouve le refus d'une opération violant l'invariant de frontière est celui qui manque
presque toujours. Son absence ne signale pas un défaut de couverture : elle signale que l'invariant
de frontière n'est pas formulé, donc un défaut de A1.

## ROI des invariants

| Invariant | Rentabilité | Ce qu'on gagne |
| --- | --- | --- |
| **A1** frontière explicite | **forte** | Ce qui doit être vrai ensemble est connu, donc aussi ce qu'une transaction doit couvrir. Sans cette réponse, chaque écriture multiple est improvisée |
| **A2** point d'entrée unique | **forte** | La règle ne peut pas être contournée. C'est la différence entre une garantie et une convention |
| **A6** petit Aggregate | moyenne | Moins de contention en écriture, chargements plus rapides, frontières plus faciles à déplacer quand le métier change |
| **A7** une transaction, un Aggregate | moyenne | Les conflits d'écriture concurrente restent raisonnables, et, hors cas échouer-ensemble de l'ADR 25, la question « faut-il une transaction ici ? » a une réponse mécanique |
| **A3** un repository par racine | hygiène | Le nombre de repositories redevient une information sur la conception. Aucun défaut prévenu |

Les invariants hérités gardent le ROI qu'ils ont dans `../entite/explication.md`. **E3** et **E7**
y sont classés en rentabilité forte, et c'est sur une racine que ce classement se justifie le plus.

L'[ordre de mise en œuvre](outillage.md#ordre-de-mise-en-œuvre) suit le coût et les dépendances, pas
ce classement : A1, le plus rentable, vient en dernier parce qu'il dépend de la déclaration des
racines.

### L'avertissement propre à l'Aggregate Root

Ces rentabilités sont potentielles, pas acquises : elles supposent une frontière correctement placée.
Un Aggregate qui respecte tous les invariants sur une mauvaise frontière n'a aucun ROI. Il sera
seulement plus difficile à corriger, parce que le code s'y sera appuyé.

Sur une frontière mal placée, respecter les invariants aggrave le problème. La conséquence pratique :
la frontière (A1) se place avant tout outillage.

### Ce que ces invariants n'apportent pas

Ces invariants ne disent pas **où** placer la frontière. Ils disent ce qui doit tenir une fois
qu'elle est posée. Le placement est un travail de modélisation avec le métier, pas une déduction
depuis le code.

La plupart des lignes de la checklist restent humaines, et la raison est structurelle : les
invariants portent sur une frontière que le code ne déclare pas. La déclaration des racines, `X2` de
[`ecarts.md`](ecarts.md#x2-aucune-racine-nest-déclarée-nulle-part), est ce qui déplacerait cette
limite.

## Les décisions et leur histoire

### A7 et l'ADR 25

A7 est l'invariant de la littérature : Vernon, règle 4, *use eventual consistency outside the
boundary*. Pix a décidé autrement pour les écritures qui doivent échouer ensemble.

1. Pix enchaînait des traitements par événements à l'intérieur des transactions. C'est la forme qui
   aurait permis de découper les écritures par Aggregate. L'ADR 25 cite un usecase qui le faisait
   encore au moment de sa rédaction.
2. Ces événements dans des transactions ont causé des deadlocks en production, en épuisant le pool de
   connexions.
3. L'**ADR 25**, « Précision sur les transactions et les événements métier », en tire deux règles :
   - plus d'événements dans une transaction ;
   - les écritures qui doivent échouer ensemble sont orchestrées dans le usecase, sans événements. La
     transaction est conservée, même si elle couvre plusieurs Aggregates.
4. L'ADR 25 remplace l'ADR 9, « Transactions métier », et l'ADR 10, « Propager les Domain Events via
   un Event Dispatcher ».

Le motif est mesuré, ce qui distingue cette décision d'une préférence. A7 garde sa valeur comme
question de conception, mais ce n'est pas la règle appliquée au cas échouer-ensemble. Lire A7 sans
cette exception ferait croire que la référence prescrit ce que le dépôt contredit.

### Le typage aide peu

Une frontière de cohérence n'est pas une propriété de type. Aucune annotation ne dit « ces trois
objets doivent être cohérents ensemble ». Le typage n'apporte quelque chose que sur deux points,
décrits dans [`outillage.md`](outillage.md#vérifier-par-le-typage) : la lisibilité de E7 dans la
signature, et une protection statique de A2.

Pour E7, des identifiants typés, un `OrganizationId` distinct d'un `number`, feraient de la confusion
entre deux identifiants une erreur de compilation. C'est le sujet de l'**ADR 19**, « Typer les
identifiants ». Au vu des coûts d'implémentation, il a retenu le contrôle côté application, et écarté
le typage des identifiants côté domaine.

## La théorie des écarts

### X1. Le mot sans la frontière

Un Aggregate existe s'il y a une règle portant sur plusieurs objets à tenir en permanence. Sans cette
règle, il n'y a pas d'Aggregate. Poser le mot sur un dossier promet donc des invariants tenus, et un
dossier de projections de lecture rompt cette promesse. Voir `X1` de
[`ecarts.md`](ecarts.md#x1-le-mot--aggregate--est-posé-sur-des-dossiers-sans-frontière-nommable).

### X2. La déclaration des racines

La théorie ne dit rien directement : elle ne prescrit pas de fichier. L'écart est avec la
vérifiabilité, pas avec le livre. Aucune source ne fonde la déclaration des racines.

Le vrai levier n'est pas l'outillage, c'est la déclaration. Tant qu'aucun fichier ne dit « voici les
racines de ce contexte et ce que chacune garantit », aucune analyse statique ne peut le déduire. Voir
`X2` de [`ecarts.md`](ecarts.md#x2-aucune-racine-nest-déclarée-nulle-part).

### X4. La transaction qui couvre plusieurs Aggregates

Vernon, règle 4 : la cohérence hors de la frontière se règle à terme, et une transaction couvre un
Aggregate. Pix s'en écarte par décision, pour le motif mesuré décrit plus haut dans
[A7 et l'ADR 25](#a7-et-ladr-25). Voir `X4` de
[`ecarts.md`](ecarts.md#x4-une-opération-modifie-plusieurs-aggregates-dans-la-même-transaction).

## Sources

Bibliographie et liens dans `../references-ddd.md`. Sources primaires des conventions Pix : les ADR de
`docs/adr/`.

| Invariant | Source | Où vérifier |
| --- | --- | --- |
| **A1** frontière de cohérence | Evans, *DDD*, ch. « The Life Cycle of a Domain Object », Aggregate. Vernon, « Effective Aggregate Design », règle 1 : *model true invariants in consistency boundaries* | *DDD Reference* ; dddcommunity.org |
| **A2** point d'entrée unique | Evans, même ch. : c'est la définition de la racine | *DDD Reference* |
| **A3** un repository par racine | Evans, même ch. : le Repository porte sur les Aggregates, pas sur les Entities internes | *DDD Reference* |
| **A6** petit Aggregate | Vernon, règle 2 : *design small aggregates* | dddcommunity.org |
| **A7** une transaction, un Aggregate | Vernon, règle 4 : *use eventual consistency outside the boundary*. **Pix décide l'inverse pour le cas échouer-ensemble** : l'ADR 25, qui remplace les ADR 9 et 10, interdit les événements dans une transaction sur un motif mesuré. Voir `X4` de [`ecarts.md`](ecarts.md) | ADR 25 ; dddcommunity.org |
| Le test de discrimination | Evans, même ch. | *DDD Reference* |
| **X2** déclarer les racines | **aucune source.** La théorie ne prescrit pas de fichier ; l'écart est avec la vérifiabilité | — |
| Identifiants typés | **ADR 19**, « Typer les identifiants », qui écarte le typage des identifiants côté domaine pour son coût | ADR 19 |

Vernon, « Effective Aggregate Design », trois articles gratuits :
<https://www.dddcommunity.org/library/vernon_2011/>

Tous les invariants propres ont une source. Mais aucun n'est appuyé sur un ADR : la façon dont Pix
place ses frontières d'Aggregate n'a jamais été décidée par écrit. La déclaration des racines, `X2`,
est le premier pas pour écrire cette décision.
