# Fiche — Route

Fiche générique. Elle décrit l'état cible, où tout est en TypeScript.

Le gabarit commun, l'état du chantier et l'ordre de relecture sont dans `corpus-index.md`. L'écart avec
le code réel est mesuré dans les rapports de divergence, un par contexte. Ce qui empêche aujourd'hui le
typage de mordre est dans `migration-typescript.md`.

> **À instruire**
>
> - `R2` n'a **aucune source**, ni externe ni ADR, alors que c'est l'invariant au plus fort rendement
>   du corpus. La pratique existe, le raisonnement n'est écrit nulle part, donc personne ne peut la
>   défendre ni la contester sur pièces. Candidate évidente à un ADR.
> - `X2` — aucune liste des routes délibérément publiques — bloque la vérification de `R2`. À traiter
>   avant tout le reste de cette fiche.
> - La section « Note sur le préfixe » a été retirée : la collision entre `R` route et `R` read-model
>   est levée, le read-model emploie `RM`.

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
| [**R2**](#r2-les-contrôles-daccès-sont-déclarés-en-pre-handler) | les contrôles d'accès sont déclarés en pre-handler | **forte** | script, bloqué par `X2` |
| [**R1**](#r1-la-route-déclare-et-valide-la-forme-de-ses-entrées) | la route déclare et valide la forme de ses entrées | **forte** | script, faux positifs faibles |
| [**R4**](#r4-aucune-logique-dans-la-route) | aucune logique dans la route | moyenne | règle ESLint, à mesurer |
| [**R3**](#r3-la-route-est-documentée) | la route est documentée | moyenne | script, sans faux positif |
| [**R5**](#r5-une-adresse-et-une-méthode-un-gestionnaire) | une adresse et une méthode, un gestionnaire | hygiène | revue |

**Écarts** — triés par verdict, comme au § 5.

| # | Écart | Verdict |
| --- | --- | --- |
| [**X1**](#x1-le-contrôle-des-droits-est-écrit-dans-le-contrôleur) | le contrôle des droits est écrit dans le contrôleur | **à corriger** |
| [**X2**](#x2-aucune-liste-des-routes-délibérément-publiques) | aucune liste des routes délibérément publiques | **à corriger** |
| [**X3**](#x3-une-validation-de-route-exprime-une-règle-métier) | une validation de route exprime une règle métier | **à corriger** |
| [**X4**](#x4-des-fonctions-sont-écrites-en-ligne-dans-la-déclaration) | des fonctions sont écrites en ligne dans la déclaration | à surveiller |
| [**X5**](#x5-la-route-est-un-fichier-de-configuration-écrit-en-javascript) | la route est un fichier de configuration écrit en JavaScript | rien à faire |

L'artefact le plus cherché est le [test forme / règle](#distinguer-forme-et-règle) sous `R1` : il dit
ce qui appartient à la validation de route et ce qui appartient au domaine.

---

## 1. Rôle

Une route **déclare**. Elle ne fait rien.

Cinq déclarations, et rien d'autre : l'adresse et la méthode, la forme attendue des entrées, les
contrôles d'accès, le gestionnaire, la documentation.

C'est un fichier de configuration écrit en JavaScript. Toute expression évaluée au-delà de la
déclaration est un signal — voir `X5` au § 5 pour ce que ce choix coûte.

**Ce qui donne à cette couche son rendement particulier** : la route est le seul endroit du dépôt où
les droits d'accès sont auditables en lecture. Tout contrôle qui sort de la route pour aller dans un
contrôleur devient invisible à l'audit. C'est `R2`.

### Ce qu'une route n'est pas

Table de décision. Si le code correspond à une ligne, ce n'est pas une route.

| Le code… | Va dans | Fiche |
| --- | --- | --- |
| extrait les paramètres et appelle un usecase | un contrôleur | `fiche-controleur.md` |
| réalise l'intention métier | un usecase | `fiche-usecase.md` |
| met en forme la réponse | un sérialiseur | `fiche-serialiseur.md` |
| vérifie qu'une valeur existe en base | un usecase, ou un pre-handler qui charge | `fiche-usecase.md` |
| associe une erreur du domaine à un code HTTP | le mappeur d'erreurs du contexte | — |
| expose une capacité à un autre contexte | `application/api/` | `fiche-api-interne.md` |

---

## 2. Invariants

### R1. La route déclare et valide la forme de ses entrées

**Énoncé.** Paramètres d'adresse, chaîne de requête, corps : leur forme est déclarée ici, pas vérifiée
dans le contrôleur.

#### Distinguer forme et règle

C'est tout l'invariant, et c'est le test à appliquer devant chaque schéma :

```
« cet identifiant est un entier positif »            → forme, ici
« cet identifiant désigne une organisation active »  → règle métier, dans le domaine
```

**Ce qui casse.** Une règle métier écrite dans la validation de route est **contournable** : un
script, un job ou une API interne qui appellerait le même usecase ne passerait pas par elle. La règle
existe donc pour un seul chemin d'appel, et personne ne le sait. C'est `X3` au § 5.

Les types d'identifiants partagés valent mieux qu'un schéma réécrit à chaque route : un identifiant
mal formé devient une erreur unique et cohérente.

### R2. Les contrôles d'accès sont déclarés en pre-handler

**Énoncé.** Le contrôle des droits est déclaré dans la configuration de la route, jamais écrit dans le
gestionnaire.

```js
// conforme — le droit est lisible sans ouvrir un autre fichier
{
  method: 'GET',
  path: '/api/things/{id}',
  config: {
    pre: [{ method: securityPreHandlers.checkAdminRole }],
    handler: thingController.getById,
  },
}
```

**Deux propriétés que rien d'autre ne donne.** On lit une route et on sait qui y a accès. Et une route
**sans** contrôle se repère à l'absence de pre-handler, donc un oubli est visible.

**Ce qui casse.** Écrit dans un contrôleur, un contrôle oublié ne laisse aucune trace : l'absence ne
se distingue pas d'un fichier qui n'en a pas besoin. Il n'existe alors aucun moyen d'auditer les accès
du dépôt autrement qu'en lisant tous les contrôleurs, un par un. C'est `X1` au § 5.

**Le cas limite, et il est fréquent.** Un droit qui dépend d'une donnée métier à charger. Deux voies
acceptables : un pre-handler qui charge ce qu'il faut, ou un usecase dont c'est l'intention et qui
lève une erreur d'autorisation. Écrire le contrôle dans le contrôleur est le raccourci à refuser,
précisément parce qu'il casse l'auditabilité.

**Les routes délibérément publiques se déclarent comme telles**, pas simplement dépourvues de
pre-handler. Sinon « public » ne se distingue pas de « oublié », et c'est le préalable à toute
vérification automatique — `X2`.

### R3. La route est documentée

**Énoncé.** Étiquettes et description sur chaque route. La documentation d'API en est générée, donc
elle suit le code au lieu de dériver.

**Ce qui casse.** Une route sans description est une route dont l'usage n'est devinable que par son
auteur. Et la documentation générée devient incomplète en silence : rien ne signale une entrée
manquante.

### R4. Aucune logique dans la route

**Énoncé.** Elle déclare. Aucune fonction n'est écrite en ligne dans l'objet de configuration.

```js
// fautif — du code non testé, invisible depuis le contrôleur
handler: async (request, h) => {
  const id = Number(request.params.id);
  if (Number.isNaN(id)) return h.response().code(400);
  return thingController.getById(request, h);
},
```

**Ce qui casse.** Ce qui est déclaré est vérifiable ; ce qui est écrit en ligne ne l'est pas. Le code
en ligne échappe aux règles des autres fiches, et il rend `R1` et `R2` non fiables — une validation ou
un contrôle peuvent y être enfouis sans que rien ne les déclare.

**L'exception admise** : le traitement d'un échec de validation, quand le framework impose de le
déclarer sur la route. À garder minimal et uniforme entre les routes. Voir `X4`.

### R5. Une adresse et une méthode, un gestionnaire

**Énoncé.** Pas de branchement sur un paramètre pour choisir le gestionnaire. Deux comportements
distincts sont deux routes, avec chacune leur validation, leurs droits et leur documentation.

**Ce qui casse.** Rien directement — c'est un invariant d'hygiène. Mais il rend `R2` mécaniquement
vérifiable : une route, un jeu de droits. Une route à deux gestionnaires a deux jeux de droits
possibles, et le script du § 6 ne peut plus conclure.

---

## 3. Exceptions légitimes

Une exception ne vaut que pour l'invariant qu'elle nomme. Elle n'excuse rien d'autre.

| Cas | Statut |
| --- | --- |
| Une route délibérément publique, **déclarée comme telle** | **autorisé** — c'est la déclaration qui compte, pas l'absence de pre-handler. `R2` |
| Traitement en ligne d'un échec de validation | **autorisé** si minimal et uniforme. `R4` |
| Un pre-handler qui charge une donnée pour décider du droit | **autorisé**, c'est la première voie du cas limite de `R2` |
| Une route qui renvoie un fichier, avec ses en-têtes déclarés | **autorisé** |
| Plusieurs pre-handlers chaînés | **autorisé** — c'est la forme normale d'un contrôle composé |
| Une limite de taille de charge déclarée sur la route | **autorisé** — c'est une contrainte de forme, donc `R1` |
| Une validation qui exprime une règle métier | **pas une exception** — elle est contournable. `R1`, et `X3` |
| Un contrôle de droit dans le contrôleur | **pas une exception** — c'est `X1` |

---

## 4. ROI des invariants

| Invariant | Rentabilité | Ce qu'on gagne |
| --- | --- | --- |
| **R2** contrôles d'accès en pre-handler | **forte** | On audite les droits d'une route en la lisant. Et un contrôle **oublié** se voit, parce que l'absence de pre-handler est visible dans la déclaration |
| **R1** validation déclarée | **forte** | Le domaine ne reçoit jamais une valeur dont la forme n'a pas été contrôlée. La déclaration valide **et** documente : un seul écrit sert deux fois |
| **R4** aucune logique | moyenne | Ce qui est déclaré est vérifiable. Le gain vient surtout de ce qu'il rend `R1` et `R2` fiables |
| **R3** documentation déclarée | moyenne | La documentation d'API est générée depuis le code, donc elle ne dérive pas. Rentable à proportion du nombre de consommateurs externes |
| **R5** une adresse, un gestionnaire | hygiène | Aucun gain mesurable. Rend l'audit de `R2` mécanique |

**`R2` est l'invariant au plus fort rendement du corpus**, et c'est le seul de ce niveau qui n'ait
aucune source. La raison de son rendement n'est pas qu'il prévient un défaut de plus que les autres :
c'est qu'il rend une **omission** visible. Les autres invariants du corpus se vérifient sur ce qui est
écrit ; celui-là se vérifie sur ce qui est absent.

### Ce que ça n'apporte pas

Rien ici ne dit si le **découpage** de l'API est bon : granularité des ressources, cohérence des
adresses, versionnement. Une route irréprochable peut appartenir à une API mal conçue.

Et rien ne dit si le droit déclaré est le **bon** droit. `R2` garantit qu'un contrôle est déclaré et
lisible, pas qu'il est juste.

---

## 5. Écarts avec la théorie

| Écart | Nature | Coût payé | Bénéfice obtenu | Verdict |
| --- | --- | --- | --- | --- |
| **X1** Le contrôle des droits est écrit dans le contrôleur | dérive | La route cesse d'être auditable, et un oubli devient invisible. Aucun audit des accès n'est possible sans lire tous les contrôleurs | Le droit qui dépend d'une donnée à charger s'écrit sans pre-handler dédié | **À corriger** |
| **X2** Aucune liste des routes délibérément publiques | dérive | `R2` n'est pas vérifiable : « public » ne se distingue pas de « oublié ». Le script produirait du bruit et serait désactivé | Nul | **À corriger** |
| **X3** Une validation de route exprime une règle métier | dérive | La règle ne vaut que pour le chemin HTTP. Un script ou un job appelant le même usecase la contourne | Le refus est immédiat, avec un message utilisateur | **À corriger** |
| **X4** Des fonctions sont écrites en ligne dans la déclaration | dérive | Du code non testé, invisible depuis le contrôleur, qui échappe aux règles des autres fiches | Réel dans un cas : le framework impose de déclarer le traitement d'échec de validation sur la route | *À surveiller* |
| **X5** La route est un fichier de configuration écrit en JavaScript | convention assumée | Rien n'empêche structurellement d'y écrire de la logique — d'où la nécessité de `R4` | Réel — les pre-handlers se composent, les schémas se partagent, et la déclaration reste dans le langage du reste du dépôt | *Rien à faire* |

### X1. Le contrôle des droits est écrit dans le contrôleur

**Ce que dit la théorie.** L'adaptateur d'entrée est dépourvu de logique — Martin le traite sous
*Presenters and Humble Objects*. Un contrôle d'accès est une décision, donc il se déclare plutôt qu'il
ne s'écrit.

**Exemple concret.**

```js
// dans le contrôleur — le droit n'est plus lisible depuis la route
export async function getById(request, h) {
  const { userId } = request.auth.credentials;
  if (!(await isAdmin({ userId }))) return h.response().code(403);
  …
}
```

La route correspondante n'a pas de pre-handler, donc elle est indiscernable d'une route publique.

**Correction.** Déplacer le contrôle en pre-handler. Deux cas.

Si le droit ne dépend que de l'identité et du rôle, le déplacement est mécanique : un pre-handler
existant convient presque toujours.

Si le droit dépend d'une donnée métier à charger, il faut choisir entre les deux voies de `R2` — un
pre-handler qui charge, ou un usecase dont l'autorisation est l'intention. C'est une décision, pas un
déplacement.

L'ordre de travail est imposé par `X2` : sans la liste des routes publiques, on ne sait pas
distinguer les routes à corriger de celles qui n'ont rien à déclarer.

### X2. Aucune liste des routes délibérément publiques

**Ce que dit la théorie.** Rien : la théorie ne prescrit pas de fichier. L'écart est avec la
vérifiabilité, pas avec un livre — comme `X2` de `fiche-racine-agregat.md`.

**Exemple concret.** Deux routes sans pre-handler, indiscernables :

```js
{ method: 'POST', path: '/api/token', handler: authController.token }        // publique, voulu
{ method: 'GET',  path: '/api/things/{id}', handler: thingController.get }   // oubli
```

Aucune analyse ne peut trancher entre les deux, et un humain non plus sans connaître l'intention.

**Correction.** Déclarer la liste, versionnée dans le dépôt. Ce que ça débloque est disproportionné au
coût.

Le script de `R2` devient écrivable et sans faux positif : toute route déclare un pre-handler de
sécurité, ou figure dans la liste. Quarante lignes.

Et **la liste est elle-même un artefact de sécurité utile**, indépendamment du script : elle rend
explicite ce qui est exposé sans authentification. C'est le meilleur rapport effort sur bénéfice
identifié dans le corpus — établir la liste une fois, puis quarante lignes, et un contrôle d'accès
oublié devient impossible à fusionner.

### X3. Une validation de route exprime une règle métier

**Ce que dit la théorie.** La règle métier vit dans le domaine, où tous les chemins d'appel la
traversent. L'ADR 2 pose d'ailleurs que l'intelligence métier est dans l'API et que le front ne fait
que des contrôles de surface — le même raisonnement s'applique d'un cran plus bas.

**Exemple concret.**

```js
// sur la route — la règle « le seuil ne dépasse pas le maximum de la campagne »
validate: {
  payload: Joi.object({
    threshold: Joi.number().max(Joi.ref('$campaignMax')),
  }),
}
```

**Correction.** Garder la contrainte de **forme** sur la route — type, bornes absolues, présence — et
déplacer la règle sur l'objet du domaine qui porte l'état, où `V3` s'applique.

Le bénéfice perdu — le refus immédiat avec un message utilisateur — se récupère par le mappeur
d'erreurs : une erreur du domaine porte un code exploitable par le front, c'est `I4` de
`fiche-repository.md`. Les deux ne s'excluent pas ; c'est leur confusion qui coûte.

Cet écart est voisin de `X2` de `fiche-objet-valeur.md`, qui traite la validation de **forme** à la
frontière plutôt que par le type. Ici il s'agit de règles, pas de formes, et le verdict est différent.

### X4. Des fonctions sont écrites en ligne dans la déclaration

**Ce que dit la théorie.** Une route déclare. Toute expression évaluée au-delà de la déclaration sort
du patron.

**Exemple concret.** Le cas légitime et le cas fautif se ressemblent :

```js
// admis — le framework impose de déclarer le traitement d'échec ici
failAction: (request, h, error) => errorManager.handle(request, h, error),

// fautif — de la logique déguisée en configuration
handler: async (request, h) => { /* extraction, garde, appel */ },
```

**Correction.** Aucune sur le cas admis, qui est une contrainte du framework. Pour le reste,
déplacer dans le contrôleur, où `C2` de `fiche-controleur.md` s'applique.

C'est classé *à surveiller* et non *à corriger* parce que le motif légitime et le motif fautif ont la
même forme syntaxique : la règle du § 6 doit distinguer le champ où la fonction est déclarée, ce qui
demande d'être mesuré avant d'être rendu bloquant.

### X5. La route est un fichier de configuration écrit en JavaScript

**Ce que dit la théorie.** Rien n'impose un format déclaratif. L'écart est avec l'esprit du patron :
une configuration écrite dans un langage complet n'a aucune barrière contre la logique.

**Exemple concret.** La déclaration est un objet JavaScript, donc tout y est permis :

```js
export const register = async (server) => {
  server.route([{ method: 'GET', path: '…', config: { … } }]);
};
```

**Correction.** Aucune. Un format déclaratif pur — JSON, YAML — retirerait la composition des
pre-handlers et le partage des schémas, qui sont exactement ce qui rend `R1` et `R2` praticables. Le
coût est réel mais il est payé par `R4` et par sa règle de lint, pas par un changement de format.

À noter comme convention explicite : c'est ce qui explique pourquoi `R4` existe. Sans cet écart,
l'invariant serait sans objet.

---

## 6. Vérification déterministe

La vérification la plus utile de cette fiche est **bloquée par un préalable**, et ce préalable vaut la
peine d'être fait pour lui-même. C'est `X2`.

Il n'existe aucun plugin ESLint maison : toute règle sur mesure suppose d'abord de créer cette
infrastructure. Ce point est daté, à retirer dès que l'infrastructure existe.

| Invariant | Moyen | Coût | Faux positifs |
| --- | --- | --- | --- |
| **R2** contrôles d'accès | script `tests/tooling/` : toute route déclare un pre-handler de sécurité **ou** figure dans la liste des routes publiques | ~40 lignes | aucun — **impossible avant `X2`** |
| **R3** documentation | script : toute route déclare étiquettes et description | ~30 lignes | aucun |
| **R1** validation déclarée | script : toute route ayant des paramètres d'adresse déclare leur validation | ~30 lignes | faibles — un paramètre validé par un type partagé plutôt qu'un schéma explicite |
| **R4** aucune logique | règle ESLint : déclaration de fonction dans un objet de route, hors champ de traitement d'échec | ~30 lignes | **à mesurer** — voir `X4` |
| **R5** un gestionnaire | revue | — | — |

### R2 — et son préalable, qui est le vrai travail

Vérifier que toute route est protégée est mécanique. Il manque une seule chose : **la liste des routes
délibérément publiques**.

Sans elle, le script produit du bruit sur chaque route publique et sera désactivé dans la semaine.
Avec elle, il devient une garantie forte.

Le détail de la correction et de ce qu'elle débloque est sous `X2` au § 5. L'essentiel tient en une
phrase : établir la liste une fois, puis quarante lignes de script, et un contrôle d'accès oublié
devient impossible à fusionner.

### R3 et R1 — deux scripts triviaux

Parcourir les déclarations de routes et vérifier la présence des champs attendus.

Aucun faux positif sur `R3`. Sur `R1`, un faux positif possible quand un paramètre est validé par un
type partagé plutôt que par un schéma explicite — à reconnaître dans le script plutôt qu'à corriger
dans le code, la forme par type partagé étant la meilleure des deux.

### R4 — la plus délicate

Distinguer une fonction de configuration légitime du traitement d'échec de validation demande de
reconnaître le champ où elle est déclarée. Faisable, mais à écrire après les trois autres, et à
mesurer avant de rendre bloquante : le motif admis et le motif fautif ont la même forme.

### Ordre de mise en œuvre

Cet ordre ne suit ni le coût ni le ROI : il suit les dépendances.

1. **`X2`** — établir la liste des routes publiques. Ce n'est pas de l'outillage
2. **R2** — le script, une fois la liste écrite
3. **`X1`** — corriger les contrôles écrits dans les contrôleurs, que le script révèle
4. **R3** puis **R1** — les deux scripts triviaux
5. **R4** — la règle ESLint, en avertissement d'abord

Le premier point est le seul qui compte vraiment. Les autres sont des scripts de trente lignes.

### Codemods

Critère de découpe : un codemod peut appliquer une décision, il ne peut pas en prendre une.

| Écart ou invariant | Codemod | Ce qu'il fait |
| --- | --- | --- |
| **R3** documentation | partiel | Ajouter les champs manquants est mécanique. Le texte de la description est du contenu : le codemod pose l'emplacement et un `TODO`, pas la phrase |
| **X1** contrôle déplacé | partiel | Insérer un pre-handler existant, oui, quand le droit ne dépend que du rôle. Décider quel droit s'applique, non |
| **X2** la liste | non | C'est l'inventaire lui-même, et il demande de connaître l'intention de chaque route |

---

## 7. Le type

**Peu de gain sur cette couche.** Les objets de configuration du framework sont typés de façon large,
et la validation déclarée produit un contrôle à l'exécution que le typage ne connaît pas : le type du
paramètre reçu par le contrôleur n'est pas déduit du schéma déclaré sur la route.

Il faut le dire plutôt que de laisser croire l'inverse. La sécurité de `R1` reste une garantie
d'exécution, pas de compilation.

Un gain existe si les identifiants sont typés nominalement : une adresse déclarant un identifiant d'un
type et un contrôleur en attendant un autre deviendrait détectable. Cela suppose la chaîne complète
migrée, donc c'est un bénéfice tardif — et c'est le sujet de l'ADR 19, qui l'a écarté pour son coût.

Ce qui ne se typera pas : `R2`. Un droit déclaré n'est pas une propriété de type, et aucune annotation
ne dit « cette route est protégée ». La vérification reste le script du § 6.

Les contraintes de syntaxe imposées par la configuration sont dans `migration-typescript.md`.

---

## 8. Tests attendus

| Objet | Type de test | Ce qu'on vérifie |
| --- | --- | --- |
| Route | **acceptance** — serveur réel, base réelle | les codes HTTP, **y compris les refus de droits** |

Rien en unitaire : une route ne contient pas de logique à tester. Si un test unitaire de route a du
sens, `R4` est violé — et c'est un indice de diagnostic sans borne.

**Le test qui manque presque toujours est celui du refus.** On vérifie qu'une route répond 200 pour un
utilisateur autorisé, rarement qu'elle répond 403 pour un autre. Or c'est le second qui prouve que
`R2` est tenu : le premier passerait tout aussi bien sans aucun contrôle d'accès.

La borne : une route déclarée publique n'a pas de refus à tester, ce qu'admet le § 3 — et c'est encore
`X2` qui permet de le savoir.

---

## 9. Checklist de revue

Ordonnée par ROI décroissant, conformément au § 4.

Chaque ligne porte son statut au regard du § 6. `[auto]` disparaît de la checklist dès que la règle ou
le script correspondant existe. `[partiel]` reste, réduite à ce qu'il ne couvre pas. `[humain]` reste
entièrement : aucun moyen déterministe n'est identifié.

```
[ ] [partiel] R2  Un pre-handler de sécurité est déclaré, ou la route est déclarée publique
[ ] [humain]  R2  Aucun contrôle de droit délégué au contrôleur
[ ] [partiel] R1  La forme de toutes les entrées est déclarée et validée
[ ] [humain]  R1  Aucune validation n'exprime une règle métier
[ ] [partiel] R4  Aucune fonction en ligne, sauf traitement d'échec de validation
[ ] [auto]    R3  Étiquettes et description présentes
[ ] [humain]  R5  Une adresse et une méthode, un seul gestionnaire
[ ] [humain]  Test d'acceptance couvrant le refus de droits, pas seulement l'accès autorisé
```

À terme il reste cinq lignes, toutes de jugement. Les deux qui comptent portent sur `R2` : qu'aucun
contrôle ne soit délégué au contrôleur, et que le refus soit testé. Ni l'un ni l'autre ne se lit dans
une déclaration de route — le premier demande d'ouvrir le contrôleur, le second d'ouvrir les tests.

---

## 10. Sources

Bibliographie et liens dans `references-ddd.md`. Sources primaires des conventions Pix : les ADR de
`docs/adr/`.

| Invariant | Source | Où vérifier |
| --- | --- | --- |
| La couche | Martin, *Clean Architecture*, ch. « Presenters and Humble Objects » — l'adaptateur est dépourvu de logique | le livre de 2017 ; billet gratuit de 2012 |
| **R1** validation de forme sur la route | Pix : **ADR 2**, qui pose que l'intelligence métier est dans l'API et que le front ne fait que des contrôles de surface. **ADR 19** pour les identifiants typés | ADR 2 et 19 |
| **R2** contrôles d'accès en pre-handler | **aucune source**, ni externe ni ADR | — |
| **R3** documentation déclarée | **aucune source** — convention Pix | — |
| **R4** aucune logique | Martin, même ch. | le livre de 2017 |
| **R5** une adresse, un gestionnaire | **aucune source** — convention de rangement | — |

**Trois invariants sur cinq n'ont aucune source**, et `R2` en fait partie. C'est le manque le plus
criant du corpus : l'invariant au plus fort rendement, sur la couche qui porte la sécurité, et le
raisonnement n'est écrit nulle part. Personne ne pourrait ni le défendre ni le contester sur pièces.

Il se comble par un ADR court, dont le contenu est déjà écrit ici : les deux propriétés de `R2` au
§ 2, et le préalable de `X2`.
