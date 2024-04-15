# 52. Compatibilité avec les différents navigateurs web

Date : 2023-08-16


## État

En cours


## Contexte

Pix est un service public, sans condition d'inscription. Il est en ligne, donc accessible via un navigateur web. Pix n'a ni la volonté ni la possibilité d'imposer des navigateurs particulier à ses utilisateurs, et doit pouvoir répondre à un large public, utilisant sur des terminaux variés (ordinateur/téléphone portable/tablette/etc.) des navigateurs plus ou moins vieux.

Assurer la compatibilité avec les plus vieux navigateurs a des inconvénients et des avantages, qu'il faut évaluer.

Pour la certification, le cahier des charges des centres de certifications indique que les navigateurs doivent avoir moins de 2 ans, mais que les établissements peuvent attendre la fin de l'année scolaire pour effectuer la mise à jour. Par sécurité avec les agendas scolaires, nous ajoutons un an à ce support minimum, nous gérons donc officiellement les navigateurs de moins de 3 ans.

De plus, s'appuyer sur les nouvelles fonctionnalités natives des navigateurs (de manière globale, pas uniquement au niveau JavaScript), non présentes par définition dans les vieux navigateurs, offre de nouvelles possibilités d'interaction avec les utilisateurs, augmente la productivité des développements, la stabilité et la sécurité des applications.

De plus, limiter la compatibilité à des navigateurs récents réduit la taille des artefacts (bundles) des applications, produits au build, qui sont téléchargés par chaque terminal utilisateur, ce qui accélère les temps de téléchargement et limite l'utilisation des réseaux.

À l'opposé, toutes les études sur l'impact du numérique sur l'environnement s'accordent sur le fait que le cycle de vie d’un terminal utilisateur – c'est à dire sa fabrication et sa fin de vie – concentre les principales nuisances environnementales. Et ces étapes de cycle de vie d'un terminal produisent au moins 3,5 fois plus d'émissions de gaz à effet de serre que l'utilisation dudit terminal.
Ainsi permettre aux utilisateurs de continuer d'utiliser leur matériel informatique plus longtemps, en assurant la compatibilité avec des vieux navigateurs, serait la manière la plus efficace de réduire l'impact de Pix sur l'environnement.

Mais les frameworks et packages que nous utilisons ne permettent d'assurer une compatibilité avec les vieux navigateurs que jusqu'à un certain point seulement.
Ainsi, *EmberJs* (le framework le plus utilisé pour développer les applications front de Pix) assure une *compatibilité garantie et testée* avec un ensemble de versions de navigateurs défini dans https://emberjs.com/browser-support/ qui pour simplifier correspond à :
* la dernière version des navigateurs les plus utilisés (Google Chrome, Mozilla Firefox, Microsoft Edge, Safari)
* la dernière version de Firefox édition longue durée (Firefox ESR), souvent utilisée dans les grandes structures, les administrations, le secteur de l'éducation, etc.
* les versions de navigateurs qui détiennent un minimum de 0,25% d'utilisation au niveau mondial

Par ailleurs, les utilisateurs de Pix utilisent quasiment toujours plusieurs applications front de Pix, successivement voire simultanément, certaines applications étant plus ou moins couplées. Il faut donc assurer l'homogénéité de la compatibilité avec les différents navigateurs web des dites applications.

