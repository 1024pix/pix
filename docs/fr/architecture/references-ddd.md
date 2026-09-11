# Sources — Clean Architecture et DDD

Bibliographie commune aux fiches. Chaque fiche renvoie ici plutôt que de dupliquer les références.

Principe de sélection : **privilégier ce qui est librement accessible**, puisque l'objectif est que
les gens puissent vérifier eux-mêmes. Les livres sont cités par nom de chapitre plutôt que par
numéro de page, la numérotation variant selon les éditions.

---

## La source primaire des conventions Pix : les ADR du dépôt

**`docs/adr/` — 61 décisions datées, versionnées avec le code.** C'est la référence à citer avant
toute source externe : elle est à jour, elle est dans le dépôt, et elle porte le raisonnement de
l'équipe. Plusieurs conventions que je présentais comme « invention Pix sans source » y sont en fait
décidées et argumentées.

| ADR | Ce qu'il tranche |
| --- | --- |
| [0002](../docs/adr/0002-style-d-architecture.md) (2019-08-22) | Style de plateforme : une API métier, plusieurs fronts. L'intelligence métier **doit** être dans l'API |
| [0020](../docs/adr/0020-caractere-obligatoire-use-case.md) (2020-01-25) | Toute route passe par un usecase, même réduit à un appel. **« Pas de reprise systématique de l'existant »** |
| [0046](../docs/adr/0046-injecter-les-dependances-api.md) (2023-05-05) | Injection de dépendances custom, **automatique en suivant la signature des paramètres**. Motif : ESM rend les exports immuables, donc non substituables en test |
| [0051](../docs/adr/0051-nouvelle-arborescence-api.md) (2023-07-20) | Arborescence par contexte fonctionnel. Contrainte : **« Respecter la Clean Architecture Pix »** |
| [0055](../docs/adr/0055-communication-bounded-contexts.md) (2024-03-26) | **APIs internes synchrones** entre contextes. Cite directement le billet d'Uncle Bob |
| 0009, 0025 | Transaction métier — origine de `DomainTransaction` |
| 0008, 0010 | Découplage par événements, `event-dispatcher`. ADR 55 exclut ce type d'interaction de son périmètre |
| 0019 | Typer les identifiants |
| 0031 | Uniformiser la validation des chaînes de caractères |
| 0047 | Modulariser le code Node.js |

*Lus intégralement pour cette bibliographie : 0002, 0020, 0046, 0051, 0055. Les autres sont cités
par titre — à ouvrir avant de s'en servir comme argument.*

### Ce que les ADR établissent, et qui change la lecture des écarts

**Pix vient de la Clean Architecture d'Uncle Bob, et les contextes bornés sont arrivés par-dessus.**
ADR 46 le dit (« inspirée par la Clean architecture »), ADR 51 en fait une contrainte à respecter, et
ADR 55 cite la source. La solution 1 d'ADR 51 a d'ailleurs été **rejetée** au motif qu'elle
« ne respecte pas les contraintes », c'est-à-dire qu'elle modifiait la Clean Archi existante.

Conséquence directe : le triplet `domain/` `application/` `infrastructure/` répliqué dans chaque
contexte n'est pas une invention DDD, c'est de la **Clean Architecture préservée par contrainte** à
travers la migration. Ce qui était un jeu de couches unique dans `api/lib` est devenu dix-neuf jeux.

**Et les ADR valent vers l'avant, explicitement.** ADR 20 : « Pas de reprise systématique de
l'existant ». ADR 51 : « les différentes équipes devront migrer pas à pas les fichiers de lib vers la
nouvelle arborescence ». Les écarts hérités sont donc **attendus** et non accidentels — d'où la
catégorie *vestige* dans `invariants-clean-archi-ddd.md`.

