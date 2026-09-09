# Fiche — Route (`application/*-route.js`)

Fiche générique : elle décrit **l'état cible**, celui où la couche est rentable. Gabarit au § 10 de
`fiche-repository.md`. L'écart avec le code réel est mesuré dans les rapports de divergence.

> **La fiche au meilleur ROI de la couche application**, pour une raison précise : la route est le
> **seul endroit du dépôt où les droits d'accès sont auditables en lecture**. Tout ce qui sort de la
> route pour aller dans un contrôleur devient invisible à l'audit.

---

## 1. Rôle

Une route **déclare**. Elle ne fait rien.

Cinq déclarations, et rien d'autre : l'adresse et la méthode, la forme attendue des entrées, les
contrôles d'accès, le gestionnaire, la documentation.

C'est un fichier de configuration écrit en JavaScript. Toute expression évaluée au-delà de la
déclaration est un signal.

### Ce qu'une route n'est pas

| Le code… | Va dans |
| --- | --- |
| extrait les paramètres et appelle un usecase | un **contrôleur** |
| réalise l'intention métier | un **usecase** |
| met en forme la réponse | un **sérialiseur** |
| vérifie qu'une valeur existe en base | un **usecase**, ou un pre-handler qui charge |
| associe une erreur du domaine à un code HTTP | le **mappeur d'erreurs** du contexte |

---

## 2. Écarts fréquents

| Écart | Comment le trancher |
| --- | --- |
| Aucune validation déclarée sur une route qui reçoit des paramètres | **dérive** — le domaine reçoit des valeurs de forme inconnue |
| Le contrôle des droits est dans le contrôleur plutôt qu'en pre-handler | **dérive** — la route devient non auditable, et un oubli ne se voit pas |
| Une fonction écrite en ligne dans la déclaration de route | **dérive** — du code non testé et invisible depuis le contrôleur |
| Route sans étiquettes ni description | **dérive légère** — la documentation générée devient incomplète |
| Une validation qui exprime une règle métier plutôt qu'une forme | **dérive** — la règle est hors du domaine, donc contournable par un autre appelant |
| Plusieurs gestionnaires pour une même adresse selon un paramètre | **dérive** — deux routes déguisées en une |

---

## 3. Le ROI de ces invariants

### Rentabilité forte

| Invariant | Ce que ça rapporte |
| --- | --- |
| **R2** sécurité déclarée en pre-handler | **Le meilleur ROI de toute la couche application.** On audite les droits d'une route en la lisant, sans ouvrir un second fichier. Et surtout : un contrôle **oublié** se voit, parce que l'absence de pre-handler est visible dans la déclaration. Un contrôle oublié dans un contrôleur ne se voit pas. |
| **R1** validation déclarée | Le domaine ne reçoit jamais une valeur dont la forme n'a pas été contrôlée. Le gain est double : la déclaration valide **et** documente, donc un seul écrit sert deux fois. |

### Rentabilité moyenne

| Invariant | Ce que ça rapporte |
| --- | --- |
| **R3** documentation déclarée | La documentation d'API est générée depuis le code, donc elle ne dérive pas. Rentable à proportion du nombre de consommateurs externes. |
| **R4** aucune logique | Ce qui est déclaré est vérifiable ; ce qui est écrit en ligne ne l'est pas. Le gain vient surtout de ce qu'il rend R1 et R2 fiables. |

### Hygiène, pas rentabilité

| Invariant | Pourquoi il reste |
| --- | --- |
| **R5** une adresse, un gestionnaire | Aucun gain mesurable. Rend la route lisible et l'audit mécanique. |

### Ce que ça n'apporte pas

Rien ici ne dit si le **découpage** de l'API est bon : granularité des ressources, cohérence des
adresses, versionnement. Une route irréprochable peut appartenir à une API mal conçue.

---

## 4. Invariants

### R1. La route déclare et valide la forme de ses entrées

Paramètres d'adresse, chaîne de requête, corps : leur forme est déclarée ici, pas vérifiée dans le
contrôleur.

**Distinguer forme et règle**, c'est tout l'invariant :

```
« cet identifiant est un entier positif »            → forme, ici
« cet identifiant désigne une organisation active »   → règle métier, dans le domaine
```

Mettre une règle métier dans la validation de route la rend **contournable** : un script, un job ou
une API interne qui appellerait le même usecase ne passerait pas par elle.

Les types d'identifiants partagés valent mieux qu'un schéma réécrit à chaque route : un identifiant
mal typé devient une erreur unique et cohérente.

