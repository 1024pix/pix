# Specification — outillage

Guide pratique : mettre en place les vérifications automatiques des règles de
[`README.md`](README.md), et corriger les violations qu'elles relèvent.

## État au 2026-09-24

Aucune de ces vérifications n'est en place. Aucune documentation versionnée du format des
specifications n'existe dans le dépôt : le test de `S6` ne peut donc pas encore être écrit.

## Vérifications

Les invariants propres se vérifient par des tests plutôt que par du lint, parce que les ensembles
suivants sont finis et déclarés :

- la liste des types de critères ;
- la liste des comparaisons ;
- la surface du candidat.

Un test boucle sur ces ensembles et affirme une propriété. C'est plus simple et plus robuste qu'une
analyse d'AST.

| Invariant | Moyen | Coût | Faux positifs |
| --- | --- | --- | --- |
| **S7** énumération ↔ candidat | test de correspondance sur une instance | ~10 lignes | aucun |
| **S1** totalité | test de totalité paramétré sur les énumérations | ~30 lignes | aucun |
| **S5** fermeture par composition | test : un combinateur accepte chaque type d'enfant, imbrication comprise | ~20 lignes | aucun |
| **S6** format publié | test comparant les énumérations à une documentation versionnée | ~15 lignes | aucun. Suppose la documentation du format, voir [`S6`](#s6--ce-qui-manque-avant-de-pouvoir-le-tester) |
| **S8** pas de redéfinition | règle `dependency-cruiser`, **après** le découpage de `X1` de [`ecarts.md`](ecarts.md) | configuration | — |
| **S2** | revue | — | — |
| Invariants hérités | voir `../objet-valeur/outillage.md` | — | — |

### S7 — le test le plus rentable, et l'erreur à ne pas refaire

La forme naïve est **fausse** :

```js
// FAUX — inspecte le prototype, alors que le contrat porte sur l'instance
for (const name of Object.values(TYPES.OBJECT)) {
  expect(Object.getOwnPropertyNames(DataForQuest.prototype)).to.include(name);
}
```

**Code.** Hypothétique.

`Object.getOwnPropertyNames(Candidate.prototype)` ne voit que les méthodes et les accesseurs déclarés
sur le prototype. Un candidat qui expose ses propriétés par **champs assignés au constructeur** (la
forme montrée sous `S1` de [`README.md`](README.md#s1-la-specification-est-totale)) n'a rien sur son
prototype. Le test échoue donc sur du code correct. Et il ne dit rien du cas inverse.

La forme juste interroge une instance :

```js
const dataInput = new DataForQuest({ eligibility: {}, success: {} });
for (const name of Object.values(TYPES.OBJECT)) {
  expect(name in dataInput, `le critère « ${name} » n'a aucune propriété sur le candidat`).to.be.true;
}
```

**Code.** Hypothétique.

`in` couvre les champs propres, les accesseurs du prototype et les méthodes : les trois formes sous
lesquelles une propriété du candidat peut exister. Le message d'échec nomme le critère fautif. Sans
ce message, un échec du test est inexploitable.

Dix lignes, aucun faux positif. Si le test passe déjà, il sert de test de non-régression : il interdit
une classe entière de pannes silencieuses.

**L'extension.** Un test d'intégration vérifie en plus que la propriété est renseignée par le
repository qui assemble le candidat, pas seulement exposée. Il demande une fixture.

### S1 — test de totalité

```js
const empty = new DataForQuest({ eligibility: {}, success: {} });
for (const name of Object.values(TYPES.OBJECT)) {
  const requirement = buildRequirement({ requirement_type: name, /* … */ });
  expect(() => requirement.isFulfilled(empty)).to.not.throw();
}
```

**Code.** Hypothétique.

Étendre le test à chaque valeur de l'énumération des comparaisons, et à un candidat dont chaque
propriété est absente à tour de rôle.

Le test **ne couvre pas** les parties du candidat volontairement chargées en deux temps. Voir les
[exceptions légitimes](README.md#exceptions-légitimes).

### S6 — ce qui manque avant de pouvoir le tester

Le test est trivial : comparer les valeurs des énumérations du code à une liste documentée. Il ne peut
pas être écrit tant que la liste documentée n'existe pas.

La documentation du format, versionnée dans le dépôt, est donc le prérequis du test de `S6`. Ce
prérequis relève de la documentation, pas de l'outillage. Le test qui oppose le format au code vient
ensuite.

### Ce qui n'est pas mécanisable

`S2` demande de juger si une distinction sémantique est faite au bon endroit. Le choix de la sortie est
une décision, pas une propriété vérifiable.

`S8` est un chantier de conception. La règle qui l'interdirait ne peut être écrite qu'une fois le
découpage réalisé : elle en est la conséquence, pas le moyen. C'est la différence avec les autres
lignes de la table.

### Ordre de mise en œuvre

Cet ordre suit le coût, pas le ROI : voir [`explication.md`](explication.md#roi-des-invariants).

1. **S7** : dix lignes, sur une instance et non sur le prototype
2. **S1** : test paramétré sur les énumérations
3. **S5** : test de composition
4. **Invariants hérités** : la règle de chemin et la règle sur les champs publics, mutualisées avec
   `../objet-valeur/outillage.md`
5. **S6** : documenter le format, puis le test qui l'oppose au code
6. **S2** : choisir la sortie, puis reprendre les sites d'appel
7. **S8** : après le découpage de `X1`, la règle de chemin qui le verrouille

### Corriger les violations

Les codemods sont peu rentables ici, contrairement au repository.

| Écart ou invariant | Codemod | Ce qu'il fait |
| --- | --- | --- |
| **X3** journalisation | préparation seule | Repérer les imports fautifs, oui. Décider du canal de retour de la trace, non |
| **X2** sortie de non-évaluabilité | non | Chaque site d'appel doit décider ce qu'il fait du nouveau cas |
| **X1** redéfinition | non | C'est de la conception |

Aucun de ces écarts de [`ecarts.md`](ecarts.md) ne se corrige mécaniquement. Chacun demande une
décision :

- `X3` : ce que devient la trace ;
- `X2` : quel canal pour signaler l'inévaluable ;
- `X1` : quel découpage entre le moteur et ses consommateurs.

Pour les invariants, le test et la règle suffisent : aucun codemod n'est nécessaire.

---

## Vérifier par le typage

Le pattern se type bien, et c'est une bonne cible de migration : peu de fichiers, aucune I/O, frontière
nette. La forme cible ne s'applique qu'après la migration des modèles en `.ts` : voir
`../migration-typescript.md`.

```ts
export type DataForQuest = {
  readonly organizationLearner?: { readonly id: number };
  readonly campaignParticipations: readonly CampaignParticipation[];
};

export type Requirement<D> = {
  isFulfilled(dataInput: D): boolean;
};
```

**Code.** Hypothétique.

Deux bénéfices. Ils portent précisément sur les invariants les plus souvent en défaut.

**`S1` devient partiellement structurel.** Un candidat aux propriétés optionnelles force le traitement
de l'absence à la compilation : sous `strict`, un accès non gardé ne compile plus. Ce qui reste à la
charge du code : la valeur présente mais hors domaine, qui est le périmètre de `S2`.

**`S7` devient structurel, et `X4` disparaît.** Un `requirement_type` typé en `keyof DataForQuest`,
plutôt qu'en `string`, rend impossible la déclaration d'un critère sans propriété correspondante. Le
test de `S7` devient alors inutile. C'est le seul endroit du corpus où le typage retire un test au lieu
d'en ajouter un.

La limite : ce bénéfice suppose que le nom vienne du code. Un nom qui vient de la base de données
reste une chaîne au moment où il arrive. La vérification se déplace alors vers la validation du
format, `V3`.

Les contraintes de syntaxe imposées par la configuration sont dans `../migration-typescript.md`.
