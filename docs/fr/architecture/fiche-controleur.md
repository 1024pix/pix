# Fiche — Contrôleur (`application/*-controller.js`)

Fiche générique : elle décrit **l'état cible**, celui où la couche est rentable. Gabarit au § 10 de
`fiche-repository.md`. L'écart avec le code réel est mesuré dans les rapports de divergence.

> **Une fiche courte, et volontairement.** Le ROI d'un contrôleur est presque entièrement **négatif** :
> il vient de ce qu'il ne contient pas. Une fiche longue sur un contrôleur serait le signe qu'on lui
> demande trop.

---

## 1. Rôle

Un contrôleur traduit une requête HTTP en un appel de usecase, et le résultat en réponse.

Trois étapes, dans cet ordre, et rien entre : **extraire**, **appeler**, **rendre**.

```js
const getQuestResults = async function (request, h, dependencies = { questResultSerializer }) {
  const { campaignParticipationId } = request.params;
  const userId = extractUserIdFromRequest(request);

  const results = await usecases.getQuestResultsForCampaignParticipation({ userId, campaignParticipationId });

  return h.response(dependencies.questResultSerializer.serialize(results));
};
```

C'est un *humble object* au sens de Martin : assez bête pour que son test soit trivial, afin que tout
ce qui mérite d'être testé sérieusement le soit ailleurs.

### Ce qu'un contrôleur n'est pas

| Le code… | Va dans |
| --- | --- |
| réalise l'intention métier | un **usecase** |
| valide la forme des entrées | la **route** |
| contrôle les droits | un pre-handler déclaré sur la **route** |
| met en forme la réponse | un **sérialiseur** |
| choisit un code d'erreur à partir d'une erreur métier | le **mappeur d'erreurs** du contexte |
| accède aux données | un **repository**, appelé par un usecase |

---

## 2. Écarts fréquents

| Écart | Comment le trancher |
| --- | --- |
| Deux usecases appelés à la suite | **dérive** — une intention métier composée existe et n'a pas de nom |
| Un code d'erreur choisi dans le contrôleur | **dérive** — le mappeur d'erreurs existe pour ça |
| Un accès direct à un repository | **dérive** — contourne les règles métier |
| Une transformation de données au-delà de l'extraction | **dérive** — c'est du travail de usecase ou de sérialiseur |
| Le contrôle des droits écrit dans le contrôleur | **dérive** — la route devient non auditable |
| Un import des usecases d'un **autre** contexte | **dérive** — frontière franchie hors API interne |
| Les usecases importés sans injection | **convention assumée** — le framework HTTP ne permet pas d'injecter dans les routes |

---

## 3. Le ROI de ces invariants

Classement par rentabilité réelle, parce que tous ne se valent pas.

### Rentabilité forte

| Invariant | Ce que ça rapporte |
| --- | --- |
| **C1** un seul usecase | Chaque intention métier a un nom, un fichier et un test d'intégration. Sans C1, la composition vit dans un contrôleur où elle n'est vérifiée qu'en acceptance — le test le plus lent et le plus tardif du dépôt. C'est le seul invariant de cette fiche qui déplace du coût de vérification. |
| **C2** aucune décision | Le contrôleur devient trivial, donc son test aussi, donc l'effort se concentre là où est la valeur. C'est le mécanisme même du *humble object*. |
| **C4** aucun accès aux données | Empêche la porte dérobée : une lecture « juste pour afficher » qui contourne les règles du domaine et crée deux comportements pour la même question. |

### Rentabilité moyenne

| Invariant | Ce que ça rapporte |
| --- | --- |
| **C3** sérialiseur injecté | Rend le contrôleur testable en unitaire sans monter de serveur. Le gain est réel mais borné : ces tests sont peu nombreux et peu coûteux de toute façon. |

### Hygiène, pas rentabilité

| Invariant | Pourquoi il reste |
| --- | --- |
| **C5** un contrôleur par ressource, une fonction par action | Aucun gain mesurable. Il réduit le bruit de revue et rend le fichier prévisible. À traiter comme une convention de rangement, pas comme un invariant à outiller en priorité. |

### Ce que ça n'apporte pas

