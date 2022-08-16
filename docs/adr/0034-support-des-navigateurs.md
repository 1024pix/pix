# Support navigateur

Date : 2022-08-??

## État

En cours

## Contexte

Pix est un service en ligne accessible via des navigateurs web. Pix n'a pas la possibilité d'imposer un navigateur à ces utilisateurs, et doit pouvoir répondre à un large public, avec des navigateurs desktop/mobiles, obsolètes/à jour.

Nos frameworks et nos packages permettent de supporter les anciens navigateurs jusqu'à une certaine version.

Enfin, il faut pouvoir aider au mieux nos utilisateurs et le support Pix à répondre aux problèmes liés à l'utilisation de la plateforme.

Le support navigateur se fait via le fichier `/config/target.js` disponible dans les différents projets front. C'est Babel qui s'occupe de la rétrocompatibilité, en utilisant [BrowserList](https://github.com/browserslist/browserslist) et [Can I Use](https://caniuse.com/).
Ces sites utilisent les statistiques d'utilisations des navigateurs dans le monde.

Il faut donc pouvoir continuer à mettre à jour nos frameworks, supporter les navigateurs anciens mais aussi les nouveaux navigateurs très utilisés sur nos publics.

## Décision

Pour être au clair sur les navigateurs supportés, le fichier `/config/target.js` doit indiquer :
- la version minimale à supporter pour les navigateurs les plus communs :
  - Chrome
  - Firefox
  - Safari
  - Edge
- les navigateurs utilisés à 1% dans le monde.

Par conséquent, la liste des navigateurs est du type :
```
"browserslist": [
  "> 1%",
  "Firefox > 52",
  "Chrome > 55",
  "Edge > 88",
]
```

Les versions minimales sont mise à jour régulièrement suite à une analyse des utilisateurs de Pix (environ tous les 6 mois).
Les versions supportées sont les mêmes pour toutes les applications du repository.
