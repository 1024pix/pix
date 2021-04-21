# 23. Précision sur les transactions et les événements métier

## État

Amende [0009-transaction-metier.md][0009] et [0010-propager-domain-events-via-event-dispatcher.md][0010].

[0009]: ./0009-transaction-metier.md
[0010]: ./0010-propager-domain-events-via-event-dispatcher.md

## Contexte

On a eu plusieurs fois le problème d'avoir une instance de production qui
deadlock complètement son pool de connexions SQL à cause d'une requête dans une
transaction qui attend la fin d'une requête hors transaction qui elle-même
attend que la requête qui a démarré la transaction libère sa connexion.

Le problème est décrit dans cette page de wiki :

- https://1024pix.atlassian.net/wiki/spaces/DEV/pages/2504065029/Bloquage+du+pool+de+connection+sur+les+transactions

Des PRs qui documentent le problème :

- [BUGFIX: Modifier la sauvegarde du temps sur l'assessment][2767]
- [BUGFIX: Le mésusage de la DomainTransaction provoque des deadlocks dans le flux de complétion d'asssessment (PIX-2457)][2825]

[2767]: https://github.com/1024pix/pix/pull/2767
[2825]: https://github.com/1024pix/pix/pull/2825

Sur ces PRs, ce qu'on constate c'est qu'il n'est pas évident que tout code qui
est mis dans une callback de `DomainTransaction` doive faire l'intégralité de
ses requêtes SQL à l'intérieur de la même transaction. De déroger à cette
règle risque de provoquer une suite de deadlocks et de vider le pool de
requêtes d'instances en cas de forte charge sur la plateforme.

On constate aussi qu'il est difficile de savoir si utiliser des Domain Events
est possible en dehors d'une `DomainTransaction`.

## Décision

Au vu des informations ci-dessus, et comme les events sont un outil de
découplage, on décide de ne plus utiliser les events à l'intérieur de domain
transaction ni de transactions.

## Conséquences

Les événements ne doivent pas servir à enchaîner des traitements qui doivent
échouer ensemble ou réussir ensemble, ils doivent être utilisés pour des
enchaînements moins liés.

### Aucun rollback fourni par la BDD en cas d'erreur de traitement d'un événement

Si les traitements d'événements ne sont plus dans une transaction, alors
l'échec de traitement d'un événement n'entrainera plus le rollback automatique
des traitements qui ont déclenché cet événement.

### Les traitements qui doivent échouer ou réussir ensemble ne doivent plus utiliser d'événements

Conséquence de ce qui précède, si quand un traitement échoue il doit entrainer
un rollback du traitement précédent, alors le usecase qui les orchestre ne peut
plus utiliser un mécanisme de dispatch d'événement.

Exemple de traitements qui doivent échouer ou réussir ensemble dans le usecase
qui orchestre la complétion d'un assessment :

- L'assessment est marqué comme terminé, et sa date de complétion est
  enregistrée
- Si l'assessment ne correspond pas à un test de certification, si des badges
  ont été acquis, l'acquisition des badges est sauvegardée.
- Si l'assessment correspond à un test de certification, le score de
  certification est calculé puis sauvegardé.

### Appliquer cette décision dans le code

Il faut appliquer cette décision dans le code, par exemple le usecase
`complete-assessment` ne suit pas (encore) cette décision.

Pour les traitements qui doivent échouer ou réussir ensemble et qui utilisent
aujourd'hui de la chorégraphie par événements dans une transaction : conserver
la transaction et remplacer cette chorégraphie par événements par une
orchestration sans événements.

Pour les traitements qui peuvent échouer ou réussir indépendamment et qui
utilisent une chorégraphie par événements à l'intérieur d'une transaction,
supprimer la transaction.

### Ce qui n'est pas traité par cette ADR

Pour cette dernière option, on peut se poser la question suivante :
"Comment on gère les échecs de l'un ou l'autre des traitements?"

On peut imaginer une voie future possible, qui demanderait de monter en
compétences sur ce genre de sujets.

Par exemple, quand une série d'écritures sont liées entre elles
fonctionnellement mais ne sont pas liées par une transaction SQL, si l'une
d'elle échoue :
- pour une raison métier, charge à l'application de propager des actions de
  compensation / rollback des écritures déjà effectuées
- pour une raison technique, charge à l'application de réessayer jusqu'à
  réussir, ou de fournir un mécanisme de two phase commit.

L'autre voie serait de laisser les incohérences d'écriture se produire si elles
sont peu nombreuses, et de traiter les cas par un process explicite, par
exemple traitement par le support, par le pôle certif, autre ?
