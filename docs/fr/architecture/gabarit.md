# Gabarit des dossiers

Ce fichier dit comment s'écrit la documentation d'un type de fichier de `api/`. Les douze dossiers du
corpus le suivent. `repository/` a servi de pilote et reste le modèle.

## Principe

Un dossier par type de fichier. Il contient quatre fichiers, un par genre de documentation au sens
de Diátaxis. Chaque fichier sert un lecteur, et un seul.

| Fichier | Genre | Lecteur | Ce qu'il y cherche |
| --- | --- | --- | --- |
| `README.md` | référence | le développeur qui écrit ou relit ce type de fichier | les règles qui s'appliquent, les cas permis, les tests, la checklist |
| `explication.md` | explication | celui qui veut comprendre ou discuter une règle | pourquoi la règle existe, ce qu'elle rapporte, la théorie, l'historique des décisions |
| `outillage.md` | guide pratique | celui qui met en place une vérification automatique | les règles de lint et scripts à écrire, leur coût, leurs pièges, l'ordre |
| `ecarts.md` | suivi | l'équipe qui décide | où le code s'écarte de la théorie, le verdict, la correction |

La référence s'appelle `README.md` : ouvrir le dossier sur GitHub affiche les règles.

Les genres ne se mélangent pas dans un même passage. Chaque fichier renvoie aux autres par un lien.
Une explication que partagent au moins deux dossiers va dans `transverse/`. Sinon, elle reste dans le
`explication.md` du dossier.

## `README.md` — la référence

Dans cet ordre :

1. **Titre** : le nom du concept, par exemple « Repository ». Une phrase de définition, le dossier du
   code concerné, et les liens vers les trois autres fichiers du dossier.
2. **Portée des règles.** Une phrase dit à quels fichiers les règles s'appliquent, et renvoie à
   `outillage.md` pour ce qui est en place dans la CI.
3. **Sommaire** : les sections, puis une table des invariants dans l'ordre des numéros, avec leur
   libellé et leur vérification.
4. **Rôle** : définition, termes définis en une phrase à leur première occurrence, et table « ce que
   le fichier n'est pas » vers les dossiers voisins.
5. **Invariants**, un par titre `### In. …`, dans l'ordre des numéros. Chacun porte, dans cet ordre :
   - **Énoncé.** La règle, avec les verbes d'obligation : voir [les règles de langue](#règles-de-langue).
   - Une paire d'exemples **conforme** et **fautif** : voir [les exemples](#les-exemples).
   - **Ce qui casse.** Une à trois phrases : la conséquence concrète d'une violation.
   - **Vérification.** Une ligne : le moyen qui vérifie la règle, avec un lien vers `outillage.md`.
     Ni état, ni date, ni « prévu » : la référence reste vraie quand l'outillage avance.
6. **Exceptions légitimes** : une table cas / statut, chaque exception rattachée à son invariant.
7. **Exemple complet** : un fichier réel conforme, son enregistrement et son test. À défaut de
   fichier entièrement conforme, la **version corrigée** du fichier réel le plus proche, avec un
   permalien vers l'original et la liste des corrections, chacune rattachée à son invariant.
8. **Tests attendus** par variante du fichier.
9. **Checklist de revue**, copiable, ordonnée par ROI. Chaque ligne est marquée `[auto]`,
   `[partiel]` ou `[humain]` selon le moyen prévu dans `outillage.md`.
10. **Sources** : l'origine de chaque invariant, avec le numéro et le titre des ADR.

La référence est **intemporelle** : elle ne contient ni date, ni « aujourd'hui », ni « prévu », ni
historique, ni théorie développée, ni plan d'outillage, ni verdict. Tout ce qui dépend d'un état du
code ou de l'outillage va dans `outillage.md` ou `ecarts.md`, qui sont datés. Un
« Ce qui casse » de plus de trois phrases a sa place dans `explication.md`.

## `explication.md` — l'explication

Dans cet ordre :

1. **Ce que le fichier apporte** : le rôle du concept dans l'architecture, et ses sources théoriques.
2. **ROI des invariants** : une table invariant / rentabilité / ce qu'on gagne, classée en forte,
   moyenne, hygiène. Puis ce que les invariants n'apportent pas.
3. **Les décisions et leur histoire** : pour chaque règle qui a une histoire, l'ancienne forme, la
   décision, son motif, les formes examinées et non retenues.
4. **La théorie des écarts** : pour chaque écart de `ecarts.md` qui en a besoin, ce que dit la
   théorie et ses références.

L'explication peut discuter, comparer, citer. Elle ne prescrit rien : une règle vit dans la
référence.

## `outillage.md` — le guide pratique

Dans cet ordre :

1. **État** : ce qui est en place aujourd'hui dans la CI, daté.
2. **Table des vérifications** : invariant, moyen, coût, faux positifs.
3. **Une section par vérification** : la règle à écrire, ses pièges, sa contre-épreuve.
4. **Ordre de mise en œuvre**, en disant s'il suit le coût ou le ROI.
5. **Corriger les violations** : ce qu'un codemod peut faire, et ce qu'il ne doit pas faire.
6. **Le typage**, s'il sert de moyen de vérification : la forme cible et la façon de s'y conformer.

Les consignes y sont à l'impératif ou à l'infinitif.

## `ecarts.md` — le suivi

Ce fichier décrit l'état du code, pas une règle. Il se périme, et il le dit en tête avec sa date.

1. **La grille de verdict**, rappelée en tête (voir plus bas).
2. **Une table des écarts** en cinq colonnes : écart, nature, coût payé, bénéfice obtenu, verdict.
   Triée par verdict, les « à corriger » en premier.
