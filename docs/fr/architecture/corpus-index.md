# Index du corpus d'architecture

**Commencer ici.** Ce fichier est le point d'entrée du corpus : il dit quelles fiches existent, dans
quel état, dans quel ordre les relire, et porte le gabarit commun.

État au 2026-09-08. **Ce fichier se périme** — les fiches non.

Il porte ce qui relève de la conduite du chantier : quelles fiches existent, dans quel état, dans quel
ordre les relire, pourquoi les regroupements ont été tranchés comme ils l'ont été, et le **gabarit**
commun des fiches, en fin de document.

Le gabarit vivait au § 10 de `fiche-repository.md`, par accident : c'est la première fiche rédigée,
donc les règles s'y sont écrites. Un gabarit décrit comment écrire une fiche, pas comment écrire un
repository.

---

## Les douze fiches

Une fiche par type de fichier. Chacune porte en tête un encadré indiquant ses sections les moins
instruites.

| Fiche | Préfixe | Couverture |
| --- | --- | --- |
| `fiche-repository.md` | `I` | le port vers l'extérieur, base ou API voisine |
| `fiche-specification.md` | `S` | moteur de règles composable et piloté par des données |
| `fiche-objet-valeur.md` | `V` | objet-valeur |
| `fiche-read-model.md` | `RM` | read-model — la forme assemblée pour une lecture |
| `fiche-entite.md` | `E` | entité |
| `fiche-racine-agregat.md` | `A` | racine d'agrégat |
| `fiche-usecase.md` | `U` | usecase |
| `fiche-service-domaine.md` | `D` | service de domaine |
| `fiche-api-interne.md` | `P` | le contrat publié entre contextes |
| `fiche-controleur.md` | `C` | contrôleur |
| `fiche-route.md` | `R` | route |
| `fiche-serialiseur.md` | `M` | sérialiseur |

La collision de préfixe sur `R` est levée : le read-model emploie `RM`, `R` reste à la route. C'est la
sortie que ce fichier proposait déjà.

**Le discriminant objet-valeur / read-model est énoncé une seule fois**, au § 1 de
`fiche-objet-valeur.md`, et `fiche-read-model.md` y renvoie. De même, les cinq invariants mécaniques
communs — immuabilité, absence d'identité, pureté, absence de cycle de vie, exposition en lecture
seule — sont énoncés dans la fiche objet-valeur ; la fiche read-model les reprend dans sa checklist
seulement, parce qu'une checklist doit être copiable telle quelle.

**Les écarts se numérotent `X`**, dans toutes les fiches. L'ambiguïté signalée ici — `E` servait à la
fois de préfixe d'invariant dans `fiche-entite.md` et de numérotation des écarts partout — est devenue
bloquante à la reprise de cette fiche, où `E3` l'invariant et `E3` l'écart auraient coexisté. `X`
n'est le préfixe d'invariant d'aucune fiche.

Tranché le 2026-09-08. `fiche-repository.md`, `fiche-objet-valeur.md` et `fiche-read-model.md`
numérotent encore leurs écarts en `E` : **retard à rattraper**, purement mécanique.

## Les autres fichiers

| Fichier | Rôle |
| --- | --- |
| `invariants-clean-archi-ddd.md` | document transverse : écarts par famille, grille coût/bénéfice, discriminant entre catégories de modèles |
| `references-ddd.md` | bibliographie, avec la liste de ce qui n'a **aucune** source |
| `migration-typescript.md` | **se périme** : ce qui empêche aujourd'hui le typage de vérifier quoi que ce soit, et l'ordre de migration d'une chaîne. Une fiche y renvoie plutôt que de décrire un obstacle transitoire |
| `fiche-application.md` | **parcours**, pas une fiche : séquence route / contrôleur / sérialiseur pour l'ajout d'un point d'entrée HTTP. Aucun invariant propre |
| `rapport-divergence-<contexte>.md` | l'écart entre la cible et le code réel, un par contexte |

---

## État de la relecture

Relecture par agent, une par fiche, le 2026-09-08. **Sept sur onze relues** ; quatre ont échoué sur la
limite de session. `fiche-read-model.md`, créée depuis, porte le total à douze.

Les sept fiches reprises — repository, objet-valeur, read-model, entité, racine d'agrégat, usecase,
service de domaine — portent un **sommaire** conforme au gabarit. Les cinq autres l'auront à leur
passage.

