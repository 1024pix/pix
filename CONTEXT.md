# CONTEXT

Glossaire du vocabulaire partagé. Uniquement des définitions : ni décisions, ni
détails d'implémentation.

## Vocabulaire de déploiement

Le mot « application » recouvre trois notions distinctes chez Pix. Les confondre
change les conclusions d'architecture, parce que seules deux d'entre elles
imposent de passer par le réseau.

### Application Scalingo

Unité de déploiement autonome : variables d'environnement, nom de domaine et
scaling propres. Deux applications Scalingo ne partagent pas de code et ne
peuvent communiquer que par le réseau.

Exemples : `api`, `maddo`, `audit-logger`.

### Type de conteneur

Process supplémentaire **au sein d'une même application Scalingo**, déclaré dans
son `Procfile`. Partage le code déployé et les variables d'environnement de
l'application, mais s'exécute dans un process distinct avec son propre point
d'entrée. Peut donc importer le domaine directement et ouvrir ses propres
connexions base, sans passer par le réseau.

Exemples : `web` et `worker` dans `api/Procfile`.

### Contexte borné

Frontière de code au sein d'un même dépôt, sans aucune portée en matière de
déploiement. Un contexte borné n'est pas une unité déployable : plusieurs
contextes cohabitent dans la même application Scalingo et dans le même process.

Exemples : `organizational-entities`, `prescription/target-profile`, `quest`.

## Vocabulaire de validation

Deux vérifications distinctes, souvent confondues sous le mot « validation ».
Elles ne se placent pas au même endroit, et pour une raison de fond : l'une parle
de forme, l'autre de vérité.

### Validation d'entrée

Vérification d'un champ pris isolément : type, présence, format, appartenance à
un ensemble de valeurs. Ne regarde jamais les autres champs ni les autres
entités.

Peut légitimement être répétée à chaque porte d'entrée, puisque chaque porte
reçoit ses données dans un format qui lui est propre.

### Invariant métier

Ce qui doit rester vrai **entre** plusieurs champs d'une même entité, ou entre
plusieurs entités. Exprime quelles combinaisons ont un sens, indépendamment de
la façon dont les données sont arrivées.

N'a qu'un seul emplacement possible : le domaine. Le répéter à chaque porte
d'entrée revient à admettre qu'il puisse diverger de lui-même.

## Vocabulaire du lot

Le mot « approbation » recouvrait trois notions distinctes, ce qui rendait
indicible le défaut principal du POC : une exécution avait lieu sans qu'aucun
humain n'ait rien confirmé. Les trois sont désormais nommées séparément.

### Lot

Ensemble indivisible d'opérations issues d'un même document déposé. Il n'existe
pas d'exclusion d'opérations : un lot est soumis en entier.

L'indivisibilité porte sur la **soumission**, pas sur l'exécution. Une exécution
peut être interrompue en cours, et laisse alors derrière elle les opérations déjà
effectuées.

### Recevabilité

Propriété d'un lot dont aucune opération n'est en erreur. C'est une condition
portant sur le lot lui-même, indépendante de toute intervention humaine. Un lot
non recevable ne peut pas être soumis.

### Assentiment

Geste par lequel une personne accepte qu'un lot recevable soit exécuté. Se
distingue de l'autorisation, qui dit ce qu'une personne a le droit de faire :
l'assentiment porte sur un lot précis, à un instant précis.

### Déclenchement

Acte technique qui lance l'exécution d'un lot. Distinct de l'assentiment :
un déclenchement sans assentiment est précisément le défaut à interdire.
