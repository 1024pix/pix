# Index du corpus d'architecture

**Commencer ici.** Ce fichier est le point d'entrée du corpus : il dit quels dossiers existent, ce qui
est décidé, ce qui reste à écrire dans un ADR et ce qui reste ouvert.

État au 2026-09-30. **Ce fichier se périme**, contrairement aux `README.md` des dossiers.

La forme commune des dossiers, les règles de langue et les règles d'exemples sont dans
[`gabarit.md`](gabarit.md).

## Par où commencer

| Vous voulez | Lisez |
| --- | --- |
| écrire ou relire un type de fichier de `api/` | le `README.md` de son dossier |
| comprendre pourquoi une règle existe | l'`explication.md` du dossier |
| mettre en place une vérification automatique | l'`outillage.md` du dossier |
| savoir où le code s'écarte des règles, et ce qui est décidé | l'`ecarts.md` du dossier |
| ajouter un point d'entrée HTTP | [`parcours/ajouter-un-point-d-entree-http.md`](parcours/ajouter-un-point-d-entree-http.md) |

## Les douze dossiers

Un dossier par type de fichier de `api/`. Chacun contient `README.md`, `explication.md`,
`outillage.md` et `ecarts.md`, selon [`gabarit.md`](gabarit.md).

| Dossier | Préfixe | Couverture |
| --- | --- | --- |
| [`repository/`](repository/README.md) | `I` | le port vers l'extérieur, base ou API voisine |
| [`usecase/`](usecase/README.md) | `U` | usecase |
| [`api-interne/`](api-interne/README.md) | `P` | le contrat publié entre contextes |
| [`controleur/`](controleur/README.md) | `C` | contrôleur |
| [`route/`](route/README.md) | `R` | route |
| [`serialiseur/`](serialiseur/README.md) | `M` | sérialiseur, dans les deux sens |
| [`entite/`](entite/README.md) | `E` | Entity |
| [`objet-valeur/`](objet-valeur/README.md) | `V` | Value Object |
| [`racine-agregat/`](racine-agregat/README.md) | `A` | Aggregate Root |
| [`read-model/`](read-model/README.md) | `RM` | read-model, la forme assemblée pour une lecture |
| [`service-domaine/`](service-domaine/README.md) | `D` | Domain Service |
| [`specification/`](specification/README.md) | `S` | moteur de règles composable et piloté par des données |

Les écarts se numérotent `X` dans tous les dossiers. `X` n'est le préfixe d'invariant d'aucun
dossier. Le read-model emploie `RM` pour ne pas entrer en collision avec `R` de la route.

**Le discriminant Value Object / read-model est énoncé une seule fois**, sous « Le discriminant » dans
`objet-valeur/README.md`. `read-model/README.md` y renvoie.

## Les autres fichiers

| Fichier | Genre | Rôle |
| --- | --- | --- |
| [`gabarit.md`](gabarit.md) | référence | la forme des dossiers, les règles d'exemples, de langue et de numérotation |
| [`invariants-clean-archi-ddd.md`](invariants-clean-archi-ddd.md) | état des lieux, daté | les écarts par famille, la grille coût/bénéfice, le discriminant entre catégories de modèles |
| [`references-ddd.md`](references-ddd.md) | référence | la bibliographie, avec la liste de ce qui n'a aucune source |
| [`migration-typescript.md`](migration-typescript.md) | suivi, daté | ce qui empêche le typage de vérifier quoi que ce soit, et l'ordre de migration d'une chaîne |
| [`rapport-divergence-quest.md`](rapport-divergence-quest.md) | état des lieux, daté | l'écart entre les règles et le code réel du contexte `quest` |
| [`parcours/ajouter-un-point-d-entree-http.md`](parcours/ajouter-un-point-d-entree-http.md) | guide pratique | la séquence route, contrôleur, sérialiseur. Aucun invariant propre |

Un rapport de divergence porte sur un seul contexte, et se nomme `rapport-divergence-<contexte>.md`.

## Décisions prises

Consignées pour ne pas être rejouées.

