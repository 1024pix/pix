# API interne — outillage

Guide pratique : mettre en place les vérifications automatiques des règles de
[`README.md`](README.md), et corriger les violations qu'elles relèvent.

## État au 2026-09-24

Aucune de ces vérifications n'est en place.

Aucun plugin ESLint maison n'existe : toute règle sur mesure suppose d'abord de créer cette
infrastructure.

La convention de `P5` est décidée, mais pas appliquée partout : c'est `X3` de
[`ecarts.md`](ecarts.md). Tant que `X3` reste ouvert, les deux règles de chemin de `P2` et `P8` sont
ce qui rapporte, et elles ne coûtent que de la configuration.

Le script de génération de `P3` existe, `scripts/generate-api-documentation.js`. Des contextes ont
déjà un `API.md` committé.

## Vérifications

| Invariant | Moyen | Coût | Faux positifs |
| --- | --- | --- | --- |
| **P2** passe par un usecase | règle `dependency-cruiser` : `application/api/**` ne dépend pas de `infrastructure/**` | configuration seule | aucun |
| **P8** pas de transit | règle `dependency-cruiser` : `application/api/**` ne dépend pas d'un autre contexte | configuration seule | aucun |
| **P3** contrat documenté | régénérer `API.md` et comparer au fichier committé | ~10 lignes | aucun |
| **P1** un DTO | règle ESLint : un `return` d'API qui rend directement le résultat d'un usecase | ~40 lignes | un connu, les autres **à mesurer** |
| **P5** emplacement | script : l'objet de contrat est dans `application/api/models/` | ~20 lignes | aucun. **Bloquant après `X3`** |
| **P4** DTO sans comportement | voir `../objet-valeur/outillage.md` | — | — |
| **P6**, **P7**, **P9** | revue | — | — |

### P2 et P8 — deux règles de chemin

Ce sont les deux vérifications les plus rentables.

```js
{
  name: 'internal-api-must-not-access-infrastructure',
  severity: 'error',
  from: { path: 'src/.+/application/api/' },
  to: { path: 'src/.+/infrastructure/' },
}
```

La seconde règle interdit à une API de dépendre d'un **autre** contexte. Elle s'écrit avec un groupe
capturé sur le nom du contexte. La difficulté est la même que pour `U9` de `../usecase/README.md` :
exprimer « un autre contexte que le sien ».

`severity: 'error'` est obligatoire : la valeur par défaut est `warn`, et seul `error` fait échouer la
commande. Le chemin s'écrit `src/.+/` et non `src/[^/]+/`. Sinon, la règle n'atteint pas les contextes
à sous-contextes et ne se déclenche jamais, sans le signaler. La contre-épreuve est obligatoire.

La règle de `P2` signale aussi une API qui expose la configuration de sérialisation de son contexte,
parce que le sérialiseur est importé depuis `infrastructure/`.

### P1 — détecter le modèle du domaine qui fuit

Un sous-cas se détecte sans analyse de flot :

> Dans un fichier de `application/api/`, un `return` ou un `return await` dont l'expression est
> directement un appel sur `usecases`.

