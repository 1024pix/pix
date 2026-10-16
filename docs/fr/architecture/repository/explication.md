# Repository — explication

Pourquoi les règles de [`README.md`](README.md) existent, ce qu'elles rapportent, et d'où elles
viennent. Cette page ne prescrit rien : les règles sont dans la référence.

## Ce que le repository apporte

Le repository est un **port** au sens de l'architecture hexagonale de Cockburn, et une frontière au
sens de la Clean Architecture de Martin. Le domaine déclare ce dont il a besoin. L'infrastructure
l'implémente avec une base, un fichier, un service HTTP ou l'API d'un voisin. Le domaine ne sait pas
laquelle.

Cette lecture élargit celle d'Evans. Chez lui, un Repository retrouve les Aggregates de son propre
contexte. La lecture « port unique vers l'extérieur, contexte voisin compris » vient de la tradition
ports et adaptateurs. Evans fonde I1 et I2, pas ce cadrage.

Conséquence : la couche est uniforme, quelle que soit la source. La seule différence que la source
impose porte sur le type de test, parce que l'adaptateur connaît ce qu'il adapte. C'est pourquoi le
nom d'un fichier ne dit pas la source du repository : un invariant qui l'aurait exigé, l'ancien I8, a
été écarté.

### Le Shared Kernel

`shared/domain/` est le Shared Kernel au sens d'Evans : un noyau de modèle que plusieurs contextes
partagent par décision. Un repository qui renvoie un de ses modèles ne laisse donc pas entrer le
modèle d'un voisin, et I1 le compte comme local.

Dans les faits, `shared/` a aussi servi de fourre-tout. Certains de ses modèles appartiennent à un
seul Bounded Context et devraient y vivre. C'est un écart de découpage, décrit sous DDD-5 dans
`../invariants-clean-archi-ddd.md`. Le déplacer ne change rien pour I1 : le modèle reste local au
contexte qui le reçoit.

## ROI des invariants

| Invariant | Rentabilité | Ce qu'on gagne |
| --- | --- | --- |
| **I1** ne renvoie pas de structure de persistance | **forte** | Un renommage de champ chez un voisin devient une erreur dans la PR de ce voisin, au lieu d'une 500 en production. Sans l'invariant, le seul filet est un test d'acceptance qui couvre le chemin par hasard |
| **I4** erreurs du domaine uniquement | **forte** | Le contrat avec le front n'est pas le statut HTTP mais le code d'erreur. Une erreur non domaine sort sans code ni métadonnées |
| **I6** enregistré dans l'index du contexte | **forte** | Prévient un plantage à l'exécution. Garde l'index comme liste complète de ce que le contexte touche à l'extérieur |
| **I12** connexion par `DomainTransaction` | **forte** | Une requête sur la connexion importée échappe à la transaction en cours : l'écriture survit à un échec, et rien ne le signale |
| **I11** n'importe pas un autre repository | **forte** | Un repository qui en importe un autre fait de l'orchestration, là où ni I5 ni I10 ne la voient |
| **I10** signal : aucune fonction de lecture qui écrit | **forte** | Une fonction qui annonce une lecture et qui écrit trompe ses appelants, quel que soit le contenu de l'écriture |
| **I2** n'accepte pas de structure de persistance | moyenne | Corollaire de I1, sans mode de violation indépendant. Il figure à part parce que le reconditionnement se relit différemment de la fuite d'origine |
| **I3** `get*` lève, `find*` renvoie `null` | moyenne | Supprime deux erreurs symétriques à chaque site d'appel : le `if (!x)` mort après un `get*`, le déréférencement de `null` après un `find*` non testé |
| **I5** dépendances injectées, jamais importées | moyenne | Sans lui, le repository est intestable en unitaire, et l'index cesse d'être le point unique où les frontières sont lisibles |
| **I10** complet : aucune règle métier | réel, mais vérifiable en revue seulement | Une règle métier écrite dans un repository sera réécrite ailleurs, et une évolution du métier ne la trouvera pas |
| **I9** nommage cohérent dans le contexte | hygiène | Rend le fichier trouvable. Réduit le bruit de revue |

L'ordre de mise en œuvre de [`outillage.md`](outillage.md#ordre-de-mise-en-œuvre) suit le coût, pas
ce classement : I5 ne coûte qu'une ligne de configuration, alors que sa rentabilité est moyenne.

