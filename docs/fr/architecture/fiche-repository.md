# Fiche — `infrastructure/repositories/`

Fiche générique. Elle décrit l'état cible, où tout est en TypeScript.

Le gabarit commun, l'état du chantier et l'ordre de relecture sont dans `corpus-index.md`. L'écart avec
le code réel est mesuré dans les rapports de divergence, un par contexte. Ce qui empêche aujourd'hui le
typage de mordre est dans `migration-typescript.md`.

> **À instruire**
>
> - I1 et I2 s'énoncent en termes d'« objet du domaine local ». La définition est livrée, au § 1 de
>   `fiche-objet-valeur.md`. À relire une fois pour confirmer qu'elle couvre bien les cas de I1 et I2.
> - Le numéro **I7** n'est pas attribué. Il portait « le modèle ne porte pas de méthode au service de
>   la persistance », qui est un invariant du **modèle** : il vit désormais sous `E5` de
>   `fiche-entite.md`, avec sa vérification. Le numéro n'est pas réattribué.
> - Le grain de chargement — ce qu'un repository peut charger et renvoyer — dépend de la décision sur
>   ce que désigne un dossier `aggregates/`. Voir `fiche-racine-agregat.md`.
> - Les coûts du § 6 ne comptent que la règle elle-même. Il n'existe aucun plugin ESLint maison :
>   toute règle sur mesure suppose de créer cette infrastructure. Ce point est daté : à retirer dès
>   que l'infrastructure existe.
> - Le numéro **I8** n'est pas attribué, et ne le sera pas. Voir la note au § 4.

## Sommaire

