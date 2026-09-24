# Index du corpus d'architecture

**Commencer ici.** Ce fichier est le point d'entrée du corpus : il dit quels dossiers existent, dans
quel état, dans quel ordre les relire, et ce qui reste ouvert.

État au 2026-09-24. **Ce fichier se périme**, les dossiers de fiches non.

Il porte ce qui relève de la conduite du chantier : l'état, l'ordre de relecture, les décisions, les
numéros retirés, les questions ouvertes, et la justification des regroupements.

**Le gabarit est dans `gabarit.md`** : un dossier par type de fichier, découpé en quatre fichiers selon
Diátaxis. Les règles de langue et d'exemples restent en fin de ce document, sous « Gabarit des
fiches », et `gabarit.md` y renvoie.

---

## Les douze dossiers

Un dossier par type de fichier. Chacun contient `README.md` (la référence), `explication.md`,
`outillage.md` et `ecarts.md`.

| Dossier | Préfixe | Couverture |
| --- | --- | --- |
| `repository/` | `I` | le port vers l'extérieur, base ou API voisine |
| `specification/` | `S` | moteur de règles composable et piloté par des données |
| `objet-valeur/` | `V` | Value Object |
| `read-model/` | `RM` | read-model — la forme assemblée pour une lecture |
| `entite/` | `E` | Entity |
| `racine-agregat/` | `A` | Aggregate Root |
| `usecase/` | `U` | usecase |
| `service-domaine/` | `D` | Domain Service |
| `api-interne/` | `P` | le contrat publié entre contextes |
| `controleur/` | `C` | contrôleur |
| `route/` | `R` | route |
| `serialiseur/` | `M` | sérialiseur |

La collision de préfixe sur `R` est levée : le read-model emploie `RM`, `R` reste à la route. C'est la
sortie que ce fichier proposait déjà.

**Le discriminant Value Object / read-model est énoncé une seule fois**, au § 1 de
`objet-valeur/README.md`, et `read-model/README.md` y renvoie. De même, les cinq invariants mécaniques
communs — immuabilité, absence d'identité, pureté, absence de cycle de vie, exposition en lecture
seule — sont énoncés dans la fiche Value Object ; la fiche read-model les reprend dans sa checklist
seulement, parce qu'une checklist doit être copiable telle quelle.

**Les écarts se numérotent `X`**, dans toutes les fiches. L'ambiguïté signalée ici — `E` servait à la
fois de préfixe d'invariant dans `entite/README.md` et de numérotation des écarts partout — est devenue
bloquante à la reprise de cette fiche, où `E3` l'invariant et `E3` l'écart auraient coexisté. `X`
n'est le préfixe d'invariant d'aucune fiche.

Tranché le 2026-09-08, et appliqué aux douze fiches le même jour.

Piège rencontré au passage, à connaître si un renommage de ce genre se représente : `sed` de BSD, celui
de macOS, ne supporte pas les limites de mot `\b`. Un renommage qui les utilise réécrit les ancres et
laisse les libellés, ce qui produit un état à moitié appliqué où les liens du sommaire ne résolvent
plus. Passer par `perl -pi -e`.

**Deux sources du corpus sont datées ou hors du dépôt.** `docs/fr/Anatomy.md` décrit l'arborescence
`lib/`, qui n'existe plus depuis l'ADR 51 : il source le **sens** des dossiers, pas la structure. Et
`P5` et `P3` de `api-interne/README.md` reposent sur une page Confluence liée en fin d'ADR 55. Elle peut changer ou disparaître sans que rien ici ne le
signale, et l'ADR ne reproduit pas la décision. À reporter dans l'ADR : le dossier `api` dans la
couche application, et le sous-dossier `models` pour les classes de contrat.

## Décisions prises

Consignées pour ne pas être rejouées. Chacune reste à porter dans un ADR — c'est le seul endroit du
dépôt qui fasse autorité.