### Ce que ces invariants n'apportent pas

Ils ne disent pas si le modèle du domaine est le bon, ni si le découpage en contextes est juste. Ils
garantissent l'étanchéité des couches, pas la pertinence de la modélisation. I10 est celui qui touche
le plus au fond, et c'est aussi celui qu'aucun outil ne vérifie en entier.

Un invariant respecté sur un mauvais découpage a même un coût : le code s'appuie dessus, donc la
correction du découpage devient plus chère. Voir `../invariants-clean-archi-ddd.md`.

## Les décisions et leur histoire

### La connexion par `DomainTransaction`

Aucune source externe ne fixe la façon dont un repository reçoit sa connexion. La source est interne.

1. L'**ADR 9**, « Transactions métier », prescrivait la forme explicite : `domainTransaction`
   traversait la signature du usecase et celle du repository, avec une transaction vide par défaut.
2. L'**ADR 25**, « Précision sur les transactions et les événements métier », remplace l'ADR 9. Il ne
   traite que des événements dans les transactions, et ne redécide rien sur la forme de la connexion.
3. Entre-temps, la forme ambiante s'est imposée : le repository appelle
   `DomainTransaction.getConnection()`, qui rend la transaction en cours ou la connexion ordinaire.
4. Le 2026-09-24, l'équipe a confirmé cette forme : c'est I12. Aucun ADR ne la consigne encore.

Le motif est la propreté des signatures. La contrepartie est qu'un usecase ne dit pas s'il s'exécute
dans une transaction : la réponse est dans le fichier qui l'appelle. C'est `X3` de
[`ecarts.md`](ecarts.md).

**Une troisième forme, examinée et non retenue comme convention.**

```js
const getByCode = async ({ code, knexConn = DomainTransaction.getConnection() }) => { … };
```

Elle fonctionne : la valeur par défaut est évaluée à chaque appel, donc elle capte la transaction en
cours, et l'injection ne la gêne pas. Mais elle ne réduit pas le coût de X3, qui porte sur la lecture
d'un usecase : le usecase écrit toujours `getByCode({ code })`. Elle ajoute en plus un paramètre que
personne n'utilise, qui laisse croire que l'appelant décide de la connexion.

Elle est la bonne forme pour une fonction qui doit tourner sur une autre connexion que celle en
cours : hors transaction, sur un réplica de lecture, sur un pool distinct. Là, le paramètre sert.
D'où les deux exceptions légitimes de I12 qui en dépendent.

### Pourquoi un `Error` nu ne suffit pas

Le mappeur d'erreurs associe chaque erreur du domaine à un statut HTTP et à un code d'erreur. L'ADR
44 rend ce code obligatoire, parce que le front s'en sert pour traiter et traduire l'erreur. L'ADR 34
décide de nommer les contraintes de base par l'intention métier, ce qui rend la traduction d'une
violation de contrainte mécanique dans le repository.

### Pourquoi l'injection

L'ADR 46 décide l'injection des dépendances. Son motif : sous ESM, les exports d'un module sont
immuables, donc une dépendance importée ne peut pas être remplacée par une doublure de test. L'ADR 24
encapsule les appels HTTP derrière un composant dédié, que le repository reçoit comme les autres
dépendances.

## La théorie des écarts

### X1. Le port déclaré

Le domaine déclare l'interface dont il a besoin, l'infrastructure l'implémente. Sans déclaration, le
contrat n'a aucun support dans le code : il se résume au nom du paramètre que le usecase reçoit.

### X2. La persistance sur le modèle

Evans, *DDD*, ch. « A Model Expressed in Software » : le modèle ne porte pas de méthode dont le
repository est le seul consommateur. L'exception du format publié vient du ch. « Maintaining Model
Integrity », Published Language. La règle est `E5` de `../entite/README.md`.

### X4. Le grain de chargement

DDD associe un repository à une Aggregate Root, et un seul. Quand charger l'Aggregate entier coûte
trop cher, deux options se présentent : beaucoup de modèles, ou un modèle unique partiellement rempli
selon l'appel.