Chiffres d'époque, utiles pour mesurer le chemin parcouru : ADR 51 recense 157 modèles, 280 usecases
et 133 repositories à plat dans `api/lib`. La page Tech Days 2024 du 30 juillet 2024 note
« environ 155 routes encore sur lib ». `api/lib` n'existe plus aujourd'hui.

---

## À lire en premier si on n'a qu'une heure

**Evans, *Domain-Driven Design Reference*** — PDF gratuit, ~50 pages.
<https://www.domainlanguage.com/ddd/reference/>

C'est Evans lui-même qui condense ses patterns en définitions d'une demi-page chacune. Entity,
Value Object, Aggregate, Repository, Specification, Bounded Context, Anticorruption Layer, Published
Language : tout ce qu'on cite dans les fiches y est, sous forme vérifiable en quelques minutes.
C'est la source à donner à quelqu'un qui veut contrôler une de nos affirmations sans acheter un
livre.

---

## Sources par pattern

### Specification

**Evans & Fowler, « Specifications »** — PDF gratuit.
<https://martinfowler.com/apsupp/spec.pdf>

L'article de référence, coécrit par les deux auteurs. Il couvre explicitement la **composition**
(`and` / `or` / `not`), la distinction entre spécification de validation, de sélection et de
construction, et les variantes pilotées par les données. C'est la source directe des invariants S1 à
S5 de `fiche-specification.md`.

Également dans Evans, *Domain-Driven Design*, chapitre **« Making Implicit Concepts Explicit »**
(ch. 9), où le pattern est introduit.

### Entity, Value Object, Service

Evans, *DDD*, chapitre **« A Model Expressed in Software »** (ch. 5).

Le point qui nous concerne le plus : un Service de domaine y est défini comme sans état et sans I/O.
C'est la base de l'écart DDT-6 (`domain/services/` de `quest` contient de l'orchestration).

**Fowler, « AnemicDomainModel »** — <https://martinfowler.com/bliki/AnemicDomainModel.html>

Court, et directement applicable à `organizational-entities/domain/models/Organization.js` :
constructeur déstructuré, tous les champs optionnels, aucune validation, logique dans les getters.

### Aggregate

Evans, *DDD*, chapitre **« The Life Cycle of a Domain Object »** (ch. 6).

**Vernon, « Effective Aggregate Design »** — trois articles gratuits.
<https://www.dddcommunity.org/library/vernon_2011/>

La référence pratique sur le **grain** d'un agrégat, et donc sur notre écart DDT-5 (22 repositories
pour 6 familles de modèles, `CombinedCourse` et `CombinedCourseParticipation` racines toutes les
deux). Vernon y défend explicitement les petits agrégats et le référencement par identité entre
agrégats — ce que `rewardType`/`rewardId` fait correctement vers le contexte `profile`.

### Read model — le mot ne vient pas de DDD

**Il n'est pas chez Evans.** La partie II du blue book liste Entities, Value Objects, Services,
Modules, Aggregates, Factories, Repositories. Le read model n'y figure pas, sous aucun nom.

Il vient de **CQRS**, formulé par Greg Young autour de 2010, lui-même nommé d'après le **CQS** de
Bertrand Meyer (*Command-Query Separation*, *Object-Oriented Software Construction*, 1988). C'est une
notion **architecturale**, posée par-dessus DDD une dizaine d'années après le blue book, et par la
communauté plutôt que par Evans.

Vernon traite CQRS dans *IDDD*, mais dans le chapitre sur l'architecture — aux côtés de hexagonal,
SOA, REST, event-driven — et non parmi les building blocks. Son vocabulaire y est **command model /
query model**.

La forme de l'objet transporté, elle, est chez Fowler : **Data Transfer Object**, *PoEAA*.

