# Fiche — Racine d'agrégat

Fiche générique : elle décrit **l'état cible**, celui où l'architecture est rentable. Gabarit au § 10
de `fiche-repository.md`. L'écart avec le code est mesuré dans les **rapports de divergence**.

> **Brouillon pour relecture, et la plus prospective du corpus.** Le mot « agrégat » est aujourd'hui
> posé sur des dossiers qui ne le méritent pas, et peu d'objets satisfont réellement A1 et A2. C'est
> précisément ce qui rend la fiche utile : elle donne le critère qui permet de **juger** si un objet
> qualifie, avant de décider quoi faire des dossiers.
>
> Conséquence à assumer : appliquée telle quelle, elle disqualifie du code existant. Elle sert donc
> d'abord à trancher un débat de conception, ensuite à contrôler du code.

---

## 1. Rôle

Un agrégat est un **groupe d'objets traité comme une unité de cohérence**. Sa racine est l'entité par
laquelle on y accède : rien de ce qu'il contient n'est atteignable autrement.

Sa raison d'être tient en une phrase : **il existe une règle qui porte sur plusieurs objets à la
fois, et quelqu'un doit garantir qu'elle est vraie en permanence.** C'est la racine.

S'il n'y a pas de telle règle, il n'y a pas d'agrégat — juste une entité et des objets à côté. Poser
le mot sur un dossier sans cette règle promet une garantie qui n'existe pas, ce qui coûte plus cher
que ne pas ranger du tout.

**Le test de discrimination**, dans cet ordre :

1. *Existe-t-il une règle qui porte sur plusieurs de ces objets simultanément ?* Si non, ce n'est pas
   un agrégat.
2. *Cette règle doit-elle être vraie en permanence, ou peut-elle se réconcilier plus tard ?* Si elle
   peut attendre, la frontière est ailleurs.
3. *Y a-t-il un objet par lequel tout accès doit passer ?* C'est la racine.

### Racine d'agrégat ou entité ?

Toute racine d'agrégat est une entité, et `fiche-entite.md` s'applique intégralement. La présente
fiche ajoute ce qui est propre à la racine : la frontière, le point d'entrée unique, le repository.

Une entité qui vit **à l'intérieur** d'un agrégat n'est pas une racine : elle n'a ni repository, ni
accès direct.

### Ce qu'une racine d'agrégat n'est pas

| Le code… | Va dans |
| --- | --- |
| regroupe des objets pour une lecture, sans règle commune à tenir | un **read-model** |
| est construit par une suite de mutateurs appelés de l'extérieur | un constructeur dédié, ou un read-model |
| coordonne plusieurs agrégats | `domain/usecases/` |
| applique une règle qui ne relève d'aucun agrégat, sans I/O | `domain/services/` |
| n'a pas d'identité | un **objet-valeur** |

---

## 2. Écarts fréquents

| Écart | Comment le trancher |
| --- | --- |
| Un dossier `aggregates/` contient des projections de lecture | **dérive de rangement** — le concept est peut-être juste, le mot est faux. Renommer coûte peu et retire une promesse non tenue |
| Deux objets d'une même frontière ont chacun leur repository | **convention** si le découpage suit assumément les besoins de requêtage — mais il faut alors renoncer au mot « agrégat » |
| L'agrégat charge des objets d'autres agrégats par instance | **dérive** — le coût d'un chargement cesse d'être borné |
| Un consommateur accède à un objet interne sans passer par la racine | **dérive** — la frontière n'existe plus |
| L'agrégat est construit par `setX()` puis `setY()` puis `setZ()` | **dérive** — l'état est invalide entre deux appels, donc A5 est faux par construction |
| Le mot « agrégat » désigne en fait le contexte d'évaluation d'un moteur de règles | **dérive de vocabulaire** — voir `fiche-specification.md` |

---

## 3. Le ROI de ces invariants

| Rentabilité | Invariants |
| --- | --- |
| **Forte** | **A1** — sans frontière nommable, chaque écriture multiple est une décision improvisée. **A2** — c'est ce qui fait la différence entre une **garantie** et une convention : sans point d'entrée unique, la règle est contournable. **A4** — borne le coût d'un chargement, et c'est ce qui rend un découpage en contextes possible plus tard |
| **Moyenne** | **A5** — la cohérence devient acquise en aval. **A6** — moins de contention, chargements plus rapides, frontières plus faciles à déplacer. **A7** — la question « faut-il une transaction ici ? » a une réponse mécanique |
| **Hygiène** | **A3** — un repository par racine. Aucun bug prévenu ; à traiter comme un **indicateur** de conception, pas comme une règle à outiller |

