# Sérialiseur — explication

Pourquoi les règles de [`README.md`](README.md) existent, ce qu'elles rapportent, et d'où elles
viennent. Cette page ne prescrit rien : les règles sont dans la référence.

## Ce que le sérialiseur apporte

Le sérialiseur est un *presenter* au sens de Martin. Comme le contrôleur, c'est un *humble object* :
assez simple pour que son test soit trivial. La décision vit ailleurs, là où un lecteur la cherche.

Il travaille dans les deux sens, comme le décrit `docs/fr/Anatomy.md` : il met en forme une réponse,
et il désérialise une charge utile entrante. Les deux sens n'ont pas la même théorie. Le sens sortant
est celui du *presenter*, dépourvu de logique. Le sens entrant est une frontière d'entrée : il traduit,
et c'est cette traduction qui empêche la forme du transport d'atteindre le domaine. `M5` applique à
cette porte le raisonnement que `I1` de `../repository/README.md` applique à la persistance.

`M3` donne à la couche une particularité : c'est la seule du dépôt dont les consommateurs sont
partiellement inconnus. C'est le pendant externe de `P6` de `../api-interne/README.md`. Une différence
impose plus de prudence : les consommateurs d'une API interne sont connaissables, puisque ce sont les
contextes qui déclarent en dépendre. Ceux d'une API HTTP le sont moins.

## ROI des invariants

| Invariant | Rentabilité | Ce qu'on gagne |
| --- | --- | --- |
| **M1** aucune logique | **forte** | Une règle écrite ici serait invisible depuis le domaine et réécrite ailleurs. Une fuite coûte plus cher à cet endroit qu'ailleurs |
| **M3** format stable | **forte** | Les applications front continuent de fonctionner. C'est la seule couche dont les consommateurs sont partiellement inconnus |
| **M2** uniquement des champs présents | moyenne | Un champ manquant devient une erreur visible au lieu d'un `null` que le front interprète comme une donnée absente |
| **M5** la désérialisation ne laisse rien entrer | moyenne | La forme du format d'échange s'arrête à la frontière. Un changement de JSON:API ne remonte pas jusqu'aux modèles |
| **M4** un sérialiseur par ressource | hygiène | Aucun gain mesurable. Rend le fichier trouvable, et rend visible la violation de `M1` entre fichiers |

Les deux invariants en rentabilité forte ont des vérifiabilités opposées. `M1` se lit dans le fichier
et se contrôle par une règle simple. `M3` n'a aucun moyen dans ce dépôt, parce que ses consommateurs
sont hors du dépôt.

