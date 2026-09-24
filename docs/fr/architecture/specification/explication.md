# Specification — explication

Pourquoi les règles de [`README.md`](README.md) existent, ce qu'elles rapportent, et d'où elles
viennent. Cette page ne prescrit rien : les règles sont dans la référence.

## Ce que la Specification apporte

Le cadrage vient d'Evans, *DDD*, ch. « Making Implicit Concepts Explicit » : une règle qui répond à
« ce candidat satisfait-il ces critères ? » devient un objet du modèle, et non une condition enfouie
dans un usecase. Evans et Fowler en donnent la forme dans « Specifications » : un prédicat total, et
des combinateurs qui composent les prédicats.

Tout le reste dépend de ce cadrage : si un objet n'est pas une Specification, les invariants de la
référence ne s'appliquent pas. Le PDF gratuit d'Evans & Fowler suffit pour en juger.

Le moteur de `api/` a une particularité que les sources ne traitent pas : il est **piloté par les
données**. Ses specifications sont écrites à la main, hors du code, et stockées en base. Deux
invariants, `S2` et `S7`, viennent de cette particularité.

## ROI des invariants

| Invariant | Rentabilité | Ce qu'on gagne |
| --- | --- | --- |
| **S8** pas de redéfinition par le consommateur | **forte** | C'est le préalable à toute API publiée du moteur, donc à sa réutilisation par un autre contexte |
| **S1** totalité | **forte** | Une specification mal câblée devient un test rouge au lieu d'une exception avalée dans un job |
| **S2** non satisfait ≠ non évaluable | **forte** | Un utilisateur privé de son résultat par un défaut cesse d'être indiscernable d'un utilisateur qui n'y a pas droit |
| **S6** format publié | **forte** | Les specifications déjà écrites continuent de fonctionner, et leur documentation reste vraie |
| **S7** correspondance énumération ↔ candidat | moyenne | Interdit une classe de pannes silencieuses pour dix lignes de test |
| **S5** fermeture par composition | hygiène | Exprimer une condition métier arbitraire sans toucher au moteur. Généralement déjà tenu : l'enjeu est de le préserver |

L'ordre de mise en œuvre de [`outillage.md`](outillage.md#ordre-de-mise-en-œuvre) suit le coût, pas
ce classement.

**Pourquoi quatre invariants sur six sont en rentabilité forte.** C'est inhabituel dans le corpus. Les
modes de défaillance d'un moteur piloté par les données sont silencieux, mais visibles par
l'utilisateur.

Ses entrées sont écrites à la main, hors du code, par des gens qui ne lisent pas les logs. Son
évaluation a lieu dans des jobs. Un défaut ne casse rien : il produit un résultat faux que personne ne
relie à sa cause.

Les invariants hérités gardent le ROI qu'ils ont dans `../objet-valeur/explication.md`. `V3` y est en
rentabilité forte. C'est ici que ce classement se justifie le plus : `V3` élimine un des trois cas de
`S2`.

**Pourquoi `S8` et `S2` restent de jugement dans la checklist.** Leurs écarts, `X1` et `X2` de
[`ecarts.md`](ecarts.md), se corrigent par une décision que rien ne vérifie ensuite.

### Ce que ces invariants n'apportent pas

Aucun de ces invariants ne dit si les critères d'une specification donnée sont les bons. Aucun ne dit
si les identifiants qu'elle référence existent. La cohérence référentielle d'un format piloté par les
données est un sujet distinct. Elle se traite à l'écriture, pas à l'évaluation.

## Les décisions et leur histoire

Les règles de cette fiche n'ont pas d'historique de décision consigné. Les motifs ci-dessous
expliquent trois choix de la référence.

### Le candidat est un Value Object

Le discriminant de `../objet-valeur/README.md` le montre : une règle du domaine lit les valeurs du
candidat pour décider. Le domaine raisonne donc avec lui, et ce n'est pas un read-model. Ce classement
n'a pas de source externe. Evans fournit la catégorie Value Object.