| Décision | Ce qu'elle tranche | Conséquence dans le corpus |
| --- | --- | --- |
| `domain/services/` est réservé aux **vrais Domain Services** | Les fichiers qui font des I/O partent dans `usecases/`. Le dossier devient rare, voire vide par endroits, et c'est attendu | `X1` de `service-domaine/ecarts.md` a une direction. `D1` devient activable en erreur une fois le déplacement fait |
| Les champs qui portent une règle sont **privés** | Un champ qui porte une règle ne doit pas pouvoir être réécrit de l'extérieur. Là où rien n'est protégé, c'est de l'hygiène | `V1`, `E1` et `E6` gardent leur règle, avec ce motif. Le modèle de référence de la documentation d'architecture n'est pas la cible |
| Les deux règles hébergées dans Confluence sont **vraies** | Contrôles d'accès en pre-handler, et objets de contrat dans `application/api/models/` | `R2` et `P5` sont confirmés. Reste à les écrire dans un ADR |
| Le mot `read-model` est **conservé** | C'est l'Ubiquitous Language de l'équipe, et le renommer n'apportait rien sur l'outillage | `X2` de `read-model/ecarts.md` classé *à surveiller*. Le travail est le classement, pas le renommage |
| La **désérialisation** relève de `serialiseur/README.md` | Le sérialiseur traduit dans les deux sens, ce que `docs/fr/Anatomy.md` documente. 46 fichiers sur 235 ont une fonction de désérialisation | Invariant `M5` ajouté. `M1` limité au sens sortant, et sa règle dans `serialiseur/outillage.md` doit exclure le corps des désérialisations, sinon elle se déclenche sur du code correct |
| Les modèles par **intention d'écriture** ne se multiplient pas sans mesure | `…ForCreation` exprime une différence de nature et reste. `…ForUpdate` portant un sous-ensemble de champs est un modèle partiellement rempli, et c'est le côté commande de CQRS sans CQRS | L'écart `X7` de `objet-valeur/ecarts.md` est créé. La règle générale est passée dans le gabarit : un bénéfice de performance non mesuré compte pour nul. Révisé le 2026-10-02 : `V8` est retiré, voir les numéros retirés |
| La transaction reste au grain du **usecase**, même sur plusieurs Aggregates | ADR 25, sur un motif mesuré : les événements dans les transactions ont causé des deadlocks en production | `A7` de `racine-agregat/README.md` devient une question de conception et non la règle appliquée. `X4` passe en *rien à faire*. `U7` gagne son critère |
| Pas d'ADR sur la stabilité du format des réponses HTTP | Ce que font les applications front n'est pas le sujet de ce corpus. Et deux tiers de l'écart se règlent par un outil plutôt que par une procédure | `X3` de `serialiseur/ecarts.md` se réduit à une règle : ne jamais redéfinir le sens d'une valeur existante. Le reste attend le paquet partagé : voir `migration-typescript.md` |

## ADR à écrire

Ces décisions sont appliquées dans les dossiers, mais aucun ADR ne les consigne. Un ADR est le seul
endroit du dépôt qui fasse autorité : chacune reste à y écrire.

| Décision | Où elle s'applique |
| --- | --- |
| La connexion à la base vient toujours de `DomainTransaction`, avec deux exceptions : le datamart, et l'écriture qui doit survivre à la transaction | `I12` de `repository/README.md` |
| Un repository par Aggregate ; un repository de plus seulement pour une lecture mesurée, qui renvoie un read-model | `X4` de `repository/ecarts.md`, `A3` de `racine-agregat/README.md` |
| Un seul régime de câblage : tout repository est dans l'index du contexte | `I6` de `repository/README.md` |
| Une API interne passe toujours par un repository du contexte consommateur, l'Anticorruption Layer | `U9` de `usecase/README.md` |
| Une API interne appelle ses usecases par l'index, jamais par un import direct | `api-interne/README.md`, exceptions légitimes |
| Un DTO n'expose que les champs que ses consommateurs lisent | `P9` de `api-interne/README.md` |
| Aucune règle métier dans un sérialiseur, exports CSV compris ; une clé de présentation se compose dans le sérialiseur | `M1` de `serialiseur/README.md`, `V2` de `objet-valeur/README.md` |
| Dans un usecase, aucun `catch` sans filtre qui journalise puis continue | `X7` de `usecase/ecarts.md` |
| `domain/services/` est réservé aux vrais Domain Services | `service-domaine/README.md`, rôle |
| Les contrôles d'accès se déclarent sur la route | `R2` de `route/README.md`, sourcé par une page Confluence |
| L'emplacement des objets de contrat et la documentation générée des APIs internes | `P3` et `P5` de `api-interne/README.md`, sourcés par la page Confluence liée à l'ADR 55 |

## Numéros retirés

Un numéro retiré n'est jamais réattribué.