| Décision | Ce qu'elle tranche | Conséquence dans le corpus |
| --- | --- | --- |
| `domain/services/` est réservé aux **vrais Domain Services** | Les fichiers qui font des I/O partent dans `usecases/`. Le dossier devient rare, voire vide par endroits — c'est normal | `X1` de `service-domaine/ecarts.md` a une direction. `D1` devient activable en erreur une fois le déplacement fait |
| Les champs qui portent une règle sont **privés** | Un champ qui porte une règle ne doit pas pouvoir être réécrit de l'extérieur. Là où rien n'est protégé, c'est de l'hygiène | `V1`, `E1` et `E6` gardent leur règle, avec ce motif. Le modèle de référence de la documentation d'architecture n'est pas la cible |
| Les deux règles hébergées dans Confluence sont **vraies** | Contrôles d'accès en pre-handler, et objets de contrat dans `application/api/models/` | `R2` et `P5` sont confirmés. Reste à les faire redescendre en ADR |
| Le mot `read-model` est **conservé** | C'est l'Ubiquitous Language de l'équipe, et le renommer n'apportait rien sur l'outillage | `X2` de `read-model/ecarts.md` classé *à surveiller*. Le travail est le classement, pas le renommage |
| La **désérialisation** relève de `serialiseur/README.md` | Le sérialiseur traduit dans les deux sens, ce que `docs/fr/Anatomy.md` documente. 46 fichiers sur 235 ont une fonction de désérialisation | Invariant `M5` ajouté. `M1` limité au sens sortant, et sa règle du § 6 doit exclure le corps des désérialisations — sinon elle sort sur du code correct |
| Les modèles par **intention d'écriture** ne se multiplient pas sans mesure | `…ForCreation` exprime une différence de nature et reste. `…ForUpdate` portant un sous-ensemble de champs est un modèle partiellement rempli, et c'est le côté commande de CQRS sans CQRS | `V8` gagne son discriminant, et l'écart `X7` de `objet-valeur/ecarts.md` est créé. La règle générale est passée dans le gabarit : un bénéfice de performance non mesuré compte pour nul |
| La transaction reste au grain du **usecase**, même sur plusieurs Aggregates | ADR 25, sur un motif mesuré : les événements dans les transactions ont causé des deadlocks en production | `A7` de `racine-agregat/README.md` devient une question de conception et non la règle appliquée. `X4` passe en *rien à faire*. `U7` gagne son critère |
| Pas d'ADR sur la stabilité du format des réponses HTTP | Ce que font les applications front n'est pas le sujet de ce corpus. Et deux tiers de l'écart se règlent par un outil plutôt que par une procédure | `X3` de `serialiseur/ecarts.md` se réduit à une règle : ne jamais redéfinir le sens d'une valeur existante. Le reste attend le paquet partagé — voir `migration-typescript.md` |

## Les autres fichiers

| Fichier | Rôle |
| --- | --- |
| `invariants-clean-archi-ddd.md` | document transverse : écarts par famille, grille coût/bénéfice, discriminant entre catégories de modèles |
| `references-ddd.md` | bibliographie, avec la liste de ce qui n'a **aucune** source |
| `migration-typescript.md` | **se périme** : ce qui empêche aujourd'hui le typage de vérifier quoi que ce soit, et l'ordre de migration d'une chaîne. Une fiche y renvoie plutôt que de décrire un obstacle transitoire |
| `parcours/ajouter-un-point-d-entree-http.md` | **parcours**, pas une fiche : séquence route / contrôleur / sérialiseur pour l'ajout d'un point d'entrée HTTP. Aucun invariant propre |
| `rapport-divergence-<contexte>.md` | l'écart entre la cible et le code réel, un par contexte |

---

## État de la relecture

Relecture par agent, une par fiche, le 2026-09-08. **Sept sur onze relues** ; quatre ont échoué sur la
limite de session. `read-model/README.md`, créée depuis, porte le total à douze.

Les douze fiches ont la structure du gabarit : sommaire, dix sections dans l'ordre, écarts en cinq
colonnes numérotés `X`, checklist marquée `[auto]` / `[partiel]` / `[humain]`, section sur le type
réduite à ce qui survit à la migration. Le détail du gabarit n'est vérifié que pour les six fiches
domaine : voir la passe du 2026-09-23 ci-dessous.

Ce que ça ne dit pas : aucune n'a été relue par un tiers **dans cet état**. La relecture par agent du
2026-09-08 portait sur les versions antérieures.

