# Gabarit des dossiers

Ce fichier dit comment s'écrit la documentation d'un type de fichier de `api/`. Les fiches passent
au format décrit ici lot par lot, une PR par semaine : voir `corpus-index.md`.

## Principe

Un dossier par type de fichier. Le `README.md` est la fiche : le seul document que lit l'équipe, et
celui que GitHub affiche à l'ouverture du dossier. Il se lit de haut en bas :

- la première partie se **consulte** : qui cherche une info la trouve en quelques secondes ;
- la seconde partie, la référence des règles, **explique** : qui découvre le sujet, en particulier un
  junior, y apprend chaque règle avec un exemple de code correct et un exemple de code incorrect.

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

1. **Titre et définition** : le nom du concept, puis deux ou trois phrases simples qui disent ce que
   c'est, avec un exemple du métier, et le dossier où ces fichiers se rangent.
2. **Les règles** : la phrase « Chaque règle est détaillée plus bas, dans la référence des règles »,
   puis une table numéro / règle / en pratique. Le numéro renvoie à la règle dans la référence. La
   colonne « En pratique » dit en une ligne ce que la règle donne dans le code.
3. **Exemple complet** : une phrase qui présente l'exemple, puis son code. L'exemple couvre toutes les
   règles de la fiche, et un commentaire dans le code rattache chaque endroit à sa règle (« V3 : … »).
   Voir [les exemples](#les-exemples).
4. **Comment tester** : le type de test, puis une liste de ce que le test couvre. Chaque point donne le
   nom du test qui l'illustre (« Exemple : `refuses an empty name` »). Puis le code du test de
   l'exemple complet.
5. **Checklist de revue de code** : la checklist seule, copiable, dans un bloc de code. Les lignes sont
   groupées sous des questions courtes (« Peut-on le modifier de l'extérieur ? »), et chaque ligne
   commence par le numéro de sa règle.

Pas de section de vocabulaire, ni de question de tri entre deux concepts. Un terme expliqué par une
autre fiche renvoie à cette fiche, à sa première apparition.

### La référence des règles

Une règle par titre `### V1. …`. Le titre reprend le nom court du tableau des règles. Chaque règle
porte, dans cet ordre :

- **La règle.** Ce qu'il faut faire, en deux ou trois phrases.
- **Exemple de code correct.** Un extrait de l'exemple complet.
- **Exemple de code incorrect.** Le même code, mal écrit. Un commentaire dans le code montre la faute.
- **Ce que ça apporte.** Une ou deux phrases : le bénéfice concret, sur l'exemple de la fiche.
- **Sans cette règle.** Une ou deux phrases : un bug concret, sur l'exemple de la fiche. Pas l'inverse
  du bénéfice.
- **À savoir.** Facultatif : un piège ou une précision qui évite une erreur fréquente.
- **Exceptions.** Facultatif : les cas permis qu'un relecteur signalerait à tort.

### Ce qu'une fiche ne contient pas

- Ni date, ni « aujourd'hui », ni historique, ni état du code : la fiche décrit l'idéal visé.
- Aucune citation d'ADR : un ADR peut être remplacé, la fiche vise l'idéal.
- Aucun renvoi aux documents de travail (`explication.md`, `outillage.md`, `ecarts.md`).
- Aucun lien vers un fichier de Pix qui fait la faute montrée : c'est pointer du doigt une équipe.
- Aucune question ouverte : elle va dans `corpus-index.md`.

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

- **Un seul fil par fiche.** Toute la fiche suit la même classe : l'exemple complet, puis les exemples
  de code correct et incorrect de chaque règle. Un junior suit ainsi une seule classe du début à la fin.
- **Un fil différent d'une fiche à l'autre, c'est permis.** Chaque fiche choisit l'exemple qui montre
  le mieux son concept, et se lit sans connaître l'exemple d'une autre fiche. Des exemples variés parlent à plus de
  monde : la fiche Entity prend une certification, la fiche Aggregate Root une organisation.
- **Une fiche ne mélange pas les concepts.** La fiche Entity ne parle pas d'Aggregate : les règles
  d'Aggregate sont dans la fiche Aggregate Root. Une règle qui appartient à un autre concept va dans
  sa fiche.
- **En TypeScript**, même si le code de Pix est encore en JavaScript : la fiche décrit la cible.
- **Inventé, mais d'après le vrai code.** L'exemple s'inspire d'un fichier réel, nommé avec un
  permalien sous la phrase de présentation : « Exemple inventé, d'après `Organization.js` ». Les
  règles du métier de l'exemple sont de vraies règles du code de Pix, vérifiées dans le code.
- **Chaque permalien pointe vers un commit fixe de `dev`**, avec les lignes exactes :
  `…/blob/<sha>/api/…#L7-L11`. Un lien vers une branche est interdit : le code change, et l'exemple doit
  rester retrouvable.
- **L'exemple de code correct est un extrait de l'exemple complet**, copié à l'identique. Si les deux divergent,
  c'est l'exemple complet qui fait foi.
- **L'exemple de code incorrect montre la même chose, mal écrite.** Il porte sur le même code que
  l'exemple de code correct, pour que le lecteur voie la différence d'un coup d'œil.
- **Le test de l'exemple complet se lit seul** : il définit ses données de test (`buildOrganization`)
  au lieu de les supposer.

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

- Le ton est factuel, sans première personne. « On » est permis : il rend la phrase plus naturelle
  qu'une tournure impersonnelle.
- Écrire comme un développeur l'expliquerait à un collègue : phrases courtes, mots courants, verbes
  plutôt que noms. Éviter les deux-points en cascade, les tournures savantes et les mots que personne
  ne dit à l'oral (« accesseur » : écrire « getter »).
- Les consignes, à l'infinitif, vivent dans « Comment tester » et dans la checklist. Dans les
  documents de travail, dans les rubriques **Correction** et **Ordre de mise en œuvre**.
- Aucune phrase ne commente le document lui-même, ni ne prête une intention à l'auteur du code.
- Aucune question ouverte ni encadré « À instruire » : les questions vont dans `corpus-index.md`.

`objet-valeur/README.md` sert de modèle pour ce niveau de langue.

## Le ROI

Chaque règle énonce son bénéfice dans la rubrique « Ce que ça apporte » de la fiche. Le classement
en rentabilité forte, moyenne ou hygiène reste dans `explication.md`. Une règle dont le bénéfice n'est
pas énonçable n'a pas sa place, ou est classée en hygiène.

Un invariant à fort ROI et sans aucune source, ni externe ni ADR, est un signal : la pratique existe,
mais le raisonnement n'est écrit nulle part. Il se discute sur ses mérites.

## Critères de qualité d'une fiche

Une fiche est prête quand chaque critère est vrai. Chaque critère vient d'un défaut trouvé sur les
premières fiches.

**Le fond**

1. Chaque règle a un « Ce que ça apporte » concret et un « Sans cette règle » qui décrit un bug
   concret, tous les deux sur l'exemple de la fiche.
2. La règle du métier qui porte l'exemple existe dans le code de Pix, avec un permalien vers les
   lignes qui la contiennent.
3. Les décisions de l'équipe listées dans `corpus-index.md` sont respectées.
4. La fiche ne contredit aucune autre fiche, et ne porte pas une règle qui appartient à une autre fiche.
5. La fiche décrit l'idéal : aucun état du code, aucune date, aucune citation d'ADR.
6. Le nom court d'une règle se comprend sans lire la règle : il dit ce qu'il faut faire ou ne pas
   faire.
7. Deux règles ne se recouvrent pas. Si deux règles se ressemblent, chacune dit en quoi elle diffère
   de l'autre.
8. Une règle qui interdit explique le problème qu'elle évite, cas par cas. Si elle couvre plusieurs
   situations, la fiche les distingue.

**Les exemples**

9. L'exemple complet couvre toutes les règles, avec un commentaire par règle.
10. L'exemple complet et son test se lisent seuls : chaque type, chaque constante et chaque fonction
    d'aide utilisés sont définis ou importés.
11. Chaque exemple de code correct est un extrait identique de l'exemple complet. Chaque exemple de
    code incorrect montre le même code, mal écrit.
12. Le code est en TypeScript. Chaque permalien pointe vers un commit fixe, et ses lignes existent.
13. Aucun lien ne pointe vers un fichier de Pix qui fait la faute montrée.
14. L'exemple illustre le concept de la fiche, et rien de plus. Il ne s'appuie pas sur un concept
    d'une fiche suivante, ou il l'explique en une phrase.
15. Chaque extrait de la référence se comprend seul : il rappelle la classe où il se trouve quand ce
    n'est pas évident.
16. Chaque choix de code qui surprend (une date en paramètre, `as const` plutôt qu'un `enum`) est
    justifié dans un commentaire, ou retiré de l'exemple.
17. La fiche ne tranche pas un débat en cours dans l'équipe. Ses exemples évitent d'avoir à trancher, et
    le débat va dans `corpus-index.md`. La fiche ne change qu'une fois le débat clos.

**La structure**

18. Les sections suivent l'ordre du gabarit. Le titre de chaque règle reprend son nom court du
    tableau. La checklist est groupée par questions.
19. Ni section de vocabulaire, ni question de tri, ni renvoi aux documents de travail, ni question
    ouverte.

**La langue**

20. Aucun mot de jugement vague (propre, clair, simple, sans risque, protéger, frontière, robuste) ni
    image.
21. Aucune paire de phrases symétriques, aucun slogan, aucun deux-points en cascade.
22. Chaque terme qu'un junior ne connaît pas est expliqué en une phrase ou renvoie à sa fiche, à sa
    première apparition.
23. Le texte ne promet pas plus que ce que le code garantit : un titre ou une phrase n'affirme pas une
    protection plus forte que celle du code.
24. Chaque consigne dit qui fait quoi : le sujet de la phrase est la couche ou l'objet responsable
    (« le usecase écrit le log »).

**Les vérifications**

25. Un lecteur junior, sans contexte, répond juste à toutes ses questions.
26. Les constats du chasseur de « ton IA » sont appliqués, ou écartés pour une raison notée.
27. Tous les liens et toutes les ancres du corpus mènent au bon endroit, et les blocs de code sont
    fermés.
28. Une personne de l'équipe a relu la fiche avant l'ouverture de la PR.

## Produire une fiche

Les étapes, dans l'ordre. Chaque étape a été apprise sur les premières fiches : en sauter une, c'est
retrouver le défaut qu'elle évite.

### 1. Le fond

- Partir de l'ancienne fiche et de ses documents de travail : ils contiennent la recherche, les règles
  et les décisions.
- Garder les numéros des règles. Un numéro retiré n'est jamais réattribué, et il est noté dans
  `corpus-index.md`.
- Choisir le fil d'exemple. Chercher dans le code la vraie règle du métier qui le justifie, et lister
  les usecases qui touchent ce concept, dans tous les contextes : une règle mal choisie fausse toute la
  fiche.

### 2. L'écriture

- Écrire la fiche au format de ce gabarit, dans le français décrit par [les règles de
  langue](#règles-de-langue).
- Vérifier le code des exemples : les types, les noms, la cohérence entre l'exemple complet, ses tests
  et les extraits de la référence.
- Vérifier chaque permalien : le fichier et les lignes existent au commit cité.

### 3. Les relectures

- **Ligne par ligne** : chaque ligne apprend quelque chose. Retirer ce qui répète une autre ligne, et
  ce qui ne sert pas au lecteur.
- **Les mots vagues** : chercher propre, clair, simple, sans risque, protéger, frontière, et les
  images. Les remplacer par le défaut précis ou le bénéfice concret.
- **Un lecteur junior** : un relecteur sans contexte lit la seule fiche et répond à cinq ou six
  questions concrètes (écrire une méthode, rédiger un commentaire de revue). Une réponse fausse montre
  le passage à reprendre.
- **Un chasseur de « ton IA »** : un relecteur relève les phrases trop longues, symétriques, savantes
  ou jargonneuses. On applique ce qui est fondé, et on note ce qui est écarté.

### 4. La vérification

- Tous les liens et toutes les ancres du corpus mènent au bon endroit, y compris depuis les documents
  de travail quand un titre de règle a changé.
- Les blocs de code sont bien fermés.
- Passer la fiche aux [critères de qualité](#critères-de-qualité-dune-fiche) : tous doivent être vrais.

### 5. La PR de la semaine

- Créer une branche depuis `dev`, avec un nom en anglais : `tech-architecture-guides-<sujet>`.
- N'y mettre que le ou les `README.md` de la semaine.
- Un lien vers une fiche qui n'existe pas encore sur `dev` devient du texte simple.
- La description de la PR suit le format de l'équipe. Le problème et la proposition reprennent le
  texte présenté au weekly.

### 6. Pendant la semaine

- Répondre aux commentaires de la PR, et appliquer ce qui est accepté dans la branche de travail puis
  dans la branche de la semaine.
- Une contre-proposition à un commentaire s'écrit dans le fil, par la personne qui porte la fiche.
- Un point de désaccord sort de la PR le vendredi, et rejoint les chantiers ouverts de
  `corpus-index.md`.
- Si un changement de format vaut pour toutes les fiches, le reporter dans les fiches déjà écrites et
  dans ce gabarit.

## Ce qui ne va pas dans un dossier

| Contenu | Où il va |
| --- | --- |
| L'état du chantier, les décisions, les ADR à écrire, les numéros retirés, les questions ouvertes | `corpus-index.md` |
| La forme commune des dossiers et les règles de langue | ce fichier |
| Une bibliographie, un lien | `references-ddd.md` |
| Un obstacle transitoire au typage, un ordre de migration | `migration-typescript.md` |
| Un état des lieux d'un contexte entier, daté | `rapport-divergence-<contexte>.md` |
| Une séquence de fichiers à toucher ensemble | `parcours/` |