| Numéro | Portait | Où c'est traité |
| --- | --- | --- |
| `I7` de `repository/` | le modèle ne porte pas de méthode au service de la persistance | `E5` de `entite/README.md` |
| `I8` de `repository/` | le nom du fichier dit la source du repository | écarté : la couche est uniforme, voir `repository/explication.md` |
| `X5` de `repository/` | `domain/usecases/index.js` importe l'infrastructure | `X3` de `usecase/ecarts.md` |
| `X3` de `racine-agregat/` | plusieurs repositories pour une même frontière | `X4` de `repository/ecarts.md` |
| `A4`, `A5` de `racine-agregat/` | les doublons de `E7` et `E3` | `E7` et `E3` de `entite/README.md` |
| `X2` de `entite/` | les règles vivent dans les usecases | `X1` de `usecase/ecarts.md` |
| `X1`, `X6` de `objet-valeur/` | des écarts du read-model | `read-model/ecarts.md` |
| `S3`, `S4`, `S9` de `specification/` | des réénoncés de `V4`, de `V1`, `V2`, `V6`, `V7`, et de `V3` | `objet-valeur/README.md` |
| `D6` de `service-domaine/` | testable en unitaire pur, qui découle de `D1` | « Tests attendus » de `service-domaine/README.md` |
| `X2` de `route/` | aucune liste des routes délibérément publiques | écarté : `auth: false` déclare une route publique |
| `V8` de `objet-valeur/` | un type par intention, `…ForCreation` | retiré : une Entity neuve et une Entity enregistrée sont une seule classe, typée `Organization<null>` ou `Organization`. Voir « À savoir » de `E1` dans `entite/README.md` |

## Chantiers ouverts

- **Des Aggregates manquants.** Certains usecases portent des règles sur plusieurs objets à la fois,
  faute d'une racine pour les porter. Aucun inventaire de ces règles n'existe. C'est le préalable pour
  les décrire en écart dans `racine-agregat/ecarts.md`, avec de vrais exemples.
- **Le classement de `read-models/`.** Le classement des fichiers de `read-models/` selon les quatre
  tests du discriminant n'est pas fait. Il conditionne le passage de la règle de `RM3` en erreur.
- **Les ADR.** Les onze décisions de la section « ADR à écrire ».
- **Les documents voisins.** `docs/fr/repository.md`, `docs/fr/Usecase.md` et `docs/fr/service.md`
  couvrent les mêmes sujets en plus court. Leur sort, fusion, renvoi ou suppression, n'est pas décidé.

## Sources datées ou hors du dépôt

- `docs/fr/Anatomy.md` décrit l'arborescence `lib/`, qui n'existe plus depuis l'ADR 51. Il source le
  sens des dossiers, pas la structure.
- `P3` et `P5` de `api-interne/README.md`, et `R2` de `route/README.md`, reposent sur une page
  Confluence liée en fin d'ADR 55. Elle peut changer ou disparaître sans que rien ici ne le signale,
  et l'ADR ne reproduit pas la décision. À reporter dans l'ADR : le dossier `api` dans la couche
  application, le sous-dossier `models` pour les classes de contrat, et les contrôles d'accès en
  pre-handler.

## Justification des regroupements

Plusieurs découpages ont été discutés puis tranchés. Les raisons sont ici pour ne pas les rejouer.

**Un dossier par catégorie de modèle, pas un dossier commun.** L'argument pour un dossier unique ne
tient pas : le discriminant entre catégories n'appartient à aucune, mais le gabarit lui donne déjà une
place dans chaque référence, la table « Ce qu'un … n'est pas ». Trois arguments penchent pour la
séparation :

- la checklist est l'outil de revue, et une revue relit un fichier à la fois ;
- les invariants d'une Entity et d'un read-model ne sont pas des variantes d'une même chose ;
- la vérification diffère aussi : règle ESLint, revue humaine ou test.

**Le read-model a son dossier.** Trois découpages ont été tenus successivement le 2026-09-08, et il faut
les trois pour comprendre la position finale.

1. *Variante du Value Object* — abandonné. L'anémie est précisément ce qui fait qu'un tel objet
   n'est pas un Value Object ; un sac immuable sans comportement est un DTO au sens de Fowler.
2. *Catégorie sœur dans le même document* : abandonné aussi. Deux des trois critères de séparation
   tranchaient contre. Une revue relit un fichier à la fois, et une checklist commune force le
   relecteur à sauter des lignes annotées. C'est le reproche qui a fait éclater l'ancien document
   « application ». Seul le troisième critère, la vérification, plaidait pour l'union.
3. **Deux dossiers.** L'argument qui retenait l'union ne tient pas, pour la raison déjà dite : le
   gabarit donne une place au discriminant dans chaque référence.

