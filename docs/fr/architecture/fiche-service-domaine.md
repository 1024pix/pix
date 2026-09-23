# Fiche — Service de domaine

Fiche générique. Elle décrit l'état cible, où tout est en TypeScript.

Le gabarit commun, l'état du chantier et l'ordre de relecture sont dans `corpus-index.md`. L'écart avec
le code réel est mesuré dans les rapports de divergence, un par contexte. Ce qui empêche aujourd'hui le
typage de s'appliquer est dans `migration-typescript.md`.

> **À instruire**
>
> - `domain/services/` est réservé aux vrais services de domaine. Les fichiers qui font des I/O vont
>   dans `usecases/`. Cette décision reste à écrire dans un ADR. Ses conséquences sont dans `X1` au
>   § 5.
> - Le numéro D6 n'est pas attribué. Il portait « testable en unitaire pur », qui découle de D1 et
>   fait l'objet du § 8.
> - D4 est l'invariant le plus rentable de la fiche, et aucun outil ne le vérifie. Le seul signal
>   connu est faible.

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
| [**D1**](#d1-aucune-io-aucune-dépendance-injectée) | aucune I/O, aucune dépendance injectée | **forte** | règle ESLint, sans faux positif |
| [**D4**](#d4-cest-un-dernier-recours) | c'est un dernier recours | **forte** | aucun outil, signal faible |
| [**D3**](#d3-sans-état-et-sans-effet-sur-ses-entrées) | sans état, et sans effet sur ses entrées | moyenne | règle ESLint, partielle |
| [**D2**](#d2-prend-des-objets-du-domaine-en-renvoie) | prend des objets du domaine, en renvoie | moyenne | revue |
| [**D5**](#d5-nommé-par-la-règle-pas-par-la-ressource) | nommé par la règle, pas par la ressource | hygiène | script, à mesurer |

**Écarts** — tous à corriger. Le § 5 dit pourquoi.

| # | Écart | Verdict |
| --- | --- | --- |
| [**X1**](#x1-le-dossier-services-mélange-deux-natures-de-fichiers) | le dossier `services/` mélange deux natures de fichiers | **à corriger** |
| [**X2**](#x2-la-règle-est-placée-dans-un-service-plutôt-que-sur-un-objet) | la règle est placée dans un service plutôt que sur un objet | **à corriger** |
| [**X3**](#x3-le-fichier-est-nommé-par-la-ressource-et-suffixé--service) | le fichier est nommé par la ressource et suffixé `-service` | **à corriger** |

Hors numérotation : le [test de discrimination](#le-test-de-discrimination) du § 1. En quatre
questions, il départage objet, agrégat, usecase et service. `fiche-usecase.md` y renvoie.

---

## 1. Rôle

Un service de domaine porte une règle métier qui n'appartient à aucun objet. Soit elle traverse
plusieurs agrégats, soit aucun d'eux n'en est le propriétaire naturel.

Il reçoit des objets du domaine et en renvoie. Il ne charge rien, n'écrit rien et ne garde aucun état.

C'est une catégorie de **dernier recours**. On n'y vient qu'après avoir essayé de placer la règle sur
un objet-valeur, une entité ou une racine d'agrégat. Créer un service trop tôt retire la logique des
modèles, qui deviennent anémiques.

### Le test de discrimination

Poser les questions dans cet ordre. Le test sert aussi à `fiche-usecase.md`, qui y renvoie.

1. *La règle porte-t-elle sur les données d'un seul objet ?* → elle va sur cet **objet-valeur** ou
   cette **entité**.
2. *Porte-t-elle sur plusieurs objets d'une même frontière de cohérence ?* → elle va sur la **racine
   d'agrégat**.
3. *A-t-elle besoin de charger ou d'écrire quoi que ce soit ?* → c'est un **usecase**, pas un service.
4. *Reste-t-il une règle qui traverse plusieurs agrégats et se calcule sur des objets déjà fournis ?*
   → **service de domaine**.

En pratique, la question 3 décide le plus souvent. C'est aussi la plus facile à vérifier : le fichier
reçoit-il un paramètre dont le nom correspond à `/(Repository|Api|Storage)$/` ?

Le dossier ne suffit pas à répondre. Un fichier de `domain/services/` qui fait des I/O est un usecase,
et `fiche-usecase.md` s'applique à lui en entier. Voir X1 au § 5.

### Ce qu'un service de domaine n'est pas

Si le code correspond à une ligne, ce n'est pas un service de domaine.

| Le code… | Va dans | Fiche |
| --- | --- | --- |
| charge ou écrit des données, même une seule fois | `domain/usecases/` | `fiche-usecase.md` |
| est réutilisé par plusieurs usecases **et** fait des I/O | `domain/usecases/` : c'est un sous-usecase | `fiche-usecase.md` |
| applique une règle sur un seul objet | l'objet-valeur ou l'entité concernée | `fiche-objet-valeur.md`, `fiche-entite.md` |
| applique une règle dans une frontière de cohérence | la racine d'agrégat | `fiche-racine-agregat.md` |
| évalue un prédicat composable configuré par des données | une Specification | `fiche-specification.md` |
| met en forme pour une lecture | un read-model | `fiche-read-model.md` |
| garde un état entre deux appels | rien : un service de domaine est sans état | — |

---

## 2. Invariants

### D1. Aucune I/O, aucune dépendance injectée

**Énoncé.** Un service de domaine ne reçoit ni repository, ni API interne, ni client de stockage.
C'est l'invariant qui définit la catégorie.

```js
// conforme — tout ce dont il a besoin lui est donné, la date comprise
export function filterKnowledgeElements({
  knowledgeElements,
  createdAt,
  isImproving = false,
  minimumDelayInDaysBeforeImproving = MINIMUM_DELAY_IN_DAYS_BEFORE_IMPROVING,
}) { … }

// fautif — reçoit un repository, donc fait des I/O : c'est un usecase
const getModuleByLink = async function ({ link, moduleMetadataRepository }) { … };
```

Le premier service importe `dayjs` et une constante partagée. C'est conforme : D1 interdit
l'infrastructure, pas les bibliothèques de calcul. Le point important est que la date de référence
arrive en paramètre. Le service ne lit pas l'heure, donc son test peut la fixer.

L'interdiction couvre aussi l'infrastructure implicite : journal, horloge, aléatoire, configuration.
Une date ou un générateur arrive en paramètre, comme pour une entité.

**Ce qui casse.** Le service n'est plus testable en unitaire pur : il faut une base ou une doublure.
Il devient aussi un usecase sans que personne l'ait décidé, dans un dossier qui annonce le contraire.

La détection est simple : un paramètre dont le nom finit par `Repository`, `Api` ou `Storage`. Voir le
§ 6.

### D2. Prend des objets du domaine, en renvoie

**Énoncé.** Les entrées et les sorties sont des objets du domaine local, des objets-valeurs ou des
scalaires. Jamais une ligne de base, jamais le DTO d'un autre contexte, jamais un objet préparé pour
une réponse HTTP.

```js
// conforme — des objets du domaine et des scalaires, un nombre en sortie
export const getMasteryPercentage = (knowledgeElements, skillIds, round = true) => { … };
```

Une ligne de ce service réel est un signal :

```js
skillIds.some((id) => String(id) === String(knowledgeElement.skillId))
```

La double conversion en chaîne montre que les deux identifiants n'arrivent pas dans le même type. Le
service se protège d'entrées non normalisées. D2 vise justement à rendre cette protection inutile :
avec des objets du domaine validés en entrée, la comparaison serait directe.

**Ce qui casse.** La règle dépend d'une forme décidée ailleurs, comme un schéma de base ou le contrat
d'un voisin. Un changement de cette forme casse la règle.

**Conséquence.** Un service de domaine ne renvoie pas de read-model. Produire une projection pour
l'affichage, c'est de la mise en forme, pas une règle métier.

### D3. Sans état, et sans effet sur ses entrées

**Énoncé.** Pas de champ, pas de mémoire entre deux appels. Le service est un module de fonctions
exportées, ou une classe sans état. Il ne modifie pas ce qu'il reçoit.

```js
// conforme, malgré les apparences — les objets modifiés sont ceux que le service vient de créer
function computeTubesFromSkills(skills) {
  const tubes = [];

  skills.forEach((skill) => {
    const existingTube = tubes.find((tube) => tube.name === skill.tubeNameWithoutPrefix);
    if (existingTube) {
      existingTube.addSkill(skill);                       // un tube local
    } else {
      tubes.push(new Tube({ skills: [skill], name: skill.tubeNameWithoutPrefix }));
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

L'exemple conforme ressemble à une violation : deux modifications et une affectation de propriété.
Mais D3 porte sur les entrées, pas sur les objets créés dans la fonction. Un service qui construit sa
réponse par étapes reste sans état.

**Ce qui casse.** La signature annonce une fonction pure, et la fonction ne l'est pas. L'appelant voit
un objet changer sans qu'aucune affectation n'apparaisse dans son code. C'est le défaut le plus long à
diagnostiquer parmi ceux de cette fiche.

Un service qui modifie son entrée révèle aussi une faille de l'objet modifié : il viole V1 ou E6, qui
auraient dû l'interdire.

### D4. C'est un dernier recours

**Énoncé.** On ne crée un service qu'après avoir répondu non aux trois premières questions du test de
discrimination. Le service accueille la règle qui n'a pas de propriétaire naturel.

**Pourquoi c'est un invariant.** Un service de domaine est la solution la plus facile. Écrire une
fonction qui prend deux objets et renvoie un booléen va toujours plus vite qu'ajouter une méthode à
une entité en vérifiant que son invariant tient.

**Ce qui casse.** Avec le temps, les modèles ne contiennent plus que des champs, et toute la logique
vit dans des fonctions à côté. C'est un modèle anémique que personne n'a choisi. Voir X2 au § 5.

**Le signal.** Un service qui prend un seul objet du domaine, et rien d'autre. Sa règle appartient
presque toujours à cet objet.

### D5. Nommé par la règle, pas par la ressource

**Énoncé.** Le nom du fichier dit ce qu'il calcule ou décide. Ce n'est pas le nom d'une entité.

```
get-competence-level.js         — dit ce que ça fait
get-campaign-progression.js     — idem
scorecard-service.js            — ne dit rien, et attire tout ce qui touche à la carte de score
```

**Ce qui casse.** Un fichier nommé d'après une ressource et suffixé `-service` accepte n'importe
quelle fonction : rien ne permet de refuser un ajout. Un nom de règle, lui, donne ce critère. Voir X3
au § 5.

---

## 3. Exceptions légitimes

Une exception ne vaut que pour l'invariant qu'elle nomme. Elle n'excuse rien d'autre.

| Cas | Statut |
| --- | --- |
| Un service reçoit `now` ou un générateur en paramètre | **autorisé**, c'est la forme correcte de D1 |
| Un service reçoit une constante de configuration en paramètre | **autorisé** : c'est une donnée, pas une dépendance |
| Un service asynchrone sans I/O, qui découpe un calcul long | **autorisé**, mais rare. Vérifier qu'aucun `await` ne porte sur une I/O |
| Un service prend plusieurs objets du domaine et renvoie un objet-valeur | **autorisé**, c'est le cas nominal de D2 |
| Un service exporté sous forme de classe sans état | **autorisé** : la forme compte moins que D3 |
| Un service partagé entre plusieurs usecases | **autorisé** si D1 tient. Le partage n'est pas le critère |
| Un service qui reçoit un repository | **pas une exception** : c'est un usecase, quel que soit son dossier |
| Un service qui prend un seul objet du domaine | **pas une exception**, mais un signal : la règle appartient probablement à cet objet. Voir D4 |

---

## 4. ROI des invariants

| Invariant | Rentabilité | Ce qu'on gagne |
| --- | --- | --- |
| **D1** aucune I/O | **forte** | Une règle métier testable en unitaire pur, sans base ni doublure. Dans un usecase, la même règle demande des fixtures |
| **D4** dernier recours | **forte** | La question « cette règle peut-elle vivre sur un objet ? » est posée avant de créer le fichier. Les modèles gardent leur logique |
| **D3** sans état, sans effet de bord | moyenne | Le service se rejoue et se parallélise. L'appelant retrouve ses objets tels qu'il les a passés |
| **D2** objets du domaine en entrée et en sortie | moyenne | La règle se réutilise depuis une route, un script ou un job, sans adaptation |
| **D5** nommé par la règle | hygiène | La liste des fichiers montre les règles transversales du contexte |

D1 et D4 ont tous deux une rentabilité forte, mais pas la même vérifiabilité. D1 se lit dans la
signature, sans faux positif. Aucun outil ne vérifie D4.

### Ce que ça n'apporte pas

Ces invariants ne disent pas si la règle devait être transversale. Un service de domaine correct peut
cacher une frontière d'agrégat mal placée : la règle traverse deux agrégats qui auraient dû n'en faire
qu'un. Voir A1 de `fiche-racine-agregat.md`.

---

## 5. Écarts avec la théorie

Les écarts sont numérotés `X` et non `D`, qui est le préfixe des invariants de cette fiche.

Les trois écarts sont des dérives. Aucun n'est une convention assumée, car le sens du dossier
`services/` n'avait jamais été décidé. Il l'est maintenant : `services/` est réservé aux vrais
services. X1 a donc une correction à appliquer, pas une option à choisir.

| Écart | Nature | Coût payé | Bénéfice obtenu | Verdict |
| --- | --- | --- | --- | --- |
| **X1** Le dossier `services/` mélange deux natures de fichiers | dérive | Tant que le mélange dure, la règle de D1 ne peut pas passer en erreur. Le mot, repris du DDD, induit en erreur | Nul | **À corriger**, direction décidée |
| **X2** La règle est placée dans un service plutôt que sur un objet | dérive | Les modèles perdent leur logique, et la règle s'éloigne de ses données | L'écriture est plus rapide, et l'invariant de l'objet n'a pas à être revu | **À corriger** |
| **X3** Le fichier est nommé par la ressource et suffixé `-service` | dérive | Le fichier accueille tout ce qui touche à la ressource, sans critère pour refuser | Nul | **À corriger** |

### X1. Le dossier `services/` mélange deux natures de fichiers

**Ce que dit la théorie.** Chez Evans, un Service est sans état, et son interface emploie les termes
du modèle. Il ne fait pas d'I/O. Un code qui fait des I/O orchestre : c'est ce que Clean Architecture
appelle un usecase.

**Exemple concret.** Deux fichiers du même dossier, deux natures :

```
domain/services/
  get-mastery-percentage-service.js   → prend des objets, calcule, renvoie : vrai service
  module-service.js                   → reçoit un repository, charge, lève : usecase
  index.js                            → un fichier de câblage : il importe les repositories
                                        de trois contextes et appelle injectDependencies
```

Le dossier ne distingue pas ces natures. Un relecteur ne sait donc pas quels invariants appliquer, et
la règle de D1 ne peut pas passer en erreur. Le troisième fichier est une exception nommée, symétrique
de `domain/usecases/index.js`. Voir X5 de `fiche-repository.md`.

**Correction.** `domain/services/` est réservé aux vrais services de domaine. Les fichiers qui
reçoivent une I/O vont dans `usecases/`.

Cette position est la plus fidèle aux sources. Chez Evans, un Service est sans état et ne fait pas
d'I/O. `docs/fr/Anatomy.md` décrit `domain/services` comme les « Services métier du domaine » : le nom
parle du métier, pas du partage entre usecases.

Elle a deux conséquences :

- Une fois les fichiers déplacés, la règle de D1 passe en erreur. Plus personne ne peut ajouter un
  repository à un fichier de ce dossier.
- Le dossier devient rare, voire vide dans certains contextes. C'est attendu : une règle qui traverse
  plusieurs agrégats sans rien charger est peu fréquente.

Deux autres positions ont été écartées :

- faire de `services/` le dossier des sous-usecases partagés, ce qui oblige à renoncer à D1 ;
- renommer le dossier en `shared-usecases/`, moins cher, mais qui laisse le vrai service sans
  emplacement.

Avant de déplacer, il faut classer les fichiers existants avec le test du § 1. La règle du § 6, en
avertissement, fournit la liste.

### X2. La règle est placée dans un service plutôt que sur un objet

**Ce que dit la théorie.** Evans précise qu'un Service ne doit pas retirer leur comportement aux
objets. Fowler nomme ce qu'on obtient sinon : le modèle anémique.

**Exemple concret.**

```js
// dans domain/services/ — la règle porte sur un seul objet
function computeTubesFromSkills(skills) { … }
```

C'est le signal de D4 : une seule collection d'objets du domaine en entrée, un objet du domaine en
sortie. Regrouper des acquis par tube est une règle du modèle d'apprentissage, pas un calcul
transverse.

**Correction.** Déplacer la règle sur l'objet, sous une fabrique nommée :
`Tube.groupFromSkills(skills)`. Les appelants remplacent l'appel de fonction par la méthode statique.

La correction n'est pas mécanique. Pour savoir si la règle appartient à l'objet, il faut savoir si
elle contraint son état ou si elle relie deux objets. Le signal de D4 montre où regarder. Il ne
décide pas.

X1 de `fiche-usecase.md` décrit un écart proche, vu depuis le usecase. Le fichier fautif et la
correction diffèrent : là-bas, la règle est dans l'orchestration. Ici, elle est dans une fonction
transverse.

### X3. Le fichier est nommé par la ressource et suffixé `-service`

**Ce que dit la théorie.** L'interface d'un Service emploie les termes du modèle, et sa définition dit
ce qu'il fait. Un nom de ressource ne dit rien de ce que fait le fichier.

**Exemple concret.**

```
domain/services/scorecard-service.js
  → computeScorecard, computeLevelUpInformation, resetScorecard,
    _computeResetSkillsNotIncludedInCampaign, …
```

Cette liste réelle montre deux choses :

- `resetScorecard` écrit : le fichier contient déjà un usecase.
- `_computeResetSkillsNotIncludedInCampaign` est exporté malgré son tiret bas, qui le marque comme
  privé.

Rien ne permet de refuser une fonction de plus dans ce fichier, et il grossit sans limite.

**Correction.** Un fichier par règle, nommé par la règle. Si les fonctions sont indépendantes, le
découpage est mécanique et ne demande aucune décision de conception. Si elles partagent des fonctions
privées, il faut décider où les placer.

C'est l'écart le moins coûteux à corriger des trois.

---

## 6. Vérification déterministe

L'invariant qui définit la catégorie, D1, se lit dans la signature. Cette section est donc plus
courte et plus concluante que dans les autres fiches du domaine.

Il n'existe pas de plugin ESLint maison. Toute règle sur mesure suppose d'abord de créer cette
infrastructure, et les coûts ci-dessous ne comptent que la règle.

| Invariant | Moyen | Coût | Faux positifs |
| --- | --- | --- | --- |
| **D1** aucune I/O, signature | règle ESLint : paramètre en `/(Repository\|Api\|Storage)$/` dans `domain/services/` | ~20 lignes | aucun |
| **D1** aucune I/O, imports | règle `dependency-cruiser` de chemin | configuration seule | aucun |
| **D3** sans état | règle ESLint : champ de classe dans un fichier de `domain/services/` | ~15 lignes | faibles |
| **§ 8** un test unitaire existe | script `tests/tooling/` | ~30 lignes | aucun |
| **D5** nommé par la règle | script : nom de fichier terminant par `-service` | ~15 lignes | **à mesurer** |
| **D2** objets du domaine en entrée et en sortie | revue | — | — |
| **D4** dernier recours | revue | — | — |

### D1 — la règle qui force la décision

```
Dans un fichier de domain/services/, un paramètre déstructuré dont le nom
correspond à /(Repository|Api|Storage)$/.
```

La règle se décide sans quitter la signature.

Elle se déclenchera sur le code existant, et c'est voulu : chaque fichier signalé est à déplacer vers
`usecases/`. L'introduire en avertissement pendant le classement de X1, puis la passer en erreur.

Le même parcours d'AST sert au discriminant du § 6 de `fiche-usecase.md` et à l'étape 1 de I1 dans
`fiche-repository.md`, qui repère déjà les paramètres en `/Api$/`. Le coût supplémentaire est faible.

La règle `dependency-cruiser` complète la précédente pour les imports directs :

```js
{
  name: 'domain-service-must-not-do-io',
  severity: 'error',
  from: { path: 'src/.+/domain/services/' },
  to: { path: 'src/.+/infrastructure/' },
}
```

Deux pièges :

- `severity: 'error'` est obligatoire. La valeur par défaut est `warn`, et seul `error` fait échouer
  la commande.
- Écrire `src/.+/` et non `src/[^/]+/`. Sinon, la règle n'atteint pas les contextes à sous-contextes
  et ne se déclenche jamais, sans aucun message.

### L'existence du test unitaire comme indicateur

Un fichier de `domain/services/` sans test unitaire est soit non testé, soit testé en intégration.
Dans le second cas, D1 est probablement violé. Le script ne prouve rien : il montre où regarder.

La correspondance se fait sur le nom de base, sans le suffixe de test. Le fichier peut être dans un
sous-dossier et son test à plat, et le suffixe varie d'un contexte à l'autre.

### Ce qui n'est pas mécanisable

D4 est l'invariant le plus important et le moins vérifiable. Pour savoir si une règle aurait pu vivre
sur un objet, il faut connaître cet objet.

Le seul indicateur connu est « un seul objet du domaine en entrée ». Il justifie une revue, pas un
verdict. Il ne couvre pas le cas le plus fréquent : une règle sur deux objets, qui appartenait à l'un
des deux.

### Ordre de mise en œuvre

Cet ordre suit le coût, pas le ROI du § 4.

1. **D1 imports** : configuration `dependency-cruiser`, avec contre-épreuve.
2. **D1 signature** en avertissement, pour produire la liste des fichiers à classer.
3. **X1** : classer les fichiers avec le test du § 1, puis déplacer les usecases.
4. **D1 signature** en erreur.
5. **D3** : règle sur les champs de classe.
6. **§ 8 et D5** : un seul script, une fois le dossier stabilisé.

Les étapes 2 et 3 représentent l'essentiel du travail. L'étape 3 n'est pas de l'outillage.

### Codemods

Un codemod peut appliquer une décision. Il ne peut pas en prendre une.

| Écart ou invariant | Codemod | Ce qu'il fait |
| --- | --- | --- |
| **X1** déplacement | oui, une fois le fichier classé | Déplacer un fichier de `services/` vers `usecases/` et réécrire ses imports. Si le fichier a un câblage dédié, le signaler au lieu de deviner |
| **X3** découpage | partiel | Séparer des fonctions indépendantes en fichiers nommés, oui. Décider où vont les fonctions privées partagées, non |
| **D5** renommage | oui, complet | Renommer et réécrire les imports |
| **X2** déplacement de règle | non | Choisir l'objet qui porte la règle est de la conception |

---

## 7. Le type

Un service de domaine est un module de fonctions. Son typage n'a rien de particulier : des paramètres
nommés, des objets du domaine en entrée et en sortie.

```ts
export function filterKnowledgeElements(params: {
  knowledgeElements: readonly KnowledgeElement[];
  createdAt: Date;
  isImproving?: boolean;
  minimumDelayInDaysBeforeImproving?: number;
}): readonly KnowledgeElement[] { … }
```

Le typage rend D1 en partie visible dans la structure. Un paramètre typé `ModuleMetadataRepository`
apparaît dans la signature : la violation se lit sans exécuter le fichier. Avec la règle du § 6, il
ne reste rien à deviner.

Le typage ne couvre ni D3 ni D4 :

- L'absence d'effet de bord ne s'exprime pas. `readonly` interdit l'écriture au typage, mais disparaît
  à la compilation et ne dit rien des méthodes qui modifient l'objet reçu.
- Rien dans un type ne dit qu'une règle aurait pu vivre ailleurs.

La forme retenue est le module de fonctions, pas la classe. Une classe sans état n'apporte rien de
plus, et elle permet d'ajouter un champ.

Les contraintes de syntaxe imposées par la configuration sont dans `migration-typescript.md`.

---

## 8. Tests attendus

| Objet | Type de test | Ce qu'on vérifie |
| --- | --- | --- |
| Service de domaine | **unitaire pur** : aucune base, aucune doublure | la règle, sur le cas nominal **et** les cas limites |
| Absence d'effet sur les entrées | **unitaire** | que les objets passés ne sont pas modifiés |

L'existence du fichier de test se vérifie en comparant les noms. Moyens et limites au § 6.

Deux indices de diagnostic, avec leurs bornes :

- **Un service qui a besoin d'une doublure viole D1.** La doublure n'est pas une contrainte du test,
  c'est le diagnostic. Cet indice n'a pas de borne : un vrai service de domaine n'en demande jamais.
- **Le test d'absence d'effet est celui qui manque le plus souvent.** C'est le seul qui prouve D3.
  Borne : un service qui ne reçoit que des scalaires n'a rien à modifier.

---

## 9. Checklist de revue

Ordonnée par ROI décroissant, comme au § 4.

Chaque ligne porte son statut au regard du § 6 :

- `[auto]` sort de la checklist dès que la règle correspondante existe.
- `[partiel]` reste, réduite à ce que la règle ne couvre pas.
- `[humain]` reste en entier : aucun moyen déterministe n'est connu.

```
[ ] [auto]    D1  Aucun paramètre en *Repository, *Api, *Storage ; aucun import d'infrastructure
[ ] [humain]  D1  Ni horloge, ni aléatoire, ni configuration lue directement — tout entre en paramètre
[ ] [humain]  D4  La règle ne pouvait pas vivre sur un objet-valeur, une entité ou une racine
[ ] [partiel] D3  Aucun état ; les objets reçus ne sont pas modifiés
[ ] [humain]  D2  Entrées et sorties sont des objets du domaine local ou des scalaires
[ ] [partiel] D5  Le fichier est nommé par la règle, pas par une ressource suffixée -service
[ ] [auto]    Un fichier de test unitaire existe, et son nom correspond à celui du service
[ ] [humain]  Test unitaire pur, sans doublure, avec les cas limites
[ ] [humain]  Un test prouve que les entrées ne sont pas modifiées
[ ] [humain]  Si le service prend un seul objet du domaine, vérifier que la règle ne lui appartient pas
```

À terme, il reste huit lignes : deux `[partiel]` et six `[humain]`. D4, la ligne la plus rentable,
reste humaine : elle porte sur une alternative qui n'existe pas dans le code.

---

## 10. Sources

Bibliographie et liens dans `references-ddd.md`. Sources primaires des conventions Pix : les ADR de
`docs/adr/`.

| Invariant | Source | Où vérifier |
| --- | --- | --- |
| La catégorie, et **D1**, **D2**, **D3** | Evans, *DDD*, ch. « A Model Expressed in Software ». Le Service y est défini sans état, et son interface emploie les termes du modèle | *DDD Reference*, PDF gratuit |
| **D4** dernier recours | Evans, même chapitre : un Service ne doit pas retirer leur comportement aux objets. Fowler, « AnemicDomainModel », pour le symptôme | bliki gratuit |
| **D5** nommé par la règle | **aucune source** : convention propre à cette fiche | — |
| La distinction service / usecase | Martin, *Clean Architecture*, ch. « Business Rules ». Les règles d'entreprise sont indépendantes de l'application, les usecases orchestrent | le livre de 2017 |
| Le sens du dossier `services/` (X1) | **aucun ADR.** L'ADR 51 fixe l'arborescence sans définir le contenu de `services/`. L'ADR 20 rend le usecase obligatoire sans traiter le service. `docs/fr/Anatomy.md` parle de « Services métier du domaine », ce qui appuie la décision sans la remplacer | ADR 20 et 51 ; `docs/fr/Anatomy.md` |

Un seul invariant sur cinq n'a pas de source : D5, la convention de nommage. D1, D2 et D3 viennent de
la définition d'Evans. La fiche ne décrit donc pas une préférence locale : elle applique la définition
du terme employé.

Le sens donné au dossier n'a pas de source Pix. X1 le décide, et un ADR doit l'écrire.