| Fiche | Relue | État |
| --- | --- | --- |
| `fiche-repository.md` | oui | **corrigée** le 2026-09-08. Invariant `I11` ajouté, `I8` retiré — il rendait la source visible dans le nom du fichier, ce qui contredit l'uniformité de la couche posée au § 1. Le numéro n'est pas réattribué. Le gabarit en est sorti vers ce fichier ; dix sections, `Sources` au § 10. Sommaire ajouté, et le § 6 dit désormais lesquelles de ses lignes sont datées |
| `fiche-specification.md` | oui | à corriger — S1/S2 se contredisent, test S7 faux |
| `fiche-objet-valeur.md` | oui | **corrigée** le 2026-09-08, puis **scindée**. Le read-model en est sorti vers sa propre fiche. Quatre tests de discrimination ajoutés au § 1, écarts refaits au format en cinq colonnes, `E5` ajouté sur la clé de présentation, définition d'« objet du domaine local » ajoutée. Numéros d'écart commençant à `E2`, non réattribués. Reste : le ROI de V3, en contradiction avec `fiche-specification.md` |
| `fiche-read-model.md` | — | **créée** le 2026-09-08 par scission de `fiche-objet-valeur.md`. Jamais relue par un tiers |
| `fiche-racine-agregat.md` | oui | **corrigée** le 2026-09-08 avec la fiche entité. `A4` et `A5` retirés — duplications de `E7` et `E3` à ROI inversés ; numéros non réattribués. Section d'invariants hérités ajoutée. Écart `X2` ajouté : aucune racine n'est déclarée, ce qui bloque `A1` et `A3` |
| `fiche-service-domaine.md` | oui | **corrigée** le 2026-09-08 avec la fiche usecase. Prémisse fausse retirée : le problème n'est pas une catégorie vide mais un dossier qui mélange deux natures. ROI classé et section sur le type ajoutés — les deux éléments du gabarit qui manquaient. `D6` retiré : c'était une déduction de `D1` et le contenu du § 8. Devient le domicile du discriminant usecase / service |
| `fiche-api-interne.md` | oui | à corriger |
| `fiche-controleur.md` | oui | à corriger |
| `fiche-entite.md` | **non** | **corrigée** le 2026-09-08 sans avoir été relue par un tiers. Devient le domicile de `E3` et `E7`, que la fiche racine d'agrégat dupliquait. Écarts refaits en `X1` à `X5`. À faire relire |
| `fiche-usecase.md` | **non** | **corrigée** le 2026-09-08 sans avoir été relue par un tiers. Le § 4bis a disparu : le discriminant vit dans `fiche-service-domaine.md`, cette fiche y renvoie. Écarts refaits en `X1` à `X5`, dont deux que d'autres fiches traitaient depuis l'autre bord. À faire relire |
| `fiche-route.md` | **non** | **à relancer en priorité** |
| `fiche-serialiseur.md` | **non** | à relancer |

`fiche-route.md` d'abord : elle porte l'affirmation la plus forte du corpus — R2 au meilleur rendement
et sans aucune source — et personne ne l'a éprouvée.

## Ordre de relecture proposé

1. ~~`fiche-objet-valeur.md`~~ — **corrigée le 2026-09-08.** Elle livre la définition d'« objet du
   domaine local » dont dépendent I1 et I2 de la fiche repository, et le discriminant avec le
   read-model. `fiche-read-model.md`, issue de la même passe, n'a jamais été relue par un tiers : à
   faire relire avant les autres, puisqu'elle est neuve et non éprouvée.
2. ~~`fiche-entite.md`~~ puis ~~`fiche-racine-agregat.md`~~ — **corrigées le 2026-09-08**, ensemble
   comme prévu. Les duplications A4/E7 et A5/E3 sont résolues : l'énoncé vit dans la fiche entité, la
   fiche racine y renvoie et ajoute ce qui change pour une racine. Aucune des deux n'a été relue par
   un tiers dans cet état.
3. ~~`fiche-usecase.md`~~ et ~~`fiche-service-domaine.md`~~ — **corrigées le 2026-09-08**, ensemble
   comme prévu. Leur frontière est un test unique — la présence d'une I/O dans la signature — et il
   est désormais énoncé une seule fois, dans la fiche service. Aucune des deux n'a été relue par un
   tiers dans cet état.
4. **`fiche-route.md`** — hors séquence logique, mais R2 est l'invariant au plus gros rendement du
   corpus et il n'est adossé à aucune source ni aucun ADR. À arbitrer tôt.
5. **`fiche-api-interne.md`** — la relecture a établi que P5 est déjà décidé par la documentation liée
   à l'ADR 55 ; à répercuter.
6. **`fiche-controleur.md`** et **`fiche-serialiseur.md`** — courtes, peu d'enjeux.

---

## Justification des regroupements

Quatre découpages ont été discutés puis tranchés. Les raisons sont ici pour ne pas les rejouer.

