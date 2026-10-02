# Gabarit des dossiers

Ce fichier dit comment s'écrit la documentation d'un type de fichier de `api/`. Les fiches passent
au format décrit ici lot par lot, une PR par semaine : voir `corpus-index.md`.

## Principe

Un dossier par type de fichier. Le `README.md` est la fiche : le seul document que lit l'équipe, et
celui que GitHub affiche à l'ouverture du dossier. Il se lit de haut en bas :

- la première partie se **consulte** : qui cherche une info la trouve en quelques secondes ;
- la seconde partie, la référence des règles, **explique** : qui découvre le sujet, en particulier un
  junior, y apprend chaque règle avec un bon et un mauvais exemple.

Les trois autres fichiers du dossier sont des **documents de travail**, pour l'équipe qui décide de
l'architecture et de l'outillage. La fiche n'y renvoie pas.

| Fichier | Genre | Lecteur | Ce qu'il y cherche |
| --- | --- | --- | --- |
| `README.md` | fiche, puis référence | le développeur qui écrit ou relit ce type de fichier | les règles, un exemple complet, comment tester, comment relire, puis l'explication de chaque règle |
| `explication.md` | document de travail | celui qui veut discuter une règle | la théorie, l'historique des décisions, le ROI détaillé |
| `outillage.md` | document de travail | celui qui met en place une vérification automatique | les règles de lint et scripts à écrire, leur coût, leurs pièges, l'ordre |
| `ecarts.md` | document de travail | l'équipe qui décide | où le code s'écarte des règles, le verdict, la correction |

## `README.md` — la fiche

`objet-valeur/README.md` et `entite/README.md` servent de modèles.

### La partie à consulter

Dans cet ordre :

1. **Titre** : le nom du concept. Une à deux phrases de définition, et le dossier du code concerné.
   Une phrase dit que la première partie se consulte et que la référence des règles explique.
2. **La question de tri** : une question qui dit si le fichier relève bien de cette fiche, avec la
   réponse pour chaque cas et un lien vers la fiche voisine.
3. **Les règles** : une table numéro / règle / en pratique. Le numéro renvoie à la règle dans la
   référence. La colonne « En pratique » dit, en une ligne, ce que la règle donne dans le code,
   avec l'exception la plus fréquente.
4. **Exemple complet** : un fichier réel conforme, ou à défaut la version corrigée du fichier réel le
   plus proche, avec un permalien vers l'original. Des commentaires dans le code rattachent chaque
   endroit à sa règle. Puis son test.
5. **Comment tester** : le type de test, ce qu'il vérifie, et les signaux qu'un test révèle sur le
   code.
6. **Comment relire** : quatre questions dans l'ordre où les poser, la forme d'un commentaire de
   revue, puis la checklist copiable.

Cette partie ne dit rien de l'état du code, de l'outillage, ni de l'histoire des règles.

### La référence des règles

Une phrase rappelle la forme commune. Puis une règle par titre `### In. …`, dans l'ordre des numéros.
Chacune porte, dans cet ordre :

- **La règle.** Ce qu'il faut faire, en deux ou trois phrases, avec les verbes d'obligation : voir
  [les règles de langue](#règles-de-langue).
- **Bon exemple.** Du code, puis son permalien : voir [les exemples](#les-exemples).
- **Mauvais exemple.** Du code, puis son permalien. Un commentaire dans le code montre la faute.
- **Ce que ça apporte.** Une à deux phrases : le bénéfice.
- **Sans cette règle.** Une à deux phrases : un bug concret, pas l'inverse du bénéfice.
- **À savoir.** Facultatif : un piège, une précision qui évite une erreur fréquente.
- **Exceptions.** Facultatif : les cas permis qu'un relecteur signalerait à tort.

Un discriminant partagé avec une fiche voisine, comme celui du Value Object et du read-model, a son
propre titre au début de la référence.

La fiche est **intemporelle**. Elle ne contient ni date, ni « aujourd'hui », ni historique, ni renvoi
aux écarts du code, ni moyen de vérification. Un mauvais exemple vient du vrai code, mais il illustre
la règle : il ne raconte pas son histoire.

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

- **Un mauvais exemple** est un extrait du code réel, simplifié au besoin, sans champ ni signature
  inventés. Si aucune violation n'existe, la forme mauvaise est dérivée du code réel et dite
  hypothétique.
- **Un bon exemple** est un extrait réel quand il en existe un. Sinon, c'est la version corrigée
  du même mauvais extrait : mêmes classes, mêmes champs. Aucune classe n'est inventée pour l'occasion.
- **Un bon exemple pour une règle qui en enfreint une autre** le dit sous son bloc de code :
  « bon pour V3 seulement ».
- **Chaque extrait réel a un permalien.** Sous le bloc de code, une ligne donne un lien
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
- Pas de mot de jugement vague : propre, sale, clair, simple, robuste, maintenable, sans risque, bonne
  pratique. Ces mots ne disent pas ce qui ne va pas. Dire le défaut précis : le code est couplé à la
  base de données, la règle est copiée dans trois usecases, un appelant peut modifier le tableau. Un
  défaut précis donne la correction ; un mot vague ne donne rien.
- Les noms de patterns DDD restent en anglais, comme dans les ADR et les dossiers du code : Bounded
  Context, Entity, Value Object, Aggregate, Aggregate Root, Repository, Domain Service,
  Specification, Ubiquitous Language, Published Language, Anticorruption Layer. Le genre suit le mot
  français : une Entity, un Value Object, une Aggregate Root. `read-model` garde sa graphie d'équipe.

Dans une fiche, en plus :

- Le ton est neutre et factuel. La fiche énonce une règle. Elle ne suppose rien de ce que l'équipe
  voudra, n'emploie ni « on » ni la première personne.
- Les consignes, à l'infinitif, vivent dans « Comment tester » et « Comment relire ». Dans les
  documents de travail, dans les rubriques **Correction** et **Ordre de mise en œuvre**.
- Aucune phrase ne commente le document lui-même, ni ne prête une intention à l'auteur du code.
- Aucune question ouverte ni encadré « À instruire » : les questions vont dans `corpus-index.md`.

`objet-valeur/README.md` sert de modèle pour ce niveau de langue.

## Le ROI

Chaque règle énonce son bénéfice dans la rubrique « Ce que ça apporte » de la fiche. Le classement
en rentabilité forte, moyenne ou hygiène reste dans `explication.md`. Une règle dont le bénéfice n'est pas énonçable n'a pas sa place, ou est classé en hygiène.

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