**Avertissement propre à cette fiche.** Ces rentabilités sont **potentielles**, pas acquises : elles
supposent une frontière correctement placée. Un agrégat qui respecte les sept invariants sur une
mauvaise frontière n'a aucun ROI — il sera juste plus difficile à corriger, parce que le code s'y
sera appuyé. C'est la seule fiche du corpus où respecter les invariants peut aggraver le problème.

Détail :

| Invariant | Ce qu'on gagne |
| --- | --- |
| **A1** frontière explicite | On sait ce qui doit être vrai ensemble, et donc ce qu'une transaction doit couvrir. Sans cette réponse, chaque écriture est une décision improvisée. |
| **A2** point d'entrée unique | La règle ne peut pas être contournée. C'est ce qui fait la différence entre une garantie et une convention. |
| **A3** un repository par racine | Le nombre de repositories devient une information : il dit combien d'unités de cohérence a le contexte. |
| **A4** référence externe par identité | Le coût d'un chargement est borné et prévisible. C'est aussi ce qui rend un découpage en contextes possible plus tard. |
| **A5** invariants tenus en permanence | Aucun code en aval n'a à vérifier la cohérence : elle est acquise. |
| **A6** petit agrégat | Moins de contention en écriture, chargements plus rapides, et frontières plus faciles à déplacer quand le métier change. |
| **A7** une transaction, un agrégat | Les conflits d'écriture concurrente deviennent raisonnables. Et la question « faut-il une transaction ici ? » a une réponse mécanique. |

### Ce que ça n'apporte pas

Ces invariants ne disent pas **où** placer la frontière. Ils disent ce qu'il faut tenir une fois
qu'elle est posée. Le placement est un travail de modélisation avec le métier, pas une déduction
depuis le code.

Et une frontière mal placée qui respecte tous les invariants reste une mauvaise frontière : elle sera
juste plus difficile à déplacer, parce que le code s'y sera appuyé.

---

## 4. Invariants

### A1. La frontière de cohérence est explicite

L'agrégat existe parce qu'une règle porte sur plusieurs de ses objets à la fois. Cette règle doit
être **nommable**.

Le test : formuler la phrase « à tout instant, dans cet agrégat, … doit être vrai ». Si la phrase ne
vient pas, il n'y a pas de frontière à protéger.

Contre-exemple courant : « ces objets sont toujours affichés ensemble » n'est pas une règle de
cohérence, c'est un besoin de lecture. Il appelle un read-model, pas un agrégat.

### A2. La racine est le seul point d'entrée

Rien de ce que contient l'agrégat n'est atteignable sans passer par la racine. Ni par import direct,
ni par un repository dédié, ni par un accesseur qui rend la référence interne modifiable.

```js
// fautif — l'appelant obtient la collection interne et peut la modifier
get items() { return this.#items; }

// conforme — lecture seule, et les modifications passent par des méthodes nommées
get items() { return [...this.#items]; }
addItem(item) { /* vérifie l'invariant de la frontière */ }
```

**Conséquence sur les objets internes** : ils n'ont pas de repository, et leur identité n'a de sens
que dans l'agrégat. S'ils ont besoin d'être retrouvés indépendamment, ils ne sont pas internes.

### A3. Un repository par racine, et seulement pour les racines

Le nombre de repositories d'un contexte devrait dire combien d'unités de cohérence il a.

C'est l'invariant le plus souvent abandonné en pratique, parce que le découpage réel suit les besoins
de requêtage. **Deux positions cohérentes**, et la troisième ne l'est pas :

- tenir A3, et accepter que certaines lectures passent par un read-model plutôt que par un repository
  dédié ;
- renoncer à A3 assumément, et **renoncer aussi au mot « agrégat »** — parler d'entités et de
  repositories ;
- garder le mot et multiplier les repositories : le vocabulaire ne veut plus rien dire, et c'est ce
  qu'il faut éviter.

### A4. Les autres agrégats sont référencés par identité

Un agrégat ne tient pas l'instance d'un autre agrégat : il en tient l'identifiant. C'est E7 de
`fiche-entite.md`, et ici c'est ce **qui définit la frontière** plutôt qu'une bonne pratique.

Deux effets, et le second est décisif pour la suite :

- le coût d'un chargement est borné, il ne dépend pas de la profondeur du graphe ;
- la frontière reste déplaçable — un agrégat qui tient des instances d'un autre contexte devient
  impossible à extraire le jour où on découpe.

### A5. Les invariants sont tenus en permanence

