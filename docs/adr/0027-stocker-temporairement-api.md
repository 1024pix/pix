# 27. Comment stocker temporairement des données dans l'API ?

Date : 2021-05-28

## État
Adopté

## Contexte 

### Besoin fonctionnel

Nous avons besoin de stocker des données PE entre le moment où l'utilisateur :
- se connecte à son compte PE;
- accepte les CGU Pix, ce qui mène à la création de son compte Pix.

Ces données PE :
- sont issues du protocole OpenID, et ne peuvent être stockées dans le front;
- sont obtenues par un appel à l'API externe Pôle emploi;
- sont volatiles : au bout d'un certain temps, elles ne sont plus utilisables;
- peuvent n'être jamais lues, par exemple si l'utilisateur refuse les CGU

### Besoin technique

Nous avons besoin de partager des données volatiles entre deux appels API.

Les données seront : 
- écrites une fois;
- supprimées automatiquement au bout d'un certain délai

### Recherche de solution

Les appels à l'API externe Pôle emploi peuvent être opérés par des conteneurs API PIX différents, 
et les conteneurs étant par définition `stateless`, il n'est pas possible de stocker des données PE. 
- On ne peut pas stocker des données dans la mémoire du conteneur API PIX
- On ne peut pas stocker des données sur le filesystem du conteneur API PIX

Il faut donc stocker ces données en dehors des conteneurs API PIX.

Les données peuvent être stockées dans la base de données, mais leur caractère volatile
et la possibilité qu'elles ne soient jamais lues, confèrent de nombreux inconvénients 
à cette solution.

Les solutions restantes reposent sur le data-store [redis](https://en.wikipedia.org/wiki/Redis),
extérieur aux conteneurs API PIX et déjà utilisé.

L'utilisation existante est un [cache](./0005-ajout-d-un-cache-memoire-distribute-pour-le-contenu-pedagogique.md).
Il ne répond pas totalement à notre demande, car un cache :
- est conçu pour être lu de nombreuses fois;
- ne possède pas de mécanisme d'expiration si la donnée n'est plus utilisable

Par contre, le data-store lui-même offre les fonctionnalités suivantes :
- Sauvegarder une donnée pendant une certaine période, indiquée par un délai d'expiration (nombre de secondes) [cf. EX](https://redis.io/commands/set)

Deux possibilités s'offrent à nous :
- créer un composant dédié qui invoquera ces commandes sur le data-store;
- modifier le cache pour qu'il ne les invoque que dans un cas particulier

### Solution 1 : créer un composant dédié

Utiliser la class `RedisClient` 

Implémenter un composant avec le contrat suivant :
- `save`: écrire une clef avec une durée d'expiration;
- `get`: lire une clef
 
Avantage :
- explicite le comportement (pas de mention du cache)

Inconvénient :
- coût de développement d'un nouveau composant

### Solution 2 : modifier la solution de cache existante

Modifier la solution existante de [cache](./0005-ajout-d-un-cache-memoire-distribute-pour-le-contenu-pedagogique.md)
pour fournir un délai d'expiration.

Garder le contrat pour les clients existants.

Modifier le contrat pour un nouveau client :
- `set`: écrire une clef avec une durée d'expiration;
- `get`: lire une clef puis la supprimer

Avantages :
- le comportement attendu est contre-intuitif (le composant se nomme cache);
- pas de développement d'un nouveau composant

Inconvénient :
- couplage: risque de régression, d'évolutions hors scope

## Décision

La solution n°1 est adoptée, car elle est la plus maintenable

## Conséquences

Création d'un dossier `temporary-storage` sous le dossier `infrastructure`.

Afin de gérer les changements de délai d'expiration de l'API externe 
sans modifier le code, celui-ci sera paramétrable dans une variable d'environnement.
Celle-ci aura une valeur par défaut correspondant au délai connu à ce jour.