| Fiche | Relue | État |
| --- | --- | --- |
| `repository/README.md` | oui | **corrigée** le 2026-09-08. `I7` retiré — c'est un invariant du modèle, il vit sous `E5` de `entite/README.md` avec sa vérification par knip. `X3` précisé : la forme ambiante a remplacé la forme **prescrite par l'ADR 9** sans décision écrite, l'ADR 25 ayant remplacé le 9 sans redécider ce point. Invariant `I11` ajouté, `I8` retiré — il rendait la source visible dans le nom du fichier, ce qui contredit l'uniformité de la couche posée au § 1. Le numéro n'est pas réattribué. Le gabarit en est sorti vers ce fichier ; dix sections, `Sources` au § 10. Sommaire ajouté, et le § 6 dit désormais lesquelles de ses lignes sont datées |
| `specification/README.md` | oui | **corrigée** le 2026-09-08. `S1`/`S2` départagés en distinguant trois cas — donnée absente, arbre malformé, donnée inexploitable. Test `S7` corrigé : il inspectait le prototype au lieu d'une instance. `S3`, `S4` et `S9` retirés, ils réénonçaient `V4`, `V1`/`V2`/`V6`/`V7` et `V3` ; numéros non réattribués. Le candidat est reclassé Value Object, pas read-model |
| `objet-valeur/README.md` | oui | **corrigée** le 2026-09-08, puis **scindée**. Le read-model en est sorti vers sa propre fiche. Quatre tests de discrimination ajoutés au § 1, écarts refaits au format en cinq colonnes, `X5` ajouté sur la clé de présentation, définition d'« objet du domaine local » ajoutée. Numéros d'écart commençant à `X2`, non réattribués. Devient le domicile des invariants mécaniques pour le read-model **et** la Specification |
| `read-model/README.md` | — | **créée** le 2026-09-08 par scission de `objet-valeur/README.md`. Jamais relue par un tiers |
| `racine-agregat/README.md` | oui | **corrigée** le 2026-09-08 avec la fiche Entity, puis **rectifiée** : `A7` est l'invariant de la littérature et Pix a décidé l'inverse pour le cas échouer-ensemble — ADR 25, sur un motif mesuré. `X4` passe de *vestige à surveiller* à *convention assumée, rien à faire*. `A4` et `A5` retirés — duplications de `E7` et `E3` à ROI inversés ; numéros non réattribués. Section d'invariants hérités ajoutée. Écart `X2` ajouté : aucune racine n'est déclarée, ce qui bloque `A1` et `A3` |
| `service-domaine/README.md` | oui | **corrigée** le 2026-09-08 avec la fiche usecase. Prémisse fausse retirée : le problème n'est pas une catégorie vide mais un dossier qui mélange deux natures. ROI classé et section sur le type ajoutés — les deux éléments du gabarit qui manquaient. `D6` retiré : c'était une déduction de `D1` et le contenu du § 8. Devient le domicile du discriminant usecase / service |
| `api-interne/README.md` | oui | **corrigée** le 2026-09-08. `P5` a une source : la documentation liée à l'ADR 55 décide `application/api/models/`. `X3` est donc une convention non appliquée, pas une décision à prendre. `P3` se vérifie en régénérant `API.md` et en comparant. Le § 4 dit pourquoi le ROI de cette couche est décalé dans le temps |
| `controleur/README.md` | oui | **corrigée** le 2026-09-08, puis **répercutée** après lecture de l'ADR 13 — qui conforte `C2` mais dont l'état est `Proposed`. `C2` gagne le cas de la transaction ouverte dans le contrôleur, vestige de l'ADR 9. L'écart « contrôle des droits dans le contrôleur » n'y est plus énoncé : il vit sous `X1` de `route/ecarts.md`, où sont sa correction et sa vérification |
| `entite/README.md` | **non** | **corrigée** le 2026-09-08 sans avoir été relue par un tiers. Devient le domicile de `E3` et `E7`, que la fiche Aggregate Root dupliquait. Écarts refaits en `X1` à `X5`. À faire relire |
| `usecase/README.md` | **non** | **corrigée** le 2026-09-08 sans avoir été relue par un tiers, puis **répercutée** après lecture des ADR 9 et 25. `U7` est sourcé et donne un critère net : échouer-ensemble → une transaction sans événements, indépendant → pas de transaction. Le § 4bis a disparu : le discriminant vit dans `service-domaine/README.md`, cette fiche y renvoie. Écarts refaits en `X1` à `X5`, dont deux que d'autres fiches traitaient depuis l'autre bord. À faire relire |
| `route/README.md` | **non** | **corrigée** le 2026-09-08 sans avoir été relue par un tiers, puis **deux fois rectifiée** le même jour. `R2` a une source — la documentation d'architecture Pix. Et l'écart `X2` que j'y avais ajouté était faux : `auth: false` déclare déjà une route publique, donc la vérification de `R2` n'a aucun préalable. Numéro `X2` retiré |
| `serialiseur/README.md` | **non** | **corrigée** le 2026-09-08 sans avoir été relue par un tiers. `M3` est le seul invariant du corpus dont la vérification ne peut pas vivre dans ce dépôt : ses consommateurs sont hors du dépôt |

**Correction du 2026-09-08 sur `R2`.** Ce fichier affirmait que son raisonnement n'était écrit nulle
part et que c'était le manque le plus criant du corpus. C'est faux : la documentation d'architecture
Pix — espace Confluence EDTDT, page « 4.Application » — le prescrit explicitement. Voir
`references-ddd.md`, section « La documentation d'architecture Pix ».

Ce qui reste vrai, et plus étroit : `R2` n'est adossé à **aucun ADR**, sa source vit hors du dépôt, et
le **motif** que `route/README.md` lui donne — un contrôle oublié se voit — n'est pas celui de la
documentation. C'est ce qu'un ADR gagnerait à trancher.

## Passe d'ancrage des exemples — 2026-09-10

Chaque invariant des douze fiches porte désormais un exemple pris dans du code qui existe. La règle 1
du gabarit reste tenue : aucun nom de contexte, aucun chemin, aucun état constaté — les exemples citent
des **formes de code et des concepts métier réels**, pas des divergences.

