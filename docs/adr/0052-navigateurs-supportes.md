# Support des navigateurs web

Date : 2023-08-16


## État

En cours


## Contexte

Pix est un service public, sans condition d'inscription. Il est en ligne, donc accessible via un navigateur web. Pix n'a ni la volonté ni la possibilité d'imposer un navigateur à ses utilisateurs, et doit pouvoir répondre à un large public, avec des navigateurs desktop/mobiles, qui peuvent parfois être obsolètes.

Nos frameworks et nos packages permettent de supporter les anciens navigateurs jusqu'à un certain point.

Le choix d'assurer la compatibilité avec tel ou tel navigateur a un impact écologique qu'il faut mentionner. D'un côté supporter des vieux navigateurs permet aux utilisateurs de pouvoir utiliser de vieux ordinateurs et téléphones et ainsi aux utilisateurs de garder leurs matériels informatiques plus longtemps. Mais d'un autre côté s'appuyer sur les nouvelles fonctionnalités natives des navigateurs récents (que ce soit au niveau de JavaScript ou des CSS) permet une réduction significative de la taille des paquets (bundles) produits téléchargés par les matériels des utilisateurs.

De plus pour la certification, le cahier des charges des centres de certifications indiquent que les navigateurs doivent avoir moins de 2 ans, mais que les établissements peuvent attendre la fin de l'année scolaire pour effectuer la mise à jour. Par sécurité avec les agendas scolaires, nous ajoutons un an à ce support minimum, nous gérons donc officiellement les navigateurs de moins de 3 ans.

De plus, EmberJs (le framework le plus utilisé pour développer les applications front de Pix) assure une *compatibilité garantie et testée* avec un ensemble de versions de navigateurs défini dans https://emberjs.com/browser-support/ qui pour simplifier correspond à :
* la dernière version des navigateurs les plus utilisés (Google Chrome, Mozilla Firefox, Microsoft Edge, Safari)
* la dernière version de Firefox édition longue durée (Firefox ESR), souvent utilisée dans les grandes structures, dans le secteur public, etc.
* les versions de navigateurs qui détiennent un minimum de 0,25% d'utilisation au niveau mondial

De plus, les utilisateurs de Pix utilisent généralement plusieurs applications front de Pix les unes à la suite des autres, voire simultanément, certaines applications étant plus ou moins couplées. Ainsi il serait absurde que certains utilisateurs soient bloqués dans leur parcours et utilisation de Pix par manque d'homogénéité dans les configurations de versions des navigateurs web supportées des dites applications.

Techniquement, généralement la configuration du support navigateur se fait via un fichier dans chaque projet front (via le fichier `/config/target.js` pour les applications EmberJs, ou via un autre fichier pour les autres frameworks/applications). C'est Babel qui s'occupe de la rétrocompatibilité, en utilisant [Browserslist](https://github.com/browserslist/browserslist) et [Can I Use](https://caniuse.com/) qui se basent sur les statistiques mondiales d'utilisation des navigateurs.

Au moment de l'écriture de cette ADR la définition par défaut des versions des navigateurs supportées de *Browserslist* au format texte colonne est celle ci-dessous.
L'ensemble des versions supportées est l'union des versions définies par chaque ligne. C'est à dire que chaque nouvelle ligne augmente le périmètre.

```dotenv
> 0.5%
last 2 versions
Firefox ESR
not dead
```

Actuellement le fichier `/config/target.js` des applications Pix réalisées avec EmberJs contient la configuration suivante :

```
`'> 1%', 'firefox 58'`
```

Cette configuration a plusieurs problèmes :
* cette configuration définit un périmètre beaucoup plus large que la *compatibilité garantie et testée d'EmberJs* et cherche donc à assurer une compatibilité souhaitée mais trop décalée par rapport à la réalité des contraintes de fonctionnement d'EmberJs
* cette configuration contient en dur une version spécifique d'un navigateur, ce qui oblige à une mise à jour manuelle régulière des fichiers et qui peut être oubliée

Enfin par ailleurs l'équipe *Support utilisateurs* a besoin de connaître le plus facilement possible les navigateurs supportés par Pix.


## Possibilités et réflexions

Par rapport au cahier des charges des centres de certifications, nous devons supporter au moins les navigateurs qui ont 3 ans.
Nous pourrions choisir de supporter des navigateurs plus anciens, pour éviter de pousser les personnes à changer de navigateur.
Mais si nous supportons des navigateurs trop anciens, nous avons d'autres problèmes : 
- certains de nos packages ne supportent plus les navigateurs trop vieux, ce qui demanderait de gros efforts de notre coté
- il peut y avoir des soucis de sécurité sur d'anciens navigateurs, ou sur d'anciens packages si nous restons sur des versions qui supportent de vieux navigateurs
- Pix se base aussi sur d'autres sites externes pour valider les compétences numériques, et ces sites ne supportent pas toujours les navigateurs trop vieux (en tout cas, nous n'avons aucune vérification de cela)

