# Contrôleur — explication

Pourquoi les règles de [`README.md`](README.md) existent, ce qu'elles rapportent, et d'où elles
viennent. Cette page ne prescrit rien : les règles sont dans la référence.

## Ce que le contrôleur apporte

Le contrôleur est un *humble object* au sens de Martin, *Clean Architecture*, ch. « Presenters and
Humble Objects ». Il est assez simple pour que son test soit trivial, afin que tout ce qui mérite un
vrai test soit testé ailleurs.

Le **ROI** de cette couche est presque entièrement négatif : il vient de ce que le contrôleur ne
contient pas.

## ROI des invariants

| Invariant | Rentabilité | Ce qu'on gagne |
| --- | --- | --- |
| **C1** un seul usecase | **forte** | Chaque intention métier a un nom, un fichier et un test d'intégration. Sans lui, la composition n'est vérifiée qu'en acceptance |
| **C2** aucune décision | **forte** | Le contrôleur devient trivial, donc son test aussi, donc l'effort se concentre là où est la valeur. C'est le mécanisme du *humble object* |
| **C4** aucun accès aux données | **forte** | Le contrôleur ne lit rien en contournant les règles du domaine, donc il ne crée pas de second comportement pour la même question |
| **C3** dépendances en paramètre | moyenne | Rend le contrôleur testable en unitaire sans monter de serveur. Le gain est réel mais limité : ces tests sont peu nombreux et peu coûteux |
| **C5** un contrôleur par ressource | hygiène | Aucun gain mesurable. Rend le fichier prévisible, et donne à la règle de `C1` une unité claire à parcourir |

`C1` est le seul de ces invariants qui **déplace du coût de vérification** au lieu d'en retirer : la
composition quitte le contrôleur pour un usecase, qui demande son propre test d'intégration.

L'ordre de mise en œuvre de [`outillage.md`](outillage.md#ordre-de-mise-en-œuvre) suit le coût, pas
ce classement.

### Ce que ces invariants n'apportent pas

Ces invariants ne disent pas si l'API HTTP est bien conçue. Ils ne couvrent ni le découpage des
ressources, ni leur granularité, ni la cohérence des adresses. Un contrôleur irréprochable peut servir
une API pénible.

Le ROI de cette couche est négatif, et il a donc une limite. Appliquer les cinq invariants ne rend
pas le contrôleur bon : cela le rend **absent du raisonnement**, ce qui est le but de la couche.