**Une fiche par catégorie de modèle, pas une fiche commune.** L'argument pour une fiche unique — le
discriminant entre catégories n'appartient à aucune — ne tient pas : le gabarit a déjà un emplacement
pour ça dans chaque fiche, la table « ce que ce fichier n'est pas ». Et trois arguments penchent pour
la séparation : la checklist est l'artefact opérationnel et on relit **un** fichier à la fois ; les
invariants d'une entité et d'un read-model ne sont pas des variantes d'une même chose ; la vérification
déterministe diffère aussi (règle ESLint, revue humaine, test).

**Le read-model a sa fiche.** Trois découpages ont été tenus successivement le 2026-09-08, et il faut
les trois pour comprendre la position finale.

1. *Variante de l'objet-valeur* — abandonné. L'anémie est précisément ce qui fait qu'un tel objet
   n'est pas un objet-valeur ; un sac immuable sans comportement est un DTO au sens de Fowler.
2. *Catégorie sœur dans la même fiche* — abandonné aussi. Deux des trois critères de séparation énoncés
   plus haut tranchaient contre : on relit **un** fichier à la fois, et une checklist commune force le
   relecteur à sauter des lignes annotées — le reproche exact qui a fait éclater la fiche
   « application ». Seul le troisième critère, la vérification déterministe, plaidait pour l'union.
3. **Deux fiches.** L'argument qui retenait l'union — le discriminant n'appartient à aucune des deux
   catégories — ne tient pas : ce fichier avait déjà tranché que le gabarit prévoit un emplacement
   pour ça, la table « ce que ce fichier n'est pas ».

L'argument décisif est pédagogique. Présenter le read-model comme « V3 et V5 ne s'appliquent pas » le
décrit comme un **objet-valeur défectueux**, et c'est ce cadrage qui rendait la distinction
insaisissable. Deux fiches obligent chaque catégorie à se tenir sur ses propres termes.

Le discriminant reste : **le domaine raisonne-t-il avec cet objet ?**, avec quatre tests applicables
en revue.

**Le mot `read-model` est conservé**, décision du 2026-09-08 qui renverse un verdict précédent. Il
avait été classé « à corriger » au motif que le renommage débloquerait une vérification par règle de
chemin. C'était faux : `domain/models/` et `domain/read-models/` sont déjà des dossiers frères dans
une quinzaine de contextes, donc la règle est écrivable telle quelle. Le renommage n'apportait rien,
et le mot est celui de l'équipe — l'Ubiquitous Language est la langue de l'équipe, pas celle du livre.
Ce qui reste à faire est le **classement** des fichiers, pas le renommage : c'est l'écart `E1` de
`fiche-read-model.md`.

**Où vivent les invariants communs.** `invariants-clean-archi-ddd.md` semblait l'endroit, puisque ce
fichier le décrit comme portant le « discriminant entre catégories de modèles ». Écarté : ce document
est un **état des lieux daté**, et y placer du contenu stable casserait la règle qui fonde le corpus
— les fiches sont pérennes, le reste se périme. Les cinq invariants mécaniques restent donc énoncés
dans la fiche objet-valeur, et la fiche read-model y aiguille.

**La Specification est à part.** Un moteur de règles composable et piloté par des données a pour
invariants la totalité, la pureté et la fermeture par composition — pas l'identité et le cycle de vie.

*Contradiction arbitrée le 2026-09-08.* Il était écrit ici que le candidat évalué par une Specification
est un read-model, ce que `R3` interdisait. Le discriminant tranche : si une règle lit ses valeurs pour
décider, le candidat n'est pas un DTO, c'est un objet-valeur, et V3 et V5 s'appliquent à lui. `Q3` est
devenu un test de classement, pas une interdiction.

**Le service de domaine a sa fiche, malgré une catégorie clairsemée.** L'argument inverse a été tenu
puis abandonné : il était incohérent avec la fiche racine d'agrégat, défendue **parce que** la notion
est creuse. Une fiche est utile quand elle donne le critère de jugement, pas seulement quand la
catégorie est peuplée. *Correction issue de la relecture : la catégorie n'est pas « presque vide » —
33 vrais services sur 109 fichiers, dix contextes sur vingt à zéro.*

**Route, contrôleur et sérialiseur ont chacun leur fiche.** Elles ont d'abord été regroupées sous une
fiche « application », au motif qu'on les touche ensemble. Abandonné pour la même raison que la fiche
modèle commune : trois familles d'invariants sous une couverture, c'était trois fiches déguisées en
une, et la checklist mélangeait des critères qu'on ne relit jamais ensemble. Ce qui était juste dans le
regroupement est préservé par un parcours séparé, `fiche-application.md`.