3. **Un bloc par écart**, dans l'ordre des numéros : un **exemple concret** tiré du code, le
   **verdict** et son motif, et la **Correction**. La théorie est un lien vers `explication.md`.

Quand l'équipe tranche un écart, la décision devient une règle de `README.md`, et l'écart renvoie à
cette règle.

### Grille de verdict

- La nature est *convention assumée*, *dérive* ou *vestige*.
- Le coût payé et le bénéfice obtenu sont deux colonnes séparées.
- **À corriger** : le coût dépasse le bénéfice, ou le bénéfice s'obtient autrement. *À surveiller* : un coût et un bénéfice réels, sous
  condition. *Rien à faire* : aucun coût réel.
- **Un bénéfice de performance invoqué sans mesure compte pour nul.**

## Numérotation

- Les invariants se numérotent avec le préfixe du dossier (`I` pour le repository). Les écarts se
  numérotent `X1`, `X2`, … dans chaque dossier.
- Un numéro retiré n'est jamais réattribué. La liste des numéros retirés vit dans l'index du corpus,
  `corpus-index.md`, pas dans les dossiers.
- Un renvoi vers un autre dossier nomme le fichier : « `X4` de `repository/ecarts.md` ».

## Les exemples

- **Un exemple fautif** est un extrait du code réel, simplifié au besoin, sans champ ni signature
  inventés. Si aucune violation n'existe, la forme fautive est dérivée du code réel et dite
  hypothétique.
- **Un exemple conforme** est un extrait réel quand il en existe un. Sinon, c'est la version corrigée
  du même extrait fautif : mêmes classes, mêmes champs. Aucune classe n'est inventée pour l'occasion.
- **Un exemple conforme pour un invariant qui en enfreint un autre** le dit sur sa ligne **Code.** :
  « conforme pour V3 seulement ».
- **Chaque extrait réel a un permalien.** Sous le bloc de code, une ligne **Code.** donne un lien
  GitHub vers un commit fixe de `dev`, avec les lignes exactes : `…/blob/<sha>/api/…#L7-L11`. Un lien
  vers une branche est interdit, parce que le code change et que l'exemple doit rester retrouvable. Le
  chemin n'est pas répété dans le commentaire du bloc. Un extrait hypothétique n'a pas de lien, et la
  ligne le dit. Un extrait raccourci est dit « simplifié ».
- **Tous les permaliens d'un dossier pointent vers le même commit**, pour que ses exemples décrivent
  un seul état du code. Pour mettre un exemple à jour, les extraits du dossier et le commit changent
  ensemble.

## Règles de langue

D'après les guides de langage clair (ISO 24495-1) et Diátaxis :

- Une idée par phrase, vingt mots en moyenne. La règle d'abord, le motif ensuite.
- Voix active, le verbe plutôt que le nom.
- Pas d'incise en tiret cadratin dans la prose. Un point, deux points ou une phrase de plus.
- Du gras seulement sur le terme à repérer, une fois par paragraphe au plus.
- Des mots courants, un seul mot pour une même chose, sans jargon maison. Un mot se remplace selon le
  sens de sa phrase, jamais mécaniquement.
- Couper une phrase ne coupe pas son lien logique : les « parce que », « donc », « sauf si » restent,
  et chaque pronom désigne encore le bon nom.
- Simplifier n'affaiblit pas une règle : « ne doit pas pouvoir » n'est pas « ne doit pas ».
- Trois éléments ou plus dans une phrase deviennent une liste.
- Les noms de patterns DDD restent en anglais, comme dans les ADR et les dossiers du code : Bounded
  Context, Entity, Value Object, Aggregate, Aggregate Root, Repository, Domain Service,
  Specification, Ubiquitous Language, Published Language, Anticorruption Layer. Le genre suit le mot
  français : une Entity, un Value Object, une Aggregate Root. `read-model` garde sa graphie d'équipe.

Dans une référence, en plus :

- Le ton est neutre et factuel. La référence énonce une règle et son statut. Elle ne conseille pas,
  ne suppose rien de ce que l'équipe voudra, n'emploie ni « on » ni la première personne.
- Les consignes à l'impératif vivent seulement dans les rubriques **Correction** et **Ordre de mise
  en œuvre**. Une condition qui changerait un verdict s'écrit sous l'étiquette **Révision.**, comme un
  fait.
- Aucune phrase ne commente le document lui-même, ni ne prête une intention à l'auteur du code.
- Aucune question ouverte ni encadré « À instruire » : les questions vont dans `corpus-index.md`.

`service-domaine/README.md` sert de référence pour ce niveau de langue.

## Le ROI

Chaque invariant énonce son ROI dans `explication.md`, classé en rentabilité forte, moyenne ou
hygiène. Un invariant dont le ROI n'est pas énonçable n'a pas sa place, ou est classé en hygiène.

Un invariant à fort ROI et sans aucune source, ni externe ni ADR, est un signal : la pratique existe,
mais le raisonnement n'est écrit nulle part. Il se discute sur ses mérites.

## Ce qui ne va pas dans un dossier

| Contenu | Où il va |
| --- | --- |
| L'état du chantier, les décisions, les ADR à écrire, les numéros retirés, les questions ouvertes | `corpus-index.md` |
| La forme commune des dossiers et les règles de langue | ce fichier |
| Une bibliographie, un lien | `references-ddd.md` |
| Un obstacle transitoire au typage, un ordre de migration | `migration-typescript.md` |
| Un état des lieux d'un contexte entier, daté | `rapport-divergence-<contexte>.md` |
| Une séquence de fichiers à toucher ensemble | `parcours/` |
