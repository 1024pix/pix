# Domain Service

Un Domain Service porte une règle métier qui n'appartient à aucun objet. Il vit dans
`domain/services/`.

Cette page est la **référence** : les règles, les cas permis, les tests et la checklist. Dans le même
dossier :

- [`explication.md`](explication.md) : pourquoi ces règles, ce qu'elles rapportent, la théorie et
  l'histoire des décisions ;
- [`outillage.md`](outillage.md) : mettre en place les vérifications automatiques ;
- [`ecarts.md`](ecarts.md) : où le code s'écarte de la théorie, et ce qui est décidé.

Les règles de cette page s'appliquent à tout fichier de `domain/services/`, sauf le fichier de câblage
`index.js`. La ligne **Vérification** de chaque invariant dit par quel moyen la règle se vérifie. Ce
qui est en place dans la CI est dans [`outillage.md`](outillage.md).

## Sommaire

[Rôle](#rôle) · [Invariants](#invariants) · [Exceptions légitimes](#exceptions-légitimes) ·
[Exemple complet](#exemple-complet) · [Tests attendus](#tests-attendus) ·
[Checklist de revue](#checklist-de-revue) · [Sources](#sources)

| # | Invariant | Vérification |
| --- | --- | --- |
| [**D1**](#d1-aucune-io-aucune-dépendance-injectée) | aucune I/O, aucune dépendance injectée | règle ESLint, sans faux positif |
| [**D2**](#d2-prend-des-objets-du-domaine-en-renvoie) | prend des objets du domaine, en renvoie | revue |
| [**D3**](#d3-sans-état-et-sans-effet-sur-ses-entrées) | sans état, et sans effet sur ses entrées | règle ESLint, partielle |
| [**D4**](#d4-cest-un-dernier-recours) | c'est un dernier recours | aucun outil, signal faible |
| [**D5**](#d5-nommé-par-la-règle-pas-par-la-ressource) | nommé par la règle, pas par la ressource | script, faux positifs non mesurés |

Hors numérotation : le [test de discrimination](#le-test-de-discrimination). En quatre questions, il
départage objet, Aggregate, usecase et service.

---

## Rôle

Un Domain Service porte une règle métier qui n'appartient à aucun objet. Soit elle traverse
plusieurs Aggregates, soit aucun objet n'en est le propriétaire naturel.

Il reçoit des objets du domaine et en renvoie. Il ne charge rien, n'écrit rien et ne garde aucun état.

C'est une catégorie de **dernier recours**. Un service ne se crée qu'après une tentative de placer la
règle sur un Value Object, une Entity ou une Aggregate Root. Créer un service par facilité retire la
logique des modèles, qui deviennent anémiques.

### Le test de discrimination

Les questions se posent dans cet ordre.

1. *La règle porte-t-elle sur les données d'un seul objet ?* → elle va sur ce **Value Object** ou
   cette **Entity**.
2. *Porte-t-elle sur plusieurs objets d'une même frontière de cohérence ?* → elle va sur l'**Aggregate
   Root**.
3. *A-t-elle besoin de charger ou d'écrire quoi que ce soit ?* → c'est un **usecase**, pas un service.
4. *Reste-t-il une règle sans propriétaire naturel, qui se calcule sur des objets déjà fournis ?*
   → **Domain Service**.

En pratique, la question 3 décide le plus souvent. C'est aussi la plus facile à vérifier : le fichier
reçoit-il un paramètre dont le nom correspond à `/(Repository|Api|Storage)$/` ?

Le dossier ne suffit pas à répondre. `domain/services/` est réservé aux vrais Domain Services. Un
fichier de `domain/services/` qui fait des I/O est un usecase : il va dans `domain/usecases/`, et
`../usecase/README.md` s'applique à lui en entier. Voir `X1` de [`ecarts.md`](ecarts.md).

### Ce qu'un Domain Service n'est pas

Si le code correspond à une ligne, ce n'est pas un Domain Service.

| Le code… | Va dans | Référence |
| --- | --- | --- |
| charge ou écrit des données, même une seule fois | `domain/usecases/` | `../usecase/README.md` |
| est réutilisé par plusieurs usecases **et** fait des I/O | `domain/usecases/` : c'est un sous-usecase | `../usecase/README.md` |
| applique une règle sur un seul objet | le Value Object ou l'Entity concernée | `../objet-valeur/README.md`, `../entite/README.md` |
| applique une règle dans une frontière de cohérence | l'Aggregate Root | `../racine-agregat/README.md` |
| évalue un prédicat composable configuré par des données | une Specification | `../specification/README.md` |
| met en forme pour une lecture | un read-model | `../read-model/README.md` |
| garde un état entre deux appels | rien : un Domain Service est sans état | — |

---

## Invariants

### D1. Aucune I/O, aucune dépendance injectée

**Énoncé.** Un Domain Service ne reçoit ni repository, ni API interne, ni client de stockage.
C'est l'invariant qui définit la catégorie.

```js
// conforme — tout ce dont il a besoin lui est donné, la date comprise
export function filterKnowledgeElements({
  knowledgeElements,
  createdAt,
  isRetrying = false,
  isImproving = false,
  isFromCampaign = false,
  minimumDelayInDaysBeforeImproving = MINIMUM_DELAY_IN_DAYS_BEFORE_IMPROVING,
}) { … }

// fautif — reçoit un repository, donc fait des I/O : c'est un usecase
const getModuleByLink = async function ({ link, moduleMetadataRepository }) { … };
```

**Code.** Conforme : [`improvement-service.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/evaluation/domain/services/improvement-service.js#L20-L27). Fautif : [`module-service.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/devcomp/domain/services/module-service.js#L6-L12).

Le premier service importe `dayjs` et une constante partagée. C'est conforme : D1 interdit
l'infrastructure, pas les bibliothèques de calcul. Le point important est que la date de référence
arrive en paramètre. Le service ne lit pas l'heure, donc son test peut la fixer.

L'interdiction couvre aussi l'infrastructure implicite :

- le journal ;
- l'horloge ;
- l'aléatoire ;
- la configuration.

Une date ou un générateur arrive en paramètre, comme pour une Entity.

**Ce qui casse.** Le service n'est plus testable en unitaire pur : il demande une base ou une doublure.
Il devient aussi un usecase sans que personne l'ait décidé, dans un dossier qui annonce le contraire.

**Vérification.** Une règle ESLint sur la signature : un paramètre dont le nom finit par `Repository`,
`Api` ou `Storage`. Une règle `dependency-cruiser` pour les imports d'infrastructure. Voir
[`outillage.md`](outillage.md#d1--la-règle-qui-force-la-décision).

### D2. Prend des objets du domaine, en renvoie

**Énoncé.** Les entrées et les sorties sont :

- des objets du domaine local ;
- des Value Objects ;
- des scalaires.

Jamais :

- une ligne de base ;
- le DTO d'un autre contexte ;
- un objet préparé pour une réponse HTTP.

```js
// conforme — des objets du domaine et des scalaires, un nombre en sortie
export const getMasteryPercentage = (knowledgeElements, skillIds, round = true) => { … };
```

**Code.** [`get-mastery-percentage-service.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/evaluation/domain/services/get-mastery-percentage-service.js#L11).

Une ligne de ce service réel est un signal :

```js
skillIds.some((id) => String(id) === String(knowledgeElement.skillId))
```

**Code.** [`get-mastery-percentage-service.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/evaluation/domain/services/get-mastery-percentage-service.js#L17).

La double conversion en chaîne montre que les deux identifiants n'arrivent pas dans le même type. Le
service se protège d'entrées non normalisées. D2 vise justement à rendre cette protection inutile :
avec des objets du domaine validés en entrée, la comparaison serait directe.

**Conséquence.** Un Domain Service ne renvoie pas de read-model. Produire une projection pour
l'affichage, c'est de la mise en forme, pas une règle métier.

**Ce qui casse.** La règle dépend d'une forme décidée ailleurs, comme un schéma de base ou le contrat
d'un voisin. Un changement de cette forme casse la règle.

**Vérification.** La revue. Voir [`outillage.md`](outillage.md#vérifications).

### D3. Sans état, et sans effet sur ses entrées

**Énoncé.** Pas de champ, pas de mémoire entre deux appels. Le service est un module de fonctions
exportées, ou une classe sans état. Il ne modifie pas ce qu'il reçoit.

```js
// conforme, malgré les apparences — les objets modifiés sont ceux que le service vient de créer
function computeTubesFromSkills(skills) {
  const tubes = [];

  skills.forEach((skill) => {
    const tubeNameOfSkill = skill.tubeNameWithoutPrefix;
    const existingTube = tubes.find((tube) => tube.name === tubeNameOfSkill);
    if (existingTube) {
      existingTube.addSkill(skill);                       // un tube local
    } else {
      tubes.push(new Tube({ skills: [skill], name: tubeNameOfSkill }));
    }
  });
  tubes.forEach((tube) => {
    tube.skills = _.sortBy(tube.skills, ['difficulty']);  // idem
  });

  return tubes;
}

// fautif — le tableau reçu est trié sur place : Array#sort le modifie
export function getNextActivityInfo({ activities, stepCount }) {
  const byDescendingCreatedAt = (a, b) => b.createdAt - a.createdAt;
  const sortedActivities = activities.sort(byDescendingCreatedAt);
  // …
}
```

**Code.** Conforme : [`tube-service.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/evaluation/domain/services/tube-service.js#L5-L22). Fautif : [`get-next-activity-info.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/school/domain/services/get-next-activity-info.js#L9-L11).

L'exemple conforme ressemble à une violation : deux modifications et une affectation de propriété.
Mais D3 porte sur les entrées, pas sur les objets créés dans la fonction. Un service qui construit sa
réponse par étapes reste sans état.

**Ce qui casse.** La signature annonce une fonction pure, et la fonction ne l'est pas. L'appelant voit
un objet changer sans qu'aucune affectation n'apparaisse dans son code. C'est le défaut le plus long à
diagnostiquer parmi ceux de ce dossier.

L'objet modifié a aussi une faille : il aurait dû refuser la modification (`V1` de
`../objet-valeur/README.md`, `E6` de `../entite/README.md`).

**Vérification.** Une règle ESLint signale un champ de classe dans un fichier de `domain/services/`.
L'absence d'effet sur les entrées se vérifie en revue et par un test. Voir
[`outillage.md`](outillage.md#vérifications).

### D4. C'est un dernier recours

**Énoncé.** Un service ne se crée qu'après une réponse négative aux trois premières questions du
[test de discrimination](#le-test-de-discrimination). Le service accueille la règle qui n'a pas de
propriétaire naturel.

```js
// fautif — dans domain/services/, une seule collection d'objets en entrée
function computeTubesFromSkills(skills) { … }

// conforme, forme corrigée — la règle vit sur l'objet, sous une fabrique nommée
Tube.groupFromSkills(skills);
```

**Code.** Fautif : [`tube-service.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/evaluation/domain/services/tube-service.js#L5). La forme corrigée est hypothétique.

**Signal.** Un service qui prend un seul objet du domaine, ou une seule collection d'objets, et
rien d'autre. Sa règle appartient presque toujours à cet objet, ou à l'objet qu'il produit.

**Ce qui casse.** Avec le temps, les modèles ne contiennent plus que des champs, et toute la logique
vit dans des fonctions à côté. C'est un modèle anémique que personne n'a choisi. Voir `X2` de
[`ecarts.md`](ecarts.md).

**Vérification.** Aucun outil. Le signal justifie une revue, pas un verdict. Voir
[`outillage.md`](outillage.md#ce-qui-nest-pas-mécanisable).

### D5. Nommé par la règle, pas par la ressource

**Énoncé.** Le nom du fichier dit ce qu'il calcule ou décide. Ce n'est pas le nom d'une Entity.

```
get-competence-level.js         — dit ce que le fichier calcule
get-campaign-progression.js     — idem
scorecard-service.js            — ne dit rien, et attire tout ce qui touche à la carte de score
```

**Code.** [Le dossier](https://github.com/1024pix/pix/tree/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/evaluation/domain/services).
Les deux premiers noms illustrent D5 seulement : les deux fichiers reçoivent ou importent un
repository, et violent donc D1.

**Ce qui casse.** Un fichier nommé d'après une ressource et suffixé `-service` accepte n'importe
quelle fonction : rien ne permet de refuser un ajout. Un nom de règle donne un critère de refus. Voir
`X3` de [`ecarts.md`](ecarts.md).

**Vérification.** Un script signale un nom de fichier terminant par `-service`. Voir
[`outillage.md`](outillage.md#vérifications).

---

## Exceptions légitimes

Une exception ne vaut que pour l'invariant qu'elle nomme. Elle n'excuse rien d'autre.

| Invariant | Cas | Statut |
| --- | --- | --- |
| **D1** | Un service reçoit `now` ou un générateur en paramètre | **autorisé**, c'est la forme correcte de D1 |
| **D1** | Un service reçoit une constante de configuration en paramètre | **autorisé** : c'est une donnée, pas une dépendance |
| **D1** | Un service asynchrone sans I/O, qui découpe un calcul long | **autorisé** si aucun `await` ne porte sur une I/O, mais rare |
| **D2** | Un service prend plusieurs objets du domaine et renvoie un Value Object | **autorisé**, c'est le cas nominal de D2 |
| **D3** | Un service exporté sous forme de classe sans état | **autorisé**, mais le module de fonctions est la forme préférée : voir [`explication.md`](explication.md#le-module-de-fonctions-plutôt-que-la-classe) |
| **D1** | Un service partagé entre plusieurs usecases | **autorisé** si D1 tient. Le partage n'est pas le critère |
| **D1** | Le fichier de câblage `index.js` importe l'infrastructure | **autorisé**, exclu des règles de D1 : il câble, il ne porte aucune règle. Voir `X3` de `../usecase/ecarts.md` |
| **D1** | Un service qui reçoit un repository | **pas une exception** : c'est un usecase, quel que soit son dossier |
| **D4** | Un service qui prend un seul objet du domaine | **pas une exception**, mais un signal : la règle appartient probablement à cet objet, ou à celui qu'il produit |

---

## Exemple complet

Un service réel conforme et son test. Il n'a pas d'enregistrement : il ne reçoit aucune dépendance à
injecter, ce qu'exige D1.

```js
// le service — deux entrées, un scalaire en sortie, aucune I/O, nommé par la règle
export function computeGlobalResult(stepResults, dareResult) {
  if (dareResult === REACHED) {
    return EXCEEDED;
  }

  const lastStepResult = stepResults.at(-1);
  if (dareResult === NOT_REACHED || lastStepResult === REACHED) {
    return REACHED;
  }

  if (stepResults.length > 1) {
    return PARTIALLY_REACHED;
  }

  return NOT_REACHED;
}
```

```js
// le test — unitaire pur : aucune base, aucune doublure
describe('Unit | Domain | Pix Junior | compute global result', function () {
  context('When the dare is successful', function () {
    it(`should return ${Assessment.results.EXCEEDED}`, function () {
      const stepResults = [Assessment.results.REACHED];
      const dareResult = Assessment.results.REACHED;

      const result = computeGlobalResult(stepResults, dareResult);

      expect(result).to.equal(Assessment.results.EXCEEDED);
    });
  });

  context('When the dare is unsuccessful', function () {
    it(`should return ${Assessment.results.REACHED}`, function () {
      const stepResults = [Assessment.results.REACHED];
      const dareResult = Assessment.results.NOT_REACHED;

      const result = computeGlobalResult(stepResults, dareResult);

      expect(result).to.equal(Assessment.results.REACHED);
    });
  });
  // …
});
```

**Code.** Le service : [`compute-global-result.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/school/domain/services/compute-global-result.js#L5-L20). Le test : [`compute-global-result_test.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/tests/school/unit/domain/services/compute-global-result_test.js#L6-L27), tronqué.

---

## Tests attendus

| Objet | Type de test | Ce qu'on vérifie |
| --- | --- | --- |
| Domain Service | **unitaire pur** : aucune base, aucune doublure | la règle, sur le cas nominal **et** les cas limites |
| Absence d'effet sur les entrées | **unitaire** | que les objets passés ne sont pas modifiés |

L'existence du fichier de test se vérifie en comparant les noms. Voir
[`outillage.md`](outillage.md#lexistence-du-test-unitaire-comme-indicateur).

Deux indices de diagnostic, avec leurs limites :

- Un service qui a besoin d'une **doublure** viole D1. La doublure n'est pas une contrainte du test,
  c'est le diagnostic. Cet indice n'a pas de limite : un vrai Domain Service n'en demande jamais.
- Le **test d'absence d'effet** est celui qui manque le plus souvent. C'est le seul qui prouve D3.
  Limite : un service qui ne reçoit que des scalaires n'a rien à modifier.

---

## Checklist de revue

Ordonnée par ROI décroissant. Le statut de chaque ligne vient du moyen de vérification décrit dans
[`outillage.md`](outillage.md) :

- `[auto]` : la ligne disparaît dès que la règle existe ;
- `[partiel]` : la ligne reste, réduite à ce que la règle ne couvre pas ;
- `[humain]` : la ligne reste en entier.

```
[ ] [auto]    D1  Aucun paramètre en *Repository, *Api, *Storage ; aucun import d'infrastructure
[ ] [humain]  D1  Ni journal, ni horloge, ni aléatoire, ni configuration lue directement : tout entre en paramètre
[ ] [humain]  D4  La règle ne pouvait pas vivre sur un Value Object, une Entity ou une Aggregate Root
[ ] [partiel] D3  Aucun état ; les objets reçus ne sont pas modifiés
[ ] [humain]  D2  Entrées et sorties sont des objets du domaine local ou des scalaires
[ ] [partiel] D5  Le fichier est nommé par la règle, pas par une ressource suffixée -service
[ ] [auto]    Un fichier de test unitaire existe, et son nom correspond à celui du service
[ ] [humain]  Test unitaire pur, sans doublure, avec les cas limites
[ ] [humain]  Un test prouve que les entrées ne sont pas modifiées
[ ] [humain]  Si le service prend un seul objet ou une seule collection, vérifier que la règle ne lui appartient pas
```

À terme, huit lignes restent : deux `[partiel]` et six `[humain]`.

---

## Sources

L'argumentation et la bibliographie sont dans [`explication.md`](explication.md#sources) et
`../references-ddd.md`. Les ADR sont dans `docs/adr/`.

| Invariant | Origine |
| --- | --- |
| La catégorie, et **D1**, **D2**, **D3** | Evans, *DDD*, définition du Service |
| **D4** dernier recours | Evans, même chapitre. Fowler, « AnemicDomainModel », pour le symptôme |
| **D5** nommé par la règle | convention propre à ce dossier, sans source |
| La distinction service / usecase | Martin, *Clean Architecture* |
| Le sens du dossier `services/` | décision d'équipe, sans ADR. L'ADR 51, « Arborescence API », et l'ADR 20, « Est-il obligatoire d'implémenter un use-case dans toutes les situations ? », ne le fixent pas : voir [`explication.md`](explication.md#le-sens-du-dossier-services) |