Le **modèle partiellement rempli est écarté**. Un Aggregate est défini par ses invariants. Chargé
partiellement, il ne peut pas les garantir. Fowler nomme cette forme : c'est la variante *Ghost* du
pattern **Lazy Load** de *PoEAA*. Il en donne le coût : l'objet doit savoir aller chercher ce qui lui
manque, donc la connaissance de la persistance entre dans le modèle. C'est X2. Choisir cette option
pour résoudre X4 aggrave X2.

La première réponse au coût de chargement est de **réduire l'Aggregate**, pour que le charger entier
soit bon marché. C'est la règle 2 de Vernon, *design small aggregates*, motivée par ce même coût.

Si une mesure montre qu'une lecture reste trop chère, cette lecture passe par un **read-model**, pas
par un second repository d'Aggregate. Une lecture qui n'a pas besoin d'invariants ne passe pas par
l'Aggregate. Elle requête directement et produit la forme adaptée. Vernon appelle cela une *use case
optimal query*.

Limite, selon Fowler : séparer lecture et écriture ajoute de la complexité et ne doit pas être le
défaut. La séparation se fait là où la pression de charge existe, donc là où elle est mesurée.

### X6. L'Anticorruption Layer

DDD appelle Anticorruption Layer la traduction du modèle d'un autre Bounded Context, et la range à
part. Pix ne fait pas cette distinction : le repository qui enveloppe l'API d'un voisin est
l'Anticorruption Layer, comme le décide l'ADR 55. C'est la lecture port / adaptateur : le domaine
ignore la source, donc la couche est uniforme.

## Sources

Bibliographie et liens dans `../references-ddd.md`. Les ADR sont dans `docs/adr/`.

| Invariant | Source | Où vérifier |
| --- | --- | --- |
| Le repository est un port, quelle que soit la source | Cockburn, « Hexagonal Architecture » ; Martin, « The Clean Architecture » | les deux gratuits en ligne |
| **I1** ne renvoie pas de structure de persistance, **I2** n'en accepte pas | Evans, *DDD*, ch. « The Life Cycle of a Domain Object » ; Fowler, « AnemicDomainModel » pour le symptôme inverse. ADR 55, qui accepte « la duplication possible des modèles dans les différents contextes » comme coût du découpage | *DDD Reference* (PDF gratuit) ; ADR 55 |
| **I3** `get*` lève, `find*` renvoie `null` | aucune source, ni externe ni ADR | — |
| **I4** erreurs du domaine uniquement | Evans, même ch. : extrapolation, pas une citation. ADR 44 et ADR 34 | ADR 34 et 44 |
| **I5** dépendances injectées, jamais importées | Martin, *Clean Architecture* (2017), ch. « The Dependency Inversion Principle ». ADR 46 et ADR 24 | ADR 24 et 46 ; pour Martin, le livre de 2017, pas le billet de 2012 |
| **I6** enregistré dans l'index du contexte | aucune source. Outillage Pix, conséquence de la forme d'injection de l'ADR 46 | ADR 46 |
| **I9** nommage cohérent dans le contexte | aucune source | — |
| **I10** aucune règle métier | Martin, *Clean Architecture* (2017), ch. « Business Rules » et « Presenters and Humble Objects » | le livre de 2017 |
| **I11** n'importe pas un autre repository | aucune source. Déduction : composer deux accès est de l'orchestration, ce que la table « ce que le repository n'est pas » attribue au usecase | — |
| **I12** connexion par `DomainTransaction` | décision d'équipe, sans ADR. ADR 9 et 25 pour l'histoire | ADR 9 et 25 |
| Grain de l'Aggregate, et le coût de chargement (X4) | Vernon, « Effective Aggregate Design », règle 2 *design small aggregates*. Vernon, *IDDD*, pour la *use case optimal query* | dddcommunity.org |
| Contre le modèle partiellement rempli (X4) | Fowler, *PoEAA*, pattern **Lazy Load**, variante *Ghost*. Fowler, « CQRS » sur son bliki | bliki gratuit en ligne |

Quatre invariants n'ont aucune source, ni externe ni ADR : I3, I6, I9, et I11, qui est une déduction.
I12 est une décision d'équipe sans ADR. La partie « erreur du domaine » de I4 est une extrapolation
d'Evans. Ce sont des conventions : elles se discutent sur leurs mérites, pas par appel à une autorité.