**DDD n'a aucun nom pour cet objet**, et le vide est logique : un objet sans comportement ni invariant
n'appartient pas au modèle du domaine, donc DDD n'a rien à en dire. Ce qui est nommé, c'est la
**requête** — la *use case optimal query* de Vernon — et l'**objet transporté** — le DTO de Fowler.
Conséquence pour le corpus : « DTO de lecture » est un nom de Fowler, pas un nom de DDD, et il faut le
présenter comme tel. L'objectif d'employer le vocabulaire de DDD parce qu'il est moins vague ne se
tient pas ici, faute de mot ; le choix se fait entre un mot de Fowler, défini et opposable, et un mot
inventé.

**Le passage d'Evans sur les requêtes de synthèse, vérifié — et il ne dit pas ce qu'on espérait.**
Chapitre 6, section « Querying a REPOSITORY » (*Final Manuscript*, 15 avril 2003, p. 109) : il entre
dans le concept d'un repository de renvoyer « some types of summary calculations, such as an object
count », ou la somme d'un attribut numérique que le modèle destinait à être totalisé.

Ce sont des **scalaires**, pas un objet de lecture assemblé. Le passage adosse donc l'exception du § 3
de `fiche-repository.md` — la fonction de repository qui renvoie un scalaire — et **non** le DTO de
lecture. L'absence de nom pour l'objet de lecture large en ressort confirmée plutôt qu'atténuée.

**Ce que Pix appelle `read-models/` n'est pas un read model CQRS.** Un read model CQRS suppose en
général un **store séparé**, alimenté par des événements, désynchronisé du modèle d'écriture — d'où
l'appareil de cohérence à terme qui l'accompagne. Les `read-models/` de Pix sont des objets assemblés
par une requête sur la même base, dans la même transaction. C'est la **use case optimal query** de
Vernon renvoyant un DTO — précisément l'option qu'il présente **comme alternative à CQRS** quand le
store séparé n'est pas souhaité.

Test pour trancher : existe-t-il un store distinct alimenté par des événements ? Si non, ce n'est pas
CQRS.

**Le mot est conservé**, décision du 2026-09-08. Un verdict précédent le classait « à corriger » ; il
reposait sur une erreur, corrigée ici. Le renommage devait débloquer la vérification par règle de
chemin « une règle du domaine n'importe pas un objet de lecture ». Or `domain/models/` et
`domain/read-models/` sont déjà des dossiers frères dans une quinzaine de contextes : la règle est
écrivable telle quelle. Le renommage n'apportait donc rien sur l'outillage.

Ce qui plaide pour le garder : le mot est en usage et compris de l'équipe. **L'Ubiquitous Language est
la langue de l'équipe**, pas celle du livre — imposer un terme de Fowler contre un terme d'équipe qui
fonctionne se retourne contre le principe qu'on invoquerait pour le faire.

Ce qui reste à son débit, et qui le classe *à surveiller* plutôt que *rien à faire* : la collision
avec le read model de CQRS, donc un malentendu possible à l'arrivée de quelqu'un qui connaît CQRS et
suppose un store séparé. Deux déclencheurs rouvriraient le dossier : un malentendu constaté sur
pièces, ou l'introduction réelle d'un read model CQRS.

**Le travail est le classement, pas le renommage.** Trois natures d'objets portent aujourd'hui le même
mot, et elles n'ont pas les mêmes invariants :

| Ce que recouvre `read-model` | Ce que c'est | Où ça va |
| --- | --- | --- |
| un objet qu'une règle du domaine lit pour décider | un **objet-valeur** mal rangé | `domain/models/`, avec validation et comportement. `fiche-objet-valeur.md` |
| une forme produite pour une lecture, sans règle | un **read-model** | `domain/read-models/`, rien à faire. `fiche-read-model.md` |
| le contrat publié vers un autre contexte | un **DTO de contrat** | `application/api/`, où le mot est trompeur |

Le classement se fait fichier par fichier, par les quatre tests du § 1 de `fiche-objet-valeur.md`, qui
les énonce pour les deux catégories. Migration opportuniste, conforme à l'ADR 20.