**La passe a corrigé cinq affirmations, en cherchant le code plutôt qu'en le supposant.**

| Fiche | Ce que le code a dit |
| --- | --- |
| `route/README.md` | `X1` — le contrôle des droits écrit dans le contrôleur — n'a **qu'une occurrence**, et sa cause est identifiable : l'identifiant de la ressource est une clé concaténée qui contient le propriétaire, donc aucun pre-handler générique ne peut faire le contrôle. C'est la clé de présentation de `V2` qui produit une conséquence sur la couche d'accès |
| `route/README.md` | La vérification de `R2` doit reconnaître **trois** formes, pas deux : un pre-handler, `auth: false`, ou une stratégie d'authentification explicite. La troisième est rare mais réelle, et un script qui l'ignore signale du code correct |
| `serialiseur/README.md` | Les conditionnels réellement présents dans les sérialiseurs relèvent du **nommage du transport** et du nettoyage d'une valeur — tous légitimes. La règle annoncée pour `M1` aurait sorti sur du code correct. Elle porte désormais sur les conditions **sur l'objet sérialisé**, ce qui la fait passer de vingt-cinq à quarante lignes |
| `api-interne/README.md` | `X5` — le DTO qui recopie le modèle — n'a **aucune occurrence** relevée : les DTO existants sont des projections de deux ou trois champs, aux noms choisis pour l'échange. L'écart reste énoncé comme vigilance, pas comme chantier. Idem pour `X4`, l'API qui transite vers un contexte tiers |
| `usecase/README.md` | `X1` est plus fort que ce qui était écrit : le test dupliqué n'est pas hypothétique, il existe **déjà** à l'intérieur du modèle, dans la méthode qui attache une organisation |

**Une découverte non prévue** a été écrite dans `api-interne/README.md` : une API interne expose la
**configuration de sérialisation** de son contexte. Le voisin reçoit de quoi produire lui-même la
réponse HTTP, donc le format de sortie d'un contexte devient une dépendance de l'autre. Aucun
invariant ne l'interdisait, parce que le cas n'avait pas été imaginé.

**Ce que la passe n'a pas pu faire.** Mesurer les taux de faux positifs annoncés dans les § 6 — cela
demande d'écrire les règles, pas de lire des fichiers. La réserve posée sur `M1` est la seule qui
s'appuie sur un échantillon compté.

## Passe du 2026-09-23 sur les fiches domaine

Périmètre : `entite/README.md`, `objet-valeur/README.md`, `racine-agregat/README.md`,
`read-model/README.md`, `service-domaine/README.md`, `specification/README.md`. Les six autres fiches
ont eu la même passe le 2026-09-24, voir ci-dessous.

Quatre étapes, dans cet ordre.

**1. Conformité au gabarit.** Un audit point par point du gabarit a trouvé des écarts dans les six
fiches. Ils sont corrigés :

- tables du sommaire classées par ROI dans `objet-valeur/README.md` et `read-model/README.md` ;
- paires conforme / fautive ajoutées pour `A3`, `A6`, `A7`, `RM2`, `RM3`, `RM4`, `S2`, `S6`, `S7` et
  `S8` ;
- invariants empruntés à `entite/README.md` mis en table dans `racine-agregat/README.md` ;
- décompte des checklists corrigé : il reste huit lignes, pas sept, dans `racine-agregat/README.md`
  et `service-domaine/README.md` ;
- renvois morts réparés : `X7` et `X2` dans `entite/README.md` ;
- dates de décision et récits de révision retirés ;
- ROI « exemption » de `RM2` remplacé par « hygiène », le seul niveau du gabarit qui lui correspond.

**2. Origine des exemples.** Chaque bloc de code a été recherché dans `api/src`. La règle est
maintenant écrite dans le gabarit : un exemple fautif est du code réel, un exemple conforme est du
code réel ou la version corrigée du même extrait. Environ quinze exemples inventés ont été remplacés
par du code réel. Les seules formes fautives sans occurrence réelle sont signalées comme
hypothétiques : les invariants concernés ne sont violés nulle part.

**3. Simplification de la prose.** Les règles de langue sont écrites dans la règle 2 du gabarit.
`service-domaine/README.md` a été réécrite en premier et sert de référence. Titres, ancres, tables et
blocs de code n'ont pas changé.

**4. Revue adversariale, puis relecture complète.** Une revue par fiche a comparé la prose simplifiée à la version d'avant.
Elle a trouvé des pertes de sens, dues à des remplacements de mots mécaniques et à des liens logiques
coupés, et des contradictions plus anciennes, surtout dans les checklists et au § 6. Les deux sont
corrigées, et la règle 2 du gabarit dit maintenant comment les éviter. Une relecture complète des six
fiches a suivi. Elle a remplacé les derniers exemples inventés et aligné les statuts de checklist
entre fiches : une ligne qui couvre l'horloge ou un accès imbriqué n'est pas `[auto]`.

