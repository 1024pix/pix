# Fiche — Sérialiseur (`infrastructure/serializers/`)

Fiche générique : elle décrit **l'état cible**, celui où la couche est rentable. Gabarit au § 10 de
`fiche-repository.md`. L'écart avec le code réel est mesuré dans les rapports de divergence.

> **La fiche la plus courte du corpus, et c'est le bon signe.** Un sérialiseur déclare une liste de
> champs. S'il fallait quatre cents lignes pour l'encadrer, c'est qu'on lui en demande trop.

---

## 1. Rôle

Un sérialiseur met en forme un objet du domaine vers le format de réponse attendu par les
consommateurs de l'API HTTP.

Il est **déclaratif** : une liste de champs, éventuellement des relations incluses. Il ne calcule pas,
ne filtre pas selon une condition métier, ne décide pas.

C'est un *presenter* au sens de Martin, et comme le contrôleur, un *humble object* : assez bête pour
que son test soit trivial.

### Ce qu'un sérialiseur n'est pas

| Le code… | Va dans |
| --- | --- |
| calcule une valeur absente de l'objet reçu | le **usecase**, ou un **read-model** |
| filtre selon une condition métier | le **domaine** — une entité, un objet-valeur, une racine d'agrégat |
| choisit une forme de réponse selon les droits de l'appelant | le **usecase**, qui ne renvoie que ce qui est autorisé |
| met en forme pour un autre contexte borné | `application/api/` et son DTO |
| met en forme pour une lecture interne | un **read-model** |

---

## 2. Écarts fréquents

| Écart | Comment le trancher |
| --- | --- |
| Une condition dans le sérialiseur | **dérive** — une règle métier a fui jusqu'au format de sortie, où personne ne pensera à la chercher |
| Le sérialiseur calcule un champ absent de l'objet reçu | **dérive** — le usecase ou le read-model devait le fournir |
| Le sérialiseur appelle une méthode métier de l'objet | **dérive** — la décision de quoi exposer remonte au domaine |
| Un champ retiré ou renommé sans coordination | **dérive** — le format est consommé par des applications front, parfois par des tiers |
| Deux sérialiseurs pour la même ressource selon l'appelant | **dérive** — c'est le usecase qui doit renvoyer ce qui est autorisé |
| Le sérialiseur reçoit un modèle du domaine plutôt qu'un read-model | **convention assumée**, mais elle expose le domaine au format de sortie |

---

## 3. Le ROI de ces invariants

### Rentabilité forte

| Invariant | Ce que ça rapporte |
| --- | --- |
| **M1** aucune logique | Une règle métier écrite ici est **invisible depuis le domaine**, et sera réécrite différemment ailleurs. C'est le seul endroit du dépôt où personne ne pense à chercher une règle : le coût d'une fuite y est donc maximal. |
| **M3** format stable | Casser le format casse les applications front, chez d'autres équipes, à l'exécution. C'est la seule couche du dépôt dont les consommateurs sont partiellement inconnus. |

### Rentabilité moyenne

| Invariant | Ce que ça rapporte |
| --- | --- |
| **M2** uniquement des champs présents | Un champ manquant devient une erreur visible au lieu d'un `undefined` sérialisé en `null`, que le front interprète comme une donnée absente. |

### Hygiène, pas rentabilité

| Invariant | Pourquoi il reste |
| --- | --- |
| **M4** un sérialiseur par ressource exposée | Aucun gain mesurable. Rend le fichier trouvable. |

### Ce que ça n'apporte pas

Rien ici ne dit si le format exposé est **bien conçu** : granularité, nommage des champs, relations
incluses ou non. Un sérialiseur irréprochable peut produire une réponse pénible à consommer.

---

## 4. Invariants

### M1. Aucune logique

Pas de condition, pas de calcul, pas de décision. Le sérialiseur met en forme ce qu'il reçoit.