Au niveau technique, le code source des applications Pix subit différentes transformations, à la fois additives et soustractives, généralement réalisées par les outils [Babel](https://babeljs.io/) pour le JavaScript et [PostCSS](https://postcss.org/) pour les CSS.
La gestion de la compatibilité navigateurs de ces outils est généralement réalisée grâce à [Browserslist](https://github.com/browserslist/browserslist) et [Can I Use](https://caniuse.com/) qui se basent sur les statistiques mondiales d'utilisation des navigateurs.
La configuration de cette compatibilité navigateur se fait généralement via un fichier dans chaque projet front (via le fichier `/config/target.js` pour les applications EmberJs, ou via un autre fichier pour les autres frameworks/applications).

Au moment de l'écriture de cette ADR, la définition de *Browserslist* des versions des navigateurs prises en charge par défaut au format texte colonne est celle ci-dessous.
L'ensemble des versions du périmètre est l'union ensembliste des versions définies par chaque ligne. C'est à dire que chaque nouvelle ligne augmente le périmètre de compatibilité.

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
* cette configuration définit un périmètre beaucoup plus large que ce que définit la *compatibilité garantie et testée d'EmberJs* et cherche à assurer une compatibilité qui s'avère illusoire car trop décalée par rapport à la réalité des contraintes de fonctionnement de [la version LTS d'EmberJs](https://emberjs.com/releases/lts/)
* cette configuration contient en dur une version spécifique d'un navigateur, ce qui oblige à une mise à jour manuelle régulière des fichiers et qui peut être oubliée
* cette configuration ne suit pas la recommandation de *Browserslist* d'étendre le périmètre de compatibilité par défaut

Enfin par ailleurs l'équipe *Aide utilisateurs* a besoin de connaître facilement les navigateurs avec lesquels Pix est compatible.


## Possibilités et réflexions

Par rapport au cahier des charges des centres de certifications, nous devons assurer la compatibilité avec les navigateurs de moins de 3 ans.

En août 2023, en analysant les navigateurs utilisés sur le mois de mai 2023, nous observons que la 5ème version la plus utilisée de Firefox est la version 78 (qui a 3 ans et demi), avec une utilisation globale autour de 0,8%.
Donc si nous voulons assurer la compatibilité avec les navigateurs de nos utilisateurs avec un peu de marge, avoir a minima une compatibilité avec les versions de navigateur ayant jusqu'à 4 ans est pertinent.

Nous pouvons aussi nous baser sur des statistiques d'utilisation mondiales des différentes versions des navigateurs. Ces données sont intéressantes pour assurer un bon service pour une population globale. Mais comme dans la population des utilisateurs Pix il y a aussi des utilisateurs très identifiés (des grandes structures, des administrations, le secteur de l'éducation, des associations, etc.) qui peuvent avoir une gestion spécifique de leur parc informatique avec des temporalités longues, une définition sur la seule base de statistiques globales créerait en pratique des exclusions fortes.

Il devient vite évident qu'idéalement une bonne définition de la compatibilité que nous recherchons doit être basée sur *l'union de plusieurs critères* : obligations légales, durée de vie, statistiques d'utilisation mondiales.

Pour éviter de forcer les utilisateurs à changer de matériel informatique nous pourrions choisir d'assurer la compatibilité avec des navigateurs encore plus anciens.
Mais chercher la compatibilité avec des navigateurs trop anciens amènerait son lot de difficultés et de problèmes : 
- certains des dépendances logicielles que nous utilisons ne fonctionnent pas avec les navigateurs trop anciens (notamment la *compatibilité garantie et testée* d'EmberJs déjà abordée)
- ce serait s'empêcher de bénéficier de certaines nouvelles fonctionnalités non-rétrocompatibiles des navigateurs
- il peut y avoir des soucis de sécurité sur d'anciens navigateurs, ou sur d'anciens packages
- Pix se base aussi sur d'autres sites web externes pour valider les compétences numériques, et ces sites ne sont pas toujours compatibles avec les navigateurs trop vieux (en tout cas, nous n'avons aucune vérification de cela)

Nous pourrions avoir des règles différentes par application.
Par souci de cohérence, la même règle pour toutes les applications semble être la meilleure solution. De plus : 
- l'équipe de développement travaille sur tous les front, donc une cohérence entre les versions de packages permet d'éviter une adaptation à chaque front
- la plupart des front se basent sur *Pix-UI* pour le design, donc il faudrait une cohérence entre les front pour éviter d'avoir à gérer des navigateurs (et donc des packages possiblement) différents

Enfin, il faut noter qu'on ne peut pas établir une correspondance *exacte* entre une configuration *Browserslist* et la *compatibilité garantie et testée d'EmberJs*. En effet les outils se basant sur *Browserslist* ont une approche à la fois additive et soustractive qui fait que par recherche d'optimisation tout ce qui ne sera pas utile aux versions des navigateurs souhaitées sera supprimé. Concrètement, une version de navigateur ancienne non listee dans les versions dont la compatibilité est garantie et testée dans EmberJs pourrait quand même fonctionner avec EmberJs, alors que si une configuration *Browserslist* ne stipule pas la compatibilité avec cette version alors il y aura une forte probabilité que l'application se basant sur cette configuration ne fonctionnera pas avec cette version. Ainsi lorsque des configurations *Browserslist* sont utilisées il serait contre-productif qu'elles cherchent à trop étendre la *compatibilité garantie et testée d'EmberJs*, et par ailleurs chercher à utiliser l'exacte *compatibilité garantie et testée d'EmberJs* serait en fait source d'exclusion.

Sur la base de tous les éléments développés, la solution proposée ci-dessous est celle qui nous semble offrir le meilleur compromis.


## Décision

Pour permettre un parcours utilisateur continu et homogène, *toutes les applications front de Pix* (les applications du repository Pix, Pix-UI, les différents pix-sites, Pix Editor, etc.) doivent être compatibles a minima avec le même ensemble de versions de navigateurs identifiées.

Cet ensemble de versions de navigateurs identifiées avec lesquelles toutes les applications front de Pix doivent être compatibles est défini grâce au logiciel *Browserslist*. Chaque application front de Pix a cette obligation de compatibilité, que l'application utilise *Browserslist* dans ses dépendances logicielles, ou pas, ou seulement en partie (par exemple uniquement pour les CSS et pas pour le JS). Autrement dit, l'obligation de compatibilité est la même quelle que soit l'application front de Pix et sa chaîne logicielle.

Toutes les applications front de Pix sont développées et configurées pour être compatibles avec les versions des navigateurs définies par défaut dans *Browserslist* **et en plus** les versions des navigateurs ayant *jusqu'à 4 ans d’ancienneté*.

Cela ne veut pas dire que seules les versions de navigateurs étant sorties il y a moins de 4 ans sont supportées. Cela veut dire *qu'en plus de toutes les versions des navigateurs déjà supportées par défaut par Browserslist*, les versions de navigateurs étant sorties il y a moins de 4 ans sont aussi supportées. Cela augmente donc le périmètre des versions supportées par défaut de *Browserslist* suivant un critère de temporalité qui correspond aux cycles de déploiement des navigateurs dans les grandes structures, les administrations, le secteur de l'éducation, etc.

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

Nous pourrons générer automatiquement la liste des versions des navigateurs supportées par chaque application front Pix au moment de son build, et rendre cette liste facilement disponible en ligne, notamment pour l'équipe *Aide utilisateurs* de Pix et plus généralement pour tous les utilisateurs de Pix via une commande du type :

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

* [Numérique : quel impact environnemental ? – ADEME Magazine Avril 2022](https://infos.ademe.fr/magazine-avril-2022/faits-et-chiffres/numerique-quel-impact-environnemental/)

* [Etude ADEME – Arcep sur l’empreinte environnementale du numérique en 2020, 2030 et 2050](https://www.arcep.fr/la-regulation/grands-dossiers-thematiques-transverses/lempreinte-environnementale-du-numerique/etude-ademe-arcep-empreinte-environnemental-numerique-2020-2030-2050.html)
