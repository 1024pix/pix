# Support des navigateurs web

Date : 2023-08-16

## État

En cours

## Contexte

Pix est un service public, sans condition d'inscription. Il est en ligne, donc accessible via un navigateur web. Pix n'a pas la possibilité d'imposer un navigateur à ses utilisateurs, et doit pouvoir répondre à un large public, avec des navigateurs desktop/mobiles, qui peuvent parfois être obsolètes.

Nos frameworks et nos packages permettent de supporter les anciens navigateurs jusqu'à une certaine version.

Le choix de supporter tel ou tel navigateur a un impact écologique qu'il faut mentionner. D'un côté supporter des vieux navigateurs permet aux utilisateurs de pouvoir utiliser de vieux ordinateurs et téléphones et ainsi aux utilisateurs de garder leurs matériels informatiques plus longtemps. Mais d'un autre côté s'appuyer sur les nouvelles fonctionnalités natives des navigateurs récents (que ce soit au niveau de JavaScript ou des CSS) permet une réduction significative de la taille des paquets (bundles) produits téléchargés par les matériels des utilisateurs.

De plus pour la certification, le cahier des charges des centres de certifications indiquent que les navigateurs doivent avoir moins de 2 ans, et que les établissements peuvent mettre à jour durant la période des vacances scolaires. Par sécurité avec les agendas scolaires, nous ajoutons un an à ce support minimum, nous gérons donc officiellement les navigateurs de moins de 3 ans.

De plus, [EmberJs ne supporte plus les navigateurs trop vieux](https://emberjs.com/browser-support/) : Ember 4.0.0 ne supporte plus Internet Explorer, et globalement les navigateurs qui détiennent au moins 0,25 % de l'utilisation de la part de marché mondiale sur les mobiles et les ordinateurs de bureau, selon statcounter.

Par ailleurs le *Support Utilisateur* a besoin de connaître le plus facilement possible les navigateurs supportés par Pix.

Enfin, techniquement, le support navigateur se fait via un fichier de configuration dans chaque projet front (via le fichier `/config/target.js` pour les applications Ember, ou via un autre fichier pour les autres frameworks/applications). C'est Babel qui s'occupe de la rétrocompatibilité, en utilisant [Browserslist](https://github.com/browserslist/browserslist) et [Can I Use](https://caniuse.com/) qui se basent sur les statistiques mondiales d'utilisation des navigateurs.

Actuellement le fichier `/config/target.js` des applications Ember contient la configuration `'> 1%', 'firefox 58'` qui contient en dur une très vielle version d'un navigateur spécifique. Ce type de configuration avec des versions en dur oblige une mise à jour manuelle des fichiers qui peut être oubliée.

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

Nous pourrions aussi nous baser uniquement sur des statistiques et les pourcentages d'utilisation mondiales ou français. Ces statistiques sont intéressantes pour s'assurer un bon service pour une population globale. Mais dans la population des utilisateurs Pix, il y a aussi des utilisateurs très identifiés (des associations, des écoles, etc.) qui ont une gestion qui peut être spécifique à leur parc informatique.
De plus, se baser uniquement sur le pourcentage ne permet pas d'avoir une liste claire de navigateurs supportés pour aider l'équipe Support Utilisateur à savoir sur quels navigateurs Pix fonctionne.

Nous pourrions nous baser uniquement sur une liste de navigateurs, mais cela demanderait : 
- d'avoir une liste assez exhaustive des navigateurs pour s'assurer de ne pas avoir d'oubli de situation
- de mettre plus souvent à jour la liste des navigateurs, notamment en cas d'arrivée d'un navigateur web ou mobile avec une forte utilisation.

De plus, le fichier `/config/target.js` est présent dans les différentes applications front.
Nous pourrions avoir des règles différentes par applications, ou la même règle pour toutes les applications.
Pour des soucis de cohérence, la même règle pour toutes les applications semble être la meilleure solution. De plus : 
- l'équipe de développement travaille sur tous les front, donc une cohérence entre les versions de packages permettent d'éviter une adaptation à chaque front
- les front se basent sur Pix-UI pour le design, donc il faudrait une cohérence entre les front pour éviter d'avoir à gérer des navigateurs (et donc des packages possiblement) différents

Pour toutes ces raisons, la solution pour les navigateurs supportés nous semble être celle proposée ci-dessous.

À noter que la valeur par défaut de *Browserslist* est :

```dotenv
> 0.5%, last 2 versions, Firefox ESR, not dead
```

## Décision finale

Les applications front de Pix supportent les versions des navigateurs définies par défaut dans *Browserslist* **et en plus** les versions des navigateurs *jusqu'à 4 ans d’ancienneté*.

Pour cela, nous proposons d'utiliser la même valeur par défaut que *Browserslist* et d'ajouter notre allongement supplémentaire de 4 ans (`last 4 years`).

Par conséquent, la liste des navigateurs supportés devient celle définie ci-dessous.

Format fichier de configuration `browserslist`, `.browserslistrc`, etc. :

```dotenv
# browserslist defaults
> 0.5%
last 2 versions
Firefox ESR
not dead # no browsers without security updates

# Pix additional rule to support more old browsers
last 4 years
```

Format fichier de configuration `package.json`, `/config/target.js`, etc. :

```json
"browserslist": [
  "> 0.5%",
  "last 2 versions",
  "Firefox ESR",
  "not dead",
  "last 4 years",
]
```

Cela permet de ne pas avoir à mettre à jour régulièrement une définition statique des navigateurs supportés, la liste des navigateurs supportés évoluant d'elle-même lors des montées de version du paquet `browserslist` et de ses dépendances.

Pour l'équipe *Support Utilisateur* de Pix, nous proposons de faire à la demande du support la liste des navigateurs supportés, via une commande de type :

```shell
npx browserslist "> 0.5%, last 2 versions, Firefox ESR, not dead, last 4 years"
```

Les versions supportées sont les mêmes pour toutes les applications Pix : les applications du repository Pix, Pix-UI, Pix Editor et les différents pix-sites (https://pix.org/, https://pix.fr/, etc.).

[Liste des navigateurs et leur date de release](https://en.wikipedia.org/wiki/Timeline_of_web_browsers)