```js
// fautif — une règle métier vit désormais dans la mise en forme
attributes: course.isPublished ? ['name', 'code', 'items'] : ['name']

// conforme — l'objet reçu porte déjà ce qu'il faut exposer
attributes: ['name', 'code', 'status', 'items']
```

Toute condition est une règle qui a fui. Le coût est asymétrique : elle est facile à écrire là, et
personne ne la cherchera jamais là.

**Ce qui reste autorisé** : les valeurs par défaut et l'accès optionnel — `x ?? null`, `x?.y`. Ce sont
des protections de forme, pas des décisions. La frontière est nette : si l'expression **choisit entre
deux formes de réponse**, c'est une décision ; si elle protège d'une valeur absente, non.

### M2. N'expose que des champs présents sur l'objet reçu

Le sérialiseur déclare des champs, il ne les fabrique pas. Si un champ à exposer n'existe pas sur
l'objet, c'est au **usecase** ou au **read-model** de le fournir.

Le symptôme d'un manquement : un champ qui sort systématiquement à `null` sans que personne ne sache
pourquoi. Le front l'interprète comme une donnée absente ; en réalité elle n'a jamais été chargée.

### M3. Le format de réponse est un contrat externe

Le format produit est consommé par des applications front, parfois par des tiers. Il obéit donc aux
règles d'un format publié : **on ajoute sans casser, on ne renomme pas à la légère, on coordonne un
retrait.**

C'est le pendant externe de P6 de `fiche-api-interne.md`, avec une différence qui impose plus de
prudence : les consommateurs d'une API interne sont connaissables — ce sont les contextes qui
déclarent en dépendre. Ceux d'une API HTTP le sont moins.

Le pire cas n'est ni l'ajout ni le retrait, c'est le **changement de sens** d'un champ existant :
rien ne le signale, ni la compilation, ni les tests, ni les consommateurs, jusqu'à ce qu'un
comportement devienne faux quelque part.

### M4. Un sérialiseur par ressource exposée

Un fichier par ressource, nommé d'après elle. Invariant d'hygiène : il ne prévient aucun bug, il rend
le fichier trouvable.

---

## 5. Exceptions légitimes

| Cas | Statut |
| --- | --- |
| `x ?? null` ou `x?.y` pour se protéger d'une valeur absente | **autorisé** — protection de forme |
| Composer un libellé à partir de plusieurs champs reçus | **autorisé** — mise en forme sans décision |
| Aplatir une structure imbriquée | **autorisé** |
| Déclarer des relations incluses | **autorisé** — c'est de la mise en forme |
| Renommer un champ pour le vocabulaire du format | **autorisé**, et c'est un bon usage de la couche |
| Une enveloppe de pagination autour des objets sérialisés | **autorisé** |
| Un sérialiseur qui reçoit un read-model plutôt qu'une entité | **autorisé**, et préférable |
| Une condition qui choisit entre deux formes de réponse | **pas une exception** — c'est M1 violé |
| Un champ calculé depuis une méthode métier de l'objet | **pas une exception** — c'est M2 violé |

---

## 6. Vérification déterministe

| Invariant | Moyen | Coût | Faux positifs |
| --- | --- | --- | --- |
| M1 | règle ESLint : structure conditionnelle dans `infrastructure/serializers/`, hors `??` et `?.` | ~20 lignes | faibles si les deux exclusions sont posées |
| M1 | même règle : appel de méthode sur l'objet sérialisé | ~10 lignes de plus | **à mesurer** |
| M4 | script `tests/tooling/` : un fichier par ressource, nommage | ~15 lignes | aucun |
| M2, M3 | revue | — | — |

### M1 — la seule règle qui compte ici, et elle est simple

Un sérialiseur est déclaratif : une structure conditionnelle y est un signal fiable.

**Les deux exclusions à poser d'emblée**, sans quoi la règle sera rejetée à la première exécution :
l'opérateur de coalescence (`??`) et l'accès optionnel (`?.`). Ce sont des protections de forme,
présentes dans presque tous les sérialiseurs, et parfaitement légitimes.