### R2. Les contrôles d'accès sont déclarés en pre-handler

Le contrôle des droits est déclaré dans la configuration de la route, jamais écrit dans le
gestionnaire.

**Pourquoi c'est l'invariant le plus rentable de la fiche.** Deux propriétés que rien d'autre ne
donne :

- on lit une route et on sait qui y a accès ;
- une route **sans** contrôle se repère à l'absence de pre-handler, donc un oubli est visible.

Écrit dans un contrôleur, un contrôle oublié ne laisse aucune trace. Il n'existe alors aucun moyen
d'auditer les accès du dépôt autrement qu'en lisant tous les contrôleurs.

**Le cas limite, et il est fréquent** : un droit qui dépend d'une donnée métier à charger. Deux voies
acceptables — un pre-handler qui charge ce qu'il faut, ou un usecase dont c'est l'intention et qui
lève une erreur d'autorisation. Écrire le contrôle dans le contrôleur est le raccourci à refuser,
précisément parce qu'il casse l'auditabilité.

**Les routes délibérément publiques doivent être déclarées comme telles**, pas simplement dépourvues
de pre-handler. Sinon on ne distingue pas « public » de « oublié » — et c'est le préalable à toute
vérification automatique, voir § 6.

### R3. La route est documentée

Étiquettes et description sur chaque route. La documentation d'API en est générée, donc elle suit le
code au lieu de dériver.

Une route sans description est une route dont l'usage n'est devinable que par son auteur.

### R4. Aucune logique dans la route

Elle déclare. Toute fonction écrite en ligne est du code non testé, invisible depuis le contrôleur, et
qui échappe aux règles des autres fiches.

**L'exception admise** : le traitement d'un échec de validation, quand le framework impose de le
déclarer sur la route. À garder minimal et uniforme entre les routes.

### R5. Une adresse et une méthode, un gestionnaire

Pas de branchement sur un paramètre pour choisir le gestionnaire. Deux comportements distincts sont
deux routes, avec chacune leur validation, leurs droits et leur documentation.

Invariant d'hygiène, mais il rend R2 mécaniquement vérifiable : une route, un jeu de droits.

---

## 5. Exceptions légitimes

| Cas | Statut |
| --- | --- |
| Une route délibérément publique, **déclarée comme telle** | **autorisé** — c'est la déclaration qui compte, pas l'absence de pre-handler |
| Traitement en ligne d'un échec de validation | **autorisé** si minimal et uniforme |
| Un pre-handler qui charge une donnée pour décider du droit | **autorisé**, c'est la première voie du cas limite de R2 |
| Une route qui renvoie un fichier, avec ses en-têtes déclarés | **autorisé** |
| Plusieurs pre-handlers chaînés | **autorisé** — c'est même la forme normale d'un contrôle composé |
| Une limite de taille de charge déclarée sur la route | **autorisé** — c'est une contrainte de forme |
| Une validation qui exprime une règle métier | **pas une exception** — elle est contournable, voir R1 |
| Un contrôle de droit dans le contrôleur | **pas une exception** — voir R2 |

---

## 6. Vérification déterministe

C'est la fiche où **la vérification la plus utile est bloquée par un préalable**, et où ce préalable
vaut la peine d'être fait pour lui-même.

| Invariant | Moyen | Coût | Faux positifs |
| --- | --- | --- | --- |
| R2 | script `tests/tooling/` : toute route déclare un pre-handler de sécurité **ou** figure dans la liste des routes publiques | ~40 lignes | aucun — **bloqué** tant que la liste n'existe pas |
| R3 | script : toute route déclare étiquettes et description | ~30 lignes | aucun |
| R1 | script : toute route ayant des paramètres d'adresse déclare leur validation | ~30 lignes | faibles |
| R4 | règle ESLint : déclaration de fonction dans un objet de route, hors traitement d'échec de validation | ~30 lignes | **à mesurer** |
| R5 | revue | — | — |

### R2 — et son préalable, qui est le vrai travail

Vérifier que toute route est protégée est mécanique. Il manque une seule chose : **la liste des routes
délibérément publiques.**

Sans elle, le script produit du bruit sur chaque route publique et sera désactivé dans la semaine.
Avec elle, il devient une garantie forte — et surtout, **la liste elle-même est un artefact de
sécurité utile**, indépendamment du script : elle rend explicite ce qui est exposé sans
authentification.

C'est le meilleur rapport effort/bénéfice identifié dans tout le corpus : établir la liste une fois,
puis quarante lignes de script, et un contrôle d'accès oublié devient impossible à fusionner.

