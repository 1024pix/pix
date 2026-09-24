# Entity — écarts

Suivi : où le code des Entities s'écarte de la théorie, et ce qui est décidé. **État au
2026-09-24.** Ce fichier décrit le code, il se périme. Les règles sont dans [`README.md`](README.md),
la théorie dans [`explication.md`](explication.md#la-théorie-des-écarts).

## Grille de verdict

- La nature d'un écart est *convention assumée*, *dérive* ou *vestige*.
- **À corriger** : le coût dépasse le bénéfice, ou le bénéfice s'obtient autrement. *À surveiller* : un coût et un bénéfice réels, sous
  condition. *Rien à faire* : aucun coût réel.
- Un bénéfice de performance invoqué sans mesure compte pour nul.

| Écart | Nature | Coût payé | Bénéfice obtenu | Verdict |
| --- | --- | --- | --- | --- |
| **X1** Le constructeur en sac de propriétés | dérive | L'Entity s'instancie dans n'importe quel état, donc elle ne protège rien. E3 est faux par construction | L'écriture est rapide, et l'ajout d'un champ ne touche pas au constructeur | **À corriger** |
| **X3** La validation a lieu après l'affectation | convention assumée | Un objet invalide existe le temps du constructeur, et le message porte sur un état déjà construit plutôt que sur l'entrée fautive | réel : un schéma déclaratif, un seul appel de validation, une forme uniforme entre tous les modèles | À surveiller |
| **X4** L'arborescence ne distingue pas Entity et Value Object | convention assumée | Le test de discrimination n'est appliqué nulle part de façon visible, et aucune règle de chemin ne peut viser les Entities seules | Un seul dossier où chercher, et aucune décision de classement à prendre à chaque fichier | À surveiller |
| **X5** L'Entity non persistée porte un identifiant `null` | convention assumée | Chaque consommateur doit traiter le cas `null`, et le type ne l'annonce pas | Une seule classe au lieu de deux, et un seul chemin de code | À surveiller |

Le modèle vide, symptôme des règles écrites dans les usecases, est traité sous `X1` de
`../usecase/ecarts.md`, là où se trouve le fichier fautif. La correction porte sur le usecase.

---

### X1. Le constructeur en sac de propriétés

**Exemple concret.** Le constructeur accepte l'objet vide, donc s'instancie toujours.

```js
class TrainingTrigger {
  constructor({ id, trainingId, triggerTubes, type, threshold } = {}) {
    this.id = id;
    this.trainingId = trainingId;
    …
  }
}
```

**Code.** [`TrainingTrigger.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/devcomp/domain/models/TrainingTrigger.js#L6-L16), simplifié.

Trois traits vont ensemble et signalent le motif :

- la valeur par défaut `= {}` sur le paramètre déstructuré ;
- tous les champs optionnels ;
- aucun appel de validation dans le corps.

Sur cet exemple, le troisième trait n'est vrai qu'en partie. La validation existe pour un seul champ,
le type de déclencheur, et manque pour tous les autres. La règle de E3 ne voit pas ce cas, parce
qu'elle cherche l'absence de tout appel de validation. Une validation partielle reste donc en revue.

C'est la forme la plus répandue de violation de E3.

**Verdict.** À corriger : le seul bénéfice est une écriture rapide, et le coût est une Entity qui ne
protège rien. La théorie est dans
[`explication.md`](explication.md#x1-le-constructeur-en-sac-de-propriétés).

**Correction.** Rendre requis ce qui est requis, et valider avant d'affecter. Le coût réel n'est pas
l'écriture du constructeur. C'est la découverte des appelants qui s'appuyaient sur la permissivité,
souvent des factories de test.

Ordre de travail : la règle de E3 en avertissement d'abord, pour produire la liste, puis fichier par
fichier. Voir [`outillage.md`](outillage.md#e3--la-règle-la-plus-utile-et-la-plus-bruyante). La
lancer en erreur d'emblée garantit qu'elle sera désactivée.

### X3. La validation a lieu après l'affectation

**Exemple concret.** C'est le motif documenté. La documentation d'architecture Pix donne comme modèle
de référence un constructeur qui affecte tous ses champs, puis valide `this` contre un schéma
déclaratif.

```js
// la forme documentée : affecter, puis valider this contre un schéma
constructor({ id, state, … }) {
  this.id = id;
  this.state = state;
  …
  validateEntity(certificationAssessmentSchema, this);
}

// la forme inverse, qui existe aussi dans le dépôt
constructor({ id, type, grains }) {
  assertNotNullOrUndefined(id, 'The id is required for a section');
  assertIsArray(grains, 'A list of grains is required for a section');
  this.id = id;
  …
}
```

**Code.** Forme documentée : [`CertificationAssessment.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/certification/session-management/domain/models/CertificationAssessment.js#L47-L69), simplifié. Forme inverse : [`Section.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/devcomp/domain/models/module/Section.js#L14-L23), simplifié.

**Verdict.** À surveiller. Ce n'est pas une dérive : c'est la forme prescrite. Le bénéfice est réel :

- un schéma déclaratif au lieu de gardes écrites une à une ;
- un seul appel ;
- une forme identique dans tous les modèles.

Le coût à surveiller est le message d'erreur. Une validation sur `this` décrit l'objet construit, pas
l'entrée fautive : le diagnostic est plus long. La théorie est dans
[`explication.md`](explication.md#x3-la-validation-a-lieu-après-laffectation).

**Correction.** Aucune n'est systématique. La forme « valider puis affecter » existe dans le dépôt,
avec ses propres utilitaires d'assertion. L'alternative n'est donc pas à inventer : les deux
conventions cohabitent.

Passer de l'une à l'autre sur un modèle donné n'est pas mécanique. L'utilitaire qui valide `this`
contre un schéma ne se remplace pas par des assertions champ par champ sans réécrire la validation.

Là où le message compte, valider les paramètres avant d'affecter reste préférable. C'est le cas d'une
entrée venant d'un import, d'une API ou d'un formulaire.

**Révision.** Un utilitaire qui validerait les paramètres plutôt que `this` change ce verdict. Il
supprimerait le coût sans rien retirer du bénéfice.

### X4. L'arborescence ne distingue pas Entity et Value Object

**Exemple concret.** `domain/models/` contient les catégories à plat, sans distinction.

```
shared/domain/models/
  Skill.js           → Entity
  Membership.js      → Entity
  AnswerStatus.js    → Value Object
```

**Code.** [Le dossier](https://github.com/1024pix/pix/tree/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/shared/domain/models).

Le mélange est documenté : `docs/fr/Anatomy.md` décrit `domain/models` comme contenant « Entités,
aggrégats et value objects du domaine ». C'est donc une convention documentée, pas une dérive.

Le contexte `quest` fait exception : il range ses modèles dans des sous-dossiers `entities/`,
`value-objects/` et `aggregates/`. Voir [le dossier](https://github.com/1024pix/pix/tree/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/quest/domain/models).
Le classement y reste à juger par le test de discrimination : `CombinedCourseStatistics`, rangé dans
`value-objects/`, est un Value Object sans règle, ou un read-model.

**Verdict.** À surveiller. Le dossier commun coûte vraiment une chose : aucune règle de chemin ne
peut viser les Entities seules. Les vérifications de [`outillage.md`](outillage.md#vérifications)
s'appliquent donc à tout `domain/models/`, et produisent du bruit sur les Value Objects.
`../read-model/README.md` montre l'inverse : deux dossiers séparés permettent d'écrire la règle de
chemin. La théorie est dans
[`explication.md`](explication.md#x4-larborescence-ne-distingue-pas-entity-et-value-object).

**Correction.** Aucune n'est décidée : c'est une décision à prendre, pas une correction à appliquer.

Ce que la séparation coûterait : une décision de classement sur chaque fichier existant, par le test
de discrimination. Le choix se fait sur le gain de vérification, pas sur le seul souci de bien
classer.

### X5. L'Entity non persistée porte un identifiant `null`

**Exemple concret.**

```js
const draftVersion = Version.buildDraftFromActiveVersion({ scope, version: activeVersion, tubeIds });
// draftVersion.id === null, avant insertion
const versionId = await versionRepository.save(draftVersion);
```

**Code.** [`create-draft.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/certification/configuration/domain/usecases/create-draft.js#L25-L33), simplifié : l'appel à `save` y est enveloppé dans `DomainTransaction.execute`. L'identifiant `null` est posé dans [`Version.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/certification/configuration/domain/models/Version.js#L166-L168).

Tout consommateur de `Version` doit alors savoir si l'identifiant peut être `null`. Rien dans la
signature ne le dit.

**Verdict.** À surveiller : aucun défaut causé par le cas `null` n'est démontré, donc un second type
ne se justifie pas encore sur l'existant. La théorie est dans
[`explication.md`](explication.md#x5-lentity-non-persistée-porte-un-identifiant-null).

**Correction.** Aucune sur l'existant. Pour le neuf, l'intention de création prend un type distinct,
`…ForCreation`, sans identifiant. La signature porte alors l'information, et le typage la vérifie.
C'est `V8` de `../objet-valeur/README.md` appliqué à une Entity.

`X7` de `../objet-valeur/ecarts.md` limite la pratique : une forme de création exprime une
différence de nature, donc elle est légitime. Une forme de mise à jour portant un sous-ensemble de
champs ne l'est pas, sauf mesure.

**Révision.** Un défaut en production causé par le cas `null` change ce verdict.
