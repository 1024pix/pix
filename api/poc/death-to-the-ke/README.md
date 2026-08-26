# POC — Death to the KE

Remplacer le stockage par `knowledge-elements` (un enregistrement par acquis)
par un **état de connaissance par tube** (un enregistrement par couple
utilisateur/tube), **sans changer les règles métier**.

Périmètre : positionnement et parcours. La certification est hors sujet
(V3/flash repose sur un modèle IRT distinct qui n'utilise pas les KE).

## Le modèle cible

```
AVANT   réponse ──> knowledge-elements ──> score ──> niveau
                    (~295 lignes/user, réécrites)

APRÈS   réponse ──> knowledge-states ──> acquis inférés ──> score ──> niveau
                    (~73 lignes/user)      └──── code de scoring inchangé ────┘
```

L'état porte, par couple (utilisateur, tube) :

| Champ                                                                           | Rôle                                                                  |
| ------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `floor`                                                                         | niveau du plus haut acquis validé — sert au calcul du score           |
| `ceiling`                                                                       | niveau du plus bas acquis invalidé — sert à l'algorithme de sélection |
| `directLevels`                                                                  | niveaux réellement posés à l'utilisateur, par opposition aux inférés  |
| `directLevels` est indispensable : `cat-algorithm.js` n'estime le niveau de     |
| l'utilisateur qu'à partir des réponses **directes**. Sans lui, le niveau prédit |
| change, donc l'ordre des questions aussi.                                       |

**L'état est persisté, et fait seul autorité** : les réponses ne sont jamais
relues. Elles sont purgées au bout d'un certain temps — un état qui en
dépendrait disparaîtrait avec elles. Les profils antérieurs à la bascule
passent par la reprise de données (`02-backfill.sql`), pas par un rejeu.

Le score et le niveau se recalculent depuis l'état en inférant les acquis
situés sous le plancher, puis en appliquant **le code de scoring actuel**
(`scoring-service.js`, inchangé) :

```
score compétence  = min(floor(Σ pixValue des acquis inférés), MAX_REACHABLE_PIX_BY_COMPETENCE)
niveau compétence = min(floor(score exact / PIX_COUNT_BY_LEVEL), MAX_REACHABLE_LEVEL)
```

## Diagnostic : pourquoi la table grossit

Trois causes distinctes, de poids très différents.

**1. Les inférences.** Chaque réponse valide ou invalide en cascade les acquis
du même tube. C'est la cause structurelle, et c'est exactement ce que l'état
par tube compresse.

**2. La réécriture délibérée.** Documentée dans `KnowledgeElement.js:80-85` :

> Historiquement, on force la création d'un KE inferré sur un acquis sur lequel
> l'utilisateur s'est possiblement déjà positionné par le passé […] pour :
>
> - forcer la réactualisation du nombre de pix rapportés par acquis (un acquis
>   peut changer de pixValue à mesure que le référentiel évolue)
> - pour gérer les trous dans le référentiel

La table conserve donc **plusieurs versions du même couple (user, skill)**, et
la déduplication se fait à la lecture (`toLatestUniqNonResetCollection`).
Mesuré par **M2b**.

**3. La conséquence.** Ces réécritures existent pour compenser deux propriétés
du référentiel que le modèle cible traite nativement — `pixValue` vivante et
trous de niveaux. Le modèle cible attaque donc la cause racine, pas le symptôme.

## Contraintes du référentiel à connaître

Vérifiées sur `learningcontent.skills` :

- **`pixValue` est uniforme par (compétence, niveau)** et vaut `8 / N` où N est
  le nombre d'acquis du niveau dans la compétence. Aucune exception.
  Conséquence : **chaque niveau vaut exactement 8 pix**, qu'il contienne 2
  acquis ou 12. Toute règle à seuil absolu (« au moins 3 tubes ») casse cette
  normalisation — bloquante sur les petits niveaux, inflationniste sur les gros.
- **107 tubes sur 407 (26 %) ont des trous de niveaux** : le tube saute des
  niveaux. Un plancher ne suffit donc pas à énumérer les acquis validés — il
  faut relire le référentiel du tube. **L'état n'est pas auto-suffisant.**
- Le référentiel plafonne à **niveau 7** (Pix cœur) et **niveau 5** (Pix+ Édu,
  Droit), sous le `MAX_REACHABLE_LEVEL = 8` applicatif de production.
- **6 compétences Pix+ ont 1 ou 2 tubes au total**, et une compétence cœur
  (`recMiZPNl7V1hyE1d`) n'a que 2 tubes au niveau 1.

## Les deux seuls écarts fonctionnels attendus

Le modèle cible étant iso-règles, seuls deux mécanismes peuvent faire diverger
les valeurs. Tout écart mesuré en dehors de ces deux-là signale un défaut du
modèle et doit être investigué.

**Écart 1 — la monotonie comble les trous.** Un profil ayant un acquis validé
de niveau 5 mais pas de niveau 3 dans le même tube verra son score **monter**.
Chaque trou comblé vaut exactement `8/N` pix. Mesuré par **M3** et **M4**.

**Écart 2 — `earnedPix` figé vs `pixValue` vivante.** La colonne `earnedPix` est
figée à l'écriture du KE ; le modèle cible recalcule au référentiel courant.
Plus juste, mais différent. Mesuré par **M6**.

## Mesures

```bash
# Production / recette — échantillon de 0,5 % des users
psql "$DATABASE_URL" -v sample_pct=0.5 -f 01-mesures.sql

# Local
docker cp 01-mesures.sql pix-api-postgres:/tmp/ && \
docker exec pix-api-postgres psql -U postgres pix -v sample_pct=100 -f /tmp/01-mesures.sql
```

Lecture seule, aucun DDL hors tables `TEMP`. Reproduit la déduplication
`toLatestUniqNonResetCollection` (un KE par couple user/skill, le plus récent,
hors `status = 'reset'`).

| Mesure | Question                                                                      |
| ------ | ----------------------------------------------------------------------------- |
| **M1** | Volumétrie, facteur de compression, distribution des KE par user              |
| **M2** | Répartition source/status, et nombre de versions par couple (user, skill)     |
| **M3** | Combien de profils ont des trous, et de quelle nature                         |
| **M4** | Delta de score et de niveau induit par la monotonie                           |
| **M5** | Bascules de certifiabilité (fonction à seuil, `≥ 5` compétences niveau `≥ 1`) |
| **M6** | Désynchronisation `earnedPix` / `pixValue`                                    |
| **M7** | Coût de lecture du modèle cible : ratio KE / answers par user                 |
| **M8** | Reconstructibilité des KE directs depuis les answers                          |

## Critères de décision

À trancher **avant** d'écrire du code applicatif.

| Mesure                      | Seuil      | Décision si le seuil n'est pas tenu                                                                                             |
| --------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------- |
| M1 `facteur_de_compression` | ≥ 3        | Le gain de volumétrie ne justifie pas le chantier                                                                               |
| M7 `ratio_ke_sur_answers`   | **> 1,5**  | **Rédhibitoire** : charger les answers coûterait plus cher que les KE, la perf de lecture se dégraderait au lieu de s'améliorer |
| M8 `skill_different`        | 0          | Des challenges ont changé de skill : la reconstruction depuis les answers diverge, l'iso-comportement de l'algo tombe           |
| M5 `perdent_certifiabilite` | 0          | Des utilisateurs perdraient l'accès à la certification : blocage produit                                                        |
| M4 `pct_niveau_modifie`     | à arbitrer | Chiffre à porter au produit, pas de seuil technique                                                                             |

## Ce qui est construit

### Dans le code

| Fichier                                                                | Rôle                                                                                                                     |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `src/shared/domain/models/KnowledgeState.js`                           | Le modèle natif : bornes par tube, application d'une réponse, dépliage en acquis, restrictions                           |
| `src/shared/infrastructure/repositories/knowledge-state-repository.js` | Persistance de l'état (lecture, upsert, oubli d'une compétence)                                                          |
| `src/shared/domain/services/knowledge-state-snapshot.js`               | Compression des instantanés de participation, lecture rétrocompatible des instantanés v1                                 |
| `db/migrations/…_add-knowledge-states-table.js`                        | La table d'état — clé `(userId, tubeId)`, sans `competenceId` : le référentiel rattache déjà chaque tube à sa compétence |
| `db/migrations/…_drop-knowledge-elements-table.js`                     | Supprime la table historique                                                                                             |
| `db/migrations/…_rename-knowledge-element-snapshots-table.js`          | Renomme la table d'instantanés en `knowledge-state-snapshots`                                                            |
| `db/database-builder/factory/build-knowledge-state.js`                 | Fixture de test : profil déjà constitué, réponses purgées                                                                |
| `db/database-builder/factory/build-answered-skill.js`                  | Fixture de test : faire répondre un utilisateur                                                                          |
| `db/database-builder/factory/build-knowledge-element.js`               | Shim de test : vocabulaire historique, écrit de l'état                                                                   |

