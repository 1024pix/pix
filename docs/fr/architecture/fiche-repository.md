# Fiche — `infrastructure/repositories/`

Fiche générique. Elle décrit l'état cible, où tout est en TypeScript.

Le gabarit commun, l'état du chantier et l'ordre de relecture sont dans `corpus-index.md`. L'écart avec
le code réel est mesuré dans les rapports de divergence, un par contexte. Ce qui empêche aujourd'hui le
typage de s'appliquer est dans `migration-typescript.md`.

> **À instruire**
>
> - I1 et I2 s'énoncent en termes d'« objet du domaine local », défini au § 1. À relire une fois pour
>   confirmer que la définition couvre bien les cas de I1 et I2.
> - Le numéro **I7** n'est pas attribué. Il portait « le modèle ne porte pas de méthode au service de
>   la persistance », qui est un invariant du **modèle**. Cet invariant est énoncé sous `E5` de
>   `fiche-entite.md`, avec sa vérification. Le numéro n'est pas réattribué.
> - Le grain de chargement désigne ce qu'un repository peut charger et renvoyer. Il dépend de la
>   décision sur ce que désigne un dossier `aggregates/`. Voir `fiche-racine-agregat.md`.
> - Les coûts du § 6 ne comptent que la règle elle-même. Il n'existe aucun plugin ESLint maison :
>   toute règle sur mesure suppose de créer cette infrastructure. Ce point est daté, comme la liste
>   des outils disponibles en tête du § 6 : à revérifier, et à retirer dès que l'infrastructure
>   existe.
> - Le numéro **I8** n'est pas attribué, et ne le sera pas. Voir la note au § 4.

## Sommaire

