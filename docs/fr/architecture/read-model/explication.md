# Read-model — explication

Pourquoi les règles de [`README.md`](README.md) existent, ce qu'elles rapportent, et d'où elles
viennent. Cette page ne prescrit rien : les règles sont dans la référence.

## Ce que le read-model apporte

Un read-model porte la forme d'une lecture : ce qu'un écran ou une réponse attend, assemblé par une
requête. Il sort du domaine sans y jouer de rôle.

DDD n'a pas de nom pour cet objet. Le vide est logique : un objet sans comportement ni invariant
n'appartient pas au modèle du domaine. Ce qui est nommé, c'est la requête, et l'objet transporté :

- Vernon, *IDDD*, nomme la requête *use case optimal query* ;
- Fowler, *PoEAA*, nomme l'objet transporté **Data Transfer Object**.

Le mot `read-model` vient d'ailleurs, de CQRS, où il désigne autre chose. La référence précise ce
qu'il désigne à Pix, et la théorie de cet emprunt est sous [X2](#x2-le-mot-read-model-vient-de-cqrs).

## ROI des invariants

| Invariant | Rentabilité | Ce qu'on gagne |
| --- | --- | --- |
| **RM1** aucune règle métier | **forte** | Empêche qu'une règle du domaine vive hors du domaine, où elle sera réécrite |
| **RM3** n'entre pas dans une règle | moyenne | Empêche une décision prise à partir d'une forme non validée. Sert aussi de test de classement |
| **RM4** emplacement | moyenne | Deux dossiers frères, donc RM3 devient vérifiable par une règle de chemin |
| **RM2** aucune validation | hygiène | Évite qu'un relecteur signale l'absence de validation sur chaque read-model |

RM4 est classé en rentabilité moyenne, pas en hygiène. Un invariant de rangement vaut d'habitude moins.
Ici, l'emplacement rend un autre invariant vérifiable.

L'ordre de mise en œuvre de [`outillage.md`](outillage.md#ordre-de-mise-en-œuvre) suit le coût, pas
ce classement.

### Ce que ces invariants n'apportent pas

