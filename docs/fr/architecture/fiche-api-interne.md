# Fiche — API interne

Fiche générique. Elle décrit l'état cible, où tout est en TypeScript.

Le gabarit commun, l'état du chantier et l'ordre de relecture sont dans `corpus-index.md`. L'écart avec
le code réel est mesuré dans les rapports de divergence, un par contexte. Ce qui empêche aujourd'hui le
typage de mordre est dans `migration-typescript.md`.

> **À instruire**
>
> - Le § 3 mérite une passe attentive : c'est la fiche où la frontière entre exception légitime et
>   dérive est la plus discutable, la couche étant jeune et ses conventions non stabilisées.
> - La source de `P5` et de `P3` est une page Confluence liée par l'ADR 55, donc **hors du dépôt**.
>   Elle peut changer ou disparaître sans que rien ici ne le signale. Le contenu utile tiendrait dans
>   l'ADR lui-même.
> - `P7` et `P8` sont des déductions, pas des citations. Ils proposent des conventions là où l'équipe
>   n'en a pas arrêté.

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
| [**P1**](#p1-lapi-expose-un-dto-jamais-un-modèle-du-domaine) | l'API expose un DTO, jamais un modèle du domaine | **forte** | règle ESLint, partielle |
| [**P2**](#p2-lapi-passe-par-un-usecase) | l'API passe par un usecase | **forte** | `dependency-cruiser` |
| [**P6**](#p6-le-contrat-est-stable) | le contrat est stable | **forte** | revue |
| [**P3**](#p3-le-contrat-est-documenté) | le contrat est documenté | moyenne | script, sans faux positif |
| [**P8**](#p8-lapi-ne-transite-pas-vers-un-autre-contexte) | l'API ne transite pas vers un autre contexte | moyenne | `dependency-cruiser` |
| [**P7**](#p7-le-comportement-ne-dépend-pas-de-lappelant) | le comportement ne dépend pas de l'appelant | moyenne | revue |
| [**P4**](#p4-le-dto-ne-porte-aucun-comportement-métier) | le DTO ne porte aucun comportement métier | hygiène | voir `fiche-objet-valeur.md` |
| [**P5**](#p5-un-seul-emplacement-pour-lobjet-de-contrat) | un seul emplacement pour l'objet de contrat | hygiène | script, bloqué par `X3` |

**Écarts** — triés par verdict, comme au § 5.

| # | Écart | Verdict |
| --- | --- | --- |
| [**X1**](#x1-lapi-renvoie-un-modèle-du-domaine-plutôt-quun-dto) | l'API renvoie un modèle du domaine plutôt qu'un DTO | **à corriger** |
| [**X2**](#x2-lapi-appelle-un-repository-sans-passer-par-un-usecase) | l'API appelle un repository sans passer par un usecase | **à corriger** |
| [**X3**](#x3-lobjet-de-contrat-nest-pas-dans-le-dossier-décidé) | l'objet de contrat n'est pas dans le dossier décidé | **à corriger** |
| [**X4**](#x4-lapi-importe-une-api-ou-un-repository-dun-contexte-tiers) | l'API importe une API ou un repository d'un contexte tiers | **à corriger** |
| [**X5**](#x5-le-dto-expose-exactement-les-champs-de-lentité) | le DTO expose exactement les champs de l'entité | à surveiller |

---

## 1. Rôle

Une API interne est le **contrat publié** d'un contexte borné : ce qu'il accepte de faire pour les
autres, et sous quelle forme il leur répond.

C'est le seul point par lequel un contexte voisin doit passer. Tout le reste — modèles, usecases,
repositories — lui est inaccessible.

Deux propriétés en découlent, et elles sont la raison d'être de la couche :

- **le contexte fournisseur reste libre** de changer son modèle, sa base, ses usecases, tant que le
  contrat tient ;
- **le contexte consommateur reste autonome**, sans avoir à connaître le fonctionnement interne du
  voisin.

C'est aussi ce qui rend l'attribution des sujets aux équipes explicite dans le code, objectif affiché
de l'ADR 55 qui a instauré la couche.

### Le sens de lecture, souvent inversé

L'API interne est écrite par le contexte **fournisseur**. Le contexte **consommateur** ne l'appelle pas
directement depuis son domaine : il la reçoit injectée dans un de ses repositories, qui traduit vers
son propre vocabulaire.

Cette fiche et `fiche-repository.md` se lisent donc ensemble : `P1` décrit ce qui sort d'ici, `I1`
décrit ce que le voisin doit en faire — le traduire, et non le laisser entrer intact dans son domaine.

### Ce qu'une API interne n'est pas

Table de décision. Si le code correspond à une ligne, ce n'est pas une API interne.

| Le code… | Va dans | Fiche |
| --- | --- | --- |
| est appelé par une requête HTTP | un contrôleur, dans `application/` | `fiche-controleur.md` |
| réalise l'intention métier | un usecase | `fiche-usecase.md` |
| accède aux données | un repository | `fiche-repository.md` |
| consomme l'API d'un voisin | un repository du contexte consommateur | `fiche-repository.md` |
| met en forme pour une réponse HTTP | un sérialiseur | `fiche-serialiseur.md` |
| réagit à un événement d'un autre contexte | le mécanisme événementiel | hors périmètre du corpus |

---

## 2. Invariants

### P1. L'API expose un DTO, jamais un modèle du domaine

**Énoncé.** Le modèle interne ne franchit pas la frontière. L'API construit un objet dédié au contrat.

```js
// conforme
export const getOrganization = async (id) => {
  return new OrganizationDTO(await usecases.getOrganizationById({ id }));
};

// fautif — le modèle du domaine devient le contrat
export const getOrganization = async (id) => {
  return usecases.getOrganizationById({ id });
};
```

**Ce qui casse.** Chaque champ du modèle devient une promesse implicite. Un renommage interne casse
les voisins à l'exécution, sans qu'aucune règle de dépendance ne bouge : `dependency-cruiser` reste
vert, la dépendance de module n'a pas changé.

La duplication que `P1` introduit est un **coût accepté et documenté** par l'ADR 55. Ce n'est pas une
dette : c'est le prix de la liberté de refactorer.

**À ne pas faire.** Envelopper le modèle dans un DTO aux mêmes champs. Le lint passe au vert et la
forme interne reste le contrat — c'est `P1` respecté à la lettre et violé en esprit.

### P2. L'API passe par un usecase

**Énoncé.** L'API interne est une porte d'entrée applicative, au même titre qu'un contrôleur. Elle
appelle un usecase, jamais un repository directement.

```js
// fautif — court-circuite les règles métier
export const findLearners = async ({ organizationId, learnerRepository }) => {
  return learnerRepository.findByOrganization({ organizationId });
};
```

**Ce qui casse.** Une lecture porte aussi des règles — filtrage des éléments supprimés, droits,
périmètre. Les court-circuiter pour les voisins seulement crée **deux comportements pour la même
question**, selon qu'on la pose de l'intérieur ou de l'extérieur.

**Le motif d'erreur le plus courant** : la donnée demandée est « juste une lecture », donc le usecase
paraît superflu. C'est le moment où la porte dérobée s'ouvre.

### P3. Le contrat est documenté

**Énoncé.** Chaque fonction exposée porte sa documentation : ce qu'elle prend, ce qu'elle rend, ce
qu'elle lève. Les types du contrat sont décrits, pas seulement nommés.

Cette documentation n'est pas un commentaire de politesse : **c'est le contrat lui-même**. Elle se
génère en fichier lisible à la racine du contexte, où elle devient consultable sans ouvrir le code du
fournisseur — ce qui est le but de la couche.

```
node scripts/generate-api-documentation.js src/<contexte> > src/<contexte>/API.md
```

Le fichier produit est **committé**. C'est ce qui rend l'invariant vérifiable : régénérer et comparer
au fichier du dépôt suffit — voir § 6.

**Ce qui casse.** Une fonction exposée sans documentation est une fonction dont le contrat n'existe
pas : le consommateur doit lire le code du fournisseur, donc la couche a coûté son prix sans rendre
son service.

### P4. Le DTO ne porte aucun comportement métier

**Énoncé.** Le DTO est un objet-valeur : immuable, sans identité, sans règle. `V1`, `V2`, `V6` et `V7`
de `fiche-objet-valeur.md` s'appliquent et ne sont pas répétés ici.

Ce qui reste autorisé : une mise en forme sans décision — composer un libellé, aplatir une structure,
renommer un champ pour le vocabulaire du contrat.

Ce qui est interdit : une règle qui décide de quelque chose. Elle vivrait en deux exemplaires, dans le
modèle et dans le DTO, avec la garantie qu'ils divergeront.

**Le DTO est le bon endroit pour renommer.** Un champ dont le nom interne est technique ou historique
prend au passage le nom du contrat. C'est l'un des usages les plus utiles de la couche — à condition
que le renommage soit stable ensuite, `P6`.

### P5. Un seul emplacement pour l'objet de contrat

**Énoncé.** Le DTO est dans `application/api/models/`. La convention est décidée : la documentation
liée à l'ADR 55 pose que les APIs internes vivent dans un dossier `api` de la couche application, et
que **les classes qui définissent le contrat sont dans un sous-dossier `models`**.

Il n'y a donc rien à trancher, seulement à appliquer — c'est `X3` au § 5.

**Ce qui casse.** On cherche avant de trouver, et la vérification de l'emplacement devient impossible
dès qu'un second emplacement existe. Or c'est le même script qui dit où chercher pour vérifier `P3`.

**Distinguer du read-model.** `domain/read-models/` est une forme assemblée pour une lecture interne ;
l'objet de contrat est un format publié vers un autre contexte. Le même mot les recouvre parfois, ce
qui brouille les deux — voir `X1` de `fiche-read-model.md`, qui traite exactement ce mélange.

### P6. Le contrat est stable

**Énoncé.** Un contrat s'étend, il ne se casse pas. Trois règles concrètes :

- **ajouter** un champ ou une fonction est sans risque ;
- **renommer ou retirer** demande de connaître les consommateurs et de coordonner ;
- **changer le sens** d'un champ existant est le pire cas, parce que rien ne le signale — ni la
  compilation, ni les tests des voisins.

**Ce qui casse.** Un changement chez le fournisseur casse la CI de plusieurs équipes, et le
diagnostic remonte lentement puisque rien ne pointe vers la cause.

**Ce qui rend cet invariant tenable ici, contrairement au format HTTP** : la liste des consommateurs
est **connaissable** — ce sont les contextes qui déclarent dépendre de celui-ci. Un changement cassant
commence par cette liste. Voir `M3` de `fiche-serialiseur.md` pour le cas où elle ne l'est pas.

### P7. Le comportement ne dépend pas de l'appelant

**Énoncé.** Une même fonction rend la même chose quel que soit le contexte qui l'appelle. Pas de
paramètre « pour qui », pas de branche selon le consommateur.

```js
// fautif — le contrat dépend de qui le lit
export const getThing = async ({ id, callerContext }) => {
  return callerContext === 'admin' ? fullDTO : partialDTO;
};
```

**Ce qui casse.** Une fonction qui se comporte selon son appelant recrée le couplage que la couche
existe pour supprimer : le fournisseur connaît ses consommateurs, donc il ne peut plus évoluer sans
les considérer un par un.

Un besoin divergent entre deux consommateurs appelle **deux fonctions nommées différemment**, chacune
avec son contrat.

### P8. L'API ne transite pas vers un autre contexte

**Énoncé.** Une API interne sert **son** contexte. Elle n'importe ni repository, ni API d'un contexte
tiers pour composer sa réponse.

**Ce qui casse.** Le fournisseur devient un intermédiaire : le consommateur dépend, sans le savoir,
d'un troisième contexte. Le graphe déclaré ne décrit plus le graphe réel, et une règle de dépendance
passe au vert sur un couplage qu'elle devrait interdire.

Si la composition est vraiment nécessaire, c'est au **consommateur** de l'assembler, en appelant les
deux APIs — et cette composition est de l'orchestration, donc elle relève d'un usecase chez lui.

---

## 3. Exceptions légitimes

Une exception ne vaut que pour l'invariant qu'elle nomme. Elle n'excuse rien d'autre.

C'est la section la moins stabilisée de la fiche : la couche est jeune, et plusieurs de ces lignes
sont des propositions plutôt que des conventions arrêtées.

| Cas | Statut |
| --- | --- |
| Le DTO renomme un champ par rapport au modèle interne | **autorisé**, et c'est un bon usage de la couche. `P4` |
| Le DTO aplatit une structure imbriquée | **autorisé** — mise en forme sans décision |
| Le DTO compose un libellé à partir de plusieurs champs | **autorisé** — mise en forme, pas décision |
| L'API renvoie `null` quand rien n'est trouvé | **autorisé** si documenté ; le contrat doit dire lequel des deux comportements s'applique. `P3` |
| L'API lève une erreur définie dans `application/api/errors.js` | **autorisé** — l'erreur fait partie du contrat |
| Une enveloppe de pagination autour de DTO | **autorisé** |
| L'API expose une fonction utilisée par un seul consommateur | **à discuter** — c'est le début d'un tunnel plutôt que d'un contrat. Voir le § 4 |
| L'API importe un usecase individuellement plutôt que l'index | **à discuter** — sans effet visible, mais contourne le point unique de câblage |
| L'API accède à un repository de `shared` | **pas une exception** — c'est `P2` violé, même si `shared` est commode |
| Un consommateur importe le domaine du fournisseur | **pas une exception** — c'est `U9` de `fiche-usecase.md`, la violation que cette couche existe pour empêcher |

---

## 4. ROI des invariants

| Invariant | Rentabilité | Ce qu'on gagne |
| --- | --- | --- |
| **P1** un DTO, jamais le modèle | **forte** | Le fournisseur refactore son domaine sans casser personne. C'est **la** contrepartie du coût de la couche |
| **P2** passe par un usecase | **forte** | Les règles métier valent aussi pour les voisins. Sans lui, l'API est une porte dérobée vers la base |
| **P6** contrat stable | **forte** | Un changement chez le fournisseur ne casse pas la CI de plusieurs équipes |
| **P3** contrat documenté | moyenne | Un consommateur sait ce qu'il peut appeler sans lire le code du fournisseur. C'est ce qui réduit la charge mentale entre équipes |
| **P8** pas de transit | moyenne | Le graphe de dépendances entre contextes reste lisible et acyclique |
| **P7** indépendant de l'appelant | moyenne | Empêche de recréer le couplage que la couche existe pour supprimer |
| **P4** DTO sans comportement | hygiène | Un seul modèle à faire évoluer plutôt que deux. Aucun défaut prévenu directement |
| **P5** emplacement unique | hygiène | On trouve le contrat sans chercher. Sa vraie valeur est d'être le préalable à `P1` et `P3` vérifiés |

### Le ROI de cette couche est décalé dans le temps

C'est structurel, et c'est ce qui explique la plupart de ses écarts. **Le coût est payé d'avance, le
bénéfice arrive plus tard** : on écrit le DTO, l'injection et le test tout de suite ; la liberté de
refactorer ne se constate que le jour où le fournisseur change son modèle.

D'où la tentation de contourner `P1` — et c'est précisément ce qui annule le ROI après en avoir payé
le prix. Une couche d'API interne dont les DTO sont les modèles est le pire des deux mondes.

### Ce que ça n'apporte pas

Ces invariants ne disent pas **ce qu'il faut exposer**. Une API qui respecte tout mais expose
trente-cinq méthodes calquées sur les besoins d'un seul consommateur n'est pas un contrat, c'est un
tunnel. Le dimensionnement reste un travail de conception entre les deux équipes.

---

## 5. Écarts avec la théorie

| Écart | Nature | Coût payé | Bénéfice obtenu | Verdict |
| --- | --- | --- | --- | --- |
| **X1** L'API renvoie un modèle du domaine plutôt qu'un DTO | dérive | Le boilerplate de la couche est payé sans la liberté de refactorer. Chaque champ du modèle devient une promesse implicite | Pas de DTO à écrire ni à maintenir | **À corriger** |
| **X2** L'API appelle un repository sans passer par un usecase | dérive | Deux comportements pour la même question, selon qu'on la pose de l'intérieur ou de l'extérieur | La lecture est immédiate, sans usecase à écrire | **À corriger** |
| **X3** L'objet de contrat n'est pas dans le dossier décidé | dérive | La convention documentée n'est pas appliquée partout, donc son script de vérification ne peut pas être bloquant. Et le mot `read-model` recouvre deux notions | Nul — la décision existe, elle n'a pas été suivie | **À corriger** |
| **X4** L'API importe une API ou un repository d'un contexte tiers | dérive | Le graphe déclaré ne décrit plus le graphe réel. Une règle de dépendance passe au vert sur un couplage réel | La composition est faite une fois chez le fournisseur au lieu de chez chaque consommateur | **À corriger** |
| **X5** Le DTO expose exactement les champs de l'entité | convention assumée, ou absence d'arbitrage | Le contrat suit le modèle : ajouter un champ interne l'expose, le renommer casse le contrat | Réel si c'est délibéré — le contrat est effectivement le modèle, et il n'y a rien à décider | *À surveiller* |

### X1. L'API renvoie un modèle du domaine plutôt qu'un DTO

**Ce que dit la théorie.** Evans traite le sujet sous *Published Language* et *Open Host Service* : ce
qu'on publie est un langage dédié à l'échange, pas le modèle interne.

**Exemple concret.**

```js
export const getOrganization = async (id) => {
  return usecases.getOrganizationById({ id });   // le modèle sort tel quel
};
```

**Correction.** Introduire le DTO, ce qui demande de **décider quels champs exposer** — c'est le cœur
du travail de contrat, pas une transformation.

Le piège à éviter absolument : envelopper le modèle dans un DTO aux mêmes champs. Le lint passe au
vert, la forme interne reste le contrat, et la dette devient invisible. Voir § 6 pour ce que la règle
ne voit pas.

### X2. L'API appelle un repository sans passer par un usecase

**Ce que dit la théorie.** L'API interne est un adaptateur d'entrée. Martin place les règles
applicatives dans la couche *Use Cases*, que tout appelant traverse.

**Exemple concret.**

```js
export const findLearners = async ({ organizationId, learnerRepository }) => {
  return learnerRepository.findByOrganization({ organizationId });
};
```

Le filtrage des apprenants supprimés, s'il existe, vit dans le usecase que cet appel contourne.

**Correction.** Écrire le usecase manquant, souvent une délégation d'une ligne — ce que l'ADR 20 admet,
voir `X5` de `fiche-usecase.md`. Mécanique dans la plupart des cas.

Ce qui ne l'est pas : constater qu'une règle existait dans un usecase voisin et décider si elle
s'applique. C'est le vrai contenu de la correction.

### X3. L'objet de contrat n'est pas dans le dossier décidé

**Ce que dit la théorie.** Rien : la théorie ne prescrit pas d'arborescence. Mais ici la convention
**existe** — la documentation liée à l'ADR 55 la pose — donc l'écart n'est pas avec la théorie, il est
avec une décision déjà prise.

C'est le seul écart du corpus dans ce cas, et c'est ce qui le rend le moins coûteux à corriger : il n'y
a aucun arbitrage à rendre.

**Exemple concret.** Le dossier décidé, et celui qu'on trouve à la place :

```
application/api/models/         → décidé par la documentation de l'ADR 55
application/api/read-models/    → employé dans certains contextes
```

Deux problèmes en un. La convention n'est pas suivie, donc son script ne peut pas être bloquant. Et le
mot `read-model` désigne ici un DTO de contrat alors qu'il désigne une forme de lecture interne dans
`domain/read-models/` — c'est exactement le mélange que décrit `X1` de `fiche-read-model.md`.

**Correction.** Mécanique : déplacer vers `models/` et réécrire les imports. Aucune décision à prendre,
donc un codemod fait le travail — et le faire à la main casse des imports.

Ce que la correction débloque : le script de `P5` devient activable en erreur, et avec lui la
vérification de `P3`, qui a besoin de savoir où chercher les fonctions exportées et leur contrat.

L'écart précis par contexte est mesuré dans les rapports de divergence, pas ici.

### X4. L'API importe une API ou un repository d'un contexte tiers

**Ce que dit la théorie.** La Context Map d'Evans doit décrire les dépendances réelles. Un
intermédiaire non déclaré la rend fausse.

**Exemple concret.**

```js
// dans l'API de A — A devient un intermédiaire vers C, sans que B le sache
import { thingApi } from '../../../contexte-c/application/api/thing-api.js';
```

Le consommateur B dépend de C, et rien dans ses déclarations de dépendances ne le dit.

**Correction.** Déplacer la composition chez le **consommateur**, qui appelle les deux APIs. Chez lui,
c'est de l'orchestration, donc un usecase — et ses dépendances déclarées redeviennent vraies.

Ce qui rend la correction coûteuse : elle déplace du travail du fournisseur vers chaque consommateur,
et il peut y en avoir plusieurs. C'est le prix d'un graphe honnête, et il se vérifie par configuration
seule une fois payé.

### X5. Le DTO expose exactement les champs de l'entité

**Ce que dit la théorie.** Le langage publié est choisi pour l'échange. Qu'il coïncide avec le modèle
interne est possible, mais ce doit être une coïncidence constatée, pas un défaut d'arbitrage.

**Exemple concret.**

```js
export class OrganizationDTO {
  constructor(organization) {
    this.id = organization.id;
    this.name = organization.name;
    this.createdAt = organization.createdAt;    // tous les champs, sans exception
  }
}
```

**Correction.** Aucune tant que la coïncidence est **délibérée**, et c'est ce qui classe l'écart en
*à surveiller* plutôt qu'à corriger : un contrat qui reprend le modèle peut être le bon contrat.

Ce qui est à trancher, fonction par fonction : chaque champ exposé l'est-il parce qu'un consommateur en
a besoin, ou parce qu'il était là ? La seconde réponse rend `P6` intenable — on ne peut pas s'engager
sur la stabilité de champs qu'on n'a pas choisis.

Le symptôme à guetter : le premier champ interne qu'il faut masquer, ou le premier renommage refusé
parce qu'il casserait le contrat. C'est le moment où l'arbitrage devient dû.

---

## 6. Vérification déterministe

`P5` conditionne les autres, et il n'est pas tranché : c'est `X3`. Tant qu'il l'est, les deux règles de
chemin sont ce qui rapporte, et elles ne coûtent que de la configuration.

Il n'existe aucun plugin ESLint maison : toute règle sur mesure suppose d'abord de créer cette
infrastructure. Ce point est daté, à retirer dès que l'infrastructure existe.

| Invariant | Moyen | Coût | Faux positifs |
| --- | --- | --- | --- |
| **P2** passe par un usecase | règle `dependency-cruiser` : `application/api/**` ne dépend pas de `infrastructure/**` | configuration seule | aucun |
| **P8** pas de transit | règle `dependency-cruiser` : `application/api/**` ne dépend pas d'un autre contexte | configuration seule | aucun |
| **P3** contrat documenté | régénérer `API.md` et comparer au fichier committé | ~10 lignes | aucun |
| **P1** un DTO | règle ESLint : un `return` d'API qui rend directement le résultat d'un usecase | ~40 lignes | **à mesurer** |
| **P5** emplacement | script : l'objet de contrat est dans `application/api/models/` | ~20 lignes | aucun — **bloquant après `X3`** |
| **P4** DTO sans comportement | voir § 6 de `fiche-objet-valeur.md` | — | — |
| **P6**, **P7** | revue | — | — |

### P2 et P8 — deux règles de chemin, les plus rentables

```js
{
  name: 'internal-api-must-not-access-infrastructure',
  severity: 'error',
  from: { path: 'src/.+/application/api/' },
  to: { path: 'src/.+/infrastructure/' },
}
```

La seconde — interdire à une API de dépendre d'un **autre** contexte — s'écrit avec un groupe capturé
sur le nom du contexte. C'est la même difficulté que `U9` de `fiche-usecase.md` : exprimer « un autre
contexte que le sien ».

`severity: 'error'` est obligatoire : la valeur par défaut est `warn`, et seul `error` fait échouer la
commande. Écrire `src/.+/` et non `src/[^/]+/`, sinon les contextes à sous-contextes ne sont pas
atteints et la règle ne se déclenche jamais, sans le signaler. Contre-épreuve obligatoire.

### P1 — détecter le modèle du domaine qui fuit

Sous-cas à précision totale, sans analyse de flot :

> Dans un fichier de `application/api/`, un `return` — ou `return await` — dont l'expression est
> directement un appel sur `usecases`.

C'est le passe-plat pur : le modèle du domaine sort tel quel. Les élargissements — variable
intermédiaire, expression conditionnelle — suivent la même progression que `I1` de
`fiche-repository.md`, avec le même risque croissant de faux positifs.

**Limite honnête, et elle est importante** : la règle ne voit pas le cas où l'API construit un objet
qui recopie exactement le modèle. C'est `P1` respecté à la lettre et violé en esprit — c'est `X5` — et
seule la revue l'attrape.

### P3 — le générateur est déjà l'oracle

Le script de génération existe. La vérification n'est donc pas à écrire, elle est à **brancher** :
régénérer la documentation et comparer au fichier committé.

```
node scripts/generate-api-documentation.js src/<contexte> | diff - src/<contexte>/API.md
```

Dix lignes en test, aucun faux positif, et c'est plus fort qu'un script qui vérifierait la présence
d'un commentaire : un contrat modifié sans régénération devient un test rouge, et la documentation
committée ne peut plus dériver du code.

Ce que ça ne dit pas : que la documentation soit **juste**. Un contrat mal décrit se régénère
fidèlement. C'est la borne de cette vérification, et elle laisse `P6` en revue.

### Ordre de mise en œuvre

Cet ordre suit le coût, pas le ROI du § 4.

1. **P2** puis **P8** — configuration `dependency-cruiser`, avec contre-épreuve
2. **P3** — brancher le générateur en test, sur les contextes qui ont déjà un `API.md` committé
3. **`X3`** — déplacer les objets de contrat vers `models/`, par codemod
4. **P5** — le script d'emplacement, activable en erreur après `X3`
5. **P1** — la règle ESLint, en avertissement d'abord

Les points 1 et 2 ne dépendent de rien et se font aujourd'hui. C'est un changement par rapport à la
version précédente de cette fiche, qui plaçait une décision en préalable là où il n'y en avait pas.

### Codemods

Critère de découpe : un codemod peut appliquer une décision, il ne peut pas en prendre une.

| Écart | Codemod | Ce qu'il fait |
| --- | --- | --- |
| **X3** emplacement | oui, complet | Déplacer vers `models/` et réécrire les imports. La convention étant décidée, il n'y a aucune décision à prendre |
| **X2** usecase manquant | partiel | Remplacer l'appel de repository par un usecase existant, oui. Écrire celui qui manque, non |
| **X1** introduire un DTO | préparation seule | Générer un squelette et un `TODO`. **Jamais** un DTO aux mêmes champs que le modèle : le lint passerait au vert et la dette deviendrait invisible |
| **X4** transit | non | Déplacer la composition chez chaque consommateur est de la conception |

---

## 7. Le type

L'API interne est le meilleur endroit du dépôt pour du typage, parce que **c'est le seul contrat que
plusieurs équipes lisent**.

```ts
export type OrganizationDTO = {
  readonly id: number;
  readonly name: string;
  readonly identityProvider: string | null;
};

export const getOrganization: (id: number) => Promise<OrganizationDTO | null> = async (id) => { … };
```

Deux bénéfices, et ils portent sur les deux invariants en rentabilité forte.

**`P1` devient structurel.** Un type de retour explicite interdit de laisser fuir le modèle : le
compilateur refuse un objet qui ne correspond pas au DTO déclaré.

**`P6` devient visible.** Un changement de contrat devient un changement de type, donc un changement
revu — au lieu d'un renommage discret dans un objet littéral.

**C'est un candidat de migration précoce**, contrairement aux usecases. Une API en `.ts` qui importe
ses usecases depuis des `.js` ne vérifie que la forme de son propre DTO — ce qui reste exactement ce
que `P1` protège. Le bénéfice existe donc même quand l'amont n'est pas migré.

Ce que le typage n'apporte pas : `X5`. Un DTO typé peut recopier le modèle champ par champ, et le
compilateur n'a rien à dire.

Les contraintes de syntaxe imposées par la configuration sont dans `migration-typescript.md`.

---

## 8. Tests attendus

| Objet | Type de test | Ce qu'on vérifie |
| --- | --- | --- |
| Fonction d'API interne | **unitaire**, usecase substitué | uniquement le mapping du modèle vers le DTO |
| DTO | **unitaire pur** | la forme produite, les renommages, les mises en forme |
| Contrat vu du consommateur | **unitaire** côté consommateur, API substituée | le mapping du DTO vers son vocabulaire local — voir `fiche-repository.md` |

L'existence du fichier de test se vérifie par comparaison de noms. Moyens et limites au § 6 de
`fiche-repository.md`.

Le test d'une API interne ne doit **pas** rejouer la logique du usecase : il vérifie la traduction,
c'est tout. S'il faut monter des fixtures métier pour le faire passer, c'est que `P1` ou `P2` est
violé.

Un indice de diagnostic, avec sa borne. **Une API dont le test unitaire n'a rien à vérifier ne traduit
rien**, donc elle expose probablement le modèle du domaine. La borne : une fonction qui renvoie un
scalaire ou rien n'a pas de traduction à tester, comme au § 3 de `fiche-repository.md`.

---

## 9. Checklist de revue

Ordonnée par ROI décroissant, conformément au § 4.

Chaque ligne porte son statut au regard du § 6. `[auto]` disparaît de la checklist dès que la règle ou
le script correspondant existe. `[partiel]` reste, réduite à ce qu'il ne couvre pas. `[humain]` reste
entièrement : aucun moyen déterministe n'est identifié.

```
[ ] [partiel] P1  Aucun return ne rend directement un modèle du domaine
[ ] [humain]  P1  Le DTO ne recopie pas le modèle champ par champ — voir X5
[ ] [auto]    P2  Chaque fonction passe par un usecase, jamais par un repository
[ ] [humain]  P6  Aucun renommage ni retrait sans avoir listé les contextes consommateurs
[ ] [auto]    P3  Le fichier API.md régénéré est identique à celui du dépôt
[ ] [auto]    P8  Aucun import d'un autre contexte : ni repository, ni API tierce
[ ] [humain]  P7  Aucun paramètre ni branche qui dépend de l'identité de l'appelant
[ ] [humain]  P4  Le DTO ne porte aucune règle métier, seulement de la mise en forme
[ ] [auto]    P5  Le DTO est dans application/api/models/
[ ] [auto]    Un fichier de test existe, et son nom correspond à celui de l'API
[ ] [humain]  Test unitaire avec usecase substitué, portant sur le mapping seul
```

À terme il reste cinq lignes, toutes de jugement. La plus importante est la seconde : `P1` a une règle
et un typage, et **ni l'un ni l'autre ne voit un DTO qui recopie le modèle**. C'est la seule violation
du corpus qui passe au vert sur tous les outils tout en annulant le bénéfice de sa couche.

---

## 10. Sources

Bibliographie et liens dans `references-ddd.md`. Sources primaires des conventions Pix : les ADR de
`docs/adr/`.

| Invariant | Source | Où vérifier |
| --- | --- | --- |
| La couche elle-même | Pix : **ADR 55**, qui décide les APIs internes synchrones, expose le raisonnement et **énumère les coûts acceptés** — complexité d'injection, boilerplate, duplication des modèles | ADR 55 |
| **P1** un DTO, jamais le modèle | Evans, *DDD*, ch. « Maintaining Model Integrity » — **Published Language** et **Open Host Service**. Pix : ADR 55, qui accepte la duplication comme contrepartie | *DDD Reference*, PDF gratuit ; ADR 55 |
| **P2** passe par un usecase | Pix : **ADR 20**. Martin, *Clean Architecture*, ch. « Business Rules » | ADR 20 ; le livre de 2017 |
| **P3** contrat documenté | Evans, même ch. — un Published Language est par définition documenté. Pix : la **documentation liée à l'ADR 55** donne le script de génération et l'emplacement du fichier produit | *DDD Reference* ; le lien en fin d'ADR 55 |
| **P4** DTO sans comportement | Evans, ch. « A Model Expressed in Software » — Value Object. Énoncés dans `fiche-objet-valeur.md` | *DDD Reference* |
| **P5** emplacement du DTO | **documentation liée à l'ADR 55** : dossier `api` dans la couche application, sous-dossier `models` pour les classes de contrat. Page Confluence de l'espace EDTDT, donc hors du dépôt | le lien en fin d'ADR 55 |
| **P6** stabilité du contrat | Evans, ch. « Maintaining Model Integrity ». Vernon, *IDDD*, ch. « Integrating Bounded Contexts » | *DDD Reference* ; dddcommunity.org |
| **P7** indépendance de l'appelant | **aucune source.** Déduction : une API qui dépend de son appelant n'est pas un Open Host Service | — |
| **P8** pas de transit | **aucune source.** Déduction de la Context Map d'Evans : le graphe déclaré doit décrire le graphe réel | — |

**Deux invariants sur huit n'ont aucune source** : `P7` et `P8`, tous deux des déductions explicites.
`P5` en a une, contrairement à ce qu'affirmait la version précédente de cette fiche : la documentation
liée à l'ADR 55 tranche l'emplacement du DTO.

Le point de fragilité est ailleurs : **cette source est hors du dépôt**. Une page Confluence peut
changer sans que rien ici ne le signale, et l'ADR qui y renvoie ne reproduit pas la décision. Les deux
phrases utiles — le dossier `api`, le sous-dossier `models` — tiendraient dans l'ADR.

C'est aussi ce qui rend cette fiche la plus utile à relire à plusieurs : elle propose des conventions
là où l'équipe n'en a pas encore arrêté.
