# Sérialiseur — outillage

Guide pratique : mettre en place les vérifications automatiques des règles de
[`README.md`](README.md), et corriger les violations qu'elles relèvent.

## État au 2026-09-24

Aucune de ces vérifications n'est en place. Aucun plugin ESLint maison n'existe : toute règle sur
mesure suppose d'abord de créer cette infrastructure, et les coûts ci-dessous ne comptent que la
règle.

## Vérifications

Les lignes dont le moyen est le typage ne vérifient rien avant que la chaîne de types soit migrée.
Voir `../migration-typescript.md`.

| Invariant | Moyen | Coût | Faux positifs |
| --- | --- | --- | --- |
| **M1** aucune condition | règle ESLint : structure conditionnelle **sur l'objet sérialisé**, hors `??`, `?.`, hors fonction de désérialisation, hors fonction de nommage du transport et hors fonction utilitaire qui prend une valeur | ~40 lignes | **à mesurer** : voir la réserve ci-dessous |
| **M1** aucune méthode métier | même règle : appel de méthode sur l'objet sérialisé | ~10 lignes de plus | **à mesurer** |
| **M4** un fichier par ressource | script `tests/tooling/` : nommage et unicité | ~15 lignes | aucun |
| **M2** champs présents | typage, après migration du read-model reçu | — | aucun : voir [le typage](#vérifier-par-le-typage) |
| **M5** la désérialisation ne laisse rien entrer | revue ; typage après migration | — | — |
| **M3** format stable | aucun moyen dans ce dépôt. Piste : un paquet de types partagé avec les fronts | — | — |
| **Tests** un fichier de test existe | comparaison des noms de base | — | voir `../repository/outillage.md` |

L'existence du fichier de test se vérifie en comparant les noms. Les moyens et leurs limites sont
ceux de `../repository/outillage.md`.

### M1 — la règle qui compte ici, et sa réserve

Un sérialiseur est déclaratif, donc une structure conditionnelle y est un signal. Ce signal est moins
fiable qu'il n'y paraît : une condition y est souvent légitime, comme le montrent les formes autorisées
sous `M1`. Une règle qui signale « toute condition dans un fichier de sérialiseur » produit donc
surtout du bruit.

**Quatre exclusions** sont posées d'emblée, pour éviter ce bruit :

- L'opérateur de coalescence `??` et l'accès optionnel `?.`. Ce sont des protections de forme,
  présentes dans presque tous les sérialiseurs.
- Le corps des fonctions de désérialisation. Une désérialisation contient légitimement des `if`, des
  conversions et des constructions d'objets : c'est `M5`.
- Les fonctions de nommage du transport, comme celle qui traduit un nom d'attribut en type JSON:API.
  Ce sont des conditions sur une chaîne de format, pas sur l'objet du domaine.
- Les fonctions utilitaires qui prennent une valeur, et non l'objet sérialisé, comme le nettoyage
  d'une chaîne.

La règle couvre aussi les exports CSV de `infrastructure/serializers/csv/`. Voir `X5` de
[`ecarts.md`](ecarts.md).

Après ces quatre exclusions, la règle signale les `if`, les ternaires, les `&&` en position de valeur
et les `switch` **qui portent sur l'objet sérialisé ou une de ses propriétés**. C'est ce dernier point
qui porte l'essentiel du coût de la règle, et qui la rend défendable. La question posée n'est plus
« y a-t-il une condition » mais « la mise en forme dépend-elle de ce qu'elle met en forme ».

Une condition sur un paramètre de `serialize`, et non sur l'objet sérialisé, échappe à la règle. Elle
se relève en revue. C'est la forme de `X1` de [`ecarts.md`](ecarts.md).

Le second motif, un appel de méthode sur l'objet sérialisé, attrape `X2` en même temps. Il attrape
aussi un filtrage de l'objet reçu, comme le fautif de `M1`. Il demande de distinguer un accesseur d'une
méthode métier, ce qui n'est pas décidable au nom seul. Il s'écrit après le premier, et se mesure
avant de devenir bloquant.

Les faux positifs des deux motifs ne sont pas mesurés.

### M5 — pourquoi la revue, et pas une règle

Distinguer une traduction d'une décision demande de savoir ce qui est métier. Le motif fautif le plus
grossier, rendre `json.data.attributes` tel quel, est détectable. C'est aussi probablement le plus
rare.

Ce qui rendrait `M5` structurel est le typage. Une fonction de désérialisation dont le type de retour
est celui d'un objet du domaine ne peut pas rendre la forme du transport. Voir
[le typage](#vérifier-par-le-typage).

### M3 — pas mécanisable, et par quoi ça changerait

`M3` demande de savoir ce que les consommateurs lisent. Aucune règle de lint ne l'apprendra depuis ce
dépôt. C'est le seul invariant du corpus dont la vérification vit hors du dépôt.

**Ce qui lèverait la limite** : un paquet de types partagé entre l'API et les applications front, une
fois celles-ci en TypeScript. Le compilateur du front refuserait alors un champ retiré ou renommé, et
la vérification cesserait d'être une affaire de coordination. Voir
[la piste qui changerait `M3`](#la-piste-qui-changerait-m3).

**Ce qui resterait hors de portée**, même avec ce paquet : le changement de **sens** d'un champ. Un
`status` dont les valeurs changent de signification garde son type. C'est la part de `M3` qui reste en
revue dans tous les cas, et c'est la plus dangereuse.

### Ordre de mise en œuvre

Cet ordre suit le ROI, sauf pour les étapes qui attendent un préalable : une mesure pour `M1`
méthodes, la migration des read-models pour `M2`. Voir
[`explication.md`](explication.md#roi-des-invariants).

1. **M1 conditions** : la règle simple, avec ses quatre exclusions, dont celle des désérialisations.
2. **M4** : script de nommage et d'unicité.
3. **M1 méthodes** : après mesure.
4. **M2** : par le typage, une fois les read-models migrés.

Toute hypothèse sur le comportement d'un outil se vérifie par contre-épreuve avant d'être écrite :
introduire la violation, confirmer que l'outil la signale, retirer la violation.

### Corriger les violations

Aucun codemod. Aucun invariant ne se corrige par une transformation :

- `M1` demande de décider où déplacer la règle qui a fui ;
- `M2` demande de décider si le champ appartient au read-model ou au domaine ;
- `M3` demande de coordonner ;
- `M5` demande de distinguer une traduction d'une décision.

---

## Vérifier par le typage

La liste des champs exposés se type contre l'objet reçu, ce qui rend **`M2` structurel** : déclarer un
champ qui n'existe pas sur l'objet ne compile plus.

```ts
type SerializableFields<T> = readonly (keyof T)[];

const attributes: SerializableFields<CalibrationScoringConfiguration> = [
  'calibrationId',
  'globalScoringConfiguration',
  'competencesScoringConfiguration',
];
```

**Code.** Extrait hypothétique : c'est la forme cible en TypeScript. La liste des champs reprend celle
de [`calibration-scoring-configuration-serializer.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/certification/configuration/infrastructure/serializers/calibration-scoring-configuration-serializer.js#L7), qui reçoit le read-model `CalibrationScoringConfiguration`.

Le gain est direct et ne dépend pas de la migration du reste : il suffit que le **read-model reçu**
soit typé. Le sérialiseur est donc un candidat plus précoce que le contrôleur ou la route, à condition
que les read-models soient migrés d'abord.

**`M5` devient structurel aussi.** Une fonction de désérialisation dont le type de retour est celui
d'un objet du domaine ne peut plus rendre la forme du transport : le compilateur refuse
`json.data.attributes`.

Le typage n'apporte pas `M1` et `M3` **dans ce dépôt seul**. Une condition reste possible dans un
fichier typé. La stabilité du contrat n'est pas vérifiable tant que le type ne franchit pas la
frontière.

Avec le typage, la checklist de [`README.md`](README.md#checklist-de-revue) perd deux lignes de plus :
`M2`, et la première ligne de `M5`. Il reste alors sept lignes :

- `M1` conditions, pour les conditions sur un paramètre de `serialize` ;
- `M1` méthodes, en partie ;
- l'unicité du sérialiseur par ressource ;
- `M3` dans sa part irréductible ;
- les deux lignes de `M5` qui portent sur une décision : traduire n'est pas décider, et valider n'est
  pas son travail ;
- le test unitaire pur.

Les contraintes de syntaxe imposées par la configuration sont dans `../migration-typescript.md`.

### La piste qui changerait `M3`

Ember prend en charge TypeScript. Le jour où les applications front y passent, **un paquet de types
partagé entre l'API et les fronts** peut porter la forme de retour des sérialiseurs.

Retirer ou renommer un champ devient alors une **erreur de compilation chez le consommateur**. `M3`
cesse d'être une procédure de coordination et devient une contrainte mécanique, ce qu'aucune autre
approche ne permet.

**Le paquet peut aussi porter les constantes.** Les chaînes qui portent du sens deviennent des types
partagés, au lieu d'être recopiées de chaque côté :

- les valeurs possibles d'un `status` ;
- les codes d'erreur ;
- les énumérations du contrat.

Ajouter ou retirer une valeur possible devient à son tour une erreur de compilation. Les constantes
partagées retirent aussi un défaut qui existe déjà : la duplication des littéraux entre l'API et les
fronts.

Ce qui reste alors hors de portée est bien plus étroit que ce que `M3` couvre. Des trois niveaux,
seul le dernier résiste :

| Le changement | Attrapé par |
| --- | --- |
| Un champ est retiré ou renommé | le type partagé |
| Une valeur possible est ajoutée ou retirée | les constantes partagées |
| Une valeur inchangée change de **signification** | rien, jamais |

Le troisième cas est le résidu irréductible : `terminé` reste la chaîne `'terminé'`, son type ne bouge
pas, et pourtant elle ne veut plus dire la même chose. C'est la seule part de `M3` qui restera en revue
humaine, quel que soit l'outillage.

**Coût.** Le paquet devient lui-même un contrat versionné, à publier et à faire évoluer.

Cette piste n'est pas une décision de ce corpus, parce que le passage des fronts à TypeScript ne
relève pas de `api/`. Elle est consignée dans `../migration-typescript.md`.
