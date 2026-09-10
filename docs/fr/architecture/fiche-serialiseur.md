# Fiche — Sérialiseur

Fiche générique. Elle décrit l'état cible, où tout est en TypeScript.

Le gabarit commun, l'état du chantier et l'ordre de relecture sont dans `corpus-index.md`. L'écart avec
le code réel est mesuré dans les rapports de divergence, un par contexte. Ce qui empêche aujourd'hui le
typage de mordre est dans `migration-typescript.md`.

> **À instruire**
>
> - `M3` n'a **aujourd'hui** aucun moyen de vérification, parce que ses consommateurs sont hors du
>   dépôt. Cette limite est conjoncturelle, pas structurelle : une piste identifiée la lève en grande
>   partie — voir le § 7 et `migration-typescript.md`. Ce qui restera hors de portée, c'est le
>   changement de **sens** d'un champ.
> - Ce que font les applications front du contrat **n'est pas le sujet de ce corpus**, qui porte sur
>   `api/`. Ce qui l'est : ne pas casser ce qu'on publie.
> - Le § 6 annonce des taux de faux positifs estimés, pas mesurés. Le second motif de `M1` demande de
>   distinguer un accesseur d'une méthode métier, ce qui n'est pas décidable au nom seul.

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
| [**M1**](#m1-aucune-logique) | aucune logique | **forte** | règle ESLint, simple |
| [**M3**](#m3-le-format-de-réponse-est-un-contrat-externe) | le format de réponse est un contrat externe | **forte** | aucun moyen aujourd'hui — piste au § 7 |
| [**M2**](#m2-nexpose-que-des-champs-présents-sur-lobjet-reçu) | n'expose que des champs présents sur l'objet reçu | moyenne | typage, après migration |
| [**M4**](#m4-un-sérialiseur-par-ressource-exposée) | un sérialiseur par ressource exposée | hygiène | script |

**Écarts** — triés par verdict, comme au § 5.

| # | Écart | Verdict |
| --- | --- | --- |
| [**X1**](#x1-une-condition-choisit-entre-deux-formes-de-réponse) | une condition choisit entre deux formes de réponse | **à corriger** |
| [**X2**](#x2-le-sérialiseur-fabrique-un-champ-absent-de-lobjet-reçu) | le sérialiseur fabrique un champ absent de l'objet reçu | **à corriger** |
| [**X3**](#x3-un-champ-est-retiré-renommé-ou-change-de-sens-sans-coordination) | un champ est retiré, renommé, ou change de sens sans coordination | **à corriger** |
| [**X4**](#x4-le-sérialiseur-reçoit-un-modèle-du-domaine-plutôt-quun-read-model) | le sérialiseur reçoit un modèle du domaine plutôt qu'un read-model | à surveiller |

---

## 1. Rôle

Un sérialiseur met en forme un objet du domaine vers le format de réponse attendu par les
consommateurs de l'API HTTP.

Il est **déclaratif** : une liste de champs, éventuellement des relations incluses. Il ne calcule pas,
ne filtre pas selon une condition métier, ne décide pas.

C'est un *presenter* au sens de Martin, et comme le contrôleur, un *humble object* : assez bête pour
que son test soit trivial.

**C'est la fiche la plus courte du corpus, et c'est cohérent avec la couche** : un sérialiseur déclare
une liste de champs. S'il fallait quatre cents lignes pour l'encadrer, c'est qu'on lui en demanderait
trop.

### Ce qu'un sérialiseur n'est pas

Table de décision. Si le code correspond à une ligne, ce n'est pas un sérialiseur.

| Le code… | Va dans | Fiche |
| --- | --- | --- |
| calcule une valeur absente de l'objet reçu | le usecase, ou un read-model | `fiche-usecase.md`, `fiche-read-model.md` |
| filtre selon une condition métier | le domaine — entité, objet-valeur, racine d'agrégat | `fiche-entite.md`, `fiche-objet-valeur.md`, `fiche-racine-agregat.md` |
| choisit une forme de réponse selon les droits de l'appelant | le usecase, qui ne renvoie que ce qui est autorisé | `fiche-usecase.md` |
| met en forme pour un autre contexte borné | `application/api/` et son DTO de contrat | `fiche-api-interne.md` |
| assemble une forme pour une lecture | un read-model, construit par un repository | `fiche-read-model.md` |

---

## 2. Invariants

### M1. Aucune logique

**Énoncé.** Pas de condition, pas de calcul, pas de décision. Le sérialiseur met en forme ce qu'il
reçoit.

```js
// fautif — une règle métier vit désormais dans la mise en forme
attributes: course.isPublished ? ['name', 'code', 'items'] : ['name']

// conforme — l'objet reçu porte déjà ce qu'il faut exposer
attributes: ['name', 'code', 'status', 'items']
```

**Ce qui casse.** Une règle écrite ici est **invisible depuis le domaine**. Le coût est asymétrique :
elle est facile à écrire là, et personne ne la cherchera jamais là. C'est le seul endroit du dépôt où
l'on ne pense pas à chercher une règle, donc celui où une fuite coûte le plus cher.

**Ce qui reste autorisé** : les valeurs par défaut et l'accès optionnel — `x ?? null`, `x?.y`. Ce sont
des protections de forme, pas des décisions.

La frontière est nette : si l'expression **choisit entre deux formes de réponse**, c'est une décision ;
si elle protège d'une valeur absente, non.

Cette frontière vaut aussi entre fichiers. Deux sérialiseurs pour la même ressource selon l'appelant
sont la même violation à une autre granularité : c'est au usecase de ne renvoyer que ce qui est
autorisé.

### M2. N'expose que des champs présents sur l'objet reçu

**Énoncé.** Le sérialiseur déclare des champs, il ne les fabrique pas. Si un champ à exposer n'existe
pas sur l'objet, c'est au usecase ou au read-model de le fournir.

```js
// fautif — le champ est fabriqué ici
attributes: { …, progression: computeProgression(course) }

// conforme — l'objet reçu le porte
attributes: ['name', 'progression']
```

**Ce qui casse.** Un champ qui sort systématiquement à `null` sans que personne ne sache pourquoi. Le
front l'interprète comme une donnée absente ; en réalité elle n'a jamais été chargée. Rien ne le
signale — ni la compilation, ni les tests du sérialiseur, qui passent avec un objet de test complet.

### M3. Le format de réponse est un contrat externe

**Énoncé.** Le format produit est consommé par des applications front, parfois par des tiers. Il obéit
donc aux règles d'un format publié : **on ajoute sans casser, on ne renomme pas à la légère, on
coordonne un retrait.**

**Ce qui casse.** Casser le format casse les applications front, chez d'autres équipes, à l'exécution.
C'est la seule couche du dépôt dont les consommateurs sont partiellement inconnus.

C'est le pendant externe de `P6` de `fiche-api-interne.md`, avec une différence qui impose plus de
prudence : les consommateurs d'une API interne sont connaissables — ce sont les contextes qui
déclarent en dépendre. Ceux d'une API HTTP le sont moins.

**Le pire cas n'est ni l'ajout ni le retrait, c'est le changement de sens** d'un champ existant. Rien
ne le signale : ni la compilation, ni les tests, ni les consommateurs, jusqu'à ce qu'un comportement
devienne faux quelque part.

Et il faut distinguer deux choses sous ce mot. **Changer l'ensemble des valeurs possibles** d'un champ
— ajouter ou retirer un état — est un changement de forme, donc rattrapable par un outil. **Redéfinir
ce qu'une valeur inchangée signifie** ne l'est par aucun outil, présent ou futur. Voir le § 7.

### M4. Un sérialiseur par ressource exposée

**Énoncé.** Un fichier par ressource, nommé d'après elle.

**Ce qui casse.** Rien à l'exécution. Invariant d'hygiène : il rend le fichier trouvable. Il rend
aussi visible la violation décrite sous `M1` — deux sérialiseurs pour une même ressource sautent aux
yeux quand la convention est d'en avoir un.

---

## 3. Exceptions légitimes

Une exception ne vaut que pour l'invariant qu'elle nomme. Elle n'excuse rien d'autre.

| Cas | Statut |
| --- | --- |
| `x ?? null` ou `x?.y` pour se protéger d'une valeur absente | **autorisé** — protection de forme. `M1` |
| Composer un libellé à partir de plusieurs champs reçus | **autorisé** — mise en forme sans décision |
| Aplatir une structure imbriquée | **autorisé** |
| Déclarer des relations incluses | **autorisé** — c'est de la mise en forme |
| Renommer un champ pour le vocabulaire du format | **autorisé**, et c'est un bon usage de la couche |
| Une enveloppe de pagination autour des objets sérialisés | **autorisé** |
| Un sérialiseur qui reçoit un read-model plutôt qu'une entité | **autorisé**, et préférable. Voir `X4` |
| Une condition qui choisit entre deux formes de réponse | **pas une exception** — c'est `M1` violé, donc `X1` |
| Un champ calculé depuis une méthode métier de l'objet | **pas une exception** — c'est `M2` violé, donc `X2` |
| Deux sérialiseurs pour la même ressource selon l'appelant | **pas une exception** — c'est `M1` à l'échelle du fichier |

---

## 4. ROI des invariants

| Invariant | Rentabilité | Ce qu'on gagne |
| --- | --- | --- |
| **M1** aucune logique | **forte** | Une règle écrite ici serait invisible depuis le domaine et réécrite ailleurs. Le coût d'une fuite est maximal à cet endroit précis |
| **M3** format stable | **forte** | Les applications front continuent de fonctionner. C'est la seule couche dont les consommateurs sont partiellement inconnus |
| **M2** uniquement des champs présents | moyenne | Un champ manquant devient une erreur visible au lieu d'un `null` que le front interprète comme une donnée absente |
| **M4** un sérialiseur par ressource | hygiène | Aucun gain mesurable. Rend le fichier trouvable, et rend visible la violation de `M1` entre fichiers |

Les deux invariants en rentabilité forte ont des vérifiabilités opposées : `M1` se lit dans le fichier
et se contrôle par une règle simple, `M3` n'a **aucun moyen aujourd'hui** parce que ses consommateurs
sont hors du dépôt.

Cette asymétrie n'est pas définitive. Un paquet de types partagé entre l'API et les applications front
rendrait `M3` vérifiable par le compilateur pour tout ce qui est retrait ou renommage — voir § 7. La
tension se réduirait alors au seul changement de sens d'un champ.

### Ce que ça n'apporte pas

Rien ici ne dit si le format exposé est **bien conçu** : granularité, nommage des champs, relations
incluses ou non. Un sérialiseur irréprochable peut produire une réponse pénible à consommer.

---

## 5. Écarts avec la théorie

| Écart | Nature | Coût payé | Bénéfice obtenu | Verdict |
| --- | --- | --- | --- | --- |
| **X1** Une condition choisit entre deux formes de réponse | dérive | La règle est invisible depuis le domaine, à l'endroit où personne ne la cherche | Le besoin est satisfait sans toucher au usecase ni au domaine | **À corriger** |
| **X2** Le sérialiseur fabrique un champ absent de l'objet reçu | dérive | Un champ sort à `null` sans cause visible, ou un calcul métier vit dans la mise en forme | Pas de read-model ni de usecase à modifier | **À corriger** |
| **X3** Un champ est retiré, renommé, ou change de sens sans coordination | dérive | Des applications front cassent à l'exécution, chez d'autres équipes. Le changement de sens ne se signale nulle part | Le format suit le vocabulaire interne sans dette de compatibilité | **À corriger** |
| **X4** Le sérialiseur reçoit un modèle du domaine plutôt qu'un read-model | convention assumée | Le format de sortie est couplé à la forme du modèle : ajouter un champ au domaine l'expose, le renommer casse la réponse | Réel — pas de read-model à écrire pour chaque écran, et le modèle est déjà là | *À surveiller* |

### X1. Une condition choisit entre deux formes de réponse

**Ce que dit la théorie.** Le *presenter* est dépourvu de logique, pour que son test soit trivial et
que la décision vive où on la cherche.

**Exemple concret.**

```js
attributes: user.hasAdminRole ? ['name', 'email', 'internalId'] : ['name']
```

Deux formes de réponse, donc une décision d'autorisation prise dans la mise en forme.

**Correction.** Faire renvoyer par le usecase **uniquement ce qui est autorisé**, et sérialiser sans
condition. Si les deux formes sont vraiment deux ressources, ce sont deux points d'entrée avec
chacun leurs droits déclarés sur la route — `R2` de `fiche-route.md`.

Ce qui rend la correction non mécanique : il faut décider laquelle des deux lectures est la bonne, et
cette décision remonte souvent jusqu'au découpage de l'API.

### X2. Le sérialiseur fabrique un champ absent de l'objet reçu

**Ce que dit la théorie.** Même chapitre : le *presenter* met en forme, il ne produit pas de donnée.

**Exemple concret.** Deux formes, le second est le plus discret :

```js
progression: computeProgression(course),        // calcul explicite
label: course.buildDisplayLabel(),              // appel d'une méthode métier de l'objet
```

Le second passe pour de la mise en forme parce qu'il ressemble à un accesseur.

**Correction.** Le champ vient du usecase ou du read-model, qui le porte déjà calculé. Le sérialiseur
retombe à une liste de noms.

Le déplacement est mécanique quand le calcul est pur. Il ne l'est pas quand il faut décider si le
champ appartient au read-model — donc s'il est de la présentation — ou au domaine. C'est le
discriminant du § 1 de `fiche-objet-valeur.md`, et la question à poser est celle de `RM1` :
ce calcul décide-t-il quelque chose ?

### X3. Un champ est retiré, renommé, ou change de sens sans coordination

**Ce que dit la théorie.** Evans traite le sujet sous *Published Language* : un format publié se
versionne ou s'étend, il ne se casse pas. Le fait que le consommateur soit hors du système ne change
pas la règle, il en augmente la portée.

**Exemple concret.** Le cas grave n'a pas d'exemple visible dans le code — c'est ce qui le rend grave.
Un champ `status` dont les valeurs possibles changent de sens produit un diff d'une ligne et casse un
affichage ailleurs.

**Correction.** Aucune rétroactive possible, et la bonne réponse n'est pas une procédure de
coordination entre équipes — ce qui se passe côté front n'est pas le sujet de ce corpus.

Ce qui est à tenir côté API tient en une phrase, et elle est plus étroite qu'il n'y paraît : **ne
jamais redéfinir ce qu'une valeur existante signifie**, en ajouter une nouvelle à la place. C'est la
seule partie de l'écart qu'aucun outil ne rattrapera jamais, donc la seule qui mérite d'être une règle
tenue à la main.

Tout le reste — retrait de champ, renommage, ajout ou retrait d'une valeur possible — a une piste
mécanique : un paquet de types **et de constantes** partagé avec les fronts, une fois ceux-ci en
TypeScript, en fait des erreurs de compilation. Voir § 7. Ça vaut mieux qu'une procédure, parce
qu'une procédure s'oublie.

Donc pas d'ADR sur une procédure de coordination : le sujet est d'attendre le bon outil pour deux
tiers de l'écart, et de tenir la règle du sens pour le tiers restant.

### X4. Le sérialiseur reçoit un modèle du domaine plutôt qu'un read-model

**Ce que dit la théorie.** Le format de sortie et le modèle du domaine sont deux choses qui évoluent
pour des raisons différentes. Les coupler fait dépendre l'une de l'autre.

**Exemple concret.**

```js
// le sérialiseur déclare des champs de l'entité elle-même
attributes: ['name', 'code', 'createdAt']     // ce sont les champs de Course
```

Ajouter un champ à `Course` pour un besoin interne l'expose dans la réponse. Le renommer casse le
format.

**Correction.** Aucune systématique, et le bénéfice de la convention est réel : écrire un read-model
pour chaque écran a un coût, et le modèle est déjà disponible.

Ce qui est à tenir : dès que le format de sortie et le modèle **divergent** — un champ exposé qui
n'existe pas sur le modèle, ou un champ du modèle qu'il faut masquer — c'est le signal qu'un
read-model est dû. Le premier symptôme est habituellement `X2`.

Ce qui rouvrirait le dossier : un incident où un changement interne du domaine a modifié une réponse
d'API sans que personne l'ait voulu.

---

## 6. Vérification déterministe

Il n'existe aucun plugin ESLint maison : toute règle sur mesure suppose d'abord de créer cette
infrastructure. Ce point est daté, à retirer dès que l'infrastructure existe.

| Invariant | Moyen | Coût | Faux positifs |
| --- | --- | --- | --- |
| **M1** aucune condition | règle ESLint : structure conditionnelle dans `infrastructure/serializers/`, hors `??` et `?.` | ~20 lignes | faibles si les deux exclusions sont posées |
| **M1** aucune méthode métier | même règle : appel de méthode sur l'objet sérialisé | ~10 lignes de plus | **à mesurer** |
| **M4** un fichier par ressource | script `tests/tooling/` : nommage et unicité | ~15 lignes | aucun |
| **M2** champs présents | typage, après migration du read-model reçu | — | aucun — voir § 7 |
| **M3** format stable | aucun moyen aujourd'hui. Piste : un paquet de types partagé avec les fronts — voir § 7 | — | — |

### M1 — la seule règle qui compte ici, et elle est simple

Un sérialiseur est déclaratif : une structure conditionnelle y est un signal fiable.

**Les deux exclusions à poser d'emblée**, sans quoi la règle sera rejetée à la première exécution :
l'opérateur de coalescence `??` et l'accès optionnel `?.`. Ce sont des protections de forme, présentes
dans presque tous les sérialiseurs, et parfaitement légitimes.

Ce qui reste signalé : `if`, ternaire, `&&` en position de valeur, `switch`. Tous décidables sans
quitter le fichier.

Le second motif — un appel de méthode sur l'objet sérialisé — attrape `X2` en même temps, mais demande
de distinguer un accesseur d'une méthode métier, ce qui n'est pas décidable au nom seul. À écrire après
le premier, et à mesurer avant de rendre bloquant.

### M3 — pas mécanisable aujourd'hui, et par quoi ça changerait

`M3` demande de savoir ce que les consommateurs lisent. Aucune règle de lint ne l'apprendra depuis ce
dépôt, et c'est la seule ligne du corpus dont la vérification vit ailleurs.

**Ce qui lèverait la limite** : un paquet de types partagé entre l'API et les applications front, une
fois celles-ci en TypeScript. Le compilateur du front refuserait alors un champ retiré ou renommé, et
la vérification cesserait d'être une affaire de coordination. Le détail est au § 7.

**Ce qui resterait hors de portée**, même avec ce paquet : le changement de **sens** d'un champ. Un
`status` dont les valeurs changent de signification garde son type. C'est la part de `M3` qui reste en
revue quoi qu'il arrive, et c'est la plus dangereuse.

### Ordre de mise en œuvre

1. **M1 conditions** — la règle simple, avec ses deux exclusions
2. **M4** — script de nommage et d'unicité
3. **M1 méthodes** — après mesure
4. **M2** — par le typage, une fois les read-models migrés

### Codemods

Sans objet. `M1` demande de décider où déplacer la règle qui a fui, `M2` de décider si le champ
appartient au read-model ou au domaine, `M3` de coordonner. Aucun n'est une transformation.

---

## 7. Le type

**C'est le seul endroit de la couche application où le typage apporte réellement quelque chose.**

La liste des champs exposés se type contre l'objet reçu, ce qui rend **`M2` structurel** : déclarer un
champ qui n'existe pas sur l'objet ne compile plus.

```ts
type SerializableFields<T> = readonly (keyof T)[];

const attributes: SerializableFields<CombinedCourseReadModel> = ['name', 'code', 'status'];
```

Le gain est direct et ne dépend pas de la migration du reste : il suffit que le **read-model reçu**
soit typé. Cela fait du sérialiseur un candidat plus précoce que le contrôleur ou la route, à condition
que les read-models soient migrés d'abord.

Ce que le typage n'apporte pas **dans ce dépôt seul** : `M1` et `M3`. Une condition reste écrivable
dans un fichier typé, et la stabilité du contrat n'est pas vérifiable tant que le type ne franchit pas
la frontière.

### La piste qui changerait `M3`

TypeScript est un citoyen de première classe dans Ember. Le jour où les applications front y passent,
**un paquet de types partagé entre l'API et les fronts** peut porter la forme de retour des
sérialiseurs.

Ce que ça change, et c'est considérable pour cette fiche : retirer ou renommer un champ devient une
**erreur de compilation chez le consommateur**. `M3` cesse d'être une procédure de coordination pour
devenir une contrainte mécanique, ce qu'aucune autre approche ne permet.

**Le paquet peut aussi porter les constantes**, et c'est ce qui rend la piste presque complète. Les
chaînes qui portent du sens — les valeurs possibles d'un `status`, les codes d'erreur, les
énumérations du contrat — deviennent des types partagés au lieu d'être recopiées de chaque côté.

Ce que ça ajoute : ajouter ou retirer une valeur possible devient à son tour une erreur de
compilation. Et ça retire une classe de défauts qui existe **dès aujourd'hui**, sans attendre quoi que
ce soit — la duplication des littéraux entre l'API et les fronts.

Ce qui reste alors hors de portée est beaucoup plus étroit que ce que `M3` couvre. Trois niveaux, et
seul le dernier résiste :

| Le changement | Attrapé par |
| --- | --- |
| Un champ est retiré ou renommé | le type partagé |
| Une valeur possible est ajoutée ou retirée | les constantes partagées, si le front les consomme de façon exhaustive |
| Une valeur inchangée change de **signification** | rien, jamais |

Le troisième cas est le résidu irréductible : `terminé` reste la chaîne `'terminé'`, son type ne bouge
pas, et pourtant elle ne veut plus dire la même chose. C'est la seule part de `M3` qui restera en revue
humaine quoi qu'on outille.

Deux réserves sur la piste elle-même.

Le bénéfice sur les valeurs **dépend de la façon dont le front les consomme**. Un `switch` exhaustif
sur un type union casse à l'ajout d'une valeur ; un `if` sur une chaîne l'ignore en silence. Le paquet
crée la possibilité, il ne la garantit pas.

Et le paquet **suppose que le type soit dérivé du sérialiseur**, pas écrit à côté. Un type maintenu à
la main en parallèle du code dériverait, ce qui reproduirait le problème un cran plus loin. Il devient
aussi un contrat versionné à publier et à faire évoluer, ce qui a son propre coût.

Ce n'est pas une décision de ce corpus — le passage des fronts à TypeScript ne relève pas de `api/`.
C'est une piste consignée dans `migration-typescript.md`, à ressortir le jour où la question se pose.

Les contraintes de syntaxe imposées par la configuration sont dans `migration-typescript.md`.

---

## 8. Tests attendus

| Objet | Type de test | Ce qu'on vérifie |
| --- | --- | --- |
| Sérialiseur | **unitaire pur** — aucune doublure, aucun serveur | la forme produite, champ par champ |

L'existence du fichier de test se vérifie par comparaison de noms. Moyens et limites au § 6 de
`fiche-repository.md`.

Deux indices de diagnostic, avec leurs bornes.

**Un test de sérialiseur qui a besoin d'une fixture métier ou d'une doublure est le signe que `M1` ou
`M2` est violé.** La borne : un sérialiseur de collection paginée demande un objet d'entrée un peu
construit sans rien décider.

**Le test doit couvrir les valeurs absentes**, pas seulement le cas nominal : c'est là que se révèle un
champ que l'objet reçu ne portait pas. Un test écrit avec un objet complet passe alors que `M2` est
violé — c'est précisément le défaut que ce test doit attraper.

---

## 9. Checklist de revue

Ordonnée par ROI décroissant, conformément au § 4.

Chaque ligne porte son statut au regard du § 6. `[auto]` disparaît de la checklist dès que la règle
correspondante existe. `[partiel]` reste, réduite à ce qu'elle ne couvre pas. `[humain]` reste
entièrement : aucun moyen déterministe n'est identifié.

```
[ ] [auto]    M1  Aucune condition — ni if, ni ternaire, ni && en position de valeur
[ ] [partiel] M1  Aucun appel de méthode métier sur l'objet sérialisé
[ ] [humain]  M3  Aucune valeur existante ne change de signification ; on en ajoute une nouvelle
[ ] [humain]  M2  Tous les champs déclarés existent sur l'objet reçu
[ ] [auto]    M4  Un fichier par ressource exposée, nommé d'après elle
[ ] [auto]    Un fichier de test existe, et son nom correspond à celui du sérialiseur
[ ] [humain]  Test unitaire pur, couvrant les valeurs absentes et pas seulement le cas nominal
[ ] [humain]  Un seul sérialiseur pour cette ressource, quel que soit l'appelant
```

À terme il reste quatre lignes, toutes de jugement, dont `M3` qui n'aura jamais de moyen. `M2` sortira
de la liste par le typage et non par une règle de lint — c'est le seul invariant du corpus dans ce cas.

---

## 10. Sources

Bibliographie et liens dans `references-ddd.md`. Sources primaires des conventions Pix : les ADR de
`docs/adr/`.

| Invariant | Source | Où vérifier |
| --- | --- | --- |
| La couche, **M1** et **M4** | Martin, *Clean Architecture*, ch. « Presenters and Humble Objects » — le *presenter* est dépourvu de logique pour que son test soit trivial | le livre de 2017 ; billet gratuit de 2012 |
| **M2** uniquement des champs présents | **aucune source** — déduction de `M1` | — |
| **M3** format stable | Evans, *DDD*, ch. « Maintaining Model Integrity » — **Published Language**, appliqué ici à l'extérieur du système plutôt qu'entre contextes | *DDD Reference*, PDF gratuit |
| La stabilité du format des réponses HTTP | **aucun ADR**, et c'est cohérent : deux tiers de l'écart se règlent par un outil à venir plutôt que par une procédure. Voir `X3` au § 5 | — |

**Un invariant sur quatre n'a aucune source** : `M2`, déduit de `M1`. L'essentiel repose sur un seul
chapitre de Martin, ce qui est cohérent avec la minceur de la couche : il n'y a pas grand-chose à
décider, donc peu à documenter.

`M3` est le seul invariant du corpus qui porte sur un contrat dont les consommateurs sont **hors du
dépôt**, et le seul dont la vérification ne peut pas vivre ici — aujourd'hui. Un paquet de types
partagé avec les fronts la ramènerait pour l'essentiel, ce qui ferait de cette fiche celle où le
typage rapporte le plus. Voir § 7.