C'est le cas le plus simple : le modèle du domaine sort tel quel. Les élargissements, comme une
variable intermédiaire ou une expression conditionnelle, suivent la même progression que `I1` dans
[`../repository/outillage.md`](../repository/outillage.md#i1--deux-étapes), avec le même risque
croissant de faux positifs.

Ce sous-cas a déjà un faux positif : si le usecase renvoie un scalaire ou rien, la fonction n'expose
aucun modèle. C'est la limite de l'indice de diagnostic des tests attendus de
[`README.md`](README.md#tests-attendus).

**Limite.** La règle ne voit pas une API qui construit un objet recopiant exactement le modèle. Ce cas
respecte `P1` à la lettre et viole `P9`. C'est `X5` de [`ecarts.md`](ecarts.md), et seule la revue le
détecte.

### P3 — le générateur est déjà l'oracle

Le script de génération existe. La vérification n'est donc pas à écrire, elle est à **brancher** :
régénérer la documentation et la comparer au fichier committé.

```
diff <(node scripts/generate-api-documentation.js src/<contexte> | grep -v '^This doc has been generated') \
     <(grep -v '^This doc has been generated' src/<contexte>/API.md)
```

**Code.** Le générateur :
[`generate-api-documentation.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/scripts/generate-api-documentation.js#L5-L13).

**Piège.** Le générateur écrit la date de génération en première ligne. La comparaison exclut cette
ligne, sinon elle échoue à chaque exécution.

La vérification tient en dix lignes de test, sans faux positif. Elle est plus forte qu'un script qui
vérifierait la présence d'un commentaire, parce qu'une documentation modifiée sans régénération fait
échouer le test. La documentation committée ne peut donc plus s'écarter de la documentation écrite
dans le code.

**Limite.** La comparaison ne voit pas une fonction exportée sans documentation, que le générateur
omet. Elle ne voit pas non plus une signature changée sans que sa documentation change. Enfin, elle
ne dit pas que la documentation est juste : un contrat mal décrit se régénère fidèlement. `P6`
reste donc en revue.

### Ordre de mise en œuvre

Cet ordre suit le coût, pas le ROI : voir [`explication.md`](explication.md#roi-des-invariants).

1. **P2**, puis **P8** : configuration `dependency-cruiser`, avec contre-épreuve. Introduire une
   violation, vérifier que l'outil la signale, puis la retirer.
2. **P3** : brancher le générateur en test, sur les contextes qui ont déjà un `API.md` committé.
3. **`X3`** : déplacer les objets de contrat vers `models/`, par codemod.
4. **P5** : le script d'emplacement, activable en erreur après `X3`.
5. **P1** : la règle ESLint, en avertissement d'abord.

Les points 1 et 2 ne dépendent de rien.

### Corriger les violations

Un codemod peut appliquer une décision. Il ne peut pas en prendre une.

| Écart | Codemod | Ce qu'il fait |
| --- | --- | --- |
| **X3** emplacement | oui, complet | Déplacer vers `models/` et réécrire les imports. La convention étant décidée, il n'y a aucune décision à prendre |
| **X2** usecase manquant | partiel | Remplacer l'appel de repository par un usecase existant, oui. Écrire celui qui manque, non |
| **X1** introduire un DTO | préparation seule | Générer un squelette et un `TODO`. **Jamais** un DTO aux mêmes champs que le modèle : le lint passerait au vert et la dette deviendrait invisible |
| **X4** transit | non | Déplacer la composition chez chaque consommateur est de la conception |

---

## Vérifier par le typage

Forme cible. Les contraintes de syntaxe imposées par la configuration sont dans
`../migration-typescript.md`.

```ts
export type UserDTO = {
  readonly id: number;
  readonly firstName: string;
  readonly lastName: string;
};

export const getActiveByUserIds: (params: { userIds: number[] }) => Promise<UserDTO[]> = async ({ userIds }) => { … };
```

**Code.** Hypothétique : forme typée de
[`UserDTO.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/identity-access-management/application/api/models/UserDTO.js#L1-L7)
et de [`users-api.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/identity-access-management/application/api/users-api.js#L39-L43).

Le typage apporte deux bénéfices, sur deux des invariants de rentabilité forte.

**`P1` devient en partie structurel.** Un type de retour explicite fixe la forme du contrat. Le
compilateur refuse un objet auquel il manque un champ du DTO, ou dont un champ a le mauvais type. Il
accepte en revanche un modèle qui a plus de champs que le DTO, parce que le typage est structurel.
Seul un DTO construit explicitement empêche le modèle de fuir.

**`P6` devient visible.** Un changement de contrat devient un changement de type, donc un changement
revu, et non un renommage discret dans un objet littéral.

Le typage ne couvre pas `P9`. Un DTO typé peut recopier le modèle champ par champ, et le compilateur
n'a rien à dire.

Une API en `.ts` qui importe ses usecases depuis des `.js` vérifie déjà la forme de son propre DTO.
Le motif est dans [`explication.md`](explication.md#pourquoi-le-typage-rapporte-plus-ici).