### R3 et R1 — deux scripts triviaux

Parcourir les déclarations de routes et vérifier la présence des champs attendus. Aucun faux positif
sur R3. Sur R1, un faux positif possible quand un paramètre est validé par un type partagé plutôt que
par un schéma explicite — à reconnaître dans le script.

### R4 — la plus délicate

Distinguer une fonction de configuration légitime du traitement d'échec de validation demande de
reconnaître le champ où elle est déclarée. Faisable, mais à écrire après les trois autres.

### Codemods

Rentable sur R3 pour la **structure** : ajouter les champs manquants est mécanique. Mais le texte de la
description est du contenu — le codemod pose l'emplacement et un `TODO`, pas la phrase.

Non rentable sur R2 : décider quels droits s'appliquent à une route est le travail lui-même.

---

## 7. En TypeScript

**Peu de gain, et à migrer en dernier.** Les objets de configuration du framework sont typés de façon
large, et la validation déclarée produit un contrôle à l'exécution que le typage ne connaît pas — le
type du paramètre reçu par le contrôleur n'est pas déduit du schéma déclaré sur la route.

Un gain marginal existe si les types d'identifiants partagés sont typés : une adresse déclarant un
identifiant d'un type et un contrôleur en attendant un autre deviendrait détectable. Cela suppose que
la chaîne complète soit migrée, donc c'est un bénéfice tardif.

Contraintes habituelles : `erasableSyntaxOnly` interdit `enum` ; `declare module '*.js'` annule la
vérification de tout import d'un `.js`.

---

## 8. Tests attendus

| Objet | Type de test | Ce qu'on vérifie |
| --- | --- | --- |
| Route | **acceptance** — serveur réel, base réelle | les codes HTTP, **y compris les refus de droits** |

Rien en unitaire : une route ne contient pas de logique à tester. Si un test unitaire de route a du
sens, R4 est violé.

**Le test qui manque presque toujours, et c'est le plus important de la fiche** : celui du refus. On
vérifie qu'une route répond 200 pour un utilisateur autorisé, rarement qu'elle répond 403 pour un
autre. Or c'est le second qui prouve que R2 est tenu — le premier passerait tout aussi bien sans aucun
contrôle d'accès.

---

## 9. Checklist de revue

```
[ ] R2  Un pre-handler de sécurité est déclaré, ou la route est déclarée publique explicitement
[ ] R2  Aucun contrôle de droit délégué au contrôleur
[ ] R1  La forme de toutes les entrées est déclarée et validée
[ ] R1  Aucune validation n'exprime une règle métier
[ ] R4  Aucune fonction en ligne, sauf traitement d'échec de validation
[ ] R3  Étiquettes et description présentes
[ ] R5  Une adresse et une méthode, un seul gestionnaire
[ ] Test d'acceptance couvrant le refus de droits, pas seulement l'accès autorisé
```

---

## 10. Sources

Bibliographie dans `references-ddd.md`.

| Invariant | Source |
| --- | --- |
| **La couche** | Martin, *Clean Architecture*, ch. « Presenters and Humble Objects » — l'adaptateur est dépourvu de logique. Billet gratuit de 2012 |
| **R1** validation de forme sur la route | Pix : **ADR 2**, qui pose que l'intelligence métier est dans l'API et que le front ne fait que des contrôles de surface. L'ADR 19 pour les identifiants typés |
| **R2** sécurité en pre-handler | **aucune source**, ni externe ni ADR. C'est la convention la plus rentable du corpus et **elle n'est écrite nulle part** — candidate évidente à un ADR |
| **R3** documentation déclarée | **aucune source** — convention Pix |
| **R4** aucune logique | Martin, même ch. |
| **R5** une adresse, un gestionnaire | **aucune source** — convention de rangement |

**Trois invariants sur cinq n'ont aucune source.** Et le plus rentable des cinq, R2, en fait partie :
la pratique existe, le raisonnement n'est écrit nulle part, et personne ne pourrait le contester ni le
défendre sur pièces. C'est le manque le plus criant relevé dans tout le corpus, et il se comble par un
ADR de deux pages.

---

## Note sur le préfixe

`R` désigne la route ici, et le read-model dans `fiche-objet-valeur.md`. Les deux ne se croisent jamais
dans une même revue, mais si la confusion apparaît, renommer le read-model en `RM` plutôt que la
route : la route est la catégorie autonome, le read-model est une variante.
