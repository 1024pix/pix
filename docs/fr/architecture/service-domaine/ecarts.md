# Domain Service — écarts

Suivi : où le code des Domain Services s'écarte de la théorie, et ce qui est décidé. **État au
2026-09-24.** Ce fichier décrit le code, il se périme. Les règles sont dans [`README.md`](README.md),
la théorie dans [`explication.md`](explication.md#la-théorie-des-écarts).

## Grille de verdict

- La nature d'un écart est *convention assumée*, *dérive* ou *vestige*.
- **À corriger** : un coût payé sans bénéfice. *À surveiller* : un coût et un bénéfice réels, sous
  condition. *Rien à faire* : aucun coût réel.
- Un bénéfice de performance invoqué sans mesure compte pour nul.

Les trois écarts sont des dérives. Aucun n'est une convention assumée.

| Écart | Nature | Coût payé | Bénéfice obtenu | Verdict |
| --- | --- | --- | --- | --- |
| **X1** Le dossier `services/` mélange deux natures de fichiers | dérive | Tant que le mélange dure, la règle ESLint de D1 ne peut pas passer en erreur. Le mot, repris du DDD, induit en erreur | Nul | **À corriger**, direction décidée |
| **X2** La règle est placée dans un service plutôt que sur un objet | dérive | Les modèles perdent leur logique, et la règle s'éloigne de ses données | L'écriture est plus rapide, et l'invariant de l'objet n'a pas à être revu | **À corriger** |
| **X3** Le fichier est nommé par la ressource et suffixé `-service` | dérive | Le fichier accueille tout ce qui touche à la ressource, sans critère pour refuser | Nul | **À corriger** |

---

### X1. Le dossier `services/` mélange deux natures de fichiers

**Exemple concret.** Trois fichiers du même dossier, deux natures :

```
domain/services/
  get-mastery-percentage-service.js   → prend des objets, calcule, renvoie : vrai service
  get-campaign-progression.js         → reçoit des repositories, charge : usecase
  index.js                            → un fichier de câblage : il importe les repositories
                                        de trois contextes et appelle injectDependencies
```

**Code.** [Le dossier](https://github.com/1024pix/pix/tree/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/evaluation/domain/services). Le usecase : [`get-campaign-progression.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/evaluation/domain/services/get-campaign-progression.js#L3-L13). Le câblage : [`index.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/evaluation/domain/services/index.js#L1-L42).

Le dossier ne distingue pas ces natures. Un relecteur ne sait donc pas quels invariants appliquer, et
la règle ESLint de D1 ne peut pas passer en erreur. Le troisième fichier est une exception légitime de
[`README.md`](README.md#exceptions-légitimes), symétrique de `domain/usecases/index.js`. Voir `X3` de
`../usecase/ecarts.md`.

**Verdict.** Le mélange a une cause connue : le sens du dossier `services/` n'avait jamais été décidé.
Il l'est maintenant, et c'est la règle de [`README.md`](README.md#le-test-de-discrimination). X1
relève donc d'une correction, pas d'un choix entre options. L'histoire de la décision et les
positions écartées sont dans [`explication.md`](explication.md#le-sens-du-dossier-services).

**Correction.** `domain/services/` est réservé aux vrais Domain Services. Les fichiers qui font
des I/O vont dans `usecases/`.

Le déplacement suppose d'abord le classement des fichiers existants avec le
[test de discrimination](README.md#le-test-de-discrimination). La règle ESLint de D1, en
avertissement, fournit la liste : voir [`outillage.md`](outillage.md#d1--la-règle-qui-force-la-décision).

### X2. La règle est placée dans un service plutôt que sur un objet

**Exemple concret.**

```js
// dans domain/services/ — une seule collection d'objets en entrée
function computeTubesFromSkills(skills) { … }
```

**Code.** [`tube-service.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/evaluation/domain/services/tube-service.js#L5).

C'est le signal de D4 : une seule collection d'objets du domaine en entrée, des objets du domaine en
sortie. Regrouper des acquis par tube est une règle du modèle d'apprentissage, pas un calcul
transverse.

**Verdict.** Le bénéfice porte sur l'écriture : elle est plus rapide, et l'invariant de l'objet n'a
pas à être revu. Le coût : les modèles perdent leur logique, et la règle s'éloigne de ses données. La théorie est dans
[`explication.md`](explication.md#x2-la-règle-est-placée-dans-un-service-plutôt-que-sur-un-objet).

**Correction.** Déplacer la règle sur l'objet, sous une fabrique nommée :
`Tube.groupFromSkills(skills)`. Les appelants remplacent l'appel de fonction par la méthode statique.

La correction n'est pas mécanique. Savoir si la règle appartient à l'objet demande de savoir si elle
contraint son état ou si elle relie deux objets. Le signal de D4 montre où regarder. Il ne
décide pas.

### X3. Le fichier est nommé par la ressource et suffixé `-service`

**Exemple concret.**

```
domain/services/scorecard-service.js
  → computeScorecard, computeLevelUpInformation, resetScorecard,
    _computeResetSkillsNotIncludedInCampaign, …
```

**Code.** [`scorecard-service.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/evaluation/domain/services/scorecard-service.js#L8-L188) : les quatre exports sont aux lignes 8, 36, 76 et 186.

Cette liste réelle montre deux choses :

- `resetScorecard` écrit : le fichier contient déjà un usecase.
- `_computeResetSkillsNotIncludedInCampaign` est exporté malgré son tiret bas, qui le marque comme
  privé.

Rien ne permet de refuser une fonction de plus dans ce fichier, et il grossit sans limite.

**Verdict.** Aucun bénéfice. Le coût est un fichier sans critère pour refuser un ajout. La théorie est
dans [`explication.md`](explication.md#x3-le-fichier-est-nommé-par-la-ressource-et-suffixé--service).

**Correction.** Un fichier par règle, nommé par la règle. Si les fonctions sont indépendantes, le
découpage est mécanique et ne demande aucune décision de conception. Si elles partagent des fonctions
privées, leur placement demande une décision.

C'est l'écart le moins coûteux à corriger des trois.