La checklist de [`README.md`](README.md#checklist-de-revue) en porte la trace. Deux invariants sur
cinq, `C4` et `C5`, se vérifient sans revue, et `C1` et `C2` en partie. C'est la contrepartie d'une
couche dont le rôle est de ne rien contenir : ce qui ne doit pas y être se détecte mieux que ce qui
doit y être.

## Les décisions et leur histoire

### La transaction hors du contrôleur

1. L'**ADR 9**, « Transactions métier », prescrivait d'ouvrir la transaction dans le contrôleur, avec
   `DomainTransaction.execute` autour de l'appel.
2. L'**ADR 25**, « Précision sur les transactions et les événements métier », remplace l'ADR 9. Il ne
   reprend pas cette forme.
3. La forme dominante place la transaction dans le usecase. Elle est cohérente avec `U7` de
   `../usecase/README.md` : c'est le usecase qui sait ce qui doit être atomique.

Un contrôleur qui ouvre une transaction décide donc quelque chose, ce que `C2` exclut.

Dans l'exemple fautif de `C2`, la transaction enveloppe un seul appel de usecase. Le contrôleur ne
compose rien. La transaction ne lui sert donc à rien qu'elle ne servirait mieux dans le usecase, où
le périmètre atomique se lit avec la règle qu'il protège.

### Le contrat du front

Le mappeur d'erreurs sert un contrat avec le front. Ce contrat n'est pas le statut HTTP, mais l'objet
d'erreur complet :

- un `code` fonctionnel, qui identifie la règle violée ;
- un objet `meta`, qui porte les informations dont le front a besoin pour composer son message.

L'ADR 44 rend le code d'erreur obligatoire. L'ADR 13, « Gestion erreurs entre IHM et API », décrit la
structure de l'objet d'erreur JSON:API : `status`, `code` fonctionnel, `title`, `detail`, `meta`. C'est
elle qui permet **plusieurs messages pour un même statut HTTP**. L'état de l'ADR 13 est `Proposed` :
il conforte `C2` sans le contredire, mais il ne peut pas être cité comme une décision.

Un `.code(404)` écrit à la main produit une réponse sans `code` et sans `meta`. Le front retombe alors
sur son message générique.

Le choix du statut et la lecture d'un repository vont souvent ensemble. Un contrôleur qui charge
lui-même n'a personne à qui déléguer la décision d'absence.

### L'injection des usecases

L'ADR 46, « Injecter les dépendances dans l'API », décide l'injection des dépendances. Son motif :
sous ESM, les exports d'un module sont immuables, donc une dépendance importée ne peut pas être
remplacée par une doublure de test. C'est ce motif qui fonde `C3`.

Le même ADR écarte l'injection des usecases dans les contrôleurs, sans en donner de motif. L'équipe a
décidé que cette exception est un vestige : la cible est l'injection de toutes les dépendances, usecases
compris. Au 2026-09-24, une démarche d'injection transverse est en cours dans l'équipe staff. En
attendant l'alignement, les deux formes existantes sont admises, et la référence recommande
l'enveloppe de la route, la seule qui injecte aussi les usecases. L'écart est `X4` de
[`ecarts.md`](ecarts.md).

Le framework HTTP n'empêche pas l'injection des usecases. Sa limite porte sur l'injection des
**contrôleurs** dans les routes.

### Le typage

Le **gain** du typage est faible sur cette couche, pour deux raisons :

- les objets de requête et de réponse du framework sont typés de façon large ;
- la validation déclarée sur la route produit un contrôle à l'exécution que le typage ne connaît
  pas. Le type de `request.params` n'est pas déduit du schéma de la route.

Le typage apporte deux choses. Typer le troisième paramètre documente ce qui est substituable en
test. Les usecases typés rendent vérifiable ce que le contrôleur appelle sur eux : une méthode absente
devient une erreur de compilation. La forme cible est dans
[`outillage.md`](outillage.md#vérifier-par-le-typage).

## La théorie des écarts

### X1. Deux usecases sont appelés à la suite

L'adaptateur d'entrée ne compose pas. La composition d'intentions est du travail de usecase : Martin
la place dans la couche *Use Cases*, pas dans l'adaptateur.

### X2. Un code d'erreur est choisi dans le contrôleur

L'adaptateur traduit, il ne décide pas. Le passage d'une erreur du domaine à un code HTTP est une
traduction, donc cette traduction a un endroit unique.

### X3. Un accès direct au repository, ou au domaine d'un voisin

La règle de dépendance : la couche externe n'atteint pas l'infrastructure en sautant le domaine. De
plus, l'ADR 55 décide que toute frontière de contexte passe par l'API interne.

### X4. Les usecases sont importés sans injection

Les dépendances arrivent en paramètres. C'est `U2` de `../usecase/README.md`, et le motif ESM vaut
ici aussi : un export importé ne peut pas être substitué. L'histoire de la décision est plus haut,
sous [L'injection des usecases](#linjection-des-usecases).

## Sources

Bibliographie et liens dans `../references-ddd.md`. Les ADR sont dans `docs/adr/`.

| Invariant | Source | Où vérifier |
| --- | --- | --- |
| La couche, et **C2** | Martin, *Clean Architecture*, ch. « Presenters and Humble Objects » : le contrôleur est dépourvu de logique pour que son test soit trivial | le livre de 2017 ; billet gratuit |
| **C1** un usecase par point d'entrée | Pix : **ADR 20**, qui rend le usecase obligatoire pour toute route | ADR 20 |
| La transaction hors du contrôleur | Pix : **ADR 25**, qui remplace l'ADR 9. Celui-ci plaçait `DomainTransaction.execute` dans le contrôleur ; l'ADR 25 ne le reprend pas, et la forme dominante place la transaction dans le usecase | ADR 9 et 25 |
| **C3** dépendances en paramètre | Pix : **ADR 46**, et son motif ESM. L'ADR écarte l'injection des usecases dans les contrôleurs sans motif ; la cible est désormais l'injection, voir `X4` de [`ecarts.md`](ecarts.md) | ADR 46 |
| **C4** aucun accès aux données | Martin, « The Clean Architecture » : la règle de dépendance. Pix : **ADR 55** pour la frontière entre contextes | billet gratuit ; ADR 55 |
| **C5** nommage | **aucune source** : convention de rangement | — |
| Le mappeur d'erreurs (`C2`, `X2`) | Pix : **ADR 44**, qui rend le code d'erreur obligatoire. **ADR 13** décrit la structure de l'objet d'erreur JSON:API (`status`, `code` fonctionnel, `title`, `detail`, `meta`) et pose que plusieurs messages peuvent correspondre à un même statut HTTP. **Son état est `Proposed`** : il éclaire le raisonnement, il ne fait pas autorité | ADR 13 et 44 |

**Un invariant sur cinq n'a aucune source** : `C5`, et c'est celui que le classement du ROI met en
hygiène. Les quatre autres renvoient à Martin ou à un ADR, ce qui les rend contestables sur pièces.