Il n'y a plus d'adaptateur : `KnowledgeState` est la monnaie d'échange dans
tous les contextes (`evaluation`, `prescription`, `certification`, `devcomp`,
`profile`, `quest`, `shared`), et le service
`knowledge-state-for-participation-service` route entre état vivant et
instantané selon le type de campagne.

### Dans le POC

| Fichier               | Rôle                                                                 |
| --------------------- | -------------------------------------------------------------------- |
| `01-mesures.sql`      | 8 mesures préparatoires, exécutables en production                   |
| `02-backfill.sql`     | Matérialise `knowledge-states` depuis les knowledge elements         |
| `03-verification.sql` | Recalcule score, niveau et certifiabilité des deux façons et compare |

Les prototypes JS du POC (`knowledge-state.js`, `virtual-knowledge-elements.js`
et leurs tests d'équivalence) ont été retirés une fois l'implémentation native
en place : leur rôle — prouver l'équivalence avant de basculer — est rempli, et
le modèle vit désormais dans `src/` avec ses propres suites.

```bash
NODE_ENV=test node ./node_modules/mocha/bin/mocha 'tests/evaluation/**/*test.js'
```

## Résultats

**L'état par tube est une représentation exacte, pas une approximation.**
`_createInferredKnowledgeElements` ne propage que dans le tube — vers le bas
quand la réponse est juste, vers le haut quand elle est fausse. Après N
réponses, l'ensemble des knowledge elements d'un assessment est donc exactement
décrit par `(plus haut validé, plus bas invalidé)`. Un acquis déjà évalué
n'étant jamais réévalué, `plancher < plafond` tient toujours : **aucun trou
n'est possible à l'intérieur d'un assessment**.

Vérifié sur **2000 séquences de réponses aléatoires** : mêmes acquis validés,
mêmes acquis invalidés, même score exact par compétence que le code de
production.

**L'algorithme tourne sans knowledge elements, à l'identique.**
Plutôt que de le réécrire — ce qui aurait demandé de prouver une ressemblance —
on lui fournit la même entrée, reconstituée depuis l'état. Il n'est pas modifié
d'une ligne, donc l'iso-comportement est garanti par construction.

Vérifié sur **300 parcours complets simulés** : à chaque tour, mêmes acquis
proposés, même niveau estimé, même condition de fin.

Les deux suites ont été validées par mutation : cinq mutants (plancher exclusif,
réévaluation autorisée, sens d'inférence inversé, source toujours inférée,
acquis invalidés omis) sont tous détectés.

**La suite `evaluation` passe intégralement** — 1258 tests — knowledge elements
débranchés.

**Ce que l'algorithme consommait réellement.** Les knowledge elements ne lui
servaient qu'à deux choses, désormais couvertes sans eux :

| Usage                                            | Remplacé par             |
| ------------------------------------------------ | ------------------------ |
| `getPredictedLevel` (filtre `source === DIRECT`) | `directLevels` de l'état |
| `getUntestedSkills`, `computeReward`             | les bornes de l'état     |

## Bascule

Le prototype se contente des migrations : `npm run db:migrate` crée
`knowledge-states` et supprime `knowledge-elements`.

Sur une base qui porte des données, les deux étapes suivantes s'intercalent
entre la création de `knowledge-states` et la suppression de
`knowledge-elements` — l'ordre importe, la table historique étant la source du
backfill. En local elle a déjà disparu : `02-backfill.sql` et
`03-verification.sql` n'y sont plus exécutables, ils décrivent le chemin de
reprise d'une base réelle.

```bash
# 1. mesurer (facultatif mais recommandé)
psql "$DATABASE_URL" -v sample_pct=0.5 -f poc/death-to-the-ke/01-mesures.sql

# 2. matérialiser l'état AVANT de basculer les écritures
psql "$DATABASE_URL" -f poc/death-to-the-ke/02-backfill.sql
```

Le backfill part des **knowledge elements**, pas des réponses : celles-ci sont
purgées, eux non. Ils sont la seule trace restante de l'état des utilisateurs
anciens. Il est idempotent.

Deux contrôles à lire dans sa sortie :

- `etats_contradictoires` — tubes où le plafond est passé sous le plancher, deux
  parcours s'étant contredits. Le plafond est relevé : la validation gagne,
  comme lorsque la lecture applicative retient le knowledge element le plus
  récent. Sur les seeds : 184 sur 5894 états.
- `perte_reelle` — **doit valoir 0**. Les utilisateurs sans état ne sont pas une
  perte tant que leurs knowledge elements portent sur des acquis disparus du
  référentiel : ils n'ont déjà aujourd'hui ni score ni niveau. Sur les seeds :
  110 utilisateurs non couverts, 228 knowledge elements orphelins,
  `perte_reelle = 0`.

Facteur de compression mesuré sur les seeds : **4,13**.

### Vérifier la bascule

`03-verification.sql` recalcule score, niveau et certifiabilité des deux façons
— depuis les knowledge elements, puis depuis l'état — et compare, utilisateur
par utilisateur et compétence par compétence. À lancer après le backfill, tant
que les deux représentations coexistent.

Il ne se contente pas de constater les écarts : il vérifie qu'ils s'expliquent
**exactement** par la monotonie, c'est-à-dire par la somme des `pixValue` des
acquis situés sous le plancher que l'utilisateur n'avait jamais réussis. Un
écart non expliqué signale un défaut du modèle.

Résultat sur les seeds :

```
649 couples utilisateur/compétence comparés
649 écarts entièrement expliqués par la monotonie · 0 inexpliqué
résidu maximal 0,0001  (arrondi flottant)

certifiabilité :  0 gain · 0 perte
```

Les scores montent — 45 utilisateurs sur 93, jusqu'à +176 pix — parce que les
seeds fabriquent des profils très troués. L'écart est toujours positif, jamais
arbitraire.

### Bascule vérifiée en local

La table `knowledge-elements` a été vidée : les scores restent calculables
depuis le seul état, et les suites `evaluation` (143 tests d'acceptance),
`profile` et `devcomp` (1386 tests) passent sans elle.

## Instantanés de participation

Un instantané fige ce que l'utilisateur savait au moment où il a partagé sa
participation. Il ne peut pas disparaître au profit de l'état : l'état ne décrit
que le présent, et une fois les réponses purgées plus rien ne permet de
reconstituer un passé antérieur à lui. Pour les campagnes de type EXAM, il est
même la source de vérité, celle qui isole la participation du profil global.

En revanche, rien n'obligeait les deux à se représenter différemment :
l'instantané fige le temps, l'état compresse l'espace. L'instantané retient donc
désormais lui aussi un état par tube.

```json
{
  "version": 2,
  "tubes": {
    "sourceImage": { "floor": 3, "ceiling": 5, "directLevels": [3, 5], "competenceId": "rec…", "createdAt": "…" }
  }
}
```

Les instantanés écrits avant la bascule restent lisibles : ils se reconnaissent
à leur forme de tableau, et sont dépliés tels quels. Aucune migration n'est
nécessaire ; ils se convertissent au prochain partage.

Compression mesurée sur les instantanés existants : **3,22** (20 611 knowledge
elements pour 6 399 tubes, sur 136 instantanés).

`save()` prend maintenant `knowledgeElements` plutôt qu'un instantané déjà
sérialisé : la compression a besoin du référentiel, qui est affaire
d'infrastructure. Les deux appelants ont été adaptés.

## Limite connue : la fusion multi-assessments

L'invariant `plancher < plafond` vaut **à l'intérieur d'un assessment**. Il
tombe dès qu'on fusionne : un assessment peut avoir validé `@tube5` pendant
qu'un autre invalidait `@tube3`. Le cas est matérialisé par un test, et traité
par le backfill (`etats_contradictoires`).

En fonctionnement courant, la règle « un acquis déjà évalué n'est pas réévalué »
suffit à préserver l'invariant : l'état ne fait que se resserrer, le plancher
monte et le plafond descend.

## Points ouverts

1. **Précision des dates.** L'état porte une date par tube, là où chaque
   knowledge element portait la sienne. `Scorecard.computeRemainingDaysBeforeReset`
   (J+7) et `improvement-service` (J+4) s'en accommodent — ils raisonnent sur le
   plus récent — mais la granularité est perdue.
2. **Lecture datée en certification V2.** `scoring-v2.js` lit le profil à
   `limitDate = reconciledAt`. L'état ne décrivant que le présent, un tube qui a
   bougé entre le rattachement et le calcul est écarté : le candidat serait noté
   sur un profil plus pauvre. Le remède existe dans le dépôt — figer un
   instantané au rattachement, comme le partage de campagne le fait au partage.
3. **Reprise de données.** Le prototype n'en fait aucune : la table historique
   est supprimée telle quelle. `02-backfill.sql` reste le chemin à emprunter
   sur une base réelle, où elle est la seule trace de l'état des utilisateurs
   dont les réponses ont été purgées.
4. **Unifier instantanés et état** : les campagnes EXAM pourraient s'appuyer sur
   `knowledge-states` avec un `campaignParticipationId` nullable, plutôt que sur
   un JSONB à part. Un seul modèle au lieu de deux.

## Ce que la bascule a appris des fixtures

Deux hypothèses que les tests portaient et que le référentiel réel ne porte pas :

- **Un acquis vaut ce que le test lui donne.** `earnedPix` était figé à
  l'écriture ; il se lit maintenant sur l'acquis. Un test qui fabriquait un
  knowledge element à 23 pix décrit désormais un acquis qui en vaut 23.
- **Deux acquis d'un même tube sont indépendants.** L'inférence les relie :
  réussir le niveau 4 valide le niveau 2. Les fixtures qui voulaient des acquis
  sans lien leur donnent chacun leur tube — ce qui est aussi la règle appliquée
  aux acquis sans tube (`tubeIdOf`).