### Le rôle de V3 et de V4 dans un moteur de règles

**`V3`** élimine le cas d'une specification malformée au moment de l'évaluation. Un arbre invalide ne
s'instancie pas, donc `isSatisfiedBy` n'a rien à vérifier. Sans elle, `S1` et `S2` deviennent
inextricables : voir la distinction des trois cas sous `S2` de [`README.md`](README.md).

**`V4`** interdit toute I/O. L'entorse la plus fréquente dans un moteur de règles est la
journalisation : c'est `X3` de [`ecarts.md`](ecarts.md).

### La forme « laide » du format publié

`requirement_type` garde sa casse snake_case dans le modèle, parce que c'est la clé du format écrit à
la main. La cohérence interne demanderait `requirementType`. Le renommage casserait toutes les
specifications déjà écrites en base, ce que `S6` interdit.

## La théorie des écarts

### X1. Un consommateur reconstruit la specification

Un Bounded Context expose un contrat, pas sa forme interne. Evans traite le sujet sous *Bounded
Context* et *Anticorruption Layer*. L'ADR 55 le décide pour Pix. Le consommateur qui réassemble le
modèle d'un autre ne consomme pas un service : aucune API publiée ne peut couvrir cet usage.

### X2. « Non satisfait » et « non évaluable » sont confondus

Evans et Fowler traitent la Specification comme un prédicat total. Ils ne traitent pas le cas d'une
specification non évaluable. L'écart porte donc sur une exigence que les sources ne formulent pas,
mais que le caractère piloté par les données impose.

### X3. La specification journalise

Le domaine ne dépend pas de l'infrastructure. C'est `V4`, et la règle de dépendance de Clean
Architecture.

### X4. La résolution d'une propriété du candidat se fait par nom

Rien : la résolution par nom est un choix d'implémentation, pas un écart avec le pattern. L'écart est
avec la vérifiabilité. Le nom est stocké en base de données, donc aucun outil ne peut lier la
déclaration à son usage.

## Sources

Bibliographie et liens dans `../references-ddd.md`. Sources primaires des conventions Pix : les ADR de
`docs/adr/`.

| Invariant | Source | Où vérifier |
| --- | --- | --- |
| Le cadrage : c'est une Specification, pas un modèle ordinaire | Evans, *DDD*, ch. « Making Implicit Concepts Explicit » | Evans & Fowler, PDF gratuit |
| **S1** totalité | Evans & Fowler, « Specifications » | <https://martinfowler.com/apsupp/spec.pdf> |
| **S2** non satisfait ≠ non évaluable | **aucune source.** Les sources traitent la Specification comme un prédicat total et ne traitent pas le cas d'une donnée présente mais inexploitable | — |
| **S5** fermeture par composition | Evans & Fowler, « Specifications » : la composition y est explicite | même PDF |
| **S6** format publié | Evans, *DDD*, ch. « Maintaining Model Integrity » : **Published Language** | *DDD Reference*, PDF gratuit |
| **S7** énumération ↔ candidat | **aucune source.** Contrainte propre à la résolution par nom, donc à `X4` | — |
| **S8** pas de redéfinition par le consommateur | Evans, même ch. : **Anticorruption Layer**, **Bounded Context**. Pix : **ADR 55**, « Communication "séquentielle" entre les contextes fonctionnels » | ADR 55 ; Vernon, *IDDD*, ch. « Integrating Bounded Contexts » |
| Le candidat est un Value Object | Discriminant de `../objet-valeur/README.md`, sans source externe. Evans pour la catégorie Value Object | *DDD Reference* |
| Invariants hérités | voir `../objet-valeur/explication.md` | — |

Deux invariants propres sur six n'ont **aucune source** : `S2` et `S7`. Ils se discutent sur leurs
mérites, pas par appel à une autorité. Ils ont la même origine : le caractère piloté par les données du
moteur, que les sources ne traitent pas.