Ce qui est à tenir dans tous les cas : ne pas invoquer CQRS pour justifier une décision sur ces
objets, l'architecture correspondante n'étant pas en place.

**La même appropriation existe du côté écriture**, et elle est passée inaperçue plus longtemps. Les
modèles `…ForCreation` et `…ForUpdate` ressemblent aux **commandes** de CQRS. Le motif est le même
qu'un read-model : ne pas passer par l'agrégat entier. L'architecture manquante est la même aussi.

La différence tient au motif invoqué. Un read-model répond à un besoin de lecture réel. Une forme
d'écriture partielle répond le plus souvent à une optimisation **non mesurée**, ce qui la rend plus
difficile à défendre. C'est `X7` de `fiche-objet-valeur.md`.

### Repository

Evans, *DDD*, chapitre **« The Life Cycle of a Domain Object »** (ch. 6).

À noter pour l'honnêteté intellectuelle : chez Evans, un Repository sert à retrouver les agrégats de
**son propre** contexte. Notre lecture — le repository comme port unique vers l'extérieur, y compris
vers un contexte voisin — vient de la tradition ports & adaptateurs, pas de DDD à la lettre. Les deux
sources ci-dessous sont donc celles qui fondent réellement notre convention.

### Ports et adaptateurs, inversion de dépendance

**Cockburn, « Hexagonal Architecture »** — <https://alistair.cockburn.us/hexagonal-architecture/>

L'article d'origine. C'est lui qui fonde notre décision : un contexte voisin est de l'environnement
extérieur au même titre qu'une base de données, et le domaine ne sait pas lequel.

**Martin, « The Clean Architecture »** (2012) — billet gratuit.
<https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html>

Version courte du livre. Les cercles, la règle de dépendance, et le fait que la frontière se
franchit par une interface possédée par la couche interne.

