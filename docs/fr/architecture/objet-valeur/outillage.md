# Value Object — outillage

Guide pratique : mettre en place les vérifications automatiques des règles de
[`README.md`](README.md), et corriger les violations qu'elles relèvent.

## État au 2026-09-24

Aucune de ces vérifications n'est en place. Aucun plugin ESLint maison n'existe : toute règle sur
mesure suppose d'abord de créer cette infrastructure, et les coûts ci-dessous ne comptent que la
règle.

Les taux de faux positifs annoncés sont estimés, pas mesurés. Toute hypothèse sur le comportement d'un
outil se vérifie par contre-épreuve :

- introduire la violation ;
- confirmer que l'outil la signale ;
- retirer la violation.

## Vérifications

| Invariant | Moyen | Coût | Faux positifs |
| --- | --- | --- | --- |
| **V4** aucune I/O | règle `dependency-cruiser` de chemin, pour les imports seulement. L'horloge, l'aléatoire et la configuration restent en revue | configuration seule | aucun |
| **V1** immuabilité | règle ESLint : champ de classe public | ~30 lignes | aucun attendu |
| **V7** exposition en lecture seule | même règle, élargie | ~30 lignes de plus | faibles |
| **V6** aucun cycle de vie propre | script `tests/tooling/` : aucun repository ne porte le nom d'un Value Object | ~20 lignes | faibles |
| **Tests** un fichier de test existe | même script | ~15 lignes de plus | aucun |
| **X5** clé composée dans le domaine — signal | règle ESLint : affectation à `id` depuis un littéral de gabarit | ~20 lignes | aucun faux positif syntaxique ; ne dit pas lequel des cas de V2 s'applique, donc jamais bloquante |
| **V2** aucune identité | règle ESLint : accesseur ou champ nommé `id` | ~15 lignes | **nombreux avant X5** — voir plus bas |
| **V3**, **V5**, **V8** | revue | — | — |

### V4 — une règle de chemin

```js
{
  name: 'domain-model-must-not-import-infrastructure',
  severity: 'error',
  from: { path: 'src/.+/domain/models/' },
  to: { path: 'src/.+/infrastructure/' },
}
```

`severity: 'error'` est obligatoire. La valeur par défaut est `warn`, et seul `error` fait échouer la
commande.

Le chemin s'écrit `src/.+/`, pas `src/[^/]+/`. Avec la seconde forme, les contextes à sous-contextes
ne sont pas atteints : la règle ne s'y déclenche jamais, sans aucun message.

La règle jumelle interdit à une règle du domaine d'importer un read-model. Elle est dans
`../read-model/outillage.md`, sous l'invariant RM3.

### V1 et V7 — une seule règle ESLint

Trois motifs syntaxiques, tous locaux au fichier :

- une déclaration de champ de classe sans `#` ;
- un `Object.freeze(x)` dont la cible n'a que des champs privés, ou dont le résultat n'est pas la
  valeur renvoyée ;
- un accesseur dont le corps est un `return this.#champ` où le champ est initialisé par un tableau.

Le troisième est le plus utile et le plus délicat : il demande de remonter à l'initialisation pour
connaître le type. La règle se limite au cas évident : un champ initialisé à `[]`, ou affecté depuis un
paramètre par défaut `= []`.

Le motif ne couvre ni un champ rempli par un appel, comme `#tubesWithLevels` dans l'exemple fautif de
V7, ni un accès imbriqué rendu sans copie, comme le serait `return this.#coreChallenge.attachments`. Ces cas restent à la revue,
d'où le statut `[partiel]` de V7 dans la checklist.

### X5 et V2 — dans cet ordre

Les deux règles regardent le même champ, et l'ordre entre elles compte.

**X5 d'abord.** Le signal est syntaxique, et il ne donne aucun faux positif sur sa forme :

> Une affectation à une propriété `id`, dont la valeur est un littéral de gabarit, dans un fichier du
> domaine.

La règle ne dit pas lequel des trois cas de V2 s'applique : elle désigne l'endroit où faire le
classement. Elle n'est donc jamais bloquante, car les cas 2 et 3 sont légitimes.

**V2 ensuite.** Un champ ou accesseur `id` dans un fichier de Value Object. Cette règle est inexploitable
avant X5 : les clés de présentation composées dans le domaine la déclenchent toutes, et rien ne les
distingue d'une identité réelle. Une fois X5 traité, restent deux sortes d'`id` légitimes : les
identifiants d'autre chose, que V2 autorise, et les identifiants composites du deuxième cas de V2. Une
liste d'exclusion couvre les deux.

### V6 et l'existence des tests — un script

Le script parcourt les fichiers de Value Objects et de DTO. Deux vérifications :

- **V6** : aucun fichier de `infrastructure/repositories/` ne porte le nom d'un Value Object. Faux
  positifs faibles : une homonymie entre un Value Object et une Entity est possible.
- **Tests** : chaque fichier a un fichier de test. La correspondance se fait sur le nom de base, après
  retrait du suffixe de test, car le fichier peut être dans un sous-dossier et son test à un autre
  endroit. Le suffixe de test varie aussi d'un endroit à l'autre. La comparaison couvre les deux sens :
  un objet sans test, et un test dont aucun objet ne porte le nom. Ce second sens attrape la faute de
  frappe dans un nom de fichier de test.

### Ordre de mise en œuvre

Cet ordre suit le coût, pas le ROI : voir [`explication.md`](explication.md#roi-des-invariants).

1. **V4**, configuration `dependency-cruiser`, avec contre-épreuve
2. **V1** puis **V7**, première règle ESLint sur mesure, ce qui suppose de créer l'infrastructure
3. **V6** et l'existence des tests, un seul script de complétude
4. **X5** signal, puis le classement des trois cas, fichier par fichier
5. **V2**, après X5, avec la liste d'exclusion des `id` légitimes

### Codemods

Critère de découpe : un codemod peut appliquer une décision, il ne peut pas en prendre une.

| Invariant | Codemod | Ce qu'il fait |
| --- | --- | --- |
| **V1**, **V7** | oui | Passer un champ public en champ privé avec accesseur, et renommer les usages |
| **X5** cas 1 | oui, une fois le classement fait | Retirer l'affectation de l'objet et composer la clé dans le sérialiseur, à valeur identique : la réponse de l'API ne change pas |
| **V3**, **V5** | non | Chaque cas demande de décider quelle règle valider, et où elle vit |

Un cas d'arrêt sur V1 : si un champ public est **écrit** depuis l'extérieur, le codemod ne peut pas le
privatiser sans casser. Il signale et s'arrête, il n'ajoute pas de mutateur.

---

## Vérifier par le typage

Forme cible d'un Value Object : une classe avec champ privé. Elle ne s'applique qu'après la migration
des modèles en `.ts` : voir `../migration-typescript.md`, qui porte aussi les contraintes de syntaxe
imposées par la configuration. Le choix entre type structurel et classe est expliqué dans
[`explication.md`](explication.md#la-forme-du-type).

```ts
export class AnswerStatus {
  readonly #status: string;
  constructor({ status }: { status: string }) { /* validation */ this.#status = status; }
  isOK(): boolean { return this.#status === statuses.OK; }
}
```

**Code.** Extrait hypothétique, sans lien.

Le champ `#` rend le type non assignable depuis une forme identique. C'est ce qui rend V3 et V8
vérifiables par le compilateur.

`readonly` est effacé à la compilation : il empêche l'écriture au typage, pas à l'exécution. V1 repose
sur les champs privés, pas sur `readonly`.