Ce qui reste ouvert :

- Réglé le 2026-09-24 : la clé de présentation se compose dans le sérialiseur, quel que soit l'objet
  qui la porte aujourd'hui. `X5` de `objet-valeur/ecarts.md` reste l'énoncé unique, et
  `read-model/README.md` y renvoie déjà.
- Aucune des six fiches n'a été relue par un tiers après cette passe.

## Passe du 2026-09-24 sur les autres fiches

Périmètre : `repository/README.md`, `usecase/README.md`, `api-interne/README.md`,
`controleur/README.md`, `route/README.md`, `serialiseur/README.md`, et le parcours
`parcours/ajouter-un-point-d-entree-http.md`.

Même processus que pour les fiches domaine, appliqué par le skill `technical-writing` : conformité
au gabarit, exemples vérifiés dans le code, simplification et ton de référence, puis vérification
par inventaire des faits, revue adversariale et lecteur neuf.

Ce que la passe a trouvé et corrigé :

- des exemples inventés ou déformés dans chaque fiche, remplacés par du vrai code ou dits
  hypothétiques ;
- des paires conforme / fautive manquantes, surtout dans les fiches usecase, API interne, route et
  contrôleur ;
- des décomptes de checklist faux dans chaque fiche ;
- deux titres hors gabarit dans `repository/README.md` (§ 5 et § 7), renommés ;
- des restes de `I7`, retiré, dans `repository/README.md` ;
- des affirmations fausses sur le code : `X4` de `api-interne/ecarts.md` disait n'avoir aucune
  occurrence ; `controleur/README.md` renvoyait à `X4` au lieu de `I4` ;
- dans le parcours, un `U1` qui était `U4`, et `R2` réduit à deux de ses trois formes.

Ce que l'équipe a décidé après la passe :

- `X4` de `controleur/ecarts.md` devient un vestige à corriger : la cible est l'injection des
  usecases dans le contrôleur, comme le fait déjà devcomp.
- Le script de `R2` ne produit aucun faux positif : il liste les routes authentifiées sans
  restriction, sans les faire échouer, et leur examen reste en revue.
- Un usecase ne reçoit jamais une API interne directement : elle passe par un repository du contexte,
  l'Anticorruption Layer de l'ADR 55. C'est l'écart `X6` de `usecase/ecarts.md`, à corriger.
- Un écart énoncé dans deux fiches n'est gardé qu'une fois. `X5` de `repository/ecarts.md` est retiré
  au profit de `X3` de `usecase/ecarts.md`. `X3` de `racine-agregat/ecarts.md` est retiré au profit de
  `X4` de `repository/ecarts.md`.
- Un repository obtient toujours sa connexion par `DomainTransaction`. C'est le nouvel invariant `I12`
  de `repository/README.md` ; `X3` n'attend plus qu'un ADR.
  Le datamart, une autre base, en est exempté.
- Un DTO n'expose que les champs que ses consommateurs lisent. C'est le nouvel invariant `P9` de
  `api-interne/README.md` ; `X5` devient une dérive à corriger.
- Aucune règle métier dans un sérialiseur, exports CSV compris. `X5` de `serialiseur/ecarts.md` décrit
  l'écart sur les CSV. `X4` de `repository/ecarts.md` devient une dérive à corriger : un découpage en
  plusieurs repositories ne se justifie que par une mesure de charge.

Toutes les questions ouvertes de cette passe sont décidées.

## Passe du 2026-09-24 : découpage Diátaxis, pilote `repository/`

Un rapport d'étonnement d'un technical writer externe, sur l'ancienne `repository/README.md`, a montré
que la fiche servait trois lecteurs à la fois : le développeur, le relecteur, et l'équipe qui décide
de l'architecture et de l'outillage. Décision : un dossier par type de fichier, découpé selon
Diátaxis. Le gabarit est dans `gabarit.md`. Le pilote est `repository/` :

- `README.md`, la référence : règles applicables aujourd'hui, exceptions, exemple complet, tests,
  checklist ;
- `explication.md` : ROI, histoire des décisions, théorie des écarts, sources détaillées ;
- `outillage.md` : les vérifications à mettre en place ;
- `ecarts.md` : le suivi des écarts, daté.

Erreurs du rapport corrigées au passage :

- l'ordre des invariants, différent entre le sommaire, le ROI et la checklist ;
- le verdict de `X4`, qui ne découlait pas de la règle de verdict écrite ;
- l'exemple fautif de `I1`, qui renvoyait un booléen, donc un scalaire autorisé ;
- l'étape 1 de la règle de `I1`, qui ne détectait pas son propre exemple ;
- la même fonction conforme pour `I2` et fautive pour `I10` ;
- l'index présenté comme une exception de `I5` ;
- les statuts de checklist de `I2` et du signal de `I10`.

Le pilote validé, les onze autres fiches ont été découpées le même jour, sur le même modèle. Voir la passe suivante.