Pas seulement à la construction : après chaque opération, y compris celles qui échouent à mi-chemin.

**Le piège de la construction progressive.** Un agrégat assemblé par une suite de mutateurs appelés
de l'extérieur est invalide entre deux appels. A5 est alors faux par construction, et A2 aussi
puisque l'assembleur manipule l'état interne. Si l'assemblage est réellement progressif, le nommer :
un constructeur dédié, ou un read-model si l'objet ne porte aucune règle.

### A6. Petit agrégat

Un agrégat grossit naturellement, parce qu'il est commode d'y ajouter ce qu'on a sous la main. Deux
questions à poser à chaque ajout :

- *cette donnée doit-elle être cohérente avec le reste à tout instant, ou seulement à terme ?*
- *combien de lignes cet ajout fait-il charger pour une opération qui ne s'en sert pas ?*

La règle pratique de Vernon : préférer plusieurs petits agrégats reliés par identité à un gros
agrégat qui tient tout.

### A7. Une transaction, un agrégat

Une opération modifie **un** agrégat. Si elle doit en modifier deux, deux voies :

- la frontière est mal placée, et les deux n'en font qu'un ;
- ou ils sont bien distincts, et la cohérence entre eux se règle **à terme** — un événement, un job,
  une réconciliation.

C'est l'invariant le plus exigeant, et celui qui se heurte le plus vite à l'existant. Il vaut comme
règle de conception pour le code nouveau, pas comme grille de correction rétroactive.

---

## 5. Exceptions légitimes

| Cas | Statut |
| --- | --- |
| Un agrégat réduit à sa seule racine, sans objet interne | **autorisé** et fréquent — l'invariant porte alors sur les seuls champs de la racine |
| Une racine expose une collection en lecture par copie | **autorisé**, c'est la forme correcte de A2 |
| Une lecture qui traverse plusieurs agrégats | **autorisé** via un read-model — A3 ne contraint que l'écriture |
| Une opération qui touche deux agrégats via un événement ou un job | **autorisé**, c'est la seconde voie de A7 |
| Un identifiant d'un autre contexte porté comme donnée | **autorisé**, c'est A4 bien appliqué |
| Plusieurs repositories pour une même frontière, dans du code existant | **pas une exception** — c'est une convention à trancher explicitement, voir A3 |
| Un dossier `aggregates/` contenant des read-models | **pas une exception** — dérive de rangement |

---

## 6. Vérification déterministe

*Section volontairement courte : c'est la fiche la moins mécanisable du corpus. Presque tout y demande
de savoir ce qui appartient à la même frontière, information qui n'est écrite nulle part.*

| Invariant | Moyen | Coût | Faux positifs |
| --- | --- | --- | --- |
| A2 | règle ESLint : accesseur rendant un champ privé de type tableau, dans `domain/models/` | ~30 lignes | faibles |
| A5 | règle ESLint : mutateur `set` public, ou méthode `setX` appelée depuis l'extérieur du modèle | ~30 lignes | **à mesurer** |
| A3 | script `tests/tooling/` : rapport du nombre de repositories au nombre de racines déclarées | ~30 lignes | — c'est un **indicateur**, pas une règle |
| A4 | revue, ou règle ESLint sur un champ nommé `<chose>` plutôt que `<chose>Id` | — | **élevés** — non recommandé |
| A1, A6, A7 | revue | — | — |

### A2 — la seule règle nette

Un accesseur qui rend directement une collection interne casse le point d'entrée unique, et c'est
décidable localement. C'est la même règle que V7 de `fiche-objet-valeur.md` : une seule
implémentation couvre les deux.

### A3 — un indicateur plutôt qu'une règle

Compter les repositories d'un contexte et les comparer aux racines d'agrégat qu'il déclare ne produit
pas un verdict, mais un **chiffre à regarder**. Un écart important est un signal de conception, pas
une violation.

Prérequis : que les racines soient déclarées quelque part. Aujourd'hui elles ne le sont pas, ce qui
rend l'indicateur impossible à calculer. **C'est le premier travail à faire**, et il est aussi ce qui
donnerait sa valeur au dossier `aggregates/` : y ranger ce qui est réellement racine.

### Ce qui n'est pas mécanisable, et pourquoi

A1, A6 et A7 demandent de connaître la frontière de cohérence. Elle n'est écrite nulle part dans le
code — c'est justement ce qui manque. Aucune analyse statique ne peut la déduire.