[1. Rôle](#1-rôle) · [2. Invariants](#2-invariants) ·
[3. Exceptions légitimes](#3-exceptions-légitimes) · [4. ROI des invariants](#4-roi-des-invariants) ·
[5. Écarts avec la théorie](#5-écarts-avec-la-théorie) ·
[6. Vérification déterministe](#6-vérification-déterministe) · [7. Le type](#7-le-type) ·
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
| [**X4**](#x4-plusieurs-repositories-pour-un-même-aggregate) | plusieurs repositories pour un même Aggregate | à surveiller |
| [**X6**](#x6-le-repository-couvre-aussi-laccès-aux-contextes-voisins) | le repository couvre aussi l'accès aux contextes voisins | rien à faire |

Hors numérotation : la définition d'un [objet du domaine local](#ce-quest-un-objet-du-domaine-local)
et la table [« ce que le repository n'est pas »](#ce-que-le-repository-nest-pas) au § 1, et
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
| l'API interne d'un autre Bounded Context | `infrastructure/repositories/` |

DDD nomme séparément l'Anticorruption Layer pour la dernière ligne. Le corpus ne reprend pas cette
distinction. L'écart est instruit sous X6 au § 5.

### Ce qu'est un objet du domaine local

Notion utilisée par I1 et I2, les invariants de sortie et d'entrée du repository.

Un objet du domaine local est un type déclaré dans le `domain/` **du contexte courant**, dont ce
contexte contrôle la construction.

| Est un objet du domaine local | N'en est pas un |
| --- | --- |
| une Entity, une Aggregate Root | une ligne de base de données |
| un Value Object | une charge utile HTTP désérialisée |
| un read-model produit par un repository du contexte | le DTO publié par l'API interne d'un autre contexte |

La dernière ligne de droite porte le cas le plus facile à manquer. Le format d'un voisin vient de
l'extérieur, même quand il a déjà la forme d'un objet. Sa traduction est le travail du repository.

### Ce que le repository n'est pas

Table de décision. Si le code correspond à une ligne, il ne va pas dans le repository.

| Le code… | Va dans | Fiche |
| --- | --- | --- |
| enchaîne plusieurs repositories, décide de l'ordre des opérations | `domain/usecases/` | `fiche-usecase.md` |
| applique une règle sur des objets d'une même frontière de cohérence | l'Aggregate Root, dans `domain/models/` | `fiche-racine-agregat.md` |
| applique une règle qui traverse plusieurs Aggregates, sans aucune I/O | `domain/services/` | `fiche-service-domaine.md` |
| contraint une valeur | un Value Object, dans `domain/models/` | `fiche-objet-valeur.md` |
| valide la cohérence interne d'une Entity | le constructeur du modèle, dans `domain/models/` | `fiche-entite.md` |
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

L'énoncé liste ce qui est interdit. « Renvoie un objet du domaine » serait trop fort et rejetterait
du code correct : voir § 3.

L'invariant se vérifie par fonction, pas par fichier. Un même fichier peut contenir une fonction
conforme et un passe-plat.

```js
// conforme — passage par une fonction de mapping locale
const result = await knexConnection('view-active-organization-learners')
  .where({ userId, organizationId })
  .first();
return result ? _toDomain(result) : null;

// fautif — passe-plat intégral : le fichier entier fait deux lignes
const canSelfDeleteAccount = async ({ userId, dependencies = { privacyUsersApi } }) => {
  return dependencies.privacyUsersApi.canSelfDeleteAccount({ userId });
};
```

La forme fautive est courte, lisible, et son nom est clair. Pourtant ce qu'elle renvoie est décidé
chez le voisin. Si `canSelfDeleteAccount` renvoie un jour `{ allowed, reason }` au lieu d'un booléen,
le code appelant casse à l'exécution. Aucune analyse statique ne le signale.

**Ce qui casse.** Un usecase lit un champ dont la forme est décidée par un autre contexte. Un
renommage dans ce contexte casse le contexte appelant à l'exécution. `dependency-cruiser` reste vert :
la dépendance de module n'a pas changé.

**Forme interdite.** Envelopper le DTO étranger dans une classe locale aux mêmes champs ne rend pas
le code conforme. Le lint passe au vert, mais la forme de l'autre contexte reste dans le domaine. La
traduction doit produire un type local dont les champs sont ceux que le domaine utilise.

### I2. Ne jamais accepter une structure de persistance en entrée

**Énoncé.** Les paramètres métier sont des objets du domaine local, des identifiants ou des
primitives. Jamais une ligne SQL, jamais le DTO d'un autre contexte, même reconditionné en objet
littéral.

```js
// conforme — un objet du domaine, ou des identifiants
await getOrCreateNewOrganizationLearner({ organizationLearner, userId, organizationId });
await findOrganizationLearner({ userId, organizationId });

// fautif — dans le usecase, le DTO étranger reconditionné en littéral
const user = await userRepository.findById({ userId });   // I1 violé en amont
await combinedCourseParticipantRepository.getOrCreateNewOrganizationLearner({
  userId,
  organizationId: combinedCourse.organizationId,
  organizationLearner: { firstName: user.firstName, lastName: user.lastName },
});
```

**Ce qui casse.** Même mécanique que I1, mais la fuite traverse le usecase.

I2 est un corollaire de I1. Il n'a pas de mode de violation propre et tombe si I1 est tenu partout. Il
figure séparément parce que le reconditionnement se relit différemment de la fuite d'origine.

### I3. `get*` lève, `find*` renvoie `null` ou une collection vide

**Énoncé.** Le préfixe du nom annonce le comportement en cas d'absence. `get…` lève une erreur du
domaine. `find…` renvoie `null` pour un élément, un tableau vide pour une collection.

```js
// fautif — un nom qui annonce une lecture tolérante, un corps qui lève
const findByTemporaryKey = async function (temporaryKey) {
  const knexConn = DomainTransaction.getConnection();
  const accountRecoveryDemandDTO = await knexConn
    .where({ temporaryKey })
    .select(/* … */)
    .from('account-recovery-demands')
    .first();

  if (!accountRecoveryDemandDTO) {
    throw new NotFoundError('No account recovery demand found');
  }

  return _toDomain(accountRecoveryDemandDTO);
};

// conforme, forme corrigée — le même corps, sous le nom qui annonce qu'il lève
const getByTemporaryKey = async function (temporaryKey) { /* corps identique */ };
```

Les deux corps sont identiques. Seul le nom diffère, et c'est lui qui dit à l'appelant s'il doit
prévoir un `try` ou un test à `null`.

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

Le motif fautif est le `catch` qui traduit un cas connu et relâche les autres. Les deux formes
cohabitent dans le même bloc. Le nom `one_active_organization_learner` rend la première branche
possible : la contrainte dit l'intention métier, donc la traduction est mécanique. Les violations non
reconnues doivent être traduites en une erreur de domaine générique.

**Ce qui casse.** Le mappeur d'erreurs associe les erreurs du domaine aux codes HTTP et à un code
d'erreur exploitable par le front. Une erreur non domaine produit une 500, sans code ni métadonnées : le
client ne peut ni la traiter ni la traduire.

**Prérequis.** La traduction n'est possible que si les contraintes de base portent un nom exprimant
l'intention métier. C'est une décision distincte, déjà prise. Voir § 10.

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

La forme fautive est la plus fréquente, et elle est trompeuse : `dependencies` est bien un paramètre, donc le test peut substituer
une doublure. Mais l'import reste écrit dans le fichier. La dépendance de module existe donc,
`dependency-cruiser` la voit et la règle de contexte se déclenche. Le paramètre rend le repository
testable sans le rendre découplé.

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

Ce fichier est le seul autorisé à importer les API des contextes voisins. C'est l'exception nommée
par I5.

**Ce qui casse.** L'injection ne s'applique qu'aux entrées de cet objet. Un repository absent n'a
jamais ses dépendances remplies : elles restent `undefined`, et il échoue au premier appel. Pour tout
repository couvert par I5, I6 a une conséquence d'exécution.

Second effet : l'index cesse d'être la liste exhaustive des ports du contexte, donc toute lecture
d'ensemble de l'index est fausse.

### I7 — numéro retiré

Cet invariant porte sur le **modèle**, pas sur le repository : il interdit au modèle du domaine
d'exposer une méthode dont le repository est le seul consommateur.

Il est énoncé sous `E5` de `fiche-entite.md`, avec ses illustrations, son exception du format publié et
sa vérification. Le numéro n'est pas réattribué.

Côté repository, la traduction vers la forme de stockage est son travail, sous forme de fonction
locale. C'est le pendant positif de `E5`, et c'est déjà ce que `I1` exige en sortie.

### I9. Nommage du fichier

**Énoncé.** Les noms de fichier sont cohérents à l'intérieur du contexte. L'uniformité du dépôt
n'est pas exigée.

Deux conventions sont possibles : `sujet-repository.js` et `sujet.repository.js`. Un contexte n'en
mélange pas deux. Aucune convention globale n'est choisie. Tant qu'elle ne l'est pas, l'incohérence
interne à un contexte est le seul défaut signalable.

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

La règle cachée ici est une règle métier : un élève désactivé qui revient sur un parcours est
réactivé sans que l'appelant le sache. Elle peut être voulue par le métier. Mais un fichier de
`infrastructure/`, sous une fonction nommée `getOrCreate…`, n'est pas l'endroit où cette décision se
cherche.

**Ce qui casse.** La règle vit à un endroit où personne ne la cherche. Elle sera réécrite différemment
ailleurs, et une modification du métier n'ira pas la chercher là.

**Cas limite, jugé en revue.** Une fonction qui enchaîne plusieurs appels dont l'ordre porte une
intention. Une garde sur un paramètre optionnel n'est pas une règle métier. Un enchaînement qui décrit
un processus relève de `domain/usecases/`.

### I11. Un repository n'importe pas un autre repository

**Énoncé.** Un repository n'importe aucun autre repository, ni de son contexte ni d'un autre.
Composer deux accès relève du usecase.

```js
// fautif — le repository importe d'autres repositories et compose leurs appels
import * as knowledgeElementRepository from '../../../shared/infrastructure/repositories/knowledge-element-repository.js';
import * as skillRepository from '../../../shared/infrastructure/repositories/skill-repository.js';

// extrait simplifié : dans le code, ces appels sont dans un Promise.all
export async function findPaginatedFilteredRecommendedByUserId({ userId, filters = {}, page, lang }) {
  const invalidatedKnowledgeElements = await knowledgeElementRepository.findInvalidatedAndDirectByUserId({ userId });
  const skills = await skillRepository.findOperativeByIds(invalidatedKnowledgeElements.map(({ skillId }) => skillId));
  …
}

// conforme, forme corrigée (hypothétique) — le usecase réel ne reçoit aujourd'hui que
// tutorialRepository ; dans la forme corrigée, il compose, et chaque repository reste un port
const findPaginatedFilteredTutorials = async function ({
  userId, filters, page, lang, knowledgeElementRepository, skillRepository, tutorialRepository,
}) {
  const invalidatedKnowledgeElements = await knowledgeElementRepository.findInvalidatedAndDirectByUserId({ userId });
  const skills = await skillRepository.findOperativeByIds(invalidatedKnowledgeElements.map(({ skillId }) => skillId));
  …
};
```

**Ce qui casse.** L'orchestration se retrouve à un endroit où aucune règle ne la cherche :

- I5 ne voit que les API internes et les clients ;
- I10 ne voit que les conditions métier ;
- la table du § 1 suppose que le code est déjà dans le bon fichier.

Un import vers le repository d'un autre contexte franchit en plus une frontière hors de l'API interne.
Les règles au grain du contexte le laissent passer si ce contexte est déclaré dans les dépendances
autorisées.

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
| Un repository de `jobs/` est une classe étendant une classe de base partagée, exportée en singleton | autorisé. La conversion en module de fonctions ne doit pas être faite |
| L'accesseur de connexion à la base est importé et non injecté | autorisé. Seule exception à I5 |
| Une fonction reçoit `knexConn` en paramètre, avec l'accesseur ambiant en valeur par défaut | autorisé **si l'appelant passe effectivement une autre connexion** — hors transaction, réplica, pool distinct. Voir X3 au § 5 |
| `getOrCreate*` ne lève pas alors qu'il commence par `get` | autorisé pour I3 seulement. Voir l'avertissement ci-dessous |

Lecture de I1 sur les premières lignes : un identifiant ou un scalaire est le langage du domaine. Ce
qui est interdit, c'est la forme de la persistance : un objet dont les clés sont des colonnes, ou un
DTO étranger.

### Avertissement

`getOrCreate*` est dispensé de I3 : il ne lève pas en cas d'absence parce qu'il crée. Le préfixe ne
dispense de rien d'autre : I10 s'applique. `getOrCreate*` est même le nom sous lequel une écriture
non annoncée passe le plus facilement. Le signal de I10, au § 6, désigne donc tout
`getOrCreate*` qui écrit : la revue juge ensuite si l'écriture porte une règle métier.

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

L'ordre de mise en œuvre du § 6 suit le **coût**, pas ce classement. I5 y figure en tête, avec I11.
I5 ne coûte qu'une ligne de configuration, alors que sa rentabilité est moyenne.

### Ce que ça n'apporte pas

Ces invariants ne disent pas si le modèle du domaine est le bon, ni si le découpage en contextes est
juste. Ils garantissent l'étanchéité des couches, pas la pertinence de la modélisation. I10 est celui
qui touche le plus au fond, et c'est aussi celui qu'aucun outil ne vérifie en entier.

Un invariant respecté sur un mauvais découpage a un ROI négatif, pas nul : le code s'appuie dessus,
donc la correction devient plus chère. Voir `invariants-clean-archi-ddd.md`.

---

## 5. Écarts avec la théorie

Deux axes : la nature de l'écart, et son rapport coût payé / bénéfice obtenu.

**Le verdict découle des deux colonnes du milieu.** Un coût payé sans bénéfice est à corriger : c'est
le seul verdict qui engage du travail. Table triée par verdict.

| Écart | Nature | Coût payé | Bénéfice obtenu | Verdict |
| --- | --- | --- | --- | --- |
| **X1** Aucun port n'est déclaré | dérive | l'injection et le code de câblage | **nul** : aucun contrat vérifiable | **À corriger** |
| **X2** Méthode de persistance sur le modèle | dérive | différé, à la prochaine migration de schéma | **nul** | **À corriger** |
| **X3** La connexion à la base ne passe pas par la signature | convention assumée | un usecase ne dit pas, à la lecture, s'il est transactionnel | réel : signatures propres | À surveiller |
| **X4** Plusieurs repositories pour un même Aggregate | convention assumée | quelques fichiers de plus, et A3 de `fiche-racine-agregat.md` tombe : compter les repositories ne dit plus rien de la conception | réel : chaque requête est écrite pour son besoin | À surveiller |
| **X6** Le repository couvre aussi l'accès aux contextes voisins | convention assumée | nul | réel : un seul concept, le domaine ignore la source | Rien à faire |

Le numéro **X5** n'est pas attribué. Il portait « `domain/usecases/index.js` importe
l'infrastructure ». C'est énoncé au § 5 de `fiche-usecase.md` sous `X3`, là où se trouve le fichier.
La règle qui l'exempte reste au § 6 de cette fiche. Le numéro n'est pas réattribué.

### X1. Aucun port n'est déclaré

**Ce que dit la théorie.** Le domaine déclare l'interface dont il a besoin, l'infrastructure
l'implémente.

**Exemple concret.** Le contrat d'un repository est le **nom du paramètre** que le usecase reçoit.

```js
// le usecase
const getCombinedCourseById = async ({ combinedCourseId, combinedCourseRepository, questRepository }) => {
  const combinedCourse = await combinedCourseRepository.getById({ id: combinedCourseId });
  …
};
```

Rien ne déclare que `combinedCourseRepository` sait faire `getById`, ni ce que cette fonction rend.
Une faute de frappe dans le nom de la méthode échoue à l'exécution. Un repository qui perd une
fonction ne casse aucune compilation.

**Correction.** Déclarer le port dans `domain/ports/` et annoter le repository contre lui : voir § 7.
Uniquement après la migration des modèles en `.ts`, parce qu'avant, le port ne vérifie rien.

### X2. Méthode de persistance sur le modèle

**Ce que dit la théorie.** Le modèle ne porte pas de méthode dont le repository est le seul
consommateur (Evans, ch. « A Model Expressed in Software »). C'est `E5` de `fiche-entite.md`.

**Exemple concret.** `Chat` porte `toDTO()` et `fromDTO()`, et le repository est le seul appelant.

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

La racine délègue à ses objets internes, qui portent chacun leur `toDTO()`. Déplacer le mapping dans
le repository suppose donc de déplacer toute la chaîne, pas une seule méthode.

**Correction.** Déplacer la fonction de mapping dans le repository, sous forme de fonction locale. Le
déplacement est mécanique. Exception à vérifier avant : si la forme sérialisée est un format publié,
la méthode reste sur le modèle. Voir `E5` de `fiche-entite.md`.

### X3. La connexion à la base ne passe pas par la signature

**Ce que dit la théorie.** Aucune source externe ne fixe la façon dont le repository reçoit sa
connexion. La source est interne : l'ADR 9 prescrivait la forme **explicite** : `domainTransaction` traverse la signature du usecase et celle du repository,
avec une transaction vide par défaut. L'ADR 25 **remplace** l'ADR 9. Il ne traite que des événements
dans les transactions, sans rien redécider sur la forme de la connexion.

**Exemple concret.** Le repository récupère sa connexion depuis un contexte implicite.

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
s'exécute dans une transaction : la réponse est dans le fichier qui l'appelle.

La forme ambiante a remplacé la forme prescrite par l'ADR 9, sans décision écrite. Ce n'est pas
une convention sans source : c'est une convention **contre** une source, dont l'abandon n'est pas
consigné.

**Une troisième forme, examinée et non retenue comme convention.**

```js
const getByCode = async ({ code, knexConn = DomainTransaction.getConnection() }) => { … };
```

Elle fonctionne : la valeur par défaut est évaluée à chaque appel, donc elle capte la transaction en
cours, et l'injection ne la gêne pas.

Mais elle ne réduit pas le coût de X3, qui porte sur la lecture d'un **usecase** : le usecase écrit
toujours `getByCode({ code })`. Elle informe seulement le lecteur du repository, qui sait déjà que le
repository utilise une connexion.

Elle ajoute en plus un coût : un paramètre par défaut qui appelle un contexte implicite annonce un
point d'extension que personne n'utilise. La forme en vigueur dit « je prends la connexion
ambiante ». La troisième forme laisse croire que l'appelant décide.

**Où elle est la bonne forme.** Pour une fonction qui doit pouvoir tourner sur une **autre** connexion
que celle en cours : hors transaction, sur un réplica de lecture, sur un pool distinct. Là, le
paramètre est utilisé, donc il n'annonce rien de faux. Elle est autorisée par exception, sur ces
fonctions, et non comme convention générale.

**Correction.** Aucune sur la forme, qui est en place partout et fonctionne. Ce qui manque est
l'écrit : un ADR court qui acte l'abandon de la forme explicite et son motif, des signatures propres.
Cet ADR reprend aussi la contrepartie : documenter le périmètre transactionnel quand il n'est pas
évident. C'est l'objet de `U7` dans `fiche-usecase.md`.

### X4. Plusieurs repositories pour un même Aggregate

**Ce que dit la théorie.** DDD associe un repository à une Aggregate Root, et un seul.

**Exemple concret.** Un repository est créé par **besoin de requête**, pas par Aggregate.

```
infrastructure/repositories/
  combined-courses/
    combined-course-repository.js                     getById, save
  combined-course-details-repository.js               findByOrganizationId, avec tout ce qu'un écran affiche
  combined-course-participations/
    combined-course-participation-repository.js       une Entity interne à la frontière
    organization-learner-participation-repository.js
  prescription/
    combined-course-participant-repository.js         la même frontière, vue d'un autre besoin
```

Cinq repositories pour un seul Aggregate. Les sous-dossiers portent le nom du besoin appelant, ce
qui dit exactement ce que le découpage est. DDD n'aurait qu'un repository.

Le bénéfice est réel : chaque requête est écrite pour son besoin, sans champ chargé pour rien et sans
repository générique que tout le monde étend. Sur une plateforme à fort trafic, ne pas charger la base
pour rien est une contrainte, pas une préférence.

Le débat porte sur l'alternative, et la littérature le règle. Deux options se présentent : beaucoup de
modèles, ou un modèle unique partiellement rempli selon l'appel.

Le **modèle partiellement rempli est écarté**. Un Aggregate est défini par ses invariants. Chargé
partiellement, il ne peut pas les garantir. Fowler nomme cette forme : c'est la variante *Ghost* du
pattern **Lazy Load** de *PoEAA*. Il en donne le coût : l'objet doit savoir aller chercher ce qui lui
manque, donc la connaissance de la persistance entre dans le modèle. C'est X2. Choisir cette option
pour résoudre X4 aggrave X2.

La réponse de la littérature au coût de chargement est ailleurs : **réduire l'Aggregate** pour que le
charger entier soit bon marché. C'est la règle 2 de Vernon, *design small aggregates*, motivée par ce
même coût.

Les modèles multiples sont admis à une condition : les modèles supplémentaires sont des
**read-models**, pas des Aggregates. Une lecture qui n'a pas besoin d'invariants ne passe pas par
l'Aggregate. Elle requête directement et produit la forme adaptée. Vernon appelle cela une *use case
optimal query*.

La forme retenue par la littérature est donc une troisième forme :

- un modèle d'écriture, l'Aggregate, petit et toujours chargé entier ;
- autant de modèles de lecture que de besoins, sans invariant.

**Correction.** Aucune sur le découpage. Deux points à tenir, d'où le verdict « à surveiller » :

1. Le **vocabulaire**. Compter les repositories d'un contexte ne dit plus combien il a de frontières de
   cohérence. Ne pas poser le mot « Aggregate » sur un dossier si les repositories ne suivent pas ce
   grain : voir A3 dans `fiche-racine-agregat.md`.
2. Les repositories créés pour un besoin de lecture renvoient des **read-models**, pas des Entities
   incomplètes : voir `fiche-read-model.md`. C'est la frontière à ne pas franchir. Plusieurs
   repositories est une convention tenable, un Aggregate à moitié chargé non.

Limite, selon Fowler : séparer lecture et écriture ajoute de la complexité et ne doit pas être le
défaut. La séparation se fait là où la pression de charge existe.

### X6. Le repository couvre aussi l'accès aux contextes voisins

**Ce que dit la théorie.** DDD appelle Anticorruption Layer la traduction du modèle d'un autre
Bounded Context, et la range à part. C'est l'écart annoncé au § 1.

**Exemple concret.** Deux fichiers du même dossier, deux sources différentes, un seul concept.

```
infrastructure/repositories/
  prescriber-repository.js            → des tables de la base
  privacy-users-api.repository.js     → l'API interne d'un autre Bounded Context
```

Le second fichier porte `-api.` dans son nom. Le nom signale la source, que la couche ne distingue
pas.

**Correction.** Aucune. C'est la lecture port/adaptateur : le domaine ignore la source, donc la couche
est uniforme. La seule conséquence de la source porte sur le type de test attendu, au § 8.

Ce repository est le seul point d'entrée vers le voisin : le usecase le reçoit, jamais l'API interne
elle-même. Voir `X6` de `fiche-usecase.md`.

---

## 6. Vérification déterministe

Outils disponibles : configuration `dependency-cruiser`, avec des règles générées depuis les
déclarations de dépendances de chaque contexte ; configuration ESLint ; knip, déjà branché dans
`npm run lint` ; scripts dans `tests/tooling/` ; ls-lint ; et le typage après migration.

Deux précisions sur les coûts :

- Il n'existe aucun plugin ESLint maison. Toute règle sur mesure suppose d'abord de créer cette
  infrastructure, et les estimations ci-dessous ne comptent que la règle.
- Les lignes dont le moyen est le typage ne vérifient rien avant que la chaîne de types soit migrée.
  Voir `migration-typescript.md`.

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

Le chemin s'écrit `src/.+/`, et non `src/[^/]+/`. Avec `src/[^/]+/`, un contexte à sous-contextes
n'est pas atteint, et la règle ne se déclenche jamais, sans erreur ni avertissement.

La règle se vérifie par contre-épreuve. Un import fautif introduit dans un sous-contexte doit la
déclencher. L'import est retiré ensuite.

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
l'infrastructure d'un **autre** contexte, ce qui reste une violation. La détecter demande une seconde
règle, qui exprime « un autre contexte que le sien » par un groupe capturé. C'est dans cette seconde
règle que le piège `src/.+/` contre `src/[^/]+/` se pose réellement : elle doit traiter les contextes à
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

Pour « l'erreur vient d'un `domain/errors.js` », la règle croise la classe levée avec la source de son
import. C'est une règle sur mesure, dont l'analyse reste locale au fichier.

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

Le script liste les fichiers de `src/<contexte>/infrastructure/repositories/**`, `index.js` exclu. Il
extrait les clés de l'objet des repositories dans l'index, puis compare les deux listes. Aucun faux
positif n'est possible. Le script peut vivre comme test plutôt que comme lint.

Le même script couvre I9 pour une dizaine de lignes de plus. Il connaît le contexte parcouru, donc il
peut appliquer la cohérence interne au contexte, là où ls-lint n'imposerait qu'une convention unique.

ls-lint ne convient pas pour I9 : ses règles d'extension ne descendent pas dans les sous-dossiers.
C'est vérifié par contre-épreuve : un mauvais nom à la racine de `api/` échoue, le même nom sous
`api/src/…/` passe. Étendre la portée à `src/**` est une décision à part.

### § 8 — les tests, par le même script

Le script parcourt déjà les fichiers de repository. Deux vérifications s'y greffent.

**Existence.** Chaque repository a un fichier de test. La correspondance se fait sur le **nom de
base**, après retrait du suffixe de test : un repository peut vivre dans un sous-dossier alors que son
test est à plat, et le suffixe de test n'est pas le même partout. Comparer les chemins produirait des
faux positifs là où comparer les noms de base n'en produit aucun.

La comparaison détecte deux cas, un dans chaque sens :

- un repository sans test ;
- un test dont aucun repository ne porte le nom. Ce cas détecte la faute de frappe dans un nom de
  fichier de test, qui sinon passe inaperçue puisque le test tourne quand même.

**Emplacement.** La source se lit dans les paramètres injectés, sans quitter le fichier :

| Signal dans le repository | Test attendu |
| --- | --- |
| un paramètre dont le nom correspond à `/Api$/` | unitaire, l'API mockée |
| un paramètre de connexion, ou un appel sur la connexion | intégration |
| les deux | les deux |
| aucun des deux | non classable : signalé, jamais deviné |

Le parcours d'AST est celui de I1 étape 1, qui repère déjà les paramètres en `/Api$/`. Coût marginal.

Cette vérification détecte un cas que la revue humaine laisse passer : un repository adossé à une API
et testé en intégration. Rien n'échoue, mais la suite monte une base de données pour rien à chaque
exécution.

**Trois limites.**

- Un fichier mixte attend les deux types. La règle exige donc *au moins* le type correspondant,
  jamais l'exclusivité.
- Une dépendance dont le nom ne finit pas par `Api`, comme un client ou un agent, n'est pas détectée.
  Le signal est suffisant, il n'est pas complet.
- Les exceptions du § 3 restent : un repository dont les fonctions ne renvoient que des scalaires n'a
  rien à traduire, donc rien à tester en unitaire.

Ces limites classent l'emplacement en faux positifs faibles plutôt qu'inexistants.

Le suffixe `Api` sur un paramètre ne remet pas la source dans le nommage de la couche : il nomme la
dépendance pour ce qu'elle est, là où un nom de fichier annoncerait la source du repository lui-même.

### I1 — deux étapes

L'énoncé complet demande de suivre l'origine des valeurs, donc une analyse de flot. Deux sous-cas se
détectent sans quitter la fonction.

**Étape 1 — passe-plat direct.** Zéro faux positif.

> Un `return` (ou `return await`) dont l'expression est directement un appel de méthode sur un
> paramètre dont le nom correspond à `/Api$/`.

Les cas acceptables, un effet de bord sans retour, ne comportent pas de `return`.

**Étape 2 — passe-plat via une variable locale.** Faux positifs faibles.

> Une variable affectée depuis un `await` sur un paramètre en `/Api$/`, puis renvoyée sans passer par
> un constructeur ni par une fonction locale. Le renvoi peut être direct, par indexation, ou via une
> expression conditionnelle.

```js
// l'étape 1 ne voit pas ceci
export async function findById({ userId, userApi }) {
  const users = await userApi.getActiveByUserIds({ userIds: [userId] });
  return users ? users[0] : null;
}
```

Les faux positifs de l'étape 2 viennent des fonctions qui renvoient un scalaire extrait de la réponse,
autorisées par le § 3.

Élargissement suivant, après l'étape 2 : `return <résultat d'await sur une requête>` sans passage par
un constructeur ou une fonction de mapping locale.

### I2 — pas de vérification propre

Vérifier les entrées demanderait de suivre les valeurs entre fichiers, hors de portée d'ESLint.
L'invariant tombe aussi si I1 est tenu : si aucun repository ne renvoie de DTO étranger, aucun DTO
étranger ne circule pour être passé en entrée. I2 se traite en corrigeant I1, puis par le typage.

### Ordre de mise en œuvre

Cet ordre suit le coût, pas le ROI du § 4.

1. **I11** et **I5** — configuration `dependency-cruiser`, avec `severity: 'error'` et contre-épreuve
2. **I4 partiel** — sélecteur `no-restricted-syntax`
3. **I6 + I9 + existence des tests** — un seul script de complétude
4. **I3** — première règle ESLint sur mesure, ce qui suppose de créer l'infrastructure de plugin
5. **I10 signal** — même parcours d'AST que I3
6. **I1 étape 1** puis **étape 2**, après correction des violations relevées dans le rapport de
   divergence
7. **§ 8 emplacement des tests** — réutilise le parcours d'AST de I1 étape 1
8. **I1 complet / I2** — par le typage, dans l'ordre de `migration-typescript.md`

Toute hypothèse sur le comportement d'un outil se vérifie par contre-épreuve avant d'être écrite :
introduire la violation, confirmer que l'outil la signale, retirer la violation.

### Corriger les violations

`api/codemods/` existe comme convention. Aucun outil de codemod n'est déclaré dans les dépendances.
En revanche, le paquet `typescript` est présent en dépendance de développement, pour `lint:types`.
Son API de compilation suffit à lire un AST et à réécrire des fichiers.

Critère de découpe : un codemod peut appliquer une décision, il ne peut pas en prendre une.

| Invariant | Codemod | Ce qu'il fait |
| --- | --- | --- |
| **I6** enregistré dans l'index | oui, complet | Insérer l'import et la clé dans l'index. Purement syntaxique |
| **I9** nommage cohérent | oui, complet | Renommer le fichier et réécrire tous les imports. La partie risquée est la mise à jour des appelants |
| **I5** dépendances injectées | oui, complet | Transformer un import direct en paramètre injecté et l'ajouter à l'index |
| **I11** n'importe pas un autre repository | partiel | Déplacer la composition vers le usecase appelant demande de savoir lequel, et de décider de l'ordre des appels |
| **I3** `get*` lève, `find*` renvoie `null` | partiel | Renommer et propager aux appelants, oui. Décider de quel côté corriger, non : faire lever un `find*` change le comportement de chaque site d'appel |
| **I4** erreurs du domaine | préparation seule | Repérer les `throw new Error(...)`, oui. Choisir l'erreur de domaine, non : ce choix détermine le code HTTP et le code d'erreur |
| **I1** en sortie, **I2** en entrée | préparation seule | Générer un squelette de type local à partir des champs lus chez les appelants. Le mapping est de la conception |
| **I10** règle métier | non | Déplacer du code entre couches demande de décider où il va |

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
préserver l'indentation, à condition de lancer la variante `:fix` après. Point non vérifié : la
configuration ESLint, qui hérite de `@1024pix/eslint-plugin`, porte-t-elle une règle de tri
d'imports ? Sinon, l'ordre des imports est rétabli par le formateur, ou pas du tout.

La règle de lint est l'oracle du codemod. Écrite d'abord, elle donne la liste exhaustive des sites et
le critère de succès : `npm run lint` doit passer au vert après passage du codemod.

---

## 7. Le type

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
stripping (voir `migration-typescript.md`), et elle impose un auto-import du module dans lui-même.

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

Indice de diagnostic, avec sa limite. Si un repository adossé à une API n'a rien à tester en
unitaire, c'est en général qu'il ne traduit rien, donc que I1 est violé.

La réciproque est fausse pour les cas du § 3 : une fonction qui renvoie un scalaire, un booléen ou
rien n'a rien à traduire en sortie, donc rien à tester en unitaire, sans violer I1. C'est un indice,
pas un test de conformité.

---

## 9. Checklist de revue

Ordonnée par ROI décroissant, conformément au § 4.

Chaque ligne porte son statut au regard du § 6 :

- Une ligne `[auto]` disparaît dès que la règle correspondante existe.
- Une ligne `[partiel]` reste, réduite à ce que la règle ne couvre pas.
- Une ligne `[humain]` reste en entier : aucun moyen déterministe n'est identifié.

Sept lignes sur treize sont `[auto]`. La checklist se vide donc de plus de la moitié de ses lignes à
mesure que le § 6 s'implémente. Une checklist dont la majorité des lignes sont vérifiées par un outil
entraîne à la parcourir sans la lire.

```
[ ] [partiel] I1  Aucun return ne rend directement une ligne de base, un DTO étranger ou une réponse HTTP
[ ] [partiel] I4  Tout throw cible une erreur du domaine ; aucun catch ne relâche l'erreur brute
[ ] [auto]    I6  Le fichier est enregistré dans infrastructure/repositories/index.js
[ ] [auto]    I11 Aucun import d'un autre repository, de ce contexte ou d'un autre
[ ] [auto]    I10 Aucune fonction en get*/find*/is*/has* qui écrit
[ ] [partiel] I2  Aucun paramètre métier n'est une ligne de base ou un DTO étranger, même reconditionné
[ ] [auto]    I3  Les get* lèvent, les find* renvoient null ou une collection vide
[ ] [auto]    I5  Aucun import d'API interne ni de client ; ils arrivent en paramètres (sauf la connexion)
[ ] [humain]  I10 Aucun branchement sur une condition métier, aucun enchaînement qui porte une intention
[ ] [auto]    I9  Nommage cohérent avec le reste du contexte
[ ] [auto]    Un fichier de test existe, et son nom correspond à celui du repository
[ ] [partiel] Test au bon endroit : intégration si base, unitaire avec mock si API interne
[ ] [humain]  Avant de signaler une violation de I1 ou I2, vérifier les exceptions du § 3
```

À terme, il reste six lignes : deux `[humain]` et quatre `[partiel]`.

- Les deux `[humain]` restent en entier : la part non décidable de I10, et le rappel des exceptions.
- Les quatre `[partiel]` se réduisent. I1 se réduit à ce que le typage seul règle, I2 au
  reconditionnement en littéral, I4 au traitement des `catch`, et l'emplacement des tests aux
  repositories que les paramètres ne classent pas.

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
| **X2** méthode de persistance sur le modèle, invariant `E5` de `fiche-entite.md` (ancien I7) | Evans, ch. « A Model Expressed in Software ». L'exception du format publié : ch. « Maintaining Model Integrity », **Published Language** | *DDD Reference* |
| **I9** nommage cohérent dans le contexte | aucune source | — |
| **I10** aucune règle métier | Martin, *Clean Architecture* (2017), ch. « Business Rules » et « Presenters and Humble Objects » | le livre de 2017 |
| **I11** n'importe pas un autre repository | aucune source. Déduction : composer deux accès est de l'orchestration, ce que la table du § 1 attribue au usecase | — |
| Grain de l'Aggregate, et le coût de chargement (X4) | Vernon, « Effective Aggregate Design », règle 2 *design small aggregates* — trois articles gratuits. Vernon, *IDDD*, pour la *use case optimal query* | dddcommunity.org |
| Contre le modèle partiellement rempli (X4) | Fowler, *PoEAA*, pattern **Lazy Load**, variante *Ghost*. Fowler, « CQRS » sur son bliki, pour la mise en garde sur la complexité ajoutée | bliki gratuit en ligne |
| Transaction en ambient context | choix Pix sans ADR. Les ADR 9 et 25 décident la transaction au grain du usecase, pas la forme ambient | ADR 9 et 25, pour ce qu'ils décident |

Trois invariants sur neuf n'ont aucune source : I3, I6, I9. I11 est une déduction explicite. La partie
« erreur du domaine » de I4 est une extrapolation d'Evans, même si ses prérequis Pix sont documentés.
Ce sont des conventions : elles se discutent sur leurs mérites, pas par appel à une autorité.

Note sur Evans et le repository : chez lui, un Repository retrouve les Aggregates de son propre
contexte. La lecture « port unique vers l'extérieur, contexte voisin compris » vient de la tradition
ports & adaptateurs. Evans fonde I1 et I2, pas le cadrage.
