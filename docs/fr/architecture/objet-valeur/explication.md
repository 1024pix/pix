# Value Object — explication

Pourquoi les règles de [`README.md`](README.md) existent, ce qu'elles rapportent, et d'où elles
viennent. Cette page ne prescrit rien : les règles sont dans la référence.

## Ce que le Value Object apporte

Le Value Object transforme une primitive sans signification en concept nommé qui protège ses propres
règles. La catégorie vient d'Evans, *DDD*, ch. « A Model Expressed in Software ». La façon de
l'appliquer dans Pix est en partie conventionnelle : V3 durcit la théorie, V7 et V8 n'ont pas de
source.

Cette référence porte aussi le discriminant avec le read-model et les cinq invariants communs aux deux
catégories : V1, V2, V4, V6 et V7. La référence du read-model y renvoie au lieu de les répéter.

## ROI des invariants

| Invariant | Rentabilité | Ce qu'on gagne |
| --- | --- | --- |
| **V3** validation à la construction | **forte** | Une valeur invalide n'existe pas. Aucun code en aval n'a à se demander si elle est cohérente |
| **V5** comportement porté par l'objet | **forte** | La règle vit à côté de la donnée qu'elle contraint, donc elle n'est pas réécrite dans trois usecases |
| **V1** immuabilité | moyenne | Le partage devient sûr sans copie défensive |
| **V7** exposition en lecture seule | moyenne | Ferme la voie par laquelle V1 est annulé de l'extérieur |
| **V4** pureté | moyenne | Test unitaire sans double, coût d'exécution prévisible |
| **V8** un type par intention | moyenne | La signature devient une garantie, et le typage la rendra vérifiable. Il va avec le test du motif : sans lui, c'est le vecteur de `X7` |
| **V2** aucune identité | moyenne | Rend le classement possible : sans lui, rien ne distingue un Value Object d'une Entity mal rangée |
| **V6** aucun cycle de vie propre | hygiène | Conséquence de V2. Rien de mesurable ne s'améliore |

L'ordre de mise en œuvre de [`outillage.md`](outillage.md#ordre-de-mise-en-œuvre) suit le coût, pas
ce classement.

Les invariants les plus rentables, V3 et V5, portent sur le contenu d'une règle, pas sur une forme
syntaxique. Cela limite la part automatisable de la checklist.

### Ce que ces invariants n'apportent pas

Ces invariants ne disent pas **quels** concepts méritent un Value Object. Extraire un Value Object de
trop est un coût pur ; ne pas en extraire un qui portait une règle laisse la règle se dupliquer. Ce
jugement reste humain.

Ils ne disent pas non plus **si** un concept mérite d'être un Value Object plutôt qu'un read-model.
C'est le [discriminant](README.md#le-discriminant) qui répond ; il s'appuie sur des tests de jugement.

## Les décisions et leur histoire

### La forme du type

Deux formes de type existent, et elles ne se valent pas.

**Type structurel**, léger, sans garantie d'unicité :

```ts
export type AnswerStatus = { readonly status: string };
```

**Code.** Extrait hypothétique, sans lien.

Deux types de même forme sont interchangeables : le typage structurel ne distingue pas un
`AnswerStatus` de n'importe quel autre objet qui porte un champ `status`. C'est la forme retenue pour
un read-model, dont la forme *est* le contenu : voir `../read-model/README.md`. Elle ne convient pas
au Value Object.