Cette asymétrie tient à l'outillage, pas à la nature de l'invariant. Un paquet de types partagé entre
l'API et les applications front rendrait `M3` vérifiable par le compilateur pour les retraits et les
renommages : voir [`outillage.md`](outillage.md#la-piste-qui-changerait-m3). Il ne resterait alors
hors de portée que le changement de sens d'un champ.

### Ce que ces invariants n'apportent pas

Rien ici ne dit si le format exposé est **bien conçu** : granularité, nommage des champs, relations
incluses ou non. Un sérialiseur irréprochable peut produire une réponse pénible à consommer.

Ce que font les applications front du contrat n'est pas le sujet de ce corpus, qui porte sur `api/`.
Le sujet est de ne pas casser le format publié.

## Les décisions et leur histoire

### Les exports CSV sont des sérialiseurs

L'équipe a décidé qu'aucune règle métier ne vit dans un sérialiseur, exports CSV compris. Un export
CSV met en forme vers un autre format d'échange, donc `M1` s'y applique comme à JSON:API. Le code qui
s'en écarte est décrit sous `X5` de [`ecarts.md`](ecarts.md).

### La clé de présentation se compose dans le sérialiseur

Une clé de présentation, comme un identifiant composé pour le front, se compose à partir de champs
reçus. L'équipe a décidé qu'elle se compose dans le sérialiseur. Ce n'est pas fabriquer un champ au
sens de `M2`, puisque la valeur ne vient que de champs présents. Le raisonnement complet est dans
`../objet-valeur/`, autour de `V2`.

### La stabilité du format, sans ADR

Aucun ADR ne porte de procédure de coordination entre équipes pour le format des réponses HTTP. C'est
une décision. Deux tiers de l'écart `X3` se règlent par un outil à venir plutôt que par une
procédure : le retrait ou le renommage d'un champ, et l'ajout ou le retrait d'une valeur possible. Un
outil est préféré à une procédure, parce qu'une procédure s'oublie.

Le tiers restant relève de la règle du sens, énoncée sous `M3` : une valeur existante ne change
jamais de signification. C'est la seule part que tient la revue, parce qu'aucun outil ne la
rattrapera.

Ce qui se passe côté front n'est pas le sujet de ce corpus. C'est pourquoi aucune procédure de
coordination n'est retenue.

## La théorie des écarts

### X1. Le presenter sans logique

Le *presenter* est dépourvu de logique. Son test reste ainsi trivial, et la décision vit là où un
lecteur la cherche. Une condition qui choisit entre deux formes de réponse place une décision dans la
mise en forme.

### X2. Le presenter ne produit pas de donnée

Même chapitre de Martin : le *presenter* met en forme, il ne produit pas de donnée. Un appel à une
méthode métier de l'objet reçu passe pour de la mise en forme parce qu'il ressemble à un accesseur.

### X3. Le Published Language

Evans traite le sujet sous *Published Language* : un format publié se versionne ou s'étend, il ne se
casse pas. Un consommateur hors du système ne change pas la règle. Il en augmente la portée.

### X4. Deux raisons de changer

Le format de sortie et le modèle du domaine évoluent pour des raisons différentes. Les coupler fait
dépendre l'un de l'autre.

### X5. Le presenter, quel que soit le format

Comme pour `X1` : le *presenter* est dépourvu de logique, quel que soit le format qu'il produit. Un
export CSV qui choisit ses données porte une règle métier dans l'infrastructure.

## Sources

Bibliographie et liens dans `../references-ddd.md`. Sources primaires des conventions Pix : les ADR de
`docs/adr/`.

| Invariant | Source | Où vérifier |
| --- | --- | --- |
| La couche, **M1** et **M4** | Martin, *Clean Architecture*, ch. « Presenters and Humble Objects » : le *presenter* est dépourvu de logique pour que son test soit trivial | le livre de 2017 ; billet gratuit de 2012 |
| **M2** uniquement des champs présents | **aucune source** : déduction de `M1` | — |
| **M5** la désérialisation ne laisse rien entrer | **déduction** de `I1` de `../repository/README.md`, vu depuis l'autre porte d'entrée. Le rôle dans les deux sens est documenté : `docs/fr/Anatomy.md` décrit les sérialiseurs comme des « Convertisseurs de données Domain objects ←→ HTTP request objects » | `docs/fr/Anatomy.md` |
| **M3** format stable | Evans, *DDD*, ch. « Maintaining Model Integrity » : **Published Language**, appliqué ici à l'extérieur du système plutôt qu'entre contextes | *DDD Reference*, PDF gratuit |
| La stabilité du format des réponses HTTP | **aucun ADR**, par décision : deux tiers de l'écart se règlent par un outil à venir plutôt que par une procédure. Voir [la stabilité du format, sans ADR](#la-stabilité-du-format-sans-adr) | — |

**Deux invariants sur cinq n'ont aucune source directe** : `M2` et `M5`, tous deux des déductions. Le
reste repose sur un chapitre de Martin et un chapitre d'Evans.

`M3` est le seul invariant du corpus qui porte sur un contrat dont les consommateurs sont **hors du
dépôt**. C'est aussi le seul dont la vérification ne peut pas vivre dans ce dépôt. Un paquet de types
partagé avec les fronts la ramènerait pour l'essentiel : voir
[`outillage.md`](outillage.md#la-piste-qui-changerait-m3).