Rien ici ne dit si l'API HTTP est bien conçue — découpage des ressources, granularité, cohérence des
adresses. Un contrôleur irréprochable peut servir une API pénible.

---

## 4. Invariants

### C1. Un seul usecase par point d'entrée

**Le cas à surveiller** : deux usecases appelés à la suite. Cela signifie qu'une intention composée
existe sans nom. Elle appartient à `domain/usecases/`, où elle sera testée en intégration.

```js
// à instruire — quelle est l'intention métier de cette séquence ?
await usecases.archiveCourse({ courseId });
await usecases.notifyParticipants({ courseId });
```

**Faux ami légitime** : un usecase d'écriture suivi d'un usecase de lecture pour construire la
réponse. Parfois justifié, parfois le signe que le premier devrait renvoyer ce qu'il faut. À trancher
au cas par cas.

### C2. Aucune décision

Pas de règle métier. Pas de code d'erreur choisi ici. Pas de transformation au-delà de l'extraction.

Le code de succès est une **propriété constante de la route** — 200, 201, 204 selon la nature de
l'opération. Les codes d'erreur viennent du mappeur d'erreurs : le contrôleur laisse remonter l'erreur
du domaine.

```js
// fautif — la décision de statut est prise ici
const result = await usecases.getSomething({ id });
if (!result) return h.response().code(404);

// conforme — le usecase lève, le mappeur traduit
const result = await usecases.getSomething({ id });
return h.response(serializer.serialize(result));
```

C'est le pendant applicatif de I4 de `fiche-repository.md` : le repository lève une erreur du domaine,
le mappeur lui associe un statut, personne au milieu ne décide.

### C3. Le sérialiseur est injecté par valeur de paramètre par défaut

```js
const handler = async function (request, h, dependencies = { someSerializer }) { … }
```

Sous ESM les exports sont immuables : sans cette forme, le sérialiseur ne peut pas être substitué en
test. C'est la même contrainte technique que celle qui motive l'injection ailleurs.

### C4. Aucun accès direct aux données

Ni repository, ni client de stockage, ni API interne d'un autre contexte. Le contrôleur ne connaît
que les usecases de **son** contexte.

**L'exception à ne pas généraliser** : les usecases sont importés directement, sans injection, parce
que le framework HTTP ne permet pas d'injecter dans les routes. Cette exception ne s'étend **pas** aux
usecases d'un autre contexte — franchir une frontière passe par l'API interne.

### C5. Un contrôleur par ressource, une fonction par action

Le fichier porte le nom de la ressource ; chaque fonction exportée porte le nom de l'action ; elles
sont regroupées dans un objet exporté que la route référence.

Invariant d'hygiène : il ne prévient aucun bug, il rend le fichier prévisible.

---

## 5. Exceptions légitimes

| Cas | Statut |
| --- | --- |
| Les usecases importés sans injection | **autorisé**, contrainte du framework |
| L'utilisateur extrait de la requête via un utilitaire partagé | **autorisé**, c'est de l'extraction |
| Un code de succès non standard (201, 204) | **autorisé** — propriété constante de la route |
| Un `if` sur la présence d'un paramètre optionnel | **autorisé** |
| Un flux ou un fichier renvoyé plutôt qu'un objet sérialisé, avec ses en-têtes | **autorisé** |
| Un usecase d'écriture suivi d'un usecase de lecture | **à instruire**, voir C1 |
| Deux usecases métier enchaînés | **pas une exception** — intention sans nom |
| Le contrôle des droits écrit ici | **pas une exception** — voir `fiche-route.md`, R2 |

---

## 6. Vérification déterministe

| Invariant | Moyen | Coût | Faux positifs |
| --- | --- | --- | --- |
| C4 | règle `dependency-cruiser` : `application/**` ne dépend pas de `infrastructure/repositories/**` | configuration seule | aucun |
| C4 | règle `dependency-cruiser` : pas de dépendance vers le domaine d'un **autre** contexte | configuration | aucun |
| C1 | règle ESLint : plus d'un appel sur `usecases` dans une fonction de contrôleur | ~30 lignes | faibles |
| C2 | règle ESLint : `.code(4xx)` ou `.code(5xx)` dans un contrôleur | ~20 lignes | **à mesurer** |
| C5 | script `tests/tooling/` : nommage du fichier et de l'objet exporté | ~20 lignes | aucun |