### Numéros retirés

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

### Questions ouvertes nées du pilote

Réglées le 2026-09-24 :

- Les tests d'un repository adossé à un service HTTP externe : intégration, le service intercepté
  par `nock`. Ajouté aux tests attendus.
- La portée de `I6` : un seul régime, tout repository est dans l'index. Les contextes qui câblent
  autrement forment l'écart `X7` de `repository/ecarts.md`.
- Le grain de chargement et le dossier `aggregates/` : la décision existe. `X1` de
  `racine-agregat/ecarts.md` réserve le dossier aux vrais Aggregates, et `X4` de
  `repository/ecarts.md` fixe un repository par Aggregate, les lectures sans invariant passant par un
  read-model.
- Le nom de contexte dans l'arborescence de `A3` : accepté, un exemple illustre la règle.

- La définition d'« objet du domaine local » et `shared/domain/` : un modèle du Shared Kernel compte
  comme local. `shared/` a servi de fourre-tout, et certains modèles devraient vivre dans un Bounded
  Context : c'est DDD-5 de `invariants-clean-archi-ddd.md`, un écart de découpage.

## Passe du 2026-09-24 : découpage des onze autres fiches

Chaque fiche est devenue un dossier sur le modèle de `repository/`, avec des permaliens vers le commit
`bd5b0b8` de `dev`. L'ancienne `fiche-application.md` est devenue
`parcours/ajouter-un-point-d-entree-http.md`. Les 228 permaliens du corpus mènent à un fichier et à
des lignes qui existent au commit cité.

Les permaliens ont fait apparaître des exemples qui ne correspondaient pas au code. Ils sont alignés
sur le code, ou dits simplifiés ou hypothétiques. Les plus notables :

- l'exemple fautif de `V7` n'était pas une violation, et l'exemple conforme de `V1` et `V2` était
  hypothétique ;
- l'exemple de `X1` de `service-domaine/` et l'arborescence de `X4` de `entite/` mélangeaient des
  contextes ;
- les deux dossiers `aggregates/` de `X1` de `racine-agregat/` sont dans le même contexte, pas dans
  deux ;
- plusieurs extraits de `specification/` et `serialiseur/` s'écartaient du code réel.

### Questions ouvertes nées du découpage

- Réglé : `C3` admet les deux formes d'injection, l'enveloppe de la route par défaut et la valeur par
  défaut du troisième paramètre. `X4` de `controleur/` passe « à surveiller » jusqu'à l'alignement.
- Réglé : la grille de verdict dit maintenant « à corriger : le coût dépasse le bénéfice, ou le
  bénéfice s'obtient autrement », ce qui correspond aux verdicts rendus.
- Réglé : `Section` de devcomp est une Entity, interne à l'Aggregate `Module`. L'exemple conforme de
  `V3` de `objet-valeur/` devient `QrocmSolutions`.
- Réglé : la clé de présentation se compose dans le sérialiseur (cas 1), et une clé que le client
  renvoie reste dans un Value Object qui la construit et la découpe (cas 2). Dans tous les cas, la
  réponse de l'API reste identique : seule la construction de la clé se déplace.

## Ordre de relecture proposé

1. ~~`objet-valeur/README.md`~~ — **corrigée le 2026-09-08.** Elle livre la définition d'« objet du
   domaine local » dont dépendent I1 et I2 de la fiche repository, et le discriminant avec le
   read-model. `read-model/README.md`, issue de la même passe, n'a jamais été relue par un tiers : à
   faire relire avant les autres, puisqu'elle est neuve et non éprouvée.
2. ~~`entite/README.md`~~ puis ~~`racine-agregat/README.md`~~ — **corrigées le 2026-09-08**, ensemble
   comme prévu. Les duplications A4/E7 et A5/E3 sont résolues : l'énoncé vit dans la fiche Entity, la
   fiche racine y renvoie et ajoute ce qui change pour une racine. Aucune des deux n'a été relue par
   un tiers dans cet état.
3. ~~`usecase/README.md`~~ et ~~`service-domaine/README.md`~~ — **corrigées le 2026-09-08**, ensemble
   comme prévu. Leur frontière est un test unique — la présence d'une I/O dans la signature — et il
   est désormais énoncé une seule fois, dans la fiche service. Aucune des deux n'a été relue par un
   tiers dans cet état.
4. ~~`route/README.md`~~ — **corrigée le 2026-09-08.** `R2` reste sans aucune source : c'est le point
   à arbitrer, et il relève d'un ADR plutôt que d'une relecture de fiche.
5. ~~`api-interne/README.md`~~ — **corrigée le 2026-09-08**, puis **répercutée** le même jour après
   lecture de la documentation liée à l'ADR 55. La relecture avait raison : `P5` est décidé —
   `application/api/models/`. `X3` cesse d'être une décision à prendre et devient une convention à
   appliquer, corrigeable par codemod. La même page donne le script de génération de `API.md`, ce qui
   rend `P3` vérifiable par régénération et comparaison.