Martin, *Clean Architecture* (2017), chapitres **« Business Rules »** (entités vs cas d'usage) et
**« The Dependency Inversion Principle »**. Le premier est la source de notre démarcation
repository / usecase / service.

### Bounded Context, Anticorruption Layer, Published Language

Evans, *DDD*, chapitre **« Maintaining Model Integrity »** (ch. 14, partie « Strategic Design »).

Trois patterns qu'on utilise nommément :

- **Bounded Context** : la frontière, et le critère qui compte — un langage ubiquitaire cohérent,
  pas une taille de dossier. C'est ce qui justifie de séparer `quest` (moteur) des parcours combinés.
- **Anticorruption Layer** : la couche qui traduit le modèle d'un voisin dans le vocabulaire local.
  `QuestInput` en est une.
- **Published Language** : un format d'échange documenté et stable. C'est le statut exact du JSON
  des quêtes, et la raison pour laquelle `requirement_type` ne se renomme pas.

**Fowler, « BoundedContext »** — <https://martinfowler.com/bliki/BoundedContext.html>
Deux pages, pour situer rapidement.

**Vernon, *Implementing Domain-Driven Design*** (2013), chapitre **« Integrating Bounded
Contexts »** — le traitement le plus concret de l'intégration entre contextes, avec le cas de l'API
publiée. Utile pour instruire le découpage `quest` / parcours combinés.

---

## Ce qui n'a pas de source, et qu'il faut assumer comme tel

À maintenir honnêtement : plusieurs de nos conventions ne viennent d'aucun livre. Les présenter comme
du DDD affaiblirait celles qui en viennent vraiment.

| Convention Pix | Statut |
| --- | --- |
| `get*` lève, `find*` renvoie `null` | **aucune source**, ni externe ni ADR. Convention orale |
| Nom de fichier en `-api.repository.js` | **aucune source**. Usage observé dans `privacy`, `organizational-entities`, `identity-access-management` |
| Un objet-valeur par intention d'écriture (`…ForCreation`, `…ForUpdate`) | **aucune source**. Proche de Command / DTO d'entrée, pas nommé ainsi |
| Règles de test par couche (`quest/CLAUDE.md`) | **convention d'équipe**, écrite dans le contexte, pas dans un ADR |
| `dependencies.json` + `dependsOn` par contexte | **outillage Pix**. Matérialise la Context Map d'Evans, qui est un document et non un fichier vérifié en CI |
| Le repository comme port vers un contexte voisin | **lecture ports & adaptateurs**, pas DDD à la lettre — voir la note sous « Repository ». Cohérent avec ADR 55 sans y être nommé ainsi |
| Le mot `read-model` | **emprunté à CQRS**, pas à DDD, et l'architecture CQRS n'est pas en place — voir « Read model » ci-dessus. **Conservé** le 2026-09-08 : DDD n'a aucun nom pour cet objet, le mot est celui de l'équipe, et le renommage n'apportait rien sur l'outillage. Ce qui est à faire est le classement des trois natures qu'il recouvre |

### La documentation d'architecture Pix

Espace Confluence **EDTDT**, série de cinq pages : *1.Intro*, *2.Domaine*, *3.Infrastructure*,
*4.Application*, *5.Bout en bout*. Lue le 2026-09-08. C'est la seule documentation d'architecture
existante, et elle source plusieurs points que le corpus donnait pour conventions sans appui.

| Ce qu'elle établit | Ce que ça source |
| --- | --- |
| La logique d'autorisation « doit être réalisée autant que possible dans les securityPreHandlers, plutôt que dans les controllers ou les usecases » | `R2` de `fiche-route.md`, qui était donné sans source |
| Le contrat d'un securityPreHandler : paramètres, valeurs de retour, utilitaire de combinaison des accès | la forme prescrite de `R2` |
| Le domaine « se compose de deux grosses parties : les use cases et les entités » | le placement des usecases dans `domain/` |
| L'infrastructure contient « les repositories, la sérialisation et différents services » | le placement des sérialiseurs dans `infrastructure/` |
| L'application dépend de l'infrastructure, qui dépend du domaine | le fait que `C4` vise `infrastructure/repositories/` et non toute l'infrastructure |
| « Dans la majorité des cas on utilise le format json-api, c'est le format à privilégier » | le format de sortie supposé par `fiche-serialiseur.md` |
| Le modèle de référence valide `this` après avoir affecté ses champs, contre un schéma déclaratif | `X3` de `fiche-entite.md`, qui passe de dérive à convention assumée |

**Trois réserves sur cette source, et elles comptent.**

Elle est **hors du dépôt**. Une page Confluence change sans que rien ici ne le signale.

Elle est **datée** : la page *5.Bout en bout* emploie des chemins `api/lib/…`, donc elle décrit
l'arborescence d'avant l'ADR 51 et les contextes bornés.

Et la page *4.Application* porte son **propre `TODO`** : « préciser des pistes d'améliorations ou
valider ce qui est documenté ici en précisant que c'est le contrat qu'il faut suivre (plutôt que
d'écrire que c'est ce qui est fait actuellement) ». Elle se présente donc comme une description, pas
comme une prescription.

**Une contradiction qu'elle ouvre.** Son modèle de référence expose des champs publics assignables,
ce que `V1` de `fiche-objet-valeur.md` et `E1`/`E6` de `fiche-entite.md` excluent. À trancher.

### `docs/fr/Anatomy.md`

Dans le dépôt. Référencé par la page *1.Intro* de la documentation d'architecture comme la source sur
l'organisation des fichiers. Lu le 2026-09-08.

Il donne le **rôle de chaque dossier**, ce qui source la moitié « emplacement » de plusieurs invariants
que le corpus donnait pour conventions sans appui.

| Ce qu'il établit | Ce que ça source |
| --- | --- |
| `domain/models` → « Entités, aggrégats et value objects du domaine » | `X4` de `fiche-entite.md` : le mélange des trois catégories dans un dossier commun est **documenté**, pas subi |
| `domain/services` → « Services métier du domaine » | la décision de réserver le dossier aux vrais services : le nom dit bien le métier, pas le partage |
| `domain/usecases` → « Cas d'usage métier » | le placement de `U4` |
| `infrastructure/repositories` → « Gestionnaires d'accès aux données » | le placement de `I9` |
| `infrastructure/serializers` → « Convertisseurs de données Domain objects **←→** HTTP request objects » | `M5` de `fiche-serialiseur.md` : le métier bidirectionnel du sérialiseur |
| `application` → « Fichiers de définition des routes et contrôleurs HTTP » | le placement de `R5` et `C5` |

**La réserve, et elle est importante** : ce fichier décrit `lib/`, avec les trois couches à la racine.
Cette arborescence **n'existe plus** — l'ADR 51 l'a remplacée par un triplet répliqué dans chaque
contexte borné. Le **sens des dossiers** a survécu à la migration, la structure non.

Ce qu'il ne couvre pas : le **nommage des fichiers**. PascalCase pour un modèle, kebab-case pour un
usecase, le suffixe `-repository` — rien de tout cela n'y figure. Les invariants de nommage restent
donc sans source, contrairement aux invariants d'emplacement.

### Le vocabulaire des couches ne vient pas de la Clean Architecture

La page *1.Intro* le dit explicitement : « Les termes utilisés dans notre architecture ne viennent pas
de la clean architecture et sont empruntés à d'autres style d'architecture », avec un renvoi à l'article
d'Octo sur *application / domaine / infrastructure* comme mots de la layered, hexagonal et clean
architecture.

Conséquence pour le corpus : `invariants-clean-archi-ddd.md` pose que Pix vient de la Clean
Architecture d'Uncle Bob, ce que les ADR 46, 51 et 55 confirment pour les **principes**. Mais le
**nommage** des trois couches est emprunté à la layered et à l'hexagonale. Ne pas invoquer Martin pour
justifier un nom de dossier.

### Corrections — ces conventions ont bien une source, contrairement à ce que j'avais écrit

| Convention | Source réelle |
| --- | --- |
| `injectDependencies`, injection **par nom de paramètre** | **ADR 46**, avec son motif : ESM rend les exports immuables, donc non substituables en test. Ce n'est pas un goût, c'est une contrainte technique datée |
| Toujours passer par un usecase, même trivial | **ADR 20** |
| Un contrôleur importe les usecases sans injection | **ADR 46**, exception assumée (« les use-case ne sont pas injectés dans les controllers »). Attention : cela n'autorise pas à franchir une frontière de contexte — ADR 55 impose l'API interne pour ça |
| Traduire vers un type local plutôt que passer le DTO du voisin | **ADR 55**, qui accepte explicitement « la duplication possible des modèles dans les différents contextes » comme coût du découpage |
| L'injection de dépendances dans les repositories | **ADR 55**, listée comme coût accepté (« ajout de complexité dans la couche infrastructure ») |
| Transaction en ambient context | **ADR 9 et 25**, à lire avant d'invoquer le Unit of Work de Fowler contre elle |
| `shared/` comme zone d'attente | **ADR 55**, qui le décrit et énumère ses conséquences négatives — surcharge cognitive, délais, perte d'autonomie |

---

## Comment vérifier une affirmation d'une fiche

1. Si l'affirmation porte un renvoi vers ce fichier, la source y est nommée avec son chapitre.
2. Si elle figure dans le tableau ci-dessus, **c'est une convention Pix** : elle se discute sur ses
   mérites, pas par appel à une autorité.
3. Si elle ne renvoie ni à l'un ni à l'autre, c'est un oubli — le signaler.

Les affirmations sur le **code** se vérifient autrement : chaque fiche cite le chemin du fichier, et
les mesures (nombres de fichiers, résultats d'exécution) portent leur date. Le code bouge, les fiches
se périment.
