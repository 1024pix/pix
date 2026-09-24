# API interne — explication

Pourquoi les règles de [`README.md`](README.md) existent, ce qu'elles rapportent, et d'où elles
viennent. Cette page ne prescrit rien : les règles sont dans la référence.

## Ce que l'API interne apporte

L'API interne est le contrat publié d'un Bounded Context. Evans en traite sous deux noms, au ch.
« Maintaining Model Integrity » de *DDD* :

- **Open Host Service** : un contexte ouvre un point d'accès unique à ses voisins ;
- **Published Language** : ce qui se publie est un langage dédié à l'échange, pas le modèle interne.

La couche rend aussi explicite dans le code l'attribution des sujets aux équipes. C'est l'objectif
affiché de l'ADR 55, qui a instauré la couche.

### Pourquoi le typage rapporte plus ici

Le typage rapporte plus sur l'API interne qu'ailleurs dans le dépôt, parce que c'est le seul contrat
que plusieurs équipes lisent.

Une API en `.ts` qui importe ses usecases depuis des `.js` ne vérifie que la forme de son propre DTO.
C'est précisément ce que `P1` protège, donc le bénéfice existe même quand l'amont n'est pas migré.
Contrairement aux usecases, l'API interne est donc un candidat de migration précoce. La forme typée
est dans [`outillage.md`](outillage.md#vérifier-par-le-typage).

## ROI des invariants

| Invariant | Rentabilité | Ce qu'on gagne |
| --- | --- | --- |
| **P1** un DTO, jamais le modèle | **forte** | Le fournisseur refactore son domaine sans casser personne. C'est la contrepartie du coût de la couche |
| **P2** passe par un usecase | **forte** | Les règles métier valent aussi pour les voisins. Sans `P2`, l'API est une porte dérobée vers la base |
| **P6** contrat stable | **forte** | Un changement chez le fournisseur ne casse pas la CI de plusieurs équipes |
| **P9** seulement ce qui est utilisé | **forte** | L'équipe du fournisseur sait exactement quel contrat elle doit respecter. Tout champ hors du DTO se refactore sans coordination |
| **P3** contrat documenté | moyenne | Un consommateur sait ce qu'il peut appeler sans lire le code du fournisseur. La charge mentale entre équipes baisse |
| **P8** pas de transit | moyenne | Le graphe de dépendances entre contextes reste lisible et acyclique |
| **P7** indépendant de l'appelant | moyenne | Le couplage que la couche existe pour supprimer ne se recrée pas |
| **P4** DTO sans comportement | hygiène | Un seul modèle à faire évoluer plutôt que deux. Aucun défaut prévenu directement |
| **P5** emplacement unique | hygiène | Le contrat se trouve sans chercher, et le script de `P5` peut devenir bloquant |

L'ordre de mise en œuvre de [`outillage.md`](outillage.md#ordre-de-mise-en-œuvre) suit le coût, pas
ce classement.

La ligne de `P9` est la plus importante de la checklist. `P1` a une règle et un typage, et ni l'un ni
l'autre ne voit un DTO qui recopie le modèle. Cette violation passe au vert sur tous les outils, et
elle annule le bénéfice de la couche.

### Le ROI de cette couche est décalé dans le temps

Le coût de la couche est payé d'avance, et son bénéfice arrive plus tard. Le DTO, l'injection et le
test s'écrivent tout de suite. La liberté de refactorer ne se constate que le jour où le fournisseur
change son modèle. Ce décalage explique la plupart des écarts de la couche.

Ce décalage pousse à contourner `P1`. Or contourner `P1` annule le bénéfice alors que le coût est
déjà payé : une couche d'API interne dont les DTO sont les modèles paie le coût sans le bénéfice.

Sur `P2`, le motif d'erreur le plus courant est le suivant : la donnée demandée est « juste une
lecture », et le usecase paraît superflu. C'est ainsi que la porte dérobée s'ouvre.

### Ce que ces invariants n'apportent pas

`P9` borne les champs d'un DTO, pas le découpage des fonctions. Une API qui respecte tous les
invariants mais expose des dizaines de méthodes calquées sur les besoins d'un seul consommateur n'est
pas un contrat : c'est un tunnel. Le dimensionnement reste un travail de conception entre les deux
équipes.

## Les décisions et leur histoire

### La duplication des modèles, acceptée par l'ADR 55

L'ADR 55 décide les APIs internes synchrones et expose son raisonnement. Il énumère les coûts
acceptés :

- la complexité d'injection ;
- les données de test à fournir aux consommateurs ;
- le boilerplate ;
- la duplication des modèles.

La duplication que `P1` introduit n'est donc pas une dette : c'est le prix de la liberté de
refactorer.

### L'emplacement du DTO, décidé hors du dépôt

La documentation liée à l'ADR 55 fixe l'emplacement : un dossier `api` dans la couche application,
et un sous-dossier `models` pour les classes de contrat. C'est `P5`. Il n'y a donc rien à décider,
seulement à appliquer : c'est `X3` de [`ecarts.md`](ecarts.md).

Cette documentation est une page Confluence de l'espace EDTDT, donc hors du dépôt. Elle peut changer
sans que rien ici ne le signale, et l'ADR 55, qui y renvoie, ne reproduit pas la décision.

### Le DTO borné par ses consommateurs

L'équipe a décidé qu'un DTO n'expose que les champs que ses consommateurs lisent. C'est `P9`, sans
ADR. Le critère vient de Robinson : le contrat d'un fournisseur est l'union de ce que ses
consommateurs utilisent. Un DTO qui recopie le modèle est donc une dérive à corriger : c'est `X5` de
[`ecarts.md`](ecarts.md).

### Le consommateur reçoit l'API par un repository

Le contexte consommateur n'appelle pas l'API depuis son domaine. Il la reçoit injectée dans un
repository de son contexte, qui la traduit. C'est la lecture de `I1` de `../repository/README.md`, et
la décision décrite par `X6` de `../usecase/ecarts.md`.

### La stabilité du contrat, tenable ici

`P6` est tenable pour l'API interne, contrairement au format HTTP, parce que la liste des
consommateurs est connaissable : ce sont les contextes qui déclarent dépendre de celui-ci.

### Le nom d'une fonction par appelant

La forme limite de `P7`, une fonction par appelant comme `getByIdForAdmin`, a un défaut : son nom
désigne un écran plutôt qu'un besoin métier. Si l'écran change, le contrat se périme.
`getWithFullReferential` vieillirait mieux que `getByIdForAdmin`.

### Un cas non tranché

**L'API expose une fonction utilisée par un seul consommateur.** C'est le début d'un tunnel plutôt que
d'un contrat : voir [ce que ces invariants n'apportent pas](#ce-que-ces-invariants-napportent-pas).

### L'import d'un usecase hors de l'index

Une API qui importe le fichier d'un usecase reçoit la fonction brute, sans les dépendances que
l'index injecte. Elle doit alors câbler elle-même les repositories, ce qui la fait violer `P2`, et
parfois `P8`. Le cas relevé dans le code servait à casser un import cyclique. L'équipe a décidé que
ce motif ne le justifie pas : l'API passe toujours par l'index.

## La théorie des écarts

### X1. L'API renvoie un modèle du domaine plutôt qu'un DTO

Evans traite le sujet sous *Published Language* et *Open Host Service* : ce qui se publie est un
langage dédié à l'échange, pas le modèle interne.

### X2. L'API appelle un repository sans passer par un usecase

L'API interne est un adaptateur d'entrée. Martin place les règles applicatives dans la couche *Use
Cases*, que tout appelant traverse.

### X3. L'objet de contrat n'est pas dans le dossier décidé

La théorie ne prescrit pas d'arborescence. Ici, la convention **existe** : la documentation liée à
l'ADR 55 la pose. L'écart porte donc sur une décision déjà prise, pas sur la théorie.

### X4. L'API importe une API ou un repository d'un contexte tiers

La Context Map d'Evans doit décrire les dépendances réelles. Un intermédiaire non déclaré la rend
fausse.

### X5. Le DTO expose exactement les champs de l'Entity

Le Published Language est choisi pour l'échange, pas recopié du modèle interne. Robinson en donne le
critère : le contrat d'un fournisseur est l'union de ce que ses consommateurs utilisent. C'est `P9`.

## Sources

Bibliographie et liens dans `../references-ddd.md`. Les ADR sont dans `docs/adr/`.

| Invariant | Source | Où vérifier |
| --- | --- | --- |
| La couche elle-même | ADR 55, « Communication "séquentielle" entre les contextes fonctionnels », qui décide les APIs internes synchrones, expose le raisonnement et **énumère les coûts acceptés** : complexité d'injection, données de test à fournir aux consommateurs, boilerplate, duplication des modèles | ADR 55 |
| **P1** un DTO, jamais le modèle | Evans, *DDD*, ch. « Maintaining Model Integrity » : **Published Language** et **Open Host Service**. ADR 55, qui accepte la duplication comme contrepartie | *DDD Reference*, PDF gratuit ; ADR 55 |
| **P2** passe par un usecase | ADR 20, « Est-il obligatoire d'implémenter un use-case dans toutes les situations ? ». Martin, *Clean Architecture*, ch. « Business Rules » | ADR 20 ; le livre de 2017 |
| **P3** contrat documenté | Evans, même ch. : un Published Language est par définition documenté. La **documentation liée à l'ADR 55** donne le script de génération et l'emplacement du fichier produit | *DDD Reference* ; le lien en fin d'ADR 55 |
| **P4** DTO sans comportement | Evans, ch. « A Model Expressed in Software » : Value Object. Énoncés dans `../objet-valeur/README.md` | *DDD Reference* |
| **P5** emplacement du DTO | **documentation liée à l'ADR 55** : dossier `api` dans la couche application, sous-dossier `models` pour les classes de contrat. Page Confluence de l'espace EDTDT, donc hors du dépôt | le lien en fin d'ADR 55 |
| **P6** stabilité du contrat | Evans, ch. « Maintaining Model Integrity ». Vernon, *IDDD*, ch. « Integrating Bounded Contexts » | *DDD Reference* ; dddcommunity.org |
| **P7** indépendance de l'appelant | **aucune source.** Déduction : une API qui dépend de son appelant n'est pas un Open Host Service | — |
| **P8** pas de transit | **aucune source.** Déduction de la Context Map d'Evans : le graphe déclaré doit décrire le graphe réel | — |
| **P9** seulement ce qui est utilisé | Robinson, « Consumer-Driven Contracts: A Service Evolution Pattern » (2006). Décision d'équipe, sans ADR | martinfowler.com, gratuit |

**Deux invariants sur neuf n'ont aucune source** : `P7` et `P8`, tous deux des déductions explicites.
`P5` a une source : la documentation liée à l'ADR 55 fixe l'emplacement du DTO. Cette source est hors
du dépôt, voir [l'emplacement du DTO](#lemplacement-du-dto-décidé-hors-du-dépôt).