6. ~~`controleur/README.md`~~ et ~~`serialiseur/README.md`~~ — **corrigées le 2026-09-08**.

---

## Justification des regroupements

Quatre découpages ont été discutés puis tranchés. Les raisons sont ici pour ne pas les rejouer.

**Une fiche par catégorie de modèle, pas une fiche commune.** L'argument pour une fiche unique — le
discriminant entre catégories n'appartient à aucune — ne tient pas : le gabarit a déjà un emplacement
pour ça dans chaque fiche, la table « ce que ce fichier n'est pas ». Et trois arguments penchent pour
la séparation : la checklist est l'artefact opérationnel et on relit **un** fichier à la fois ; les
invariants d'une Entity et d'un read-model ne sont pas des variantes d'une même chose ; la vérification
déterministe diffère aussi (règle ESLint, revue humaine, test).

**Le read-model a sa fiche.** Trois découpages ont été tenus successivement le 2026-09-08, et il faut
les trois pour comprendre la position finale.

1. *Variante du Value Object* — abandonné. L'anémie est précisément ce qui fait qu'un tel objet
   n'est pas un Value Object ; un sac immuable sans comportement est un DTO au sens de Fowler.
2. *Catégorie sœur dans la même fiche* — abandonné aussi. Deux des trois critères de séparation énoncés
   plus haut tranchaient contre : on relit **un** fichier à la fois, et une checklist commune force le
   relecteur à sauter des lignes annotées — le reproche exact qui a fait éclater la fiche
   « application ». Seul le troisième critère, la vérification déterministe, plaidait pour l'union.
3. **Deux fiches.** L'argument qui retenait l'union — le discriminant n'appartient à aucune des deux
   catégories — ne tient pas : ce fichier avait déjà tranché que le gabarit prévoit un emplacement
   pour ça, la table « ce que ce fichier n'est pas ».

L'argument décisif est pédagogique. Présenter le read-model comme « V3 et V5 ne s'appliquent pas » le
décrit comme un **Value Object défectueux**, et c'est ce cadrage qui rendait la distinction
insaisissable. Deux fiches obligent chaque catégorie à se tenir sur ses propres termes.

Le discriminant reste : **le domaine raisonne-t-il avec cet objet ?**, avec quatre tests applicables
en revue.

**Le mot `read-model` est conservé**, décision du 2026-09-08 qui renverse un verdict précédent. Il
avait été classé « à corriger » au motif que le renommage débloquerait une vérification par règle de
chemin. C'était faux : `domain/models/` et `domain/read-models/` sont déjà des dossiers frères dans
une quinzaine de contextes, donc la règle est écrivable telle quelle. Le renommage n'apportait rien,
et le mot est celui de l'équipe — l'Ubiquitous Language est la langue de l'équipe, pas celle du livre.
Ce qui reste à faire est le **classement** des fichiers, pas le renommage : c'est l'écart `X1` de
`read-model/ecarts.md`.

**Où vivent les invariants communs.** `invariants-clean-archi-ddd.md` semblait l'endroit, puisque ce
fichier le décrit comme portant le « discriminant entre catégories de modèles ». Écarté : ce document
est un **état des lieux daté**, et y placer du contenu stable casserait la règle qui fonde le corpus
— les fiches sont pérennes, le reste se périme. Les cinq invariants mécaniques restent donc énoncés
dans la fiche Value Object, et la fiche read-model y aiguille.

**La Specification est à part.** Un moteur de règles composable et piloté par des données a pour
invariants la totalité, la pureté et la fermeture par composition — pas l'identité et le cycle de vie.

*Contradiction arbitrée le 2026-09-08.* Il était écrit ici que le candidat évalué par une Specification
est un read-model, ce que `R3` interdisait. Le discriminant tranche : si une règle lit ses valeurs pour
décider, le candidat n'est pas un DTO, c'est un Value Object, et V3 et V5 s'appliquent à lui. `Q3` est
devenu un test de classement, pas une interdiction.

**Le Domain Service a sa fiche, malgré une catégorie clairsemée.** L'argument inverse a été tenu
puis abandonné : il était incohérent avec la fiche Aggregate Root, défendue **parce que** la notion
est creuse. Une fiche est utile quand elle donne le critère de jugement, pas seulement quand la
catégorie est peuplée. *Correction issue de la relecture : la catégorie n'est pas « presque vide » —
33 vrais services sur 109 fichiers, dix contextes sur vingt à zéro.*

**Route, contrôleur et sérialiseur ont chacun leur fiche.** Elles ont d'abord été regroupées sous une
fiche « application », au motif qu'on les touche ensemble. Abandonné pour la même raison que la fiche
modèle commune : trois familles d'invariants sous une couverture, c'était trois fiches déguisées en
une, et la checklist mélangeait des critères qu'on ne relit jamais ensemble. Ce qui était juste dans le
regroupement est préservé par un parcours séparé, `parcours/ajouter-un-point-d-entree-http.md`.