### C4 — la plus rentable, et elle est en configuration

```js
{
  name: 'controller-must-not-access-repositories',
  severity: 'error',
  from: { path: 'src/.+/application/' },
  to: { path: 'src/.+/infrastructure/repositories/' },
}
```

Piège habituel : `src/.+/` et non `src/[^/]+/`, sinon les contextes à sous-contextes ne sont pas
atteints et **la règle ne se déclenche jamais sans le signaler**. Contre-épreuve obligatoire —
introduire la violation, confirmer que la règle sort, la retirer.

### C1 — compter les appels de usecase

Décidable localement : compter les appels de méthode sur l'identifiant `usecases` dans le corps d'une
fonction exportée d'un fichier `*-controller.js`. Plus d'un, on signale.

Faux positif attendu sur le cas « écriture puis lecture ». À traiter par exclusion nominative plutôt
qu'en affaiblissant la règle.

### C2 — les codes d'erreur

Un `.code()` avec un littéral ≥ 400 dans un contrôleur est un signal fiable. Faux positif possible sur
les chemins qui ne passent pas par le domaine — un téléversement trop volumineux, par exemple — à
exclure explicitement.

### Codemods

Peu de matière. C1 et C2 demandent chacun une décision : où placer l'intention composée, quelle erreur
de domaine lever. Un codemod ne peut que signaler.

---

## 7. En TypeScript

**À migrer en dernier, et il faut le dire.** Les objets de requête et de réponse du framework sont
typés de façon large, et la validation déclarée sur la route produit un contrôle à l'exécution que le
typage ne connaît pas. Un contrôleur en `.ts` qui importe des usecases en `.js` ne vérifie rien de ses
appels, à cause de `declare module '*.js'`.

Le seul gain marginal : typer le troisième paramètre documente ce qui est substituable en test.

Contrainte habituelle : `erasableSyntaxOnly` interdit `enum`.

---

## 8. Tests attendus

| Objet | Type de test | Ce qu'on vérifie |
| --- | --- | --- |
| Contrôleur | **unitaire**, usecase et sérialiseur mockés | que le bon usecase est appelé avec les bons paramètres, et que la réponse est sérialisée |

Rien d'autre. Les statuts et la sécurité se vérifient au niveau de la route, en acceptance — voir
`fiche-route.md`.

Un test de contrôleur qui demande des fixtures métier est le signe que C1 ou C2 est violé.

---

## 9. Checklist de revue

```
[ ] C4  Aucun accès aux repositories ; aucun usecase d'un autre contexte
[ ] C1  Un seul usecase appelé
[ ] C2  Aucune décision : ni règle métier, ni code d'erreur choisi ici
[ ] C3  Le sérialiseur est injecté par valeur de paramètre par défaut
[ ] C5  Nom de fichier = ressource, nom de fonction = action, objet exporté référencé par la route
[ ] Test unitaire avec usecase et sérialiseur mockés, sans fixture métier
```

---

## 10. Sources

Bibliographie dans `references-ddd.md`.

| Invariant | Source |
| --- | --- |
| **La couche, et C2** | Martin, *Clean Architecture*, ch. « Presenters and Humble Objects » — le contrôleur est dépourvu de logique pour que son test soit trivial. Billet « The Clean Architecture », gratuit |
| **C1** un usecase par point d'entrée | Pix : **ADR 20**, qui rend le usecase obligatoire pour toute route |
| **C3** sérialiseur injecté | Pix : **ADR 46**, et son motif ESM. L'exception des usecases non injectés y est explicitement assumée |
| **C4** aucun accès aux données | Martin, « The Clean Architecture » — la règle de dépendance. Pix : **ADR 55** pour la frontière entre contextes |
| **C5** nommage | **aucune source** — convention de rangement |

Un invariant sur cinq sans source, et c'est celui que le § 3 classe en hygiène. La cohérence est
rassurante : ce qui n'a pas de source n'a pas non plus de ROI mesurable.

ADR 13 (gestion des erreurs API/IHM) n'a pas été lu et pourrait préciser le rôle du mappeur d'erreurs
invoqué par C2. À vérifier lors de la relecture.