**Classe avec champ privé.** C'est ce qui donne la nominalité : un champ `#` rend le type non
assignable depuis une forme identique. C'est la forme retenue pour un Value Object, parce que c'est la
seule qui rende V3 et V8 vérifiables par le compilateur. Un Value Object validé à la construction ne
peut pas être un type structurel, puisque rien n'obligerait à passer par le constructeur. La forme
cible est dans [`outillage.md`](outillage.md#vérifier-par-le-typage).

### V1 et la règle de l'Entity

La référence de l'Entity, `../entite/README.md`, protège les champs qui portent une règle. La
référence du Value Object garde sa propre règle, plus large. Le motif retenu est qu'un champ qui porte
une règle ne doit pas pouvoir être réécrit de l'extérieur. Pour un Value Object, immuable par
définition, cela vaut pour tous ses champs.

### V3 et la Specification

V3 est aussi l'invariant d'entrée d'une Specification, où il élimine le cas de l'arbre malformé à
l'évaluation. `../specification/README.md` y renvoie et n'en garde pas de numéro propre.

## La théorie des écarts

### X2. Les valeurs sont validées à la frontière HTTP, pas par leur type

Un Value Object porte ses règles. Une valeur qui a franchi son constructeur est valide partout en
aval.

L'ADR 19, « Typer les identifiants », a examiné le typage des identifiants côté domaine et l'a écarté
pour son coût, en retenant la validation à la route. Son exemple donne d'ailleurs le même type à deux
identifiants de sens différent, ce qui est la limite de l'approche. Cet ADR conclut contre le typage
et ne l'appuie donc pas.

### X3. Validation à la construction de chaque Value Object

Chez Evans, l'invariant est tenu à la frontière de l'Aggregate. Valider chaque Value Object à sa
construction est un durcissement, cohérent avec sa définition mais non prescrit sous cette forme.
Cette convention est explicite, et ce n'est pas une lecture d'Evans.

### X4. L'immuabilité n'est pas garantie par le langage

Un Value Object est immuable. La théorie suppose un langage capable de le garantir. JavaScript n'en a
pas le moyen : `Object.freeze` ne touche pas les champs privés, et `readonly` en TypeScript est effacé
à la compilation.

### X5. La clé de présentation est fabriquée dans le domaine

La règle de dépendance de Clean Architecture : une couche interne ne connaît pas les couches externes.
Un objet du domaine qui compose une clé pour le store d'un client connaît son consommateur. Martin
range la mise en forme pour l'affichage dans la couche externe : *Clean Architecture* (2017), ch.
« Presenters and Humble Objects ».

### X7. Les modèles se multiplient par intention d'écriture, sans mesure

Un Aggregate se charge entier, car cela lui permet de garantir ses invariants. Face au coût de
chargement, la littérature répond : **réduire l'Aggregate** (règle 2 de Vernon), pas le charger à
moitié. Fowler prévient aussi que séparer lecture et écriture ajoute de la complexité, et que ce ne
doit pas être le choix par défaut.

Les formes `…ForUpdate` et `…Details` ressemblent à des **commandes**, au sens de CQRS. Le mot
`read-model` vient lui aussi de CQRS. Dans les deux cas, le vocabulaire de CQRS est emprunté sans son
architecture. Détail dans `../references-ddd.md`, section « Read model ».

## Sources

Bibliographie et liens dans `../references-ddd.md`. Sources primaires des conventions Pix : les ADR de
`docs/adr/`.

| Invariant | Source | Où vérifier |
| --- | --- | --- |
| **V1**, **V2**, **V6** immuabilité, absence d'identité, pas de cycle de vie | Evans, *DDD*, ch. « A Model Expressed in Software » — Value Object | *DDD Reference*, PDF gratuit |
| **V4** pureté | Evans, même ch. Martin, « The Clean Architecture » | les deux gratuits en ligne |
| **V5** comportement porté par l'objet | Fowler, « AnemicDomainModel » | bliki gratuit |
| **V3** validation à la construction | **convention Pix.** Cohérente avec l'invariant d'Aggregate d'Evans sans être prescrite sous cette forme. Voir [X3](#x3-validation-à-la-construction-de-chaque-value-object) | — |
| **V7** exposition en lecture seule | **aucune source** — conséquence pratique de V1 | — |
| **V8** un type par intention | **aucune source.** Proche de Command et du DTO d'entrée, pas nommé ainsi | — |
| L'identité composite (deuxième et troisième cas de V2) | Evans, même ch. — l'identité d'une Entity peut être composée de plusieurs attributs | *DDD Reference* |
| **X5** la clé de présentation appartient à la couche externe | Martin, *Clean Architecture* (2017), ch. « Presenters and Humble Objects » ; la règle de dépendance | le livre de 2017 |
| Le discriminant avec le read-model | la catégorie voisine n'a **aucun nom en DDD** — sources dans `../read-model/explication.md`. Les quatre tests du discriminant sont une construction de ce corpus, sans source | — |
| Validation à la frontière HTTP (X2) | **ADR 19**, « Typer les identifiants », qui écarte le typage des identifiants côté domaine pour son coût et retient la validation à la route. Il conclut contre le typage et ne l'appuie donc pas | ADR 19 |
| Grain de l'Aggregate (X7) | Vernon, « Effective Aggregate Design », règle 2 ; Fowler, « CQRS » sur son bliki | dddcommunity.org ; bliki gratuit |

Deux invariants sur huit n'ont aucune source : V7 et V8. V3 n'en a qu'une partielle. La catégorie
Value Object vient d'Evans ; la façon de l'appliquer ici est en partie conventionnelle. Ce sont des
conventions : elles se discutent sur leurs mérites, pas par appel à une autorité.

Les quatre tests du discriminant n'ont pas non plus de source. Ils se jugent sur leur utilité en
revue.