Ces invariants ne disent pas si un read-model méritait d'exister plutôt que de rester un objet littéral.
La question se pose dans les [tests attendus](README.md#tests-attendus). Elle reste de jugement.

Ils ne disent pas non plus **quelle** forme un écran devrait recevoir. Un read-model trop large fait
transiter des champs que personne n'affiche. Trop étroit, il oblige à un second aller-retour. Ce
compromis appartient au besoin, pas à l'architecture.

RM1 est le cœur de la catégorie, et il est indécidable. Aucun outil ne pourra donc vérifier
l'essentiel de cette catégorie : la checklist garde ses lignes de jugement.

## Les décisions et leur histoire

### L'immuabilité et l'absence d'identité, une convention Pix

Les invariants communs `V1`, `V2`, `V4`, `V6` et `V7` sont fondés, dans `../objet-valeur/README.md`,
sur le Value Object d'Evans. Un read-model n'en est pas un. Pour lui, l'immuabilité et l'absence
d'identité sont une **convention Pix** posée sur le DTO de Fowler, qui n'exige ni l'une ni l'autre.
L'énoncé est le même, l'autorité derrière ne l'est pas. Le coût de cette convention est l'écart `X3`
de [`ecarts.md`](ecarts.md).

Les invariants communs restent énoncés dans la fiche Value Object, et la fiche read-model y aiguille.
Le document d'état des lieux `../invariants-clean-archi-ddd.md` a été écarté comme emplacement : il est
daté, et y placer du contenu stable casserait la séparation entre ce qui est pérenne et ce qui se
périme.

### La clé de présentation se compose dans le sérialiseur

Une clé de présentation n'identifie rien : elle satisfait le store du front. L'équipe a décidé qu'elle
se compose dans le sérialiseur, pas dans le read-model. Le détail est sous `V2` dans
`../objet-valeur/README.md`.

### Pourquoi sous `domain/`

Un read-model vit sous `domain/` alors qu'il n'appartient pas au modèle du domaine. La raison est
structurelle, pas taxonomique. Un repository le construit et un usecase le renvoie. Le placer sous
`application/` ferait dépendre l'infrastructure de l'application, ce que la règle de dépendance
interdit. Le rangement suit la direction des dépendances, pas une catégorie DDD. Aucune catégorie DDD
n'existe pour cet objet.

### Pourquoi un type structurel

Un read-model est un type structurel : sa forme est son contenu, et une autre forme identique peut lui
être substituée. C'est l'inverse du choix retenu pour un Value Object, qui exige la nominalité. La
raison de la différence : la nominalité protège un constructeur qui valide. Un read-model ne valide
pas. La forme du type est dans [`outillage.md`](outillage.md#vérifier-par-le-typage).

### Le mot `read-model` conservé

Le mot avait d'abord été classé « à corriger », au motif que le renommage débloquerait une
vérification par règle de chemin. Le 2026-09-08, ce verdict a été renversé : `domain/models/` et
`domain/read-models/` sont déjà des dossiers frères, donc la règle peut s'écrire telle quelle. Le
renommage n'apportait rien, et le mot est celui de l'équipe. Ce qui reste à faire est le classement
des fichiers, pas le renommage : c'est `X1` de [`ecarts.md`](ecarts.md).

## La théorie des écarts

### X1. Un dossier pour trois natures d'objets

Un dossier nommé annonce une catégorie, donc des invariants. Trois catégories aux invariants opposés
sous un même nom rendent le classement invisible.

### X2. Le mot `read-model` vient de CQRS

Le read-model n'appartient pas au vocabulaire de DDD. La partie tactique d'Evans liste Entity, Value
Object, Service, Module, Aggregate, Factory, Repository.

Le terme vient de **CQRS**, où il désigne un modèle alimenté par un store séparé, désynchronisé du
modèle d'écriture.

Ici, le mot désigne autre chose : le résultat d'une requête sur la même base, dans la même transaction.
C'est la *use case optimal query* de Vernon. Son objet transporté est un **DTO** au sens de Fowler.

**L'Ubiquitous Language est la langue de l'équipe**, pas celle du livre. Renommer au nom de la rigueur
du vocabulaire irait contre l'Ubiquitous Language, qui est justement une règle de vocabulaire.

### X3. L'objet est immuable alors que rien ne l'exige

Le DTO de Fowler est un porteur de données. Rien dans le patron n'exige l'immuabilité ni l'absence
d'identité : ce sont des propriétés du Value Object d'Evans, qui est une autre catégorie.

## Sources

Bibliographie et liens dans `../references-ddd.md`. Sources primaires des conventions Pix : les ADR de
`docs/adr/`.

| Invariant | Source | Où vérifier |
| --- | --- | --- |
| La catégorie elle-même | DDD n'a pas de nom pour cet objet. Le vide est logique : un objet sans comportement ni invariant n'appartient pas au modèle du domaine. Ce qui est nommé, c'est la requête (Vernon, *IDDD*, *use case optimal query*), et l'objet transporté (Fowler, *PoEAA*, Data Transfer Object) | dddcommunity.org ; *PoEAA* |
| Le mot `read-model` | Emprunté à CQRS, où il désigne autre chose. Conservé comme mot de l'équipe, voir `X2` de [`ecarts.md`](ecarts.md) | `../references-ddd.md`, section « Read model » |
| **RM1** aucune règle métier | Déduction : Fowler condamne le modèle anémique du domaine. L'appliquer à un objet de transport serait un contresens | bliki gratuit |
| **RM2** aucune validation | **aucune source** | — |
| **RM3** n'entre pas dans une règle | Déduction de la validation à la construction : une règle qui décide à partir d'une forme non validée décide à partir de n'importe quoi | — |
| **RM4** emplacement | **aucune source**. Convention Pix en place | — |
| Immuabilité et absence d'identité | Convention Pix, pas Fowler : le DTO de *PoEAA* n'exige ni l'une ni l'autre. Les énoncés sont ceux de `V1` et `V2` dans `../objet-valeur/README.md`. Leur autorité, chez Evans, porte sur le Value Object, qu'un read-model n'est pas. Voir `X3` de [`ecarts.md`](ecarts.md) | *PoEAA* ; *DDD Reference* |
| Un repository peut renvoyer un calcul de synthèse | Vérifié. Cela ne concerne pas ce dossier : Evans, ch. 6, autorise un repository à renvoyer un décompte ou une somme, des scalaires, pas un objet assemblé. Le passage appuie les exceptions légitimes de [`../repository/README.md`](../repository/README.md#exceptions-légitimes) | *Final Manuscript* 2003, p. 109 |

Aucun des quatre invariants propres n'a de source directe : RM2 et RM4 n'ont aucune source, RM1 et
RM3 sont des déductions explicites. La catégorie n'existe pas dans la littérature DDD, donc c'est
cohérent. Ce sont des conventions : elles se discutent sur leurs mérites, pas par appel à une autorité.
