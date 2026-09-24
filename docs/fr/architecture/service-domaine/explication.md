# Domain Service — explication

Pourquoi les règles de [`README.md`](README.md) existent, ce qu'elles rapportent, et d'où elles
viennent. Cette page ne prescrit rien : les règles sont dans la référence.

## Ce que le Domain Service apporte

Le Domain Service vient d'Evans, *DDD*, ch. « A Model Expressed in Software ». Le Service y est défini
sans état, et son interface emploie les termes du modèle. Il ne fait pas d'I/O. D1, D2 et D3 viennent
de cette définition, D4 du même chapitre.

La frontière avec le usecase vient de Martin, *Clean Architecture*, ch. « Business Rules ». Les règles
d'entreprise sont indépendantes de l'application, les usecases orchestrent. Du code qui fait des I/O
orchestre : c'est un usecase.

Un relecteur peut donc invoquer D1 à D4 : ce n'est pas une préférence locale, c'est la définition du
terme employé. Seul D5, la convention de nommage, n'a pas de source.

## ROI des invariants

| Invariant | Rentabilité | Ce qu'on gagne |
| --- | --- | --- |
| **D1** aucune I/O | **forte** | Une règle métier testable en unitaire pur, sans base ni doublure. Dans un usecase, la même règle demande des fixtures |
| **D4** dernier recours | **forte** | La question « cette règle peut-elle vivre sur un objet ? » est posée avant de créer le fichier. Les modèles gardent leur logique |
| **D3** sans état, sans effet sur ses entrées | moyenne | Le service se rejoue et se parallélise. L'appelant retrouve ses objets tels qu'il les a passés |
| **D2** objets du domaine en entrée et en sortie | moyenne | La règle se réutilise depuis une route, un script ou un job, sans adaptation |
| **D5** nommé par la règle | hygiène | La liste des fichiers montre les règles transversales du contexte |

D1 et D4 ont tous deux une rentabilité forte, mais pas la même vérifiabilité. D1 se lit dans la
signature, sans faux positif. Aucun outil ne vérifie D4. C'est pourquoi la ligne de D4 reste humaine
dans la checklist, alors que D4 est aussi rentable que D1 : elle porte sur une alternative qui n'existe
pas dans le code.

L'ordre de mise en œuvre de [`outillage.md`](outillage.md#ordre-de-mise-en-œuvre) suit le coût, pas
ce classement.

### Ce que ces invariants n'apportent pas

Ces invariants ne disent pas si la règle devait être transversale. Un Domain Service correct peut
cacher une frontière d'Aggregate mal placée : la règle traverse deux Aggregates qui auraient dû n'en
faire qu'un. Voir `A1` de `../racine-agregat/README.md`.

## Les décisions et leur histoire

### Le sens du dossier `services/`

Le sens du dossier `services/` n'avait jamais été décidé. Aucun ADR ne le fixe :

- l'ADR 51, « Arborescence API », fixe l'arborescence sans définir le contenu de `services/` ;
- l'ADR 20, « Est-il obligatoire d'implémenter un use-case dans toutes les situations ? », rend le
  usecase obligatoire sans traiter le service.

Il l'est maintenant : `domain/services/` est réservé aux vrais Domain Services. Les fichiers qui font
des I/O vont dans `usecases/`. C'est la règle de [`README.md`](README.md#le-test-de-discrimination),
et la correction de `X1` dans [`ecarts.md`](ecarts.md). Aucun ADR ne consigne encore cette décision,
et un ADR doit l'écrire.

Cette position est la plus fidèle aux sources. Chez Evans, un Service est sans état et ne fait pas
d'I/O. `docs/fr/Anatomy.md` décrit `domain/services` comme les « Services métier du domaine » : le nom
parle du métier, pas du partage entre usecases. Ce texte appuie la décision sans la remplacer.

Elle a deux conséquences :

- Une fois les fichiers déplacés, la règle ESLint de D1 peut passer en erreur. Plus personne ne
  peut alors ajouter un repository à un fichier de ce dossier.
- Le dossier devient rare, voire vide dans certains contextes. C'est attendu : une règle qui traverse
  plusieurs Aggregates sans rien charger est peu fréquente.

Deux autres positions ont été écartées :

- faire de `services/` le dossier des sous-usecases partagés, ce qui oblige à renoncer à D1 ;
- renommer le dossier en `shared-usecases/`, moins cher, mais qui laisse le vrai service sans
  emplacement.

### Pourquoi D4 est un invariant et pas un conseil

Un Domain Service est la solution la plus facile. Écrire une fonction qui prend deux objets et renvoie
un booléen va toujours plus vite. Ajouter une méthode à une Entity oblige à vérifier que son invariant
tient. Sans règle, le choix se porte donc sur le service.

### Le module de fonctions plutôt que la classe

Le module de fonctions est préféré à la classe. Une classe sans état n'apporte rien de plus, et elle
permet d'ajouter un champ.

## La théorie des écarts

### X1. Le dossier `services/` mélange deux natures de fichiers

Chez Evans, un Service est sans état, et son interface emploie les termes du modèle. Il ne fait pas
d'I/O. Du code qui fait des I/O orchestre : c'est ce que Clean Architecture appelle un usecase.

### X2. La règle est placée dans un service plutôt que sur un objet

Evans précise qu'un Service ne doit pas retirer leur comportement aux objets. Fowler nomme ce qui en
résulte sinon : le modèle anémique.

`X1` de `../usecase/ecarts.md` décrit un écart proche, vu depuis le usecase. Le fichier fautif et la
correction diffèrent : là-bas, la règle est dans l'orchestration. Ici, elle est dans une fonction
transverse.

### X3. Le fichier est nommé par la ressource et suffixé `-service`

L'interface d'un Service emploie les termes du modèle, et sa définition dit ce qu'il fait. Un nom de
ressource ne dit rien de ce que fait le fichier.

## Sources

Bibliographie et liens dans `../references-ddd.md`. Sources primaires des conventions Pix : les ADR de
`docs/adr/`.

| Invariant | Source | Où vérifier |
| --- | --- | --- |
| La catégorie, et **D1**, **D2**, **D3** | Evans, *DDD*, ch. « A Model Expressed in Software ». Le Service y est défini sans état, et son interface emploie les termes du modèle | *DDD Reference*, PDF gratuit |
| **D4** dernier recours | Evans, même chapitre : un Service ne doit pas retirer leur comportement aux objets. Fowler, « AnemicDomainModel », pour le symptôme | bliki gratuit |
| **D5** nommé par la règle | **aucune source** : convention propre à ce dossier | — |
| La distinction service / usecase | Martin, *Clean Architecture*, ch. « Business Rules ». Les règles d'entreprise sont indépendantes de l'application, les usecases orchestrent | le livre de 2017 |
| Le sens du dossier `services/` (X1) | **aucun ADR.** L'ADR 51, « Arborescence API », fixe l'arborescence sans définir le contenu de `services/`. L'ADR 20, « Est-il obligatoire d'implémenter un use-case dans toutes les situations ? », rend le usecase obligatoire sans traiter le service. `docs/fr/Anatomy.md` parle de « Services métier du domaine », ce qui appuie la décision sans la remplacer | ADR 20 et 51 ; `docs/fr/Anatomy.md` |

Un seul invariant sur cinq n'a pas de source : D5, la convention de nommage. D1, D2 et D3 viennent de
la définition d'Evans, D4 du même chapitre.

Aucun ADR ne fixe le sens du dossier. `X1` le décide, et un ADR doit l'écrire.