[1. Rôle](#1-rôle) · [2. Invariants](#2-invariants) ·
[3. Exceptions légitimes](#3-exceptions-légitimes) · [4. ROI des invariants](#4-roi-des-invariants) ·
[5. Écarts avec Clean Architecture et DDD](#5-écarts-avec-clean-architecture-et-ddd) ·
[6. Vérification déterministe](#6-vérification-déterministe) · [7. Le port](#7-le-port) ·
[8. Tests attendus](#8-tests-attendus) · [9. Checklist de revue](#9-checklist-de-revue) ·
[10. Sources](#10-sources)

**Invariants** — classés par ROI, comme au § 4.

| # | Invariant | ROI | Vérification |
| --- | --- | --- | --- |
| [**I1**](#i1-ne-jamais-renvoyer-une-structure-de-persistance) | ne jamais renvoyer une structure de persistance | **forte** | règle ESLint, en deux étapes |
| [**I4**](#i4-les-erreurs-levées-appartiennent-au-domaine) | les erreurs levées appartiennent au domaine | **forte** | `no-restricted-syntax`, partiel |
| [**I6**](#i6-le-repository-est-enregistré-dans-infrastructurerepositoriesindexjs) | enregistré dans l'index du contexte | **forte** | script |
| [**I11**](#i11-un-repository-nimporte-pas-un-autre-repository) | n'importe pas un autre repository | **forte** | `dependency-cruiser` |
| [**I10**](#i10-aucune-règle-métier-dans-le-repository) *signal* | aucune fonction de lecture qui écrit | **forte** | règle ESLint |
| [**I2**](#i2-ne-jamais-accepter-une-structure-de-persistance-en-entrée) | n'accepte pas de structure de persistance en entrée | moyenne | typage, après migration |
| [**I3**](#i3-get-lève-find-renvoie-null-ou-une-collection-vide) | `get*` lève, `find*` renvoie `null` | moyenne | règle ESLint |
| [**I5**](#i5-les-dépendances-externes-arrivent-en-paramètre-jamais-par-import) | dépendances injectées, jamais importées | moyenne | `dependency-cruiser` |
| [**I10**](#i10-aucune-règle-métier-dans-le-repository) *complet* | aucune règle métier | revue seule | aucun moyen |
| [**I9**](#i9-nommage-du-fichier) | nommage cohérent dans le contexte | hygiène | script |

**Écarts** — triés par verdict, comme au § 5.

| # | Écart | Verdict |
| --- | --- | --- |
| [**X1**](#x1-aucun-port-nest-déclaré) | aucun port n'est déclaré | **à corriger** |
| [**X2**](#x2-méthode-de-persistance-sur-le-modèle) | méthode de persistance sur le modèle | **à corriger** |
| [**X3**](#x3-la-connexion-à-la-base-ne-passe-pas-par-la-signature) | la connexion à la base ne passe pas par la signature | à surveiller |
| [**X4**](#x4-plusieurs-repositories-pour-un-même-agrégat) | plusieurs repositories pour un même agrégat | rien à faire |
| [**X5**](#x5-domainusecasesindexjs-importe-linfrastructure) | `domain/usecases/index.js` importe l'infrastructure | rien à faire |
| [**X6**](#x6-le-repository-couvre-aussi-laccès-aux-contextes-voisins) | le repository couvre aussi l'accès aux contextes voisins | rien à faire |

Deux artefacts hors numérotation, souvent cherchés : la table de décision
[« ce que le repository n'est pas »](#ce-que-le-repository-nest-pas) au § 1, et
[l'avertissement sur `getOrCreate*`](#avertissement) au § 3.

---

## 1. Rôle

Un repository est le port par lequel le domaine atteint l'extérieur. Il traduit dans les deux sens
entre le langage du domaine local et une source de données.

Le domaine ne sait pas de quelle source il s'agit. Toutes relèvent de la même couche.

| Source | Va dans |
| --- | --- |
| une table de la base de données | `infrastructure/repositories/` |
| un fichier, un objet stocké | `infrastructure/repositories/` |
| un service HTTP externe | `infrastructure/repositories/` |
| un cache, une file de messages | `infrastructure/repositories/` |
| l'API interne d'un autre contexte borné | `infrastructure/repositories/` |

DDD nomme séparément la couche anti-corruption pour la dernière ligne. Le corpus ne reprend pas cette
distinction. L'écart est instruit au § 5.

### Ce que le repository n'est pas

Table de décision. Si le code correspond à une ligne, il ne va pas dans le repository.

| Le code… | Va dans | Fiche |
| --- | --- | --- |
| enchaîne plusieurs repositories, décide de l'ordre des opérations | `domain/usecases/` | `fiche-usecase.md` |
| applique une règle sur des objets d'une même frontière de cohérence | la racine d'agrégat, dans `domain/models/` | `fiche-racine-agregat.md` |
| applique une règle qui traverse plusieurs agrégats, sans aucune I/O | `domain/services/` | `fiche-service-domaine.md` |
| contraint une valeur | un objet-valeur, dans `domain/models/` | `fiche-objet-valeur.md` |
| valide la cohérence interne d'une entité | le constructeur du modèle, dans `domain/models/` | `fiche-entite.md` |
| décide si un utilisateur a le droit | `domain/usecases/`, ou un pre-handler déclaré sur la route | `fiche-usecase.md`, `fiche-route.md` |
| transforme un modèle en JSON:API pour une réponse HTTP | `infrastructure/serializers/` | `fiche-serialiseur.md` |
| expose une donnée du contexte à un autre contexte | `application/api/` | `fiche-api-interne.md` |

Repère : un repository ne contient aucun branchement sur une condition métier. Un `if` sur
l'existence d'une ligne est légitime. Un `if` sur une propriété métier de l'objet ne l'est pas.

---

## 2. Invariants

### I1. Ne jamais renvoyer une structure de persistance

**Énoncé.** Toute valeur renvoyée est un objet du domaine local, un scalaire, ou une enveloppe de
pagination. Jamais une ligne SQL, jamais le DTO d'un autre contexte, jamais le corps d'une réponse
HTTP.

L'énoncé est en creux. « Renvoie un objet du domaine » serait trop fort et rejetterait du code
correct : voir § 3.

L'invariant se vérifie par fonction, pas par fichier. Un même fichier peut contenir une fonction
conforme et un passe-plat.

```js
// conforme — passage par une fonction de mapping locale
const rows = await knexConnection('organization-learners').where({ organizationId });
return rows.map(_toDomain);

// fautif — passe-plat intégral : le fichier entier fait deux lignes
const canSelfDeleteAccount = async ({ userId, dependencies = { privacyUsersApi } }) => {
  return dependencies.privacyUsersApi.canSelfDeleteAccount({ userId });
};
```

Le second cas est le plus instructif, parce qu'il n'a pas l'air d'un problème : la fonction est
courte, lisible, et son nom est clair. Ce qu'elle renvoie est décidé chez le voisin. Le jour où
`canSelfDeleteAccount` renverra `{ allowed, reason }` au lieu d'un booléen, notre code cassera à
l'exécution sans qu'aucune analyse statique l'ait vu passer.

**Ce qui casse.** Un usecase lit un champ dont la forme est décidée par un autre contexte. Un
renommage là-bas casse le nôtre à l'exécution. `dependency-cruiser` reste vert : la dépendance de
module n'a pas changé.

**À ne pas faire.** Envelopper le DTO étranger dans une classe locale aux mêmes champs. Le lint passe
au vert, la forme de l'autre contexte reste dans le domaine. Il faut un type local dont les champs
sont ceux que le domaine utilise.

### I2. Ne jamais accepter une structure de persistance en entrée

**Énoncé.** Les paramètres métier sont des objets du domaine local, des identifiants ou des
primitives. Jamais une ligne SQL, jamais le DTO d'un autre contexte, même reconditionné en objet
littéral.

```js
// conforme — un objet du domaine, ou des identifiants
await getOrCreateNewOrganizationLearner({ organizationLearner, userId, organizationId });
await findOrganizationLearner({ userId, organizationId });

// fautif — le DTO étranger reconditionné en littéral
const user = await userApi.getUserDetails({ userId });   // I1 violé en amont
await save({ learner: { firstName: user.firstName, lastName: user.lastName } });
```

**Ce qui casse.** Même mécanique que I1, mais la fuite traverse le usecase.

I2 est un corollaire de I1. Il n'a pas de mode de violation propre et tombe si I1 est tenu partout. Il
figure séparément parce que le reconditionnement se relit différemment de la fuite d'origine.

### I3. `get*` lève, `find*` renvoie `null` ou une collection vide

**Énoncé.** Le préfixe du nom annonce le comportement en cas d'absence. `get…` lève une erreur du
domaine. `find…` renvoie `null` pour un élément, un tableau vide pour une collection.

```js
// conforme — get* lève
const getByCode = async ({ code }) => {
  const combinedCourse = await _baseQuery(knexConn).where('code', code).first();
  if (!combinedCourse) {
    throw new NotFoundError(`Le parcours combiné portant le code ${code} n'existe pas`);
  }
  return _toDomain(combinedCourse);
};

// fautif — le même corps, sous un nom qui annonce une lecture tolérante
const findByCode = async ({ code }) => {
  const combinedCourse = await _baseQuery(knexConn).where('code', code).first();
  if (!combinedCourse) {
    throw new NotFoundError(`… ${code} …`);
  }
  return _toDomain(combinedCourse);
};
```

La comparaison est le meilleur argument de l'invariant : **les deux corps sont identiques au
caractère près.** Seul le nom diffère, et c'est lui qui dit à l'appelant s'il doit prévoir un `try`
ou un test à `null`.

**Ce qui casse.** Le nom est le seul contrat disponible sans typage. S'il ne correspond pas au
comportement, chaque site d'appel doit lire l'implémentation.

### I4. Les erreurs levées appartiennent au domaine

**Énoncé.** Un repository lève des erreurs de `domain/errors.js` ou du contexte partagé. Il ne laisse
pas remonter une erreur du pilote de base. Il ne lève pas d'`Error` nu.

```js
} catch (error) {
  // conforme — une contrainte nommée, traduite en erreur du domaine
  if (knexUtils.isUniqConstraintViolated(error) && error.constraint === 'one_active_organization_learner') {
    throw new OrganizationLearnersCouldNotBeSavedError(…);
  }

  // fautif — la ligne suivante du même catch
  throw error;
}
```

Le motif fautif est le `catch` qui traduit un cas connu et relâche les autres, et les deux formes
cohabitent dans le même bloc. Le nom `one_active_organization_learner` est ce qui rend la première
branche possible : la contrainte dit l'intention métier, donc la traduction est mécanique. Il faut une
erreur de domaine générique pour les violations non reconnues.

**Ce qui casse.** Le mappeur d'erreurs associe les erreurs du domaine aux codes HTTP et à un code
d'erreur exploitable par le front. Une erreur non domaine sort en 500, sans code ni métadonnées : le
client ne peut ni la traiter ni la traduire.

**Prérequis.** La traduction n'est possible que si les contraintes de base portent un nom exprimant
l'intention métier. C'est une décision distincte, déjà prise. Voir § 11.

### I5. Les dépendances externes arrivent en paramètre, jamais par import

**Énoncé.** Un repository n'importe pas l'API interne d'un autre contexte, ni un client de stockage,
ni un client HTTP. Il les reçoit en paramètres nommés, remplis par l'injection depuis
`infrastructure/repositories/index.js`.

```js
// conforme — l'index du contexte importe l'API, le repository la reçoit
// infrastructure/repositories/index.js
import * as userApi from '../../../identity-access-management/application/api/users-api.js';

// fautif — le repository importe lui-même, et se donne l'API comme valeur par défaut
import * as privacyUsersApi from '../../../privacy/application/api/users-api.js';

const canSelfDeleteAccount = async ({ userId, dependencies = { privacyUsersApi } }) => { … };
```

La forme fautive est la plus fréquente, et c'est celle qui trompe : `dependencies` est bien un
paramètre, donc le test peut substituer une doublure. Mais l'import reste écrit dans le fichier, donc
la dépendance de module existe, donc `dependency-cruiser` la voit et la règle de contexte se
déclenche. **Le paramètre rend testable sans rendre découplé.**

**Exception.** L'accesseur de connexion à la base est importé, pas injecté. C'est la conséquence du
choix d'ambient context pour la transaction. C'est la seule dépendance dans ce cas.

**Ce qui casse.** Sous ESM les exports sont immuables. Sans injection, la dépendance ne peut pas être
substituée par une doublure de test : le repository devient intestable en unitaire.

### I6. Le repository est enregistré dans `infrastructure/repositories/index.js`

**Énoncé.** Tout fichier de `infrastructure/repositories/` figure dans l'objet des repositories de
l'index du contexte.

```js
// conforme — l'index importe l'API du voisin et le repository, puis les marie
import * as userApi from '../../../identity-access-management/application/api/users-api.js';
import * as combinedCourseRepository from './combined-courses/combined-course-repository.js';
import boundedContext from '../../dependencies.json' with { type: 'json' };

const repositoriesWithoutInjectedDependencies = { combinedCourseRepository, /* … */ };
const dependencies = { userApi, /* … */ };
const repositories = injectDependencies(repositoriesWithoutInjectedDependencies, dependencies, boundedContext);

// fautif — le fichier existe dans le dossier et n'est pas déclaré ici
```

C'est ce fichier, et lui seul, qui a le droit d'importer les API des contextes voisins : il est
l'exception nommée par I5.

**Ce qui casse.** L'injection ne s'applique qu'aux entrées de cet objet. Un repository absent n'a
jamais ses dépendances remplies : elles restent `undefined`, et il échoue au premier appel. Pour tout
repository couvert par I5, I6 a une conséquence d'exécution.

Second effet : l'index cesse d'être la liste exhaustive des ports du contexte, donc toute lecture
d'ensemble est fausse.

### I7 — numéro retiré

Cet invariant portait sur le **modèle**, pas sur le repository : il interdit au modèle du domaine
d'exposer une méthode dont le repository est le seul consommateur. Il figurait ici parce qu'il a été
relevé depuis le repository.

Il est énoncé sous `E5` de `fiche-entite.md`, avec ses illustrations, son exception du format publié et
sa vérification par knip. Le numéro n'est pas réattribué.

Ce qui reste du côté repository : la traduction vers la forme de stockage est **son** travail, sous
forme de fonction locale. C'est le pendant positif de `E5`, et c'est déjà ce que `I1` exige en sortie.

### I9. Nommage du fichier

**Énoncé.** La cohérence à l'intérieur du contexte, pas l'uniformité du dépôt.

Deux conventions sont possibles : `sujet-repository.js` et `sujet.repository.js`. Un contexte n'en
mélange pas deux. Le choix global reste à trancher. En attendant, l'incohérence interne à un contexte
est le seul défaut signalable.

**Ce qui casse.** Rien. Invariant d'hygiène.

### I10. Aucune règle métier dans le repository

**Énoncé.** Un repository ne contient aucun branchement sur une condition métier, et aucun
enchaînement d'opérations dont l'ordre porte une intention.

Le signal outillable est un préfixe de lecture sur une fonction qui écrit.

```js
// fautif — le nom annonce une lecture, le corps réactive un enregistrement désactivé
export async function getOrCreateNewOrganizationLearner({ organizationLearner, userId, organizationId }) {
  const existing = await findOrganizationLearner({ userId, organizationId });

  if (existing) {
    if (existing.isDisabled) {
      await knexConnection('organization-learners')
        .update({ isDisabled: false })
        .where({ id: existing.id });        // décision métier
    }
    return _toDomain({ id: existing.id });
  } else {
    // sinon insertion
  }
}

// conforme — trois opérations nommées, la décision remonte au usecase
export async function findOrganizationLearner({ userId, organizationId }) { … }
export async function createOrganizationLearner({ … }) { … }
export async function reactivateOrganizationLearner({ id }) { … }
```

La règle cachée ici est une vraie règle, et elle mérite d'être discutée : **un élève désactivé qui
revient sur un parcours est réactivé silencieusement.** C'est peut-être exactement ce que le métier
veut. Mais personne ne cherchera cette décision dans un fichier de `infrastructure/`, sous une
fonction nommée `getOrCreate…`.

**Ce qui casse.** La règle vit à un endroit où personne ne la cherche. Elle sera réécrite différemment
ailleurs, et une modification du métier n'ira pas la chercher là.

**Cas limite, à trancher en revue.** Une fonction qui enchaîne plusieurs appels dont l'ordre porte une
intention. Une garde sur un paramètre optionnel n'est pas une règle métier. Un enchaînement qui décrit
un processus relève de `domain/usecases/`.

### I11. Un repository n'importe pas un autre repository

**Énoncé.** Un repository n'importe aucun autre repository, ni de son contexte ni d'un autre.
Composer deux accès relève du usecase.

```js
// fautif — la composition a lieu dans l'adaptateur, ici trois fois
import * as knowledgeElementRepository from '../../../shared/infrastructure/repositories/knowledge-element-repository.js';
import * as skillRepository from '../../../shared/infrastructure/repositories/skill-repository.js';
import { LearningContentRepository } from '../../../shared/infrastructure/repositories/learning-content-repository.js';

// conforme — le usecase compose, chaque repository reste un port
export async function findTutorialsForUser({ userId, tutorialRepository, skillRepository }) {
  const skills = await skillRepository.findByUserId({ userId });
  return tutorialRepository.findBySkillIds({ skillIds: skills.map(({ id }) => id) });
}
```

**Ce qui casse.** L'orchestration se retrouve à un endroit où aucune règle ne la cherche : I5 ne voit
que les API internes et les clients, I10 ne voit que les conditions métier, et la table du § 1 suppose
qu'on est dans le bon fichier. Un import vers le repository d'un autre contexte franchit en plus une
frontière hors de l'API interne, ce que les règles au grain du contexte laissent passer si ce contexte
est déclaré dans les dépendances autorisées.

---

## 3. Exceptions légitimes

Sans cette section, un relecteur signale du code correct.

| Cas | Statut |
| --- | --- |
| `save` renvoie l'identifiant créé | autorisé |
| `saveInBatch` renvoie un tableau d'identifiants | autorisé |
| `delete*` renvoie un nombre de lignes affectées | autorisé |
| `count*`, `exists*`, et toute agrégation renvoyant un scalaire calculé côté base | autorisé — un scalaire est le langage du domaine |
| Une fonction `find*` renvoie `null` | autorisé, c'est I3 |
| Enveloppe de pagination autour d'objets traduits | autorisé si le contenu est traduit |
| Une fonction `is*` / `has*` renvoie un booléen | autorisé |
| Une fonction ne renvoie rien | autorisé |
| Un repository de `jobs/` est une classe étendant une classe de base partagée, exportée en singleton | autorisé. Ne pas convertir en module de fonctions |
| L'accesseur de connexion à la base est importé et non injecté | autorisé. Seule exception à I5 |
| Une fonction reçoit `connection` en paramètre, avec l'accesseur ambiant en valeur par défaut | autorisé **si l'appelant passe effectivement une autre connexion** — hors transaction, réplica, pool distinct. Voir X3 au § 5 |
| `getOrCreate*` ne lève pas alors qu'il commence par `get` | autorisé pour I3 seulement. Voir l'avertissement ci-dessous |

Lecture de I1 sur les premières lignes : un identifiant ou un scalaire est le langage du domaine. Ce
qui est interdit, c'est la forme de la persistance — un objet dont les clés sont des colonnes, ou un
DTO étranger.

### Avertissement

`getOrCreate*` est dispensé de I3 : il ne lève pas en cas d'absence parce qu'il crée. Le préfixe ne
dispense de rien d'autre, et I10 reste à vérifier — c'est le nom sous lequel une écriture non annoncée
passe le plus facilement.

Chaque exception ne vaut que pour l'invariant en regard duquel elle est écrite. Une ligne du tableau
lue comme un blanc-seing fait passer une vraie violation au lieu d'éviter un faux positif.

---

## 4. ROI des invariants

| Invariant | Rentabilité | Ce qu'on gagne |
| --- | --- | --- |
| **I1** — ne renvoie pas de structure de persistance | **forte** | Un renommage de champ chez un voisin devient une erreur dans la PR de ce voisin, au lieu d'une 500 en production. Sans l'invariant, le seul filet est un test d'acceptance qui couvre le chemin par hasard |
| **I4** — erreurs du domaine uniquement | **forte** | Le code HTTP est déterminé par le mappeur d'erreurs. Le contrat n'est pas le statut mais le code d'erreur exploité par le front : une erreur non domaine sort sans code ni métadonnées |
| **I6** — enregistré dans l'index du contexte | **forte** | Prévient un plantage à l'exécution. Garde l'index comme liste complète de ce que le contexte touche à l'extérieur |
| **I11** — n'importe pas un autre repository | **forte** | Un repository qui en importe un autre fait de l'orchestration, à un endroit où aucune règle ne la cherche : ni I5 ni I10 ne la voient |
| **I10 (signal)** — aucune fonction de lecture qui écrit | **forte** | Une fonction qui annonce une lecture et qui écrit trompe ses appelants, quel que soit le contenu de l'écriture |
| **I2** — n'accepte pas de structure de persistance | moyenne | Corollaire de I1. Pas de mode de violation indépendant, pas de moyen de vérification propre. Tombe si I1 est tenu |
| **I3** — `get*` lève, `find*` renvoie `null` | moyenne | Supprime deux erreurs symétriques à chaque site d'appel : le `if (!x)` mort après un `get*`, le déréférencement de `null` après un `find*` non testé |
| **I5** — dépendances injectées, jamais importées | moyenne | Sans lui, le repository est intestable en unitaire, et l'index cesse d'être le point unique où les frontières sont lisibles |
| **I10 (complet)** — aucune règle métier | revue seule | La règle vit à un endroit où personne ne la cherche. Bénéfice de lisibilité, non vérifiable |
| **I9** — nommage cohérent dans le contexte | hygiène | Rend le fichier trouvable. Réduit le bruit de revue |

Le numéro **I8** n'est pas attribué. Un invariant qui aurait rendu la source visible dans le nom du
fichier contredirait le § 1 : la couche est uniforme quelle que soit la source.

La seule conséquence légitime de la source porte sur le **type de test** attendu, au § 8. Elle vaut
pour l'adaptateur, qui connaît ce qu'il adapte, pas pour le domaine.

L'ordre de mise en œuvre du § 6 suit le **coût**, pas ce classement. I5 y est premier parce qu'il ne
coûte qu'une ligne de configuration, alors qu'il est de rentabilité moyenne.

### Ce que ça n'apporte pas

Ces invariants ne disent pas si le modèle du domaine est le bon, ni si le découpage en contextes est
juste. Ils garantissent l'étanchéité des couches, pas la pertinence de la modélisation. I10 est celui
qui touche le plus au fond, et c'est celui qu'on ne sait pas vérifier automatiquement.

Un invariant respecté sur un mauvais découpage a un ROI négatif, pas nul : le code s'appuie dessus,
donc la correction devient plus chère. Voir `invariants-clean-archi-ddd.md`.

---

## 5. Écarts avec Clean Architecture et DDD

Deux axes : la nature de l'écart, et son rapport coût payé / bénéfice obtenu.

**Le verdict découle des deux colonnes du milieu.** Un coût payé sans bénéfice est à corriger : c'est
le seul verdict qui engage du travail. Table triée par verdict.

| Écart | Nature | Coût payé | Bénéfice obtenu | Verdict |
| --- | --- | --- | --- | --- |
| **X1** Aucun port n'est déclaré | dérive | l'injection et le boilerplate | **nul** — aucun contrat vérifiable | **À corriger** |
| **X2** Méthode de persistance sur le modèle | dérive | différé, à la prochaine migration de schéma | **nul** | **À corriger** |
| **X3** La connexion à la base ne passe pas par la signature | convention | on ne sait pas, en lisant un usecase, s'il est transactionnel | réel — signatures propres | À surveiller |
| **X4** Plusieurs repositories pour un même agrégat | convention | quelques fichiers de plus | réel — chaque requête est écrite pour son besoin | Rien à faire |
| **X5** `domain/usecases/index.js` importe l'infrastructure | vestige assumé en convention | nul — le fichier est toujours au même chemin | le câblage est là où sont les usecases qu'il câble | Rien à faire — exempté dans la règle |
| **X6** Le repository couvre aussi l'accès aux contextes voisins | convention assumée | nul | réel — un seul concept, le domaine ignore la source | Rien à faire |

### X1. Aucun port n'est déclaré

Ce que dit la théorie : le domaine déclare l'interface dont il a besoin, l'infrastructure l'implante.

En pratique, le contrat d'un repository est le **nom du paramètre** que le usecase reçoit.

```js
// le usecase
export async function getCombinedCourse({ id, combinedCourseRepository }) {
  return combinedCourseRepository.getById({ id });
}
```

Rien ne déclare que `combinedCourseRepository` sait faire `getById`, ni ce que cette fonction rend.
Une faute de frappe dans le nom de la méthode échoue à l'exécution. Un repository qui perd une fonction ne casse
aucune compilation.

**Correction.** Déclarer le port dans `domain/ports/` et annoter le repository contre lui — voir § 7.
Uniquement après la migration des modèles en `.ts` : avant, le port ne vérifie rien.

### X2. Méthode de persistance sur le modèle

C'est `E5` de `fiche-entite.md`. Le modèle porte une méthode dont le repository est le seul consommateur.

```js
// dans domain/models/ — le modèle sait se persister, dans les deux sens
class Chat {
  toDTO() {
    return {
      id: this.id,
      userId: this.userId,
      configuration: this.configuration.toDTO(),        // et toute la frontière suit
      messages: this.messages.map((message) => message.toDTO()),
    };
  }

  static fromDTO(chatDTO) { … }
}

// et dans le repository, qui est le seul appelant
const chatDTO = chat.toDTO();
```

Le point intéressant est la **propagation** : la racine délègue à ses objets internes, qui portent
chacun leur `toDTO()`. Déplacer le mapping dans le repository suppose donc de déplacer toute la
chaîne, pas une méthode.

**Correction.** Déplacer la fonction de mapping dans le repository, sous forme de fonction locale. Le
déplacement est mécanique. Exception à vérifier avant : si la forme sérialisée est un format publié,
la méthode reste sur le modèle — voir `E5` de `fiche-entite.md`.

### X3. La connexion à la base ne passe pas par la signature

Le repository récupère sa connexion depuis un contexte implicite, au lieu de la recevoir en paramètre.

```js
// forme en vigueur — la connexion n'apparaît pas dans la signature
const getByCode = async ({ code }) => {
  const knexConn = DomainTransaction.getConnection();
  …
};

// forme explicite, non retenue — la connexion traverse toutes les couches
const getByCode = async ({ code, knexConn }) => { … };
```

La forme en vigueur garde les signatures propres. En contrepartie, un usecase ne dit pas s'il
s'exécute dans une transaction : il faut ouvrir le fichier qui l'appelle.

**Une troisième forme, examinée et non retenue comme convention.**

```js
const getByCode = async ({ code, knexConn = DomainTransaction.getConnection() }) => { … };
```

Elle fonctionne : la valeur par défaut est évaluée à chaque appel, donc elle capte la transaction en
cours, et l'injection ne la gêne pas.

Mais elle n'adresse pas le coût de X3, qui porte sur la lecture d'un **usecase** : celui-ci écrit
toujours `getByCode({ code })`. Elle informe le lecteur du repository, qui n'avait aucun doute sur le fait
qu'il utilise une connexion.

Et elle en ajoute un : un paramètre par défaut qui appelle un contexte implicite annonce un point
d'extension que personne n'utilise. La forme en vigueur dit « je prends la connexion ambiante » ;
celle-ci laisse croire que l'appelant décide.

**Où elle est la bonne forme.** Pour une fonction qui doit pouvoir tourner sur une **autre** connexion
que celle en cours — hors transaction, sur un réplica de lecture, sur un pool distinct. Là le
paramètre est utilisé, donc il n'annonce rien de faux. À employer par exception, sur ces fonctions, et
non comme convention générale.

**Ce que les ADR disent, et c'est plus embêtant qu'une simple absence.** L'ADR 9 prescrivait la forme
**explicite** : `domainTransaction` traverse la signature du usecase et celle du repository, avec une
transaction vide par défaut. L'ADR 25 **remplace** l'ADR 9 — et il ne traite que des événements dans
les transactions, sans rien redécider sur ce point.

La forme ambiante a donc remplacé une forme prescrite par un ADR, sans décision écrite. Ce n'est pas
une convention sans source : c'est une convention **contre** une source, dont l'abandon n'a pas été
consigné.

**Correction.** Aucune sur la forme, qui est en place partout et fonctionne. Ce qui manque est
l'écrit : un ADR court qui acte l'abandon de la forme explicite et son motif — des signatures propres
— et qui reprenne la contrepartie, documenter le périmètre transactionnel quand il n'est pas évident.
C'est l'objet de `U7` dans `fiche-usecase.md`.

### X4. Plusieurs repositories pour un même agrégat

DDD associe un repository à une racine d'agrégat. En pratique, un repository est créé par **besoin de
requête**, pas par agrégat.

```
infrastructure/repositories/
  combined-courses/
    combined-course-repository.js                     getById, save
  combined-course-details-repository.js               getById, avec tout ce qu'un écran affiche
  combined-course-participations/
    combined-course-participation-repository.js       une entité interne à la frontière
  prescription/
    combined-course-participant-repository.js         la même frontière, vue d'un autre besoin
```

Quatre repositories pour un seul agrégat, rangés en sous-dossiers portant le nom du besoin appelant —
ce qui dit exactement ce que le découpage est. DDD n'en aurait qu'un, et les formes de lecture seraient des
read-models qu'il produit.

Le bénéfice est réel : chaque requête est écrite pour son besoin, sans champ chargé pour rien et sans
repository générique que tout le monde étend. Sur une plateforme à fort trafic, ne pas charger la base
pour rien est une contrainte, pas une préférence.

**Le débat porte sur l'alternative**, et la littérature la tranche. Deux options se présentent
naturellement : beaucoup de modèles, ou un modèle unique partiellement rempli selon l'appel.

Le **modèle partiellement rempli est à écarter**. Un agrégat est défini par ses invariants ; chargement
partiel, il ne peut pas les garantir. Fowler nomme cette forme : c'est la variante *Ghost* du pattern
**Lazy Load** de *PoEAA*. Il en donne le coût — l'objet doit savoir aller chercher ce qui lui manque,
donc la connaissance de la persistance entre dans le modèle. C'est X2. Choisir cette option pour
résoudre X4 aggrave X2.

La réponse de la littérature au coût de chargement est ailleurs : **réduire l'agrégat** pour que le
charger entier soit bon marché. C'est la règle 2 de Vernon, *design small aggregates*, et sa motivation
est exactement celle-là.

Quant aux modèles multiples, ils sont endossés à une condition : que les modèles supplémentaires
soient des **read-models**, pas des agrégats. Une lecture qui n'a pas besoin d'invariants ne passe pas
par l'agrégat : on requête directement et on produit la forme adaptée. Vernon appelle cela une *use
case optimal query*.

La forme retenue par la littérature est donc une troisième : un modèle d'écriture — l'agrégat, petit,
toujours chargé entier — et autant de modèles de lecture que de besoins, sans invariant.

**Correction.** Aucune sur le découpage. Deux points à tenir :

1. Le **vocabulaire**. Compter les repositories d'un contexte ne dit plus combien il a de frontières de
   cohérence. Ne pas poser le mot « agrégat » sur un dossier si les repositories ne suivent pas ce
   grain — voir A3 dans `fiche-racine-agregat.md`.
2. Les repositories créés pour un besoin de lecture renvoient des **read-models**, pas des entités
   incomplètes — voir `fiche-read-model.md`. C'est la frontière à ne pas franchir : plusieurs
   repositories est une convention tenable, un agrégat à moitié chargé non.

Contrepoids : Fowler prévient que séparer lecture et écriture ajoute de la complexité et ne doit pas
être le défaut. À appliquer où la pression de charge existe.

### X5. `domain/usecases/index.js` importe l'infrastructure

Ce fichier câble les dépendances : il importe les repositories du contexte et les injecte dans les
usecases.

```js
// domain/usecases/index.js — un fichier du domaine qui importe l'infrastructure
import { repositories } from '../../infrastructure/repositories/index.js';
```

Clean Architecture place ce câblage dans une couche externe, jamais dans le domaine.

Le déplacer coûterait un fichier par contexte plus tous leurs importateurs, pour zéro changement de
comportement — et le câblage importerait l'infrastructure où qu'il aille, c'est sa fonction.

**Correction.** Aucune sur le fichier. Le chemin étant fixe, il est **exempté dans la règle** du § 6,
ce qui rend celle-ci activable. Ce que l'exemption ne couvre pas : le câblage important
l'infrastructure d'un **autre** contexte, qui reste une violation et demande une seconde règle.

### X6. Le repository couvre aussi l'accès aux contextes voisins

Deux fichiers du même dossier, deux sources différentes, un seul concept.

```
infrastructure/repositories/
  prescriber-repository.js            → des tables de la base
  privacy-users-api.repository.js     → l'API interne d'un autre contexte borné
```

Le nommage trahit d'ailleurs la gêne : le second fichier porte `-api.` dans son nom, comme s'il
fallait avertir le lecteur que ce repository n'en est pas tout à fait un.

DDD appellerait le second une couche anti-corruption et le rangerait à part. C'est l'écart annoncé au
§ 1.

**Correction.** Aucune. C'est la lecture port/adaptateur : le domaine ignore la source, donc la couche
est uniforme. La seule conséquence de la source porte sur le type de test attendu, au § 8.

---

## 6. Vérification déterministe

Outils disponibles : configuration `dependency-cruiser`, avec des règles générées depuis les
déclarations de dépendances de chaque contexte ; configuration ESLint ; knip, déjà branché dans
`npm run lint` ; scripts dans `tests/tooling/` ; ls-lint ; et le typage après migration.

Deux précisions sur les coûts. Il n'existe aucun plugin ESLint maison : toute règle sur mesure suppose
d'abord de créer cette infrastructure, et les estimations ci-dessous ne comptent que la règle. Et les
lignes dont le moyen est le typage ne vérifient rien avant que la chaîne de types soit migrée — voir
`migration-typescript.md`.

**Ce qui, dans ce §, est daté.** Une fiche est pérenne, et cette section l'est en majeure partie : le
moyen retenu pour chaque invariant, les pièges d'implémentation et le découpage codemod ne dépendent
pas de l'état du dépôt. Trois choses en dépendent, et sont à revérifier plutôt qu'à lire comme un
acquis : l'**inventaire des moyens disponibles** ci-dessus, les **estimations de coût**, qui supposent
qu'aucune infrastructure de plugin n'existe, et la ligne sur les **faux positifs de knip**, qui reste
à mesurer. Le jour où ces trois points sont périmés, ils se retirent sans toucher au reste.

| Invariant | Moyen | Coût | Faux positifs |
| --- | --- | --- | --- |
| **I11** n'importe pas un autre repository | règle `dependency-cruiser` de chemin | configuration seule | aucun |
| **I5** dépendances injectées | règle `dependency-cruiser` de chemin | configuration seule | aucun |
| **I4** erreurs du domaine — partiel | `no-restricted-syntax` ESLint | configuration seule | aucun |
| **I3** `get*` lève, `find*` renvoie `null` | règle ESLint sur mesure | ~50 lignes | faibles, si les préfixes sont listés |
| **I10** aucune fonction de lecture qui écrit — signal | règle ESLint sur mesure | ~30 lignes | aucun |
| **I6** enregistré dans l'index, **+ I9** nommage | script `tests/tooling/` | ~40 lignes | aucun |
| **§ 8** un fichier de test existe | même script | ~15 lignes de plus | aucun |
| **§ 8** test au bon endroit, unitaire ou intégration | même script + le parcours d'AST de I1 | ~25 lignes de plus | faibles |
| **I1** passe-plat direct — étape 1 | règle ESLint sur mesure | ~50 lignes | aucun |
| **I1** passe-plat via variable — étape 2 | même règle, élargie | ~30 lignes de plus | faibles |
| **I1** complet, **I2** en entrée | typage | migration TypeScript | — |
| **I10** aucune règle métier — complet | aucun moyen identifié | — | — |

### I11 et I5 — règles de chemin

```js
{
  name: 'repository-must-not-import-repository',
  severity: 'error',
  from: {
    path: 'src/.+/infrastructure/repositories/',
    pathNot: 'src/.+/infrastructure/repositories/index\\.js$',
  },
  to: { path: 'src/.+/infrastructure/repositories/' },
}
```

```js
{
  name: 'repository-must-not-import-internal-api',
  severity: 'error',
  from: {
    path: 'src/.+/infrastructure/repositories/',
    pathNot: 'src/.+/infrastructure/repositories/index\\.js$',
  },
  to: { path: 'src/.+/application/api/' },
}
```

Trois points d'implémentation.

`severity: 'error'` est obligatoire. La valeur par défaut est `warn`, et seul `error` fait échouer la
commande.

Écrire `src/.+/` et non `src/[^/]+/`. Un contexte à sous-contextes ne serait pas atteint, et la règle
ne se déclencherait jamais, sans erreur ni avertissement.

Vérifier par contre-épreuve : introduire un import fautif dans un sous-contexte, confirmer que la
règle sort, retirer l'import.

Règle jumelle, pour interdire au domaine d'importer l'infrastructure. Le fichier de câblage en est
exempté : il importe l'infrastructure par fonction, et il est toujours au même chemin.

```js
{
  name: 'domain-must-not-import-infrastructure',
  severity: 'error',
  from: {
    path: 'src/.+/domain/',
    pathNot: 'src/.+/domain/usecases/index\\.js$',
  },
  to: { path: 'src/.+/infrastructure/' },
}
```

L'exemption laisse le câblage faire son travail et garde la règle active sur tout le reste du domaine.
Elle est plus large que nécessaire sur un point : le fichier exempté peut alors importer
l'infrastructure d'un **autre** contexte, ce qui reste une violation. L'attraper demande une seconde
règle, exprimant « un autre contexte que le sien » par un groupe capturé — c'est le cas où le piège
`src/.+/` contre `src/[^/]+/` se pose réellement, et il faut alors traiter les contextes à
sous-contextes.

### I4 — sélecteur ESLint

Pour « jamais un `Error` nu » :

```js
{
  // src/** et non src/*/ : voir le piège des sous-contextes ci-dessus
  files: ['src/**/infrastructure/repositories/**/*.js'],
  rules: {
    'no-restricted-syntax': ['error', {
      selector: "ThrowStatement > NewExpression[callee.name='Error']",
      message: 'Un repository lève une erreur du domaine.',
    }],
  },
}
```

Pour « l'erreur vient d'un `domain/errors.js` », il faut croiser la classe levée avec la source de son
import. Règle sur mesure, analyse locale au fichier.

### I3 — règle ESLint

Syntaxique et locale. Pour chaque fonction exportée :

- nom en `/^get/` → exiger un `throw` sur le chemin « absent » ;
- nom en `/^find/` → interdire de lever une erreur d'absence.

Liste d'exclusion obligatoire : `getOrCreate*` commence par `get` et ne lève pas. Sans elle, la règle
produit un faux positif dès la première exécution.

### I10 signal — préfixe de lecture sur une fonction qui écrit

L'invariant complet n'est pas décidable. Le signal l'est, sans quitter la fonction :

> Une fonction exportée dont le nom commence par `get`, `find`, `is` ou `has`, et dont le corps
> contient un appel d'écriture sur la connexion.

Un nom qui annonce une lecture sur une fonction qui écrit est trompeur, indépendamment du contenu de
l'écriture. La règle ne prouve pas la violation de I10, elle désigne l'endroit où regarder.

`getOrCreate*` est inclus ici, alors qu'il est exclu de I3. Les deux règles regardent la même fonction
sans en tirer la même conclusion : I3 juge le comportement en cas d'absence, I10 juge la
correspondance entre le nom et le corps. Même parcours d'AST que I3.

### I6 et I9 — un script de complétude

Lister les fichiers de `src/<contexte>/infrastructure/repositories/**` en excluant `index.js`,
extraire les clés de l'objet des repositories dans l'index, comparer. Aucun faux positif possible.
Peut vivre comme test plutôt que comme lint.

Le même script couvre I9 pour une dizaine de lignes de plus. Il connaît le contexte parcouru, donc il
peut appliquer la cohérence interne au contexte, là où ls-lint n'imposerait qu'une convention unique.

ls-lint ne convient pas pour I9 : ses règles d'extension ne descendent pas dans les sous-dossiers.
Vérifié empiriquement — un mauvais nom à la racine de `api/` échoue, le même sous `api/src/…/` passe.
Étendre la portée à `src/**` est une décision à part.

### § 8 — les tests, par le même script

Le script parcourt déjà les fichiers de repository. Deux vérifications s'y greffent.

**Existence.** Chaque repository a un fichier de test. La correspondance se fait sur le **nom de
base**, après retrait du suffixe de test : un repository peut vivre dans un sous-dossier alors que son
test est à plat, et le suffixe de test n'est pas le même partout. Comparer les chemins produirait des
faux positifs là où comparer les noms de base n'en produit aucun.

Ce que la comparaison sort, dans les deux sens : un repository sans test, et un test dont aucun
repository ne porte le nom — ce second cas attrape la faute de frappe dans un nom de fichier de test,
qui autrement passe inaperçue puisque le test tourne quand même.

**Emplacement.** La source se lit dans les paramètres injectés, sans quitter le fichier :

| Signal dans le repository | Test attendu |
| --- | --- |
| un paramètre dont le nom correspond à `/Api$/` | unitaire, l'API mockée |
| un paramètre de connexion, ou un appel sur la connexion | intégration |
| les deux | les deux |
| aucun des deux | non classable — à signaler, pas à deviner |

Le parcours d'AST est celui de I1 étape 1, qui repère déjà les paramètres en `/Api$/`. Coût marginal.

Ce que cette vérification attrape et que la revue humaine laisse passer : un repository adossé à une
API testé en intégration. Rien n'échoue, mais la suite monte une base de données pour rien à chaque
exécution.

**Trois limites.** Un fichier mixte attend les deux types, donc la règle exige *au moins* le type
correspondant, jamais l'exclusivité. Une dépendance dont le nom ne finit pas par `Api` — un client, un
agent — n'est pas détectée : le signal est suffisant, il n'est pas complet. Et les exceptions du § 3
restent : un repository dont les fonctions ne renvoient que des scalaires n'a rien à traduire, donc
rien à tester en unitaire. C'est ce qui classe l'emplacement en faux positifs faibles plutôt
qu'inexistants.

Le suffixe `Api` sur un paramètre ne remet pas la source dans le nommage de la couche : il nomme la
dépendance pour ce qu'elle est, là où un nom de fichier annoncerait la source du repository lui-même.

### I1 — deux étapes

L'énoncé complet demande de suivre l'origine des valeurs, donc une analyse de flot. Deux sous-cas se
détectent sans quitter la fonction.

**Étape 1 — passe-plat direct.** Zéro faux positif.

> Un `return` (ou `return await`) dont l'expression est directement un appel de méthode sur un
> paramètre dont le nom correspond à `/Api$/`.

Les cas acceptables — effet de bord sans retour — ne comportent pas de `return`.

**Étape 2 — passe-plat via une variable locale.** Faux positifs faibles.

> Une variable affectée depuis un `await` sur un paramètre en `/Api$/`, puis renvoyée — directement,
> par indexation, ou via une expression conditionnelle — sans passer par un constructeur ni par une
> fonction locale.

```js
// l'étape 1 ne voit pas ceci
const users = await userApi.getUsersByIds({ ids });
return users ? users[0] : null;
```

Les faux positifs de l'étape 2 viennent des fonctions qui renvoient un scalaire extrait de la réponse,
autorisées par le § 3.

Élargissement suivant, à ne tenter qu'ensuite : `return <résultat d'await sur une requête>` sans
passage par un constructeur ou une fonction de mapping locale.

### I2 — pas de vérification propre

Vérifier les entrées demanderait de suivre les valeurs entre fichiers, hors de portée d'ESLint. Et
l'invariant tombe si I1 est tenu : s'il ne sort aucun DTO étranger d'aucun repository, il n'en circule
aucun à passer en entrée. I2 se traite en corrigeant I1, puis par le typage.

### Ordre de mise en œuvre

Cet ordre suit le coût, pas le ROI du § 4.

1. **I11** et **I5** — configuration `dependency-cruiser`, avec `severity: 'error'` et contre-épreuve
2. **I4 partiel** — sélecteur `no-restricted-syntax`
3. **I7 partiel** — exploiter la sortie de knip
4. **I6 + I9 + existence des tests** — un seul script de complétude
5. **I3** — première règle ESLint sur mesure, ce qui suppose de créer l'infrastructure de plugin
6. **I10 signal** — même parcours d'AST que I3
7. **I1 étape 1** puis **étape 2**, après correction des violations relevées dans le rapport de
   divergence
8. **§ 8 emplacement des tests** — réutilise le parcours d'AST de I1 étape 1
9. **I1 complet / I2** — par le typage, dans l'ordre de `migration-typescript.md`

Toute hypothèse sur le comportement d'un outil se vérifie par contre-épreuve avant d'être écrite :
introduire la violation, confirmer que l'outil sort, retirer la violation.

### Corriger les violations

`api/codemods/` existe comme convention. Aucun outil de codemod n'est déclaré dans les dépendances,
mais le paquet `typescript` est présent en dépendance de développement — c'est lui qui fait tourner
`lint:types` — et son API de compilation suffit à lire un AST et à réécrire des fichiers.

Critère de découpe : un codemod peut appliquer une décision, il ne peut pas en prendre une.

| Invariant | Codemod | Ce qu'il fait |
| --- | --- | --- |
| **I6** enregistré dans l'index | oui, complet | Insérer l'import et la clé dans l'index. Purement syntaxique |
| **I9** nommage cohérent | oui, complet | Renommer le fichier et réécrire tous les imports. La partie risquée est la mise à jour des appelants |
| **I5** dépendances injectées | oui, complet | Transformer un import direct en paramètre injecté et l'ajouter à l'index |
| **I11** n'importe pas un autre repository | partiel | Déplacer la composition vers le usecase appelant demande de savoir lequel, et de décider de l'ordre des appels |
| **I3** `get*` lève, `find*` renvoie `null` | partiel | Renommer et propager aux appelants, oui. Décider de quel côté corriger, non : faire lever un `find*` change le comportement de chaque site d'appel |
| **I4** erreurs du domaine | préparation seule | Repérer les `throw new Error(...)`, oui. Choisir l'erreur de domaine, non : ça détermine le code HTTP et le code d'erreur |
| **I1** en sortie, **I2** en entrée | préparation seule | Générer un squelette de type local à partir des champs lus chez les appelants. Le mapping est de la conception |
| **I7** méthode de persistance, **I10** règle métier | non | Déplacer du code entre couches demande de décider où il va |

À ne pas faire : un codemod qui « corrige » I1 en enveloppant le DTO étranger dans une classe locale
aux mêmes champs. Le lint passe au vert et la dette devient invisible. Sur I1, un codemod produit un
`TODO` et un squelette à remplir, jamais un mapping identité.

#### Fixer ESLint ou script

Un fixer ESLint ne peut modifier que le fichier où la règle se déclenche. C'est ce qui décide de la
forme.

| Nature de la correction | Forme | Pourquoi |
| --- | --- | --- |
| Renommer un fichier et réécrire ses importateurs (I9) | script | multi-fichiers par nature, hors de portée d'un fixer |
| Compléter l'index (I6) | script, ou test qui échoue en indiquant la ligne à ajouter | la détection lit le dossier, la correction porte sur un autre fichier |
| Remplacements locaux à un fichier | fixer ESLint | corrigé par `eslint --fix`, donc de façon permanente : les nouvelles violations sont réparées à la sauvegarde |

Peu d'invariants relèvent de la troisième ligne. I3 et I4 demandent une décision, I1 ne doit pas avoir
de fixer. Le travail mécanisable est donc dans des scripts.

#### Facilités en place

`lint:format` vérifie seulement ; c'est `lint:format:fix` qui reformate. Un codemod n'a pas à
préserver l'indentation, à condition de lancer la variante `:fix` après. À vérifier avant de s'y
fier : la configuration ESLint ne porte pas de règle de tri d'imports, donc l'ordre des imports est
rétabli par le formateur ou pas du tout.

La règle de lint est l'oracle du codemod. L'écrire d'abord donne la liste exhaustive des sites et le
critère de succès : `npm run lint` doit passer au vert après passage du codemod.

---

## 7. Le port

Le contrat d'un repository est déclaré. Sans port déclaré, le contrat est le nom du paramètre
déstructuré dans le usecase, et l'invariant « implémente un port du domaine » n'a aucun support dans
le code.

```ts
// domain/ports/combined-course-repository.ts
import type { CombinedCourse } from '../models/combined-courses/entities/CombinedCourse.ts';

export type CombinedCourseRepository = {
  getById(params: { id: number }): Promise<CombinedCourse>;
  getByCode(params: { code: string }): Promise<CombinedCourse>;
  save(params: { combinedCourse: CombinedCourse }): Promise<number>;
};
```

Le type dit ce que le nom promettait sans pouvoir le garantir : `getById` rend un `CombinedCourse`,
pas `CombinedCourse | null`. **I3 devient une conséquence du typage** pour les `get…`.

### Forme de conformité

L'implémentation se déclare fonction par fonction. Le message d'erreur désigne la fonction fautive.

```ts
import type { CombinedCourseRepository } from '../../domain/ports/combined-course-repository.ts';

export const getById: CombinedCourseRepository['getById'] = async ({ id }) => { … };
```

Un repository est un module de fonctions, conformément à la forme d'injection décidée par ADR 46.
L'annotation par fonction donne au site de définition la même garantie qu'un `implements`.

À ne pas utiliser : une assertion `satisfies` sur le module entier. Elle ne s'efface pas au type
stripping — voir `migration-typescript.md` — et elle impose un auto-import du module dans lui-même.

### Complétude

L'annotation par fonction ne garantit pas qu'aucune fonction du port ne manque. Deux voies : un test
de conformité, où un import de valeur et une assertion `satisfies` sont sans coût ; ou laisser l'index
du contexte échouer, s'il déclare le repository contre son type de port. La seconde place la
vérification là où le câblage a lieu.

---

## 8. Tests attendus

| Source du repository | Type de test | Ce qu'on vérifie |
| --- | --- | --- |
| Base de données | intégration uniquement | la requête et le mapping vers le domaine |
| API interne d'un autre contexte | unitaire, API mockée | uniquement le mapping vers le domaine |

Cette table est vérifiable : la source se lit dans le nom des paramètres injectés, et l'existence du
fichier de test se vérifie par comparaison de noms. Moyens et limites au § 6.

Indice de diagnostic, avec sa borne. Si un repository adossé à une API n'a rien à tester en unitaire,
c'est en général qu'il ne traduit rien, donc que I1 est violé.

La réciproque est fausse pour les cas du § 3 : une fonction qui renvoie un scalaire, un booléen ou
rien n'a rien à traduire en sortie, donc rien à tester en unitaire, sans violer I1. C'est un indice,
pas un test de conformité.

---

## 9. Checklist de revue

Ordonnée par ROI décroissant, conformément au § 4.

Chaque ligne porte son statut au regard du § 6. `[auto]` disparaît de la checklist dès que la règle
correspondante existe. `[partiel]` reste, réduite à ce que la règle ne couvre pas. `[humain]` reste
entièrement : aucun moyen déterministe n'est identifié.

La checklist est donc **transitoire pour les deux tiers de ses lignes**, et se vide à mesure que le
§ 6 s'implémente. Une checklist dont la majorité des lignes sont vérifiées par un outil entraîne à la
parcourir sans la lire.

```
[ ] [partiel] I1  Aucun return ne rend directement une ligne de base, un DTO étranger ou une réponse HTTP
[ ] [auto]    I11 Aucun import d'un autre repository, de ce contexte ou d'un autre
[ ] [partiel] I4  Tout throw cible une erreur du domaine ; aucun catch ne relâche l'erreur brute
[ ] [auto]    I6  Le fichier est enregistré dans infrastructure/repositories/index.js
[ ] [auto]    I10 Aucune fonction en get*/find*/is*/has* qui écrit
[ ] [humain]  I2  Aucun paramètre métier n'est une ligne de base ou un DTO étranger, même reconditionné
[ ] [auto]    I3  Les get* lèvent, les find* renvoient null ou une collection vide
[ ] [auto]    I5  Aucun import d'API interne ni de client ; ils arrivent en paramètres (sauf la connexion)
[ ] [humain]  I10 Aucun branchement sur une condition métier, aucun enchaînement qui porte une intention
[ ] [auto]    I9  Nommage cohérent avec le reste du contexte
[ ] [auto]    Un fichier de test existe, et son nom correspond à celui du repository
[ ] [partiel] Test au bon endroit : intégration si base, unitaire avec mock si API interne
[ ] [humain]  Avant de signaler une violation de I1 ou I2, vérifier les exceptions du § 3
```

À terme il reste trois lignes : I2, la part non décidable de I10, et le rappel des exceptions. Les
quatre `[partiel]` se réduisent — I1 à ce que le typage seul tranche, I4 au traitement des `catch`, I7
aux faux positifs de knip, et l'emplacement des tests aux repositories que les paramètres ne classent
pas.

---

## 10. Sources

Bibliographie et liens dans `references-ddd.md`. Sources primaires des conventions Pix : les ADR de
`docs/adr/`.

| Invariant | Source | Où vérifier |
| --- | --- | --- |
| Le repository est un port, quelle que soit la source | Cockburn, « Hexagonal Architecture » ; Martin, « The Clean Architecture » | les deux gratuits en ligne |
| **I1** ne renvoie pas de structure de persistance, **I2** n'en accepte pas | Evans, *DDD*, ch. « The Life Cycle of a Domain Object » ; Fowler, « AnemicDomainModel » pour le symptôme inverse. Pix : ADR 55, qui accepte « la duplication possible des modèles dans les différents contextes » comme coût du découpage | *DDD Reference* (PDF gratuit) ; ADR 55 |
| **I3** `get*` lève, `find*` renvoie `null` | aucune source, ni externe ni ADR | — |
| **I4** erreurs du domaine uniquement | Evans, même ch. — extrapolation, pas une citation. Pix : ADR 44, qui rend le code d'erreur obligatoire, et ADR 34, qui décide de nommer les contraintes de base par l'intention métier | ADR 34 et 44 |
| **I5** dépendances injectées, jamais importées | Martin, *Clean Architecture* (2017), ch. « The Dependency Inversion Principle ». Pix : ADR 46, avec son motif — ESM rend les exports immuables, donc non substituables en test — et ADR 24, qui encapsule les appels HTTP derrière un composant dédié | ADR 24 et 46 ; pour Martin, le livre de 2017, pas le billet de 2012 |
| **I6** enregistré dans l'index du contexte | aucune source. Outillage Pix. La conséquence d'exécution découle de la forme d'injection décidée par ADR 46 | ADR 46 |
| **I7** pas de méthode de persistance sur le modèle | Evans, ch. « A Model Expressed in Software ». L'exception du format publié : ch. « Maintaining Model Integrity », **Published Language** | *DDD Reference* |
| **I9** nommage cohérent dans le contexte | aucune source | — |
| **I10** aucune règle métier | Martin, *Clean Architecture* (2017), ch. « Business Rules » et « Presenters and Humble Objects » | le livre de 2017 |
| **I11** n'importe pas un autre repository | aucune source. Déduction : composer deux accès est de l'orchestration, ce que la table du § 1 attribue au usecase | — |
| Grain de l'agrégat, et le coût de chargement (X4) | Vernon, « Effective Aggregate Design », règle 2 *design small aggregates* — trois articles gratuits. Vernon, *IDDD*, pour la *use case optimal query* | dddcommunity.org |
| Contre le modèle partiellement rempli (X4) | Fowler, *PoEAA*, pattern **Lazy Load**, variante *Ghost*. Fowler, « CQRS » sur son bliki, pour la mise en garde sur la complexité ajoutée | bliki gratuit en ligne |
| Transaction en ambient context | choix Pix sans ADR. Les ADR 9 et 25 décident la transaction au grain du usecase, pas la forme ambient | ADR 9 et 25, pour ce qu'ils tranchent |

Trois invariants sur dix n'ont aucune source : I3, I6, I9. I11 est une déduction explicite. La partie
« erreur du domaine » de I4 est une extrapolation d'Evans, même si ses prérequis Pix sont documentés.
Ce sont des conventions : elles se discutent sur leurs mérites, pas par appel à une autorité.

Note sur Evans et le repository : chez lui, un Repository retrouve les agrégats de son propre
contexte. La lecture « port unique vers l'extérieur, contexte voisin compris » vient de la tradition
ports & adaptateurs. Evans fonde I1 et I2, pas le cadrage.
