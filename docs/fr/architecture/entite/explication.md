# Entity — explication

Pourquoi les règles de [`README.md`](README.md) existent, ce qu'elles rapportent, et d'où elles
viennent. Cette page ne prescrit rien : les règles sont dans la référence.

## Ce que l'Entity apporte

L'Entity est la catégorie centrale du vocabulaire tactique de DDD. Evans la définit par son identité :
ses valeurs changent au cours du temps, elle reste la même chose. Le critère qu'il donne pour la
distinguer d'un Value Object est le test de discrimination de la référence.

Une Entity porte les règles qui contraignent son propre état. E3 est l'invariant qui distingue une
Entity d'un objet littéral nommé : sans lui, l'objet a un nom de classe, mais ne garantit rien.

## ROI des invariants

| Invariant | Rentabilité | Ce qu'on gagne |
| --- | --- | --- |
| **E3** invariants tenus à tout instant | **forte** | Un état invalide n'existe jamais, donc aucun code en aval n'a à s'en prémunir |
| **E6** aucun mutateur nu | **forte** | Sans lui, E3 n'est garanti qu'à la construction. Et la liste des méthodes devient la description du cycle de vie |
| **E7** référence par identité | **forte** | Le coût d'un chargement reste limité, et la frontière reste déplaçable le jour d'un découpage en contextes |
| **E4** pureté | moyenne | Les règles métier deviennent vérifiables en unitaire pur, à coût quasi nul |
| **E5** pas de méthode de persistance | moyenne | Une migration de schéma ne touche pas au domaine |
| **E1** identité explicite | moyenne | Préalable pour raisonner sur l'égalité, la déduplication et les références |
| **E2** égalité par identité | hygiène | Conséquence de E1. L'apport se limite à des tests plus robustes |
| **E8** nommage et emplacement | hygiène | Rend le fichier trouvable. Réduit le bruit de revue |

L'ordre de mise en œuvre de [`outillage.md`](outillage.md#ordre-de-mise-en-œuvre) suit le coût, pas
ce classement.

**E7 en rentabilité forte.** Un invariant de référencement passerait pour une bonne pratique. Il est
classé en rentabilité forte à cause de son second effet, le plus coûteux des deux. Tenir l'instance
d'une Entity d'un autre contexte rend l'Entity impossible à extraire le jour où ce contexte est
découpé. L'invariant conditionne donc la faisabilité d'un découpage en contextes, qui est le chantier
le plus coûteux à rattraper.

**Le bénéfice de lecture de E6.** La liste des méthodes d'une Entity est la liste des choses qui
peuvent lui arriver. C'est la description la moins chère de son cycle de vie.

### Ce que ces invariants n'apportent pas

Aucun de ces invariants ne dit si le concept modélisé est le bon, ni si la frontière entre deux
Entities est au bon endroit. Ils garantissent qu'une Entity tient ses promesses, pas qu'elle promet
les bonnes choses.

Ils ne disent pas non plus si l'objet méritait d'être une Entity plutôt qu'un Value Object ou un
read-model. C'est le test de discrimination qui répond. Il relève du jugement.

## Les décisions et leur histoire

### E5 porté par l'Entity, pas par le repository

La règle « aucune méthode au service de la persistance » figurait dans la fiche du repository, sous
le numéro `I7`. Ce numéro est retiré de `../repository/README.md`, parce que l'invariant porte sur le
modèle, pas sur le repository. L'invariant vit ici sous le numéro E5.

### E3 et E7 énoncés ici pour toute Entity

E3 et E7 valent pour toute Entity, qu'elle soit une racine ou non. Ils sont énoncés dans ce dossier,
et `../racine-agregat/README.md` y renvoie plutôt que de les répéter. Pour une racine, E3 porte sur
la frontière de cohérence entière, et E7 est constitutif de la frontière plutôt qu'une bonne
pratique.

### Pourquoi une classe