Ce qui reste signalé : `if`, ternaire, `&&` en position de valeur, `switch`. Tous décidables sans
quitter le fichier.

Le second motif — un appel de méthode sur l'objet sérialisé — attrape M2 en même temps, mais demande
de distinguer un accesseur d'une méthode métier, ce qui n'est pas décidable au nom seul. À écrire
après le premier, et à mesurer.

### Ce qui n'est pas mécanisable

M3 demande de connaître les consommateurs du format. C'est une question de coordination, pas
d'analyse statique. Le seul outil utile serait un test de contrat côté front, ce qui sort du périmètre
de l'API.

### Codemods

Sans objet. M1 demande de décider où déplacer la règle qui a fui, M3 demande de coordonner.

---

## 7. En TypeScript

**C'est le seul endroit de la couche application où le typage apporte réellement quelque chose.**

La liste des champs exposés peut être typée contre l'objet reçu, ce qui rend **M2 structurel** :
déclarer un champ qui n'existe pas sur l'objet ne compile plus.

```ts
type SerializableFields<T> = readonly (keyof T)[];

const attributes: SerializableFields<CombinedCourseReadModel> = ['name', 'code', 'status'];
```

Le gain est direct et ne dépend pas de la migration du reste : il suffit que le **read-model reçu**
soit typé. Cela fait du sérialiseur un candidat plus précoce que le contrôleur ou la route, à
condition que les read-models soient migrés d'abord.

Contraintes habituelles : `erasableSyntaxOnly` interdit `enum` ; `declare module '*.js'` donne `any` à
tout import d'un `.js` — donc typer le sérialiseur sans typer le read-model qu'il reçoit ne vérifie
rien.

---

## 8. Tests attendus

| Objet | Type de test | Ce qu'on vérifie |
| --- | --- | --- |
| Sérialiseur | **unitaire pur** — aucun mock, aucun serveur | la forme produite, champ par champ |

Un test de sérialiseur qui a besoin d'une fixture métier ou d'un mock est le signe que M1 ou M2 est
violé.

Le test doit couvrir les **valeurs absentes**, pas seulement le cas nominal : c'est là que se révèle
un champ que l'objet reçu ne portait pas.

---

## 9. Checklist de revue

```
[ ] M1  Aucune condition — ni if, ni ternaire, ni && en position de valeur
[ ] M1  Aucun appel de méthode métier sur l'objet sérialisé
[ ] M2  Tous les champs déclarés existent sur l'objet reçu
[ ] M3  Aucun champ renommé, retiré, ou dont le sens change, sans coordination
[ ] M4  Un fichier par ressource exposée, nommé d'après elle
[ ] Test unitaire pur, couvrant les valeurs absentes et pas seulement le cas nominal
```

---

## 10. Sources

Bibliographie dans `references-ddd.md`.

| Invariant | Source |
| --- | --- |
| **La couche, M1 et M4** | Martin, *Clean Architecture*, ch. « Presenters and Humble Objects » — le *presenter* est dépourvu de logique pour que son test soit trivial. Billet gratuit de 2012 |
| **M2** uniquement des champs présents | **aucune source** — déduction de M1 |
| **M3** format stable | Evans, *DDD*, ch. « Maintaining Model Integrity » — **Published Language**, appliqué ici à l'extérieur du système plutôt qu'entre contextes |

**Deux invariants sur quatre n'ont aucune source Pix**, et l'essentiel repose sur **un seul chapitre**
de Martin. C'est cohérent avec la minceur de la couche : il n'y a pas grand-chose à décider, donc peu
à documenter.

À noter tout de même : M3 est le seul invariant du corpus qui porte sur un contrat dont les
consommateurs sont **hors du dépôt**. Aucun ADR ne traite de la stabilité du format des réponses HTTP,
ce qui est un manque au vu du nombre d'applications front concernées.