**Les DTO de contrat vont avec l'API interne**, pas avec les Value Objects : ce sont des formats
publiés, et leurs invariants sont ceux d'un contrat — stabilité, documentation, indépendance de
l'appelant.

---

## Gabarit des fiches

La structure des fiches est désormais celle de `gabarit.md`. Les règles de langue, de ton et
d'exemples de cette section restent en vigueur, et `gabarit.md` y renvoie.

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
   - L'illustration **fautive** est un extrait du code réel, simplifié au besoin, sans champ ni
     signature inventés. Si aucune violation n'existe dans le code, la forme fautive est dérivée du
     code réel et dite hypothétique.
   - L'illustration **conforme** est un extrait réel quand il en existe un. Sinon, c'est la version
     corrigée du même extrait fautif : mêmes classes, mêmes champs.
   - Aucune classe inventée pour l'occasion.
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
   - Le verdict découle des deux : **À corriger** quand le coût dépasse le bénéfice, ou quand le
     bénéfice s'obtient autrement, *À surveiller*, ou *Rien à faire*. « Convention assumée » ne dispense pas de l'examen.
   - **Un bénéfice de performance invoqué sans mesure compte pour nul.** C'est la règle la plus utile
     de la grille, parce que c'est le motif le plus fréquent des dérives structurelles : on évite un
     chargement, on multiplie les modèles, et personne n'a constaté le problème que ça résout. Le coût,
     lui, est toujours certain. Une mesure change le verdict ; une intuition non.
   - **Table triée par verdict**, les à corriger en premier, avec un écart numéroté par ligne. Les
     écarts se numérotent **`X1`, `X2`, …**, jamais avec le préfixe d'invariant de la fiche : sinon
     `E3` l'invariant et `E3` l'écart coexistent, ce qui s'est produit sur `entite/README.md`.
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

Concrètement, d'après les guides de langage clair (ISO 24495-1) et Diátaxis pour la documentation de
référence :

- Une idée par phrase, vingt mots au plus. La règle d'abord, le motif ensuite.
- Voix active, le verbe plutôt que le nom.
- Pas d'incise en tiret cadratin dans la prose. Un point, deux points ou une phrase de plus.
- Du gras seulement sur le terme à repérer, une fois par paragraphe au plus.
- Des mots courants, un seul mot pour une même chose. Pas de jargon maison : « se déclencher » et non
  « sortir sur », « s'appliquer » et non « mordre », « borne » ou « écrivable » à éviter. Remplacer
  un mot selon le sens de la phrase, jamais mécaniquement : « trancher un débat » devient « régler un
  débat », « trancher entre deux options » devient « choisir ».
- Couper une phrase ne doit pas couper son lien logique. Garder les « parce que », « donc », « sauf
  si », et vérifier que chaque pronom désigne encore le bon nom. En cas de doute, répéter le nom.
- Simplifier ne doit pas affaiblir une règle : « ne doit pas pouvoir » n'est pas « ne doit pas ».
- Une fiche est une référence au sens de Diátaxis : elle énonce une règle et son statut. Elle ne
  conseille pas, ne suppose rien de ce que l'équipe voudra, n'emploie pas « on ». Les consignes à
  l'infinitif ou à l'impératif vivent seulement dans les rubriques **Correction** et **Ordre de mise
  en œuvre**. Une condition qui changerait un verdict s'écrit sous l'étiquette **Révision.**, comme un
  fait. Ce qui relève de la conduite du chantier va dans l'encadré « À instruire » ou dans l'index.
- Les noms de patterns DDD restent en anglais, comme dans les ADR et les dossiers du code : Bounded
  Context, Entity, Value Object, Aggregate, Aggregate Root, Repository, Domain Service,
  Specification, Ubiquitous Language, Published Language, Anticorruption Layer. Le genre suit le mot
  français : une Entity, un Value Object, une Aggregate Root. `read-model` garde sa graphie d'équipe.
- Aucune phrase qui commente la fiche elle-même, ni qui prête une intention à l'auteur du code.
- Trois éléments ou plus dans une phrase deviennent une liste.

`service-domaine/README.md` sert de référence pour ce niveau de langue.

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
| Une séquence de fichiers à toucher ensemble | `parcours/ajouter-un-point-d-entree-http.md`, qui est un parcours |

Restent dans la fiche, malgré les doutes : le **type de test par variante** (§ 8) et la **checklist**
(§ 9). Le type de test fait partie de la recette du fichier, et il porte des indices de diagnostic qui
ne se déduisent d'aucune autre section. La checklist est aujourd'hui le seul mécanisme d'application,
aucune règle du § 6 n'étant en place.