L'argument décisif est pédagogique. Présenter le read-model comme « V3 et V5 ne s'appliquent pas » le
décrit comme un **Value Object défectueux**, et c'est ce cadrage qui rendait la distinction
insaisissable. Deux dossiers obligent chaque catégorie à se tenir sur ses propres termes.

Le discriminant reste : **le domaine raisonne-t-il avec cet objet ?**, avec quatre tests applicables
en revue, énoncés sous « Le discriminant » dans `objet-valeur/README.md`.

**Le mot `read-model` est conservé**, décision du 2026-09-08 qui renverse un verdict précédent. Il
avait été classé « à corriger » au motif que le renommage débloquerait une vérification par règle de
chemin. C'était faux : `domain/models/` et `domain/read-models/` sont déjà des dossiers frères dans
une quinzaine de contextes, donc la règle est écrivable telle quelle. Le renommage n'apportait rien,
et le mot est celui de l'équipe L'Ubiquitous Language est la langue de l'équipe, pas celle du livre.
Ce qui reste à faire est le **classement** des fichiers, pas le renommage : c'est l'écart `X1` de
`read-model/ecarts.md`.

**Où vivent les invariants communs.** `invariants-clean-archi-ddd.md` semblait l'endroit, puisqu'il
porte le discriminant entre catégories de modèles. Écarté : ce document est un état des lieux daté.
Y placer du contenu stable casserait la règle qui fonde le corpus : les `README.md` sont intemporels,
le reste se périme. Les cinq invariants mécaniques communs restent donc énoncés dans
`objet-valeur/README.md` : immuabilité, absence d'identité, pureté, absence de cycle de vie,
exposition en lecture seule. `read-model/README.md` y renvoie, et les reprend dans sa checklist
seulement, parce qu'une checklist doit se copier telle quelle.

**La Specification est à part.** Un moteur de règles composable et piloté par des données a pour
invariants la totalité, la pureté et la fermeture par composition, pas l'identité ni le cycle de vie.

*Contradiction arbitrée le 2026-09-08.* Il était écrit ici que le candidat évalué par une Specification
est un read-model, ce que l'invariant devenu `RM3` interdisait. Le discriminant tranche : si une règle
lit ses valeurs pour décider, le candidat n'est pas un DTO, c'est un Value Object, et V3 et V5
s'appliquent à lui. `RM3` est devenu un test de classement, pas une interdiction.

**Le Domain Service a son dossier, malgré une catégorie clairsemée.** L'argument inverse a été tenu
puis abandonné, parce qu'il contredisait le dossier Aggregate Root, défendu justement parce que la
notion est creuse. Un dossier est utile quand il donne le critère de jugement, pas seulement quand la
catégorie est peuplée. La catégorie n'est d'ailleurs pas « presque vide » : 33 vrais services sur
109 fichiers, et dix contextes sur vingt à zéro.

**Route, contrôleur et sérialiseur ont chacun leur dossier.** Ils ont d'abord été regroupés sous un
document « application », parce qu'un point d'entrée les touche ensemble. Abandonné pour la même
raison que le dossier de modèle commun : trois familles d'invariants sous une couverture, et une
checklist qui mélangeait des critères jamais relus ensemble. Ce qui était juste dans le
regroupement est préservé par un parcours séparé, `parcours/ajouter-un-point-d-entree-http.md`.

**Les DTO de contrat vont avec l'API interne**, pas avec les Value Objects : ce sont des formats
publiés, et leurs invariants sont ceux d'un contrat — stabilité, documentation, indépendance de
l'appelant.

## Historique des passes

| Date | Passe |
| --- | --- |
| 2026-09-08 | relecture des premières fiches, numérotation `X` des écarts, préfixe `RM` du read-model |
| 2026-09-10 | ancrage des exemples dans le code réel |
| 2026-09-23 | passe sur les fiches domaine |
| 2026-09-24 | passe sur les autres fiches ; rapport d'étonnement d'un technical writer externe sur `repository/`, puis découpage Diátaxis en un dossier par type de fichier, pilote `repository/` et onze autres dossiers |
| 2026-09-24 | douze questions tranchées ; exemples complets tirés de fichiers réels corrigés ; permaliens vers un commit fixe par dossier |
| 2026-09-30 | mise à jour des fichiers racine |

Le détail de chaque passe est dans l'historique git de `docs/fr/architecture/`.

Piège à connaître pour un renommage de numéros : `sed` de macOS ne supporte pas les limites de mot
`\b`. Un renommage qui les utilise réécrit les ancres et laisse les libellés, et les liens du
sommaire ne résolvent plus. Passer par `perl -pi -e`.