Donc nous souhaitons supporter les versions de navigateurs publiées jusqu'à il y a 3 ans, mais pas au-delà.
En août 2023, en analysant les navigateurs utilisés sur le mois de mai 2023, nous observons que la 5eme version la plus utilisée de Firefox est la version 78 (qui a 3 ans et demi), avec une utilisation globale autour de 0,8%.
Donc si nous voulons gérer les navigateurs de nos utilisateurs avec un peu de marge, une limite à 4 ans est intéressante.

Nous pourrions aussi nous baser uniquement sur des statistiques et les pourcentages d'utilisation mondiales ou français. Ces statistiques sont intéressantes pour s'assurer un bon service pour une population globale. Mais dans la population des utilisateurs Pix, il y a aussi des utilisateurs très identifiés (des grandes structures, des associations, des écoles, etc.) qui peuvent avoir une gestion de leur parc informatique spécifique avec des temporalités longues.
De plus, se baser uniquement sur le pourcentage ne permet pas d'avoir une liste claire de navigateurs supportés pour aider l'équipe *Support utilisateurs* à savoir sur quels navigateurs Pix fonctionne.

Nous pourrions nous baser uniquement sur une liste de navigateurs, mais cela demanderait : 
- d'avoir une liste assez exhaustive des navigateurs pour s'assurer de ne pas avoir d'oubli de situation
- de mettre plus souvent à jour la liste des navigateurs, notamment en cas d'arrivée d'un navigateur web ou mobile avec une forte utilisation.

Nous pourrions avoir des règles différentes par application, ou la même règle pour toutes les applications.
Pour des soucis de cohérence, la même règle pour toutes les applications semble être la meilleure solution. De plus : 
- l'équipe de développement travaille sur tous les front, donc une cohérence entre les versions de packages permettent d'éviter une adaptation à chaque front
- les front se basent sur Pix-UI pour le design, donc il faudrait une cohérence entre les front pour éviter d'avoir à gérer des navigateurs (et donc des packages possiblement) différents

Il faut noter qu'on ne peut pas établir une correspondance *véritablement exacte* entre une configuration *Browserslist* et la *compatibilité garantie et testée d'EmberJs* car les outils se basant sur *Browserslist* ont à la fois une approche additive et soustractive qui fait que par recherche d'optimisation tout ce qui ne sera pas utile aux versions des navigateurs souhaitées sera supprimé. Concrètement, une version de navigateur ancienne non listee dans les versions dont la compatibilité est garantie et testée dans EmberJs pourrait quand même fonctionner avec EmberJs, alors que si une configuration *Browserslist* ne stipule pas la compatibilité avec cette version alors il y aura une forte probabilité que l'application se basant sur cette configuration ne fonctionnera pas avec cette version. Ainsi lorsque des configurations *Browserslist* sont utilisées il serait contre-productif qu'elles cherchent à trop étendre la *compatibilité garantie et testée d'EmberJs*, et par ailleurs chercher à utiliser l'exacte *compatibilité garantie et testée d'EmberJs* serait source d'exclusion.

Pour toutes ces raisons, la solution pour les navigateurs supportés nous semble être celle proposée ci-dessous.


## Décision finale

Pour permettre un parcours utilisateur continu et homogène, *toutes les applications front de Pix* (les applications du repository Pix, Pix-UI, les différents pix-sites, Pix Editor, etc.) doivent être compatibles a minima avec un ensemble de versions de navigateurs identifiées.