**Les DTO de contrat vont avec l'API interne**, pas avec les objets-valeurs : ce sont des formats
publiés, et leurs invariants sont ceux d'un contrat — stabilité, documentation, indépendance de
l'appelant.

---

## Gabarit des fiches

### En-tête

Avant la première section, dans cet ordre :

1. Le **titre**, et une ligne disant que la fiche est générique et décrit l'état cible.
2. Les **renvois** : le gabarit et l'état du chantier ici, l'écart avec le code dans les rapports de
   divergence, les obstacles transitoires au typage dans `migration-typescript.md`.
3. L'encadré **À instruire**, qui liste les points les moins solides de la fiche.
4. Un **sommaire**.

### Le sommaire

Une fiche fait plusieurs centaines de lignes. Le sommaire sert à y **aller**, pas à décrire la
structure. Trois blocs, tous cliquables :

1. Les **dix sections**, sur une ligne, séparées par des points médians.
2. Une table des **invariants** : numéro cliquable, libellé court, ROI, moyen de vérification. Plus
   les invariants **empruntés à une fiche voisine**, s'il y en a, nommés avec leur fiche d'origine.
3. Une table des **écarts** : numéro cliquable, libellé court, verdict, triée comme au § 5.

Puis une ligne pour les **artefacts hors numérotation** souvent cherchés — un discriminant, une table
de décision. Quand l'artefact vit dans une autre fiche, le dire : un sommaire qui indique aussi ce qui
n'est **pas** là évite de chercher.

Lister des sections identiques d'une fiche à l'autre n'apprend rien, et ce n'est pas le but : c'est
précisément parce que les dix titres sont fixés par ce gabarit que leurs **ancres sont les liens les
plus stables du corpus**. Les ancres d'invariant, elles, cassent si on reformule un titre — c'est le
seul endroit où le sommaire dérive.

La valeur de la table des invariants est sa **position** : celle du § 4 porte déjà les libellés et le
ROI, mais elle arrive après les invariants.

Ancres au format GitHub : minuscules, ponctuation retirée, espaces en tirets, accents conservés —
`### V4. Aucune I/O, aucune dépendance à l'infrastructure` donne
`#v4-aucune-io-aucune-dépendance-à-linfrastructure`. À terme, un sommaire **généré** vaut mieux qu'un
sommaire tenu à la main, et un script de `tests/tooling/` peut vérifier qu'il correspond aux titres.

### Les dix sections

Dix éléments attendus dans chaque fiche, dans cet ordre. Une fiche conforme a donc dix sections. Le
sommaire n'en est pas une : il est dans l'en-tête.

1. **Rôle**, et **ce que le fichier n'est pas**, sous forme de table de décision vers les fichiers
   voisins. La table cite la **fiche** de destination, elle n'explique pas son contenu : une fiche
   aiguille vers ses voisines, elle ne réexplique pas leurs invariants.
2. **Invariants numérotés**, chacun avec : énoncé, illustration conforme et fautive, et « ce qui
   casse ». Les trois, pour chacun.
3. **Exceptions légitimes**, avec l'avertissement qu'une exception ne vaut que pour son invariant.
4. **ROI des invariants**, classé en rentabilité forte / moyenne / hygiène, plus un niveau *revue
   seule* pour un invariant réel mais non vérifiable. Une seule table : invariant, rentabilité, ce
   qu'on gagne. Avec une section sur ce qu'ils n'apportent pas.
5. **Écarts avec la théorie**, en cinq colonnes : écart, nature, **coût payé**, **bénéfice obtenu**,
   verdict.
   - La nature est *convention assumée*, *dérive* ou *vestige*. Un écart non tranché sera resoulevé à
     chaque relecture, et un vestige ne se traite pas comme une dérive.
   - Un **vestige peut devenir une convention** par décision : constater qu'il ne coûte rien et que le
     corriger coûterait cher est une réponse valable. L'écrire, sinon il sera resoulevé.
   - Le coût et le bénéfice sont **deux colonnes séparées**, pas une appréciation fondue en une
     phrase. C'est ce qui rend le verdict lisible d'un coup d'œil.
   - Le verdict découle des deux : **À corriger** quand le coût est payé sans bénéfice, *À surveiller*,
     ou *Rien à faire*. « Convention assumée » ne dispense pas de l'examen.
   - **Table triée par verdict**, les à corriger en premier, avec un écart numéroté par ligne. Les
     écarts se numérotent **`X1`, `X2`, …**, jamais avec le préfixe d'invariant de la fiche : sinon
     `E3` l'invariant et `E3` l'écart coexistent, ce qui s'est produit sur `fiche-entite.md`.
   - Puis **un bloc par écart** : ce que dit la théorie, un **exemple concret** de la forme en vigueur
     — code ou arborescence — et une rubrique **Correction** qui dit quoi faire, ou dit qu'il n'y a
     rien à faire et pourquoi. Sans exemple ni correction, un écart ne permet pas de se projeter.
