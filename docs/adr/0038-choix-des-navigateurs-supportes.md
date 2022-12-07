# Support des navigateurs web

Date : 2022-12-29

## État

En cours

## Contexte

Pix est un service public, sans condition d'inscription. Il est en ligne, donc accessible via un navigateur web. Pix n'a pas la possibilité d'imposer un navigateur à ses utilisateurs, et doit pouvoir répondre à un large public, avec des navigateurs desktop/mobiles, obsolètes/à jour.

Nos frameworks et nos packages permettent de supporter les anciens navigateurs jusqu'à une certaine version.

Le choix de supporter tels ou tels navigateurs a un impact écologique qu'il faut mentionner. D'un côté supporter des vieux navigateurs permet aux utilisateurs de pouvoir utiliser de vieux ordinateurs et téléphones et ainsi aux utilisateurs de garder leurs matériels informatiques plus longtemps. Mais d'un autre côté s'appuyer sur les nouvelles fonctionnalités natives des navigateurs récents (que ce soit au niveau de JavaScript ou des CSS) permet une réduction significative de la taille des paquets (bundles) produits téléchargés par les matériels des utilisateurs.

Enfin, le support utilisateur a besoin de connaitre le plus facilement possible les navigateurs supportés par Pix.
A noter que pour la certification, le cahier des charges des centres de certifications indiquent que les navigateurs doivent avoir moins de 2 ans, et que les établissements peuvent mettre à jour durant la période des vacances scolaires. Par sécurité, nous ajoutons un an à ce support minimum, nous gérons donc officiellement les navigateurs de moins de 3 ans.
Le support navigateur se fait via le fichier `/config/target.js` disponible dans les différents projets front. C'est Babel qui s'occupe de la rétrocompatibilité, en utilisant [BrowserList](https://github.com/browserslist/browserslist) et [Can I Use](https://caniuse.com/).

Ces sites utilisent les statistiques d'utilisations des navigateurs dans le monde.

Pour supporter les navigateurs très utilisés sur nos publics, anciens mais aussi nouveaux, il faut  mettre à jour la configuration du framework. 

De plus, [EmberJs ne supporte pas tous les navigateurs](https://emberjs.com/browser-support/) : Ember 4.0.0 ne supporte plus Internet Explorer, et globalement les navigateurs qui détiennent au moins 0,25 % de l'utilisation de la part de marché mondiale sur les mobiles et les ordinateurs de bureau, selon statcounter. 


## Décisions

Pour être au clair sur les navigateurs supportés, le fichier `/config/target.js`  doit indiquer :
- la version minimale à supporter pour les navigateurs les plus communs :
  - Chrome
  - Firefox
  - Safari
  - Opéra
  - Edge
- les navigateurs utilisés à 1% dans le monde.

Par conséquent, la liste des navigateurs est du type :
```
"browserslist": [
  "> 1%",
  "Firefox >= 58",
  "Chrome >= 64",
  "Edge >= 41",
  "Safari >= 11",
  "Opera >= 50",
]
```

Les versions des navigateurs supportés sont celles qui ont moins de 4 ans à date pour laisser de la marge par rapport à la certification. 

Les versions minimales supportées seront mis à jour deux fois par an (fin d'année et l'été).

A date (Janvier 2023), cela signifie que le  `/config/target.js`  doit indiquer :
```
"browserslist": [
  ">= 1%",
  "Firefox >= 58",
  "Chrome >= 64",
  "Edge >= 41",
  "Safari >= 11",
  "Opera >= 50",
]
```
Les versions supportées sont les mêmes pour toutes les applications Pix : les applications du repository Pix, Pix-UI et Pix Editor.
