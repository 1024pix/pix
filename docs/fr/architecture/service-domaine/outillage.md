# Domain Service — outillage

Guide pratique : mettre en place les vérifications automatiques des règles de
[`README.md`](README.md), et corriger les violations qu'elles relèvent.

## État au 2026-09-24

Aucune de ces vérifications n'est en place. Il n'existe pas de plugin ESLint maison : toute règle sur
mesure suppose d'abord de créer cette infrastructure, et les coûts ci-dessous ne comptent que la
règle.

## Vérifications

L'invariant qui définit la catégorie, D1, se lit dans la signature.

| Invariant | Moyen | Coût | Faux positifs |
| --- | --- | --- | --- |
| **D1** aucune I/O, signature | règle ESLint : paramètre en `/(Repository\|Api\|Storage)$/` dans `domain/services/` | ~20 lignes | aucun |
| **D1** aucune I/O, imports | règle `dependency-cruiser` de chemin | configuration seule | aucun |
| **D3** sans état | règle ESLint : champ de classe dans un fichier de `domain/services/` | ~15 lignes | faibles |
| **Tests** un test unitaire existe | script `tests/tooling/` | ~30 lignes | aucun |
| **D5** nommé par la règle | script : nom de fichier terminant par `-service` | ~15 lignes | **non mesurés** |
| **D2** objets du domaine en entrée et en sortie | revue | — | — |
| **D4** dernier recours | revue | — | — |

### D1 — la règle qui force la décision

```
Dans un fichier de domain/services/, un paramètre déstructuré dont le nom
correspond à /(Repository|Api|Storage)$/.
```

La règle n'a besoin que de la signature.

Elle se déclenchera sur le code existant, et c'est voulu : chaque fichier signalé contient un
usecase. Il se classe avec le [test de discrimination](README.md#le-test-de-discrimination), puis se
déplace ou se découpe. La règle reste en avertissement pendant ce classement, puis passe en erreur.

La même analyse de la signature sert au discriminant de `../usecase/outillage.md`. Elle sert aussi à
l'étape 1 de I1 dans [`../repository/outillage.md`](../repository/outillage.md#i1--deux-étapes), qui
repère déjà les paramètres en `/Api$/`. Le coût supplémentaire est donc faible.

La règle `dependency-cruiser` complète la précédente pour les imports directs :

```js
{
  name: 'domain-service-must-not-do-io',
  severity: 'error',
  from: { path: 'src/.+/domain/services/', pathNot: 'domain/services/index\\.js$' },
  to: { path: 'src/.+/infrastructure/' },
}
```

Deux pièges :

- `severity: 'error'` est obligatoire. La valeur par défaut est `warn`, et seul `error` fait échouer
  la commande.
- Le chemin s'écrit `src/.+/`, pas `src/[^/]+/`. Avec la seconde forme, la règle n'atteint pas les
  contextes à sous-contextes. Elle ne s'y déclenche jamais, sans aucun message.

### L'existence du test unitaire comme indicateur

Un fichier de `domain/services/` sans test unitaire est soit non testé, soit testé en intégration.
Dans le second cas, D1 est probablement violé. Le script ne prouve rien : il montre où regarder.

La correspondance se fait sur le nom de base, sans le suffixe de test. Les chemins ne sont pas
comparés, car le fichier et son test peuvent être dans des dossiers différents. Le suffixe varie aussi
d'un contexte à l'autre.

### Ce qui n'est pas mécanisable

D4 est, avec D1, l'invariant le plus rentable, et c'est le moins vérifiable. Savoir si une règle
aurait pu vivre sur un objet suppose de connaître cet objet.

Le seul indicateur connu est le signal de D4 : un seul objet du domaine, ou une seule collection, en
entrée. Il justifie une revue, pas un verdict. Il ne couvre pas le cas le plus fréquent : une règle
sur deux objets, qui appartenait à l'un des deux.

### Ordre de mise en œuvre

Cet ordre suit le coût, pas le ROI : voir [`explication.md`](explication.md#roi-des-invariants).

1. **D1 imports** : configuration `dependency-cruiser`, avec contre-épreuve. Introduire une
   violation, vérifier que l'outil la signale, puis la retirer.
2. **D1 signature** en avertissement, pour produire la liste des fichiers à classer.
3. **X1** : classer les fichiers avec le [test de discrimination](README.md#le-test-de-discrimination),
   puis déplacer ou découper ceux qui contiennent un usecase. Voir `X1` de [`ecarts.md`](ecarts.md).
4. **D1 signature** en erreur.
5. **D3** : règle sur les champs de classe.
6. **Existence des tests et D5** : un seul script, une fois le dossier stabilisé.

Les étapes 2 et 3 représentent l'essentiel du travail. L'étape 3 n'est pas de l'outillage.

### Corriger les violations

Un codemod peut appliquer une décision. Il ne peut pas en prendre une.

| Écart ou invariant | Codemod | Ce qu'il fait |
| --- | --- | --- |
| **X1** déplacement | oui, une fois le fichier classé | Déplace un fichier de `services/` vers `usecases/` et réécrit ses imports. Signale un câblage dédié au lieu de deviner |
| **X3** découpage | partiel | Sépare des fonctions indépendantes en fichiers nommés. Ne décide pas où vont les fonctions privées partagées |
| **D5** renommage | oui, complet | Renomme le fichier et réécrit les imports |
| **X2** déplacement de règle | non | Choisir l'objet qui porte la règle est de la conception |

---

## Vérifier par le typage

Forme cible, pour la forme préférée d'un Domain Service : un module de fonctions. Son typage n'a rien
de particulier : des paramètres nommés, des objets du domaine en entrée et en sortie.

```ts
export function filterKnowledgeElements(params: {
  knowledgeElements: readonly KnowledgeElement[];
  createdAt: Date;
  isRetrying?: boolean;
  isImproving?: boolean;
  isFromCampaign?: boolean;
  minimumDelayInDaysBeforeImproving?: number;
}): readonly KnowledgeElement[] { … }
```

**Code.** Forme hypothétique, tirée de la signature de D1 dans [`README.md`](README.md#d1-aucune-io-aucune-dépendance-injectée).

Le typage rend D1 en partie visible dans la structure. Un paramètre typé `ModuleMetadataRepository`
apparaît dans la signature : la violation se lit sans exécuter le fichier. Avec la règle ESLint de
[D1](#d1--la-règle-qui-force-la-décision), il ne reste rien à deviner.

Le typage ne couvre ni D3 ni D4 :

- L'absence d'effet sur les entrées ne s'exprime pas dans un type. `readonly` n'interdit l'écriture
  que pendant la vérification des types, et disparaît à la compilation. Il ne dit rien des méthodes
  qui modifient l'objet reçu.
- Rien dans un type ne dit qu'une règle aurait pu vivre ailleurs.

Les contraintes de syntaxe imposées par la configuration sont dans `../migration-typescript.md`.