Cet ensemble de versions de navigateurs identifiées avec lesquelles toutes les applications front de Pix doivent être compatibles est défini grâce au logiciel *Browserslist*. Chaque application front de Pix a cette obligation de compatibilité, que l'application utilise *Browserslist* dans ses dépendances logicielles, ou pas, ou seulement en partie (par exemple uniquement pour les CSS et pas pour le JS). L'obligation de compatibilité reste la même quelle que soit la chaîne logicielle.

Toutes les applications front de Pix sont configurées pour supporter les versions des navigateurs définies par défaut dans *Browserslist* **et en plus** les versions des navigateurs ayant *jusqu'à 4 ans d’ancienneté*.

Cela ne veut pas dire que seules les versions de navigateurs étant sorties il y a moins de 4 ans seront supportées. Cela veut au contraire dire *qu'en plus de toutes les versions des navigateurs déjà supportées par défaut par Browserslist*, les versions de navigateurs étant sorties il y a moins de 4 ans sont aussi supportées. Cela augmente donc le périmètre des versions supportées par défaut de *Browserslist* suivant un critère de temporalité qui correspond aux cycles de déploiement des navigateurs dans des grandes structures comme les administrations, l'éducation ou les grands groupes.

Pour cela, nous proposons d'utiliser la définition par défaut des versions des navigateurs supportées de *Browserslist*, à travers l'alias `defaults`, et d'y ajouter un allongement supplémentaire de 4 ans avec l'instruction `last 4 years`.

L'utilisation de l'alias `defaults`, plutôt que l'utilisation d'une définition statique comme `> 0.5%, last 2 versions, Firefox ESR, not dead`, garantit de suivre les évolutions possibles de la définition par défaut de *Browserslist*.

Par conséquent, la définition des versions de navigateurs supportées devient celle définie ci-dessous, déclinée dans les différents formats de fichiers possibles.

Fichier de configuration au format texte en colonne (qui a l'avantage de pouvoir faire figurer des commentaires) pour les fichiers `browserslist`, `.browserslistrc`, etc. :

```dotenv
# Browserslist defaults
defaults

# Pix additional rule to support more old browsers
last 4 years
```

Fichier de configuration au format JSON pour les fichiers `package.json`, `/config/target.js`, etc. :

```json
"browserslist": [
  "defaults",
  "last 4 years",
]
```

Cela permet de ne pas avoir à mettre à jour régulièrement une définition statique des navigateurs supportés, la liste des navigateurs supportés évoluant d'elle-même lors des montées de version du paquet `browserslist` et de ses dépendances.

Précisons que la liste exacte des versions de navigateur supportées par chaque application est mise à jour d'après la configuration *Browserslist* à chaque build (ou pour les utilisateurs de Pix, à chaque déploiement en production).
Compte tenu des builds et déploiements réguliers des applications front Pix (généralement rarement espacés de plus de 2 semaines), en pratique toutes les applications front Pix supporteront les mêmes versions des navigateurs à quelques jours près.
Et si jamais on rencontrait un problème de navigateur supporté sur une application/site particulier on devrait alors se poser la question du dernier build+déploiement et d'en refaire alors un si cela était nécessaire.

Nous pourrons générer automatiquement la liste des versions des navigateurs supportées par chaque application front Pix au moment de son build, et rendre cette liste facilement disponible en ligne, notamment pour l'équipe *Support utilisateurs* de Pix et plus généralement pour tous les utilisateurs de Pix via une commande du type :

```shell
npx browserslist "defaults, last 4 years"
```

Le processus technique de mise à disposition automatique de cette information sort du cadre de cette ADR. Néanmoins indépendamment de la mise en place d'un tel processus automatique, compte tenu des builds et déploiements réguliers des applications front Pix, une très bonne approximation de la liste des versions des navigateurs supportées par chaque application front Pix pourra toujours être obtenue par un développeur/une développeuse via la même commande :

```shell
npx browserslist "defaults, last 4 years"
```


## Références

* [Liste des navigateurs et leur date de sortie](https://en.wikipedia.org/wiki/Timeline_of_web_browsers)

* [Statistiques StatCounter utilisées pour déterminer l'utilisation mondiale des différents navigateurs et de leurs versions](https://gs.statcounter.com/)

* [Firefox ESR](https://support.mozilla.org/fr/kb/passer-firefox-edition-longue-duree-esr)

* [How to target last 2 versions of FF ESR?](https://github.com/browserslist/browserslist/issues/148)
