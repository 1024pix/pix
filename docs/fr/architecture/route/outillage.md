# Route — outillage

Guide pratique : mettre en place les vérifications automatiques des règles de
[`README.md`](README.md), et corriger les violations qu'elles relèvent.

## État au 2026-09-24

Aucune de ces vérifications n'est en place. Aucun plugin ESLint maison n'existe : toute règle sur
mesure suppose d'abord de créer cette infrastructure, et les coûts ci-dessous ne comptent que la
règle.

La vérification de `R2`, la plus utile de ce dossier, s'écrit sans préalable. La déclaration d'accès
est déjà dans le code, sous trois formes reconnaissables.

## Vérifications

| Invariant | Moyen | Coût | Faux positifs |
| --- | --- | --- | --- |
| **R2** contrôles d'accès | script `tests/tooling/` : classe chaque route par pre-handler de sécurité, `auth: false` ou stratégie explicite, et liste celles qui n'ont aucune des trois | ~40 lignes | aucun : les routes authentifiées sans restriction sont listées, pas signalées. Voir la limite de `R2` dans [`README.md`](README.md#r2-les-contrôles-daccès-sont-déclarés-en-pre-handler) |
| **R3** documentation | script : toute route déclare étiquettes et description | ~30 lignes | aucun |
| **R1** validation déclarée | script : toute route ayant des paramètres d'adresse déclare leur validation | ~30 lignes | faibles : un paramètre validé par un type partagé plutôt que par un schéma explicite |
| **R4** aucune logique | règle ESLint : déclaration de fonction dans un objet de route, hors champ de traitement d'échec | ~30 lignes | **à mesurer** : voir `X4` de [`ecarts.md`](ecarts.md#x4-des-fonctions-sont-écrites-en-ligne-dans-la-déclaration) |
| **R5** un gestionnaire | revue | — | — |

### R2 — un script sans préalable

Le script est mécanique. Il classe chaque route selon ce qu'elle déclare :

- un pre-handler de sécurité ;
- `auth: false` ;
- une stratégie d'authentification explicite ;
- aucune des trois : la route est authentifiée sans restriction.

Les trois formes existent dans le code. La troisième s'oublie facilement en écrivant le script :

```js
// une route dont l'authentification est optionnelle : ni pre-handler, ni auth: false
config: {
  auth: { strategy: jwtOptionalUserAuthenticationStrategyName },
  handler: combinedCourseController.getByCode,
}
```

**Code.** [`combined-course-route.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/quest/application/combined-course-route.js#L22-L26), simplifié.

Elle est plus rare que les deux autres. Un script qui l'ignore signale pourtant du code légitime, et
perd sa crédibilité au premier passage.

Le script ne fait échouer aucune route authentifiée sans restriction, parce que cet état est
légitime et fréquent : la signaler produirait un faux positif. Il en sort la liste, qui rend
l'omission visible. Décider si une route de cette liste doit porter un contrôle reste en revue :
c'est la limite de `R2`.

Un contrôle d'accès retiré par erreur fait donc passer la route dans la liste, sans faire échouer
de test. La revue le voit si elle lit la liste de la PR.

### R3 et R1 — deux scripts triviaux

Les deux scripts parcourent les déclarations de routes et vérifient la présence des champs attendus.
La configuration d'une route se déclare sous `config` ou sous `options`, et les scripts lisent les
deux.

Aucun faux positif sur `R3`. Sur `R1`, un paramètre validé par un type partagé plutôt que par un
schéma explicite ressemble à une absence de validation. Un script qui ne reconnaît pas ce cas le
signale à tort. Le code n'a rien à corriger : la forme par type partagé est la meilleure des deux.

### R4 — la plus délicate

La règle distingue le traitement d'échec de validation, légitime, d'une autre fonction en ligne. Pour
cela, elle reconnaît le champ où la fonction est déclarée. C'est faisable. La règle s'écrit après les
trois autres, et se mesure avant de devenir bloquante, parce que le motif admis et le motif fautif ont
la même forme.

La règle se déclenche aussi sur l'enveloppe écrite autour de l'utilitaire de combinaison dans `pre`.
C'est une vraie violation de `R4`, pas un faux positif : voir `X4` de
[`ecarts.md`](ecarts.md#x4-des-fonctions-sont-écrites-en-ligne-dans-la-déclaration).

## Ordre de mise en œuvre

Cet ordre suit le ROI : voir [`explication.md`](explication.md#roi-des-invariants). La vérification
la plus rentable est aussi celle qui n'attend rien.

1. **R2** — le script, dès maintenant
2. **`X1`** — corriger les contrôles écrits dans les contrôleurs, que le script ne voit pas
3. **R3** puis **R1** — les deux scripts triviaux
4. **R4** — la règle ESLint, en avertissement d'abord

## Corriger les violations

Critère de découpe : un codemod peut appliquer une décision, il ne peut pas en prendre une.

| Écart ou invariant | Codemod | Ce qu'il fait |
| --- | --- | --- |
| **R3** documentation | partiel | Ajouter les champs manquants est mécanique. Le texte de la description est du contenu : le codemod pose l'emplacement et un `TODO`, pas la phrase |
| **X1** contrôle déplacé | partiel | Insérer un pre-handler existant, oui, quand le droit ne dépend que du rôle. Décider quel droit s'applique, non |

## Le typage

**Peu de gain sur cette couche.** Les objets de configuration du framework sont typés de façon large.
La validation déclarée produit un contrôle à l'exécution que le typage ne connaît pas : le type du
paramètre reçu par le contrôleur n'est pas déduit du schéma déclaré sur la route.

La garantie de `R1` reste donc une garantie d'exécution, pas de compilation.

Un gain existe si les identifiants sont typés nominalement. Une adresse qui déclare un identifiant
d'un type, et un contrôleur qui en attend un autre, deviennent alors détectables. Ce gain suppose
toute la chaîne migrée : c'est un bénéfice tardif. L'ADR 19, « Typer les identifiants », traite ce
sujet, et a écarté le contrôle de type dans le domaine pour son coût.

`R2` ne se typera pas. Un droit déclaré n'est pas une propriété de type, et aucune annotation ne dit
« cette route est protégée ». La vérification reste le script de
[`R2`](#r2--un-script-sans-préalable).

Les contraintes de syntaxe imposées par la configuration sont dans `../migration-typescript.md`.
