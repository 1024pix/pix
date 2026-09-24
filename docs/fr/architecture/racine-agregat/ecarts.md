# Aggregate Root — écarts

Suivi : où le code des Aggregates s'écarte de la théorie, et ce qui est décidé. **État au
2026-09-24.** Ce fichier décrit le code, il se périme. Les règles sont dans [`README.md`](README.md),
la théorie dans [`explication.md`](explication.md#la-théorie-des-écarts).

Plusieurs repositories pour une même frontière de cohérence : c'est `X4` de
[`../repository/ecarts.md`](../repository/ecarts.md#x4-plusieurs-repositories-pour-un-même-aggregate),
là où se trouvent les fichiers en cause. Vu d'ici, le symptôme est A3 qui tombe.

## Grille de verdict

- La nature d'un écart est *convention assumée*, *dérive* ou *vestige*.
- **À corriger** : un coût payé sans bénéfice. *À surveiller* : un coût et un bénéfice réels, sous
  condition. *Rien à faire* : aucun coût réel.
- Un bénéfice de performance invoqué sans mesure compte pour nul.

| Écart | Nature | Coût payé | Bénéfice obtenu | Verdict |
| --- | --- | --- | --- | --- |
| **X1** Le mot « Aggregate » est posé sur des dossiers sans frontière nommable | dérive | Le dossier promet une garantie qui n'existe pas. Un relecteur y cherche des invariants absents, et leur absence passe pour normale | Un rangement, quel qu'il soit | **À corriger** |
| **X2** Aucune racine n'est déclarée nulle part | dérive | A1 n'est vérifiable ni par un humain ni par un outil, et l'indicateur de A3 est incalculable | Nul | **À corriger** |
| **X4** Une opération modifie plusieurs Aggregates dans la même transaction | convention assumée | Une transaction verrouille plus que nécessaire, et masque une frontière mal placée | Réel et **mesuré** : l'alternative par événements a causé des deadlocks en production, et la cohérence immédiate évite tout appareil de compensation | *Rien à faire* |

X2 bloque la revue de A1 et le calcul de l'indicateur de A3. Il se traite avant le reste : voir
l'[ordre de mise en œuvre](outillage.md#ordre-de-mise-en-œuvre).

---

### X1. Le mot « Aggregate » est posé sur des dossiers sans frontière nommable

**Exemple concret.** Un dossier qui annonce une frontière de cohérence, mais contient des projections
de lecture. Deux dossiers `aggregates/` réels du contexte `quest` :

```
domain/models/
  combined-course-participations/aggregates/
    CombinedCourseDetails.js               → assemblé pour un écran : aucune règle commune
    CombinedCourseParticipationDetails.js  → idem
  quests/aggregates/
    DataForQuest.js                        → le candidat d'une Specification : un Value Object
```

**Code.** [`combined-course-participations/aggregates/`](https://github.com/1024pix/pix/tree/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/quest/domain/models/combined-course-participations/aggregates) et [`quests/aggregates/`](https://github.com/1024pix/pix/tree/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/quest/domain/models/quests/aggregates), simplifié : chaque dossier contient trois fichiers, et seuls ceux déjà classés sont montrés.

Le mot annonce des invariants tenus. Un relecteur qui ne les trouve pas conclut que la règle est mal
appliquée. En réalité, ces objets n'avaient rien à faire là.

**Verdict.** À corriger : le dossier promet une garantie que rien ne tient, et le seul bénéfice est un
rangement. Théorie : [`explication.md`](explication.md#x1-le-mot-sans-la-frontière).

**Correction.** Appliquer le [test de discrimination](README.md#le-test-de-discrimination), fichier
par fichier, et renommer le dossier selon le résultat.

1. Aucune règle commune, assemblé pour une lecture → c'est un **read-model**, il va dans
   `domain/read-models/`. `../read-model/README.md` s'applique.
2. Une règle commune nommable → c'est un Aggregate, le dossier garde son nom, et la phrase de A1
   s'écrit. C'est X2.
3. Une seule Entity et des objets à côté, sans règle commune → le dossier n'a pas à s'appeler
   `aggregates/`.

Le renommage retire une promesse non tenue. Il coûte peu, une fois chaque fichier classé. Le
déplacement mécanique est décrit dans [`outillage.md`](outillage.md#corriger-les-violations).

### X2. Aucune racine n'est déclarée nulle part

**Exemple concret.** A1 demande qu'une phrase soit nommable. A3 demande de comparer le nombre de
repositories au nombre de racines. Ni l'une ni l'autre information n'existe sous une forme lisible :
les obtenir demande d'ouvrir chaque modèle et de deviner.

**Verdict.** À corriger : A1 et l'indicateur de A3 sont invérifiables, pour aucun bénéfice. L'écart
est avec la vérifiabilité, pas avec la théorie : voir
[`explication.md`](explication.md#x2-la-déclaration-des-racines).

**Correction.** Déclarer les racines par contexte, avec leur invariant de frontière. Un fichier de
quelques lignes suffit :

```md
## Aggregate Roots de ce contexte

- **CombinedCourse** : à tout instant, toute participation portée est une participation
  de ce contexte
- **CombinedCourseBlueprint** : _invariant de frontière non formulé_
```

**Code.** Hypothétique : ce fichier n'existe pas.

La deuxième ligne est le vrai apport du fichier. Une racine dont personne n'a écrit ce qu'elle
garantit se voit immédiatement.

Pour un coût faible, ce fichier permet :

- de revoir A1 ;
- de calculer l'indicateur de A3 ;
- de donner un point de comparaison à A6.

X2 est donc le prérequis de la revue de A1 et de l'indicateur de A3.

### X4. Une opération modifie plusieurs Aggregates dans la même transaction

**Exemple concret.** Un usecase transactionnel qui écrit dans deux frontières distinctes :

```js
export const updateUserPassword = withTransaction(async function ({ … }) {
  …
  const user = await userRepository.getByEmail(email);
  …
  await authenticationMethodRepository.updatePassword({ userId, hashedPassword });
  …
  await userRepository.updateEmailConfirmed(userId);   // autre Aggregate
});
```

**Code.** [`update-user-password.usecase.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/identity-access-management/domain/usecases/update-user-password.usecase.js#L19-L60), simplifié.

`User` et `AuthenticationMethod` sont deux Aggregates. Un mot de passe changé sans courriel confirmé,
ou l'inverse, laisse un compte dans un état dont personne ne veut. Ces deux écritures doivent échouer
ensemble. La cohérence à terme n'y répondrait pas : elle laisserait une fenêtre pendant laquelle le
compte est cassé.

**Verdict.** Rien à faire, et ce n'est pas une tolérance. C'est une décision, portée par l'ADR 25 :
c'est l'exception décidée de A7 dans [`README.md`](README.md#a7-une-transaction-un-aggregate). Le
bénéfice est mesuré, ce qui suffit à classer l'écart en *rien à faire* : une mesure change le verdict,
une intuition non. Ici la mesure existe, et elle va contre la littérature. L'histoire de la décision
est dans [`explication.md`](explication.md#a7-et-ladr-25).

**Correction.** Aucune. Sur du code neuf, poser la question de A7 avant tout élargissement de
transaction. Une transaction qui grossit reste un signal possible de frontière mal placée, et c'est le
seul moment où ce défaut se voit.

**Révision.** De la contention mesurée sur une de ces transactions change ce verdict. C'est le même
type de preuve que celle qui a produit l'ADR 25.