**Le vrai levier ici n'est pas l'outillage, c'est la déclaration.** Tant qu'aucun fichier ne dit
« voici les racines de ce contexte et ce que chacune garantit », ni un humain ni un agent ne peut
vérifier quoi que ce soit. Un `README.md` par contexte listant les racines et leur invariant coûterait
quelques lignes et débloquerait A1, A3 et A6 pour la revue.

### Codemods

Sans objet. Aucune correction d'agrégat n'est mécanique : déplacer une frontière est de la
modélisation.

---

## 7. En TypeScript

Le typage aide peu sur cette fiche, et il faut le dire plutôt que de laisser croire l'inverse. Une
frontière de cohérence n'est pas une propriété de type.

Deux points où il apporte quand même quelque chose :

**A4 devient lisible dans la signature.** `organizationId: number` plutôt qu'`organization: Organization`
est visible à la lecture, donc revu. Avec des identifiants typés — un `OrganizationId` distinct d'un
`number` — la confusion entre deux identifiants devient une erreur de compilation. C'est l'objet de
l'ADR 19.

**A2 se rapproche.** `readonly items: readonly Item[]` empêche la modification par l'appelant à la
compilation. Attention : `readonly` est effacé, donc la protection est statique seulement. La copie à
l'accesseur reste nécessaire pour le code JavaScript appelant.

Contraintes habituelles : `erasableSyntaxOnly` interdit `enum` et les propriétés de constructeur ;
`declare module '*.js'` annule la vérification sur tout import d'un `.js`.

---

## 8. Tests attendus

| Objet | Type de test | Ce qu'on vérifie |
| --- | --- | --- |
| La racine | **unitaire pur** | l'invariant de frontière, sur le cas passant **et** sur le refus |
| Chaque opération modifiant l'agrégat | **unitaire** | que l'invariant tient après l'opération, y compris en cas d'échec partiel |
| Le repository de la racine | **intégration** | que l'agrégat est chargé et sauvegardé **entier** |

Le test caractéristique de cette fiche, et celui qui manque presque toujours : **prouver qu'une
opération qui violerait l'invariant de frontière est refusée.** C'est le seul qui distingue un
agrégat d'une entité avec des objets à côté.

---

## 9. Checklist de revue

```
[ ] A1  L'invariant de frontière est nommable : « à tout instant, … doit être vrai »
[ ] A2  Aucun accès à un objet interne sans passer par la racine, accesseurs compris
[ ] A5  L'invariant tient après chaque opération, pas seulement à la construction
[ ] A5  Aucun assemblage par mutateurs successifs appelés de l'extérieur
[ ] A4  Les autres agrégats sont référencés par identifiant, jamais par instance
[ ] A3  Un seul repository pour cette frontière — sinon, la convention est-elle assumée ?
[ ] A6  L'ajout ne fait pas charger des données inutiles à la plupart des opérations
[ ] A7  L'opération ne modifie qu'un agrégat, ou la cohérence différée est explicite
[ ] Un test prouve le refus d'une opération qui violerait l'invariant de frontière
[ ] Si aucun invariant de frontière n'est nommable, ce n'est pas un agrégat — le ranger ailleurs
```

---

## 10. Sources

Bibliographie dans `references-ddd.md`. C'est la fiche la mieux sourcée du corpus : ses sept
invariants viennent tous des livres, et quatre d'un article gratuit.

| Invariant | Source |
| --- | --- |
| **A1** frontière de cohérence | Evans, *DDD*, ch. « The Life Cycle of a Domain Object » — Aggregate. Vernon, « Effective Aggregate Design », règle 1 : *model true invariants in consistency boundaries* |
| **A2** point d'entrée unique | Evans, même ch. — c'est la définition de la racine |
| **A3** un repository par racine | Evans, même ch. — le Repository porte sur les agrégats, pas sur les entités internes |
| **A4** référence par identité | Vernon, règle 3 : *reference other aggregates by identity* — gratuit en ligne |
| **A5** invariants tenus en permanence | Evans, même ch. |
| **A6** petit agrégat | Vernon, règle 2 : *design small aggregates* |
| **A7** une transaction, un agrégat | Vernon, règle 4 : *use eventual consistency outside the boundary*. Côté Pix, voir ADR 9 et 25 sur la transaction métier, et ADR 8 et 10 sur le découplage par événements |
| **Le test de discrimination** | Evans, même ch. |

**Aucun invariant sans source.** En contrepartie, aucun n'est adossé à un ADR Pix : la façon dont Pix
place ses frontières d'agrégat n'a jamais été décidée par écrit. C'est précisément ce que cette fiche
sert à ouvrir.

Vernon, « Effective Aggregate Design » — trois articles gratuits :
<https://www.dddcommunity.org/library/vernon_2011/>