Deux types de même forme risquent moins de se confondre que pour un Value Object, parce que deux
Entities se distinguent par leur identité. La classe reste la forme retenue, parce qu'un constructeur
qui valide doit être le seul chemin de construction. La forme typée est dans
[`outillage.md`](outillage.md#vérifier-par-le-typage).

## La théorie des écarts

### X1. Le constructeur en sac de propriétés

Une Entity protège ses invariants. Un constructeur est le point où l'invariant devient vrai pour la
première fois. Un constructeur qui accepte l'objet vide rend E3 faux par construction.

### X3. La validation a lieu après l'affectation

L'invariant est vrai à tout instant. Un objet dont les champs sont affectés puis vérifiés a existé
dans un état invalide, même brièvement.

La convention Pix valide `this` après les affectations, contre un schéma déclaratif. Ce n'est pas la
forme la plus stricte. Elle est documentée, et son coût porte sur le message d'erreur, pas sur
l'invariant.

### X4. L'arborescence ne distingue pas Entity et Value Object

Entity, Value Object et Aggregate Root sont trois catégories aux invariants différents. La théorie ne
prescrit rien sur les dossiers. Mais un dossier commun rend le classement invisible.

### X5. L'Entity non persistée porte un identifiant `null`

Une Entity est définie par son identité. Une Entity sans identité est une contradiction dans les
termes. C'est pourquoi le cas mérite un nom : `…ForCreation`, décrit par `V8` de
`../objet-valeur/README.md`.

## Sources

Bibliographie et liens dans `../references-ddd.md`. Sources primaires des conventions Pix : les ADR de
`docs/adr/`.

| Invariant | Source | Où vérifier |
| --- | --- | --- |
| **E1**, **E2** identité, égalité par identité | Evans, *DDD*, ch. « A Model Expressed in Software », Entity | *DDD Reference*, PDF gratuit |
| **E3** invariants tenus à tout instant | Evans, ch. « The Life Cycle of a Domain Object » : l'invariant est la raison d'être de l'Aggregate, et vaut pour l'Entity | *DDD Reference* |
| **E4** pureté | Evans, même ch. ; Martin, « The Clean Architecture » | billet gratuit |
| **E5** pas de méthode de persistance | Evans, ch. « A Model Expressed in Software ». L'exception du format publié : ch. « Maintaining Model Integrity », **Published Language** | *DDD Reference* |
| **E6** aucun mutateur nu | Fowler, « AnemicDomainModel » | bliki gratuit |
| **E7** référence par identité | Vernon, « Effective Aggregate Design », règle 3 : *reference other aggregates by identity* | dddcommunity.org |
| **E8** nommage et emplacement | l'**emplacement** est documenté : `docs/fr/Anatomy.md` décrit `domain/models`. Le **nommage**, PascalCase et un fichier par Entity, n'a **aucune source** | `docs/fr/Anatomy.md` ; ADR 51, « Arborescence API » |
| Le test de discrimination Entity / Value Object | Evans, même ch. : c'est le critère qu'il donne | *DDD Reference* |
| Typage des identifiants à la frontière HTTP, pas par le domaine (`X2` de `../objet-valeur/ecarts.md`) | **ADR 19**, « Typer les identifiants », qui écarte le typage des identifiants côté domaine pour son coût | ADR 19 |

Un seul invariant sur huit n'a aucune source externe : **E8**, la convention de nommage. La catégorie
Entity est le cœur du vocabulaire tactique de DDD, et ses invariants sont ceux des livres.

Ce qui manque de source, ici, c'est la **façon Pix** de les appliquer :

- le choix du type d'erreur de validation ;
- l'ordre validation / affectation ;
- le traitement de l'Entity non persistée.

Ces trois points relèvent de la convention et se discutent sur leurs mérites. Les deux derniers sont
respectivement `X3` et `X5` de [`ecarts.md`](ecarts.md).