6. **Vérification déterministe** : moyen, coût, faux positifs, pièges d'implémentation, ordre de mise
   en œuvre, et ce qui est mécanisable par codemod. Dire si l'ordre suit le coût ou le ROI.
7. **Forme du port**, telle qu'elle est déclarée et vérifiée par le typage, plus la façon de s'y
   conformer et de vérifier la complétude. Une fiche décrit l'état cible, où tout est en TypeScript :
   ce qui empêche aujourd'hui ce typage de mordre et l'ordre de migration vont dans
   `migration-typescript.md`, pas dans la fiche.
8. **Tests attendus** par variante du fichier, avec la borne de chaque indice de diagnostic.
9. **Checklist ordonnée par ROI**, copiable telle quelle. Chaque ligne marquée `[auto]`, `[partiel]`
   ou `[humain]` selon ce que le § vérification couvre. Une ligne `[auto]` sort de la checklist dès que
   sa règle existe : une checklist dont la majorité des lignes sont vérifiées par un outil entraîne à
   la parcourir sans la lire. Dire combien de lignes subsistent à terme.
10. **Sources**, invariant par invariant, avec mention explicite de ceux qui n'en ont aucune.

**L'ordre compte.** Les invariants viennent avant tout ce qui les référence. Un § qui parle du ROI de
`I1` ou de l'écart que `I7` constate avant que `I1` et `I7` soient énoncés est illisible.

**Chaque table est auto-portante.** Une première colonne qui ne contient qu'un numéro d'invariant
oblige à remonter au § 2 pour la lire. Le numéro est toujours suivi de son libellé court, même au prix
d'une répétition entre les tables.

### Quatre règles de structure

**1. Une fiche décrit l'état cible.** Elle est générique : aucun nom de contexte, aucun « état
constaté », aucun comptage, aucune mesure datée. Les illustrations servent l'énoncé, elles ne sont pas
des preuves.

**2. Ton neutre et factuel, français simple.** Une fiche décrit une règle. Elle ne la justifie pas, ne
la commente pas, ne raconte pas ses propres révisions. Pas de première personne. Pas de superlatif ni
d'emphase rhétorique. Phrases courtes. Une décision d'équipe se mentionne comme un fait, pas comme un
argument.

**3. Chaque invariant énonce son ROI**, et les invariants sont classés par rentabilité. Un invariant
dont le ROI n'est pas énonçable n'a pas sa place dans une fiche, ou est classé en hygiène.

Les invariants sans source externe ni ADR sont souvent ceux classés en hygiène. Quand ce n'est pas le
cas — fort ROI, aucune source — c'est un signal : la pratique existe, le raisonnement n'est écrit
nulle part, et personne ne peut la défendre ni la contester sur pièces.

**4. L'écart avec le code va dans un rapport de divergence par contexte** : exemple réel avec son
chemin, invariant enfreint, mode de vérification, date, et ce qu'il faudrait faire. La fiche est
stable, le rapport se périme. Une divergence peut être une convention assumée, une dérive ou un
vestige ; les trois se traitent différemment.

### Ce qui ne relève pas d'une fiche

À vérifier à chaque relecture, le sujet est revenu plusieurs fois :

| Contenu | Où il va |
| --- | --- |
| Le gabarit et les règles de structure | ici |
| L'état du chantier, l'ordre de relecture, la justification des regroupements | ici |
| Un exemple réel avec son chemin, un comptage, une mesure datée | `rapport-divergence-<contexte>.md` |
| Une bibliographie, un lien | `references-ddd.md` |
| Un obstacle transitoire au typage, un ordre de migration | `migration-typescript.md` |
| Le classement des clés de présentation existantes | `rapport-divergence-<contexte>.md` — constaté le 2026-09-08 dans trois contextes au moins |
| Une séquence de fichiers à toucher ensemble | `fiche-application.md`, qui est un parcours |

Restent dans la fiche, malgré les doutes : le **type de test par variante** (§ 8) et la **checklist**
(§ 9). Le type de test fait partie de la recette du fichier, et il porte des indices de diagnostic qui
ne se déduisent d'aucune autre section. La checklist est aujourd'hui le seul mécanisme d'application,
aucune règle du § 6 n'étant en place.
