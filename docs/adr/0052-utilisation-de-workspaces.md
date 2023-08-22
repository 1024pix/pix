# 52. Utilisation de Workspaces

Date : 2023-8-22

## État

En cours

## Contexte

Chaque application déclare ses propres dépendances avec `npm`, sans les mettre en commun avec les autres applications. En conséquence, ces dépendances sont installées isolément. Chaque application est autoportante.

Si les dépendances sont mises en commun (avec les ` workspaces`), elles ne seront téléchargées et installées qu'une seule fois. Cela peut réduire le temps d'installation et la taille prise sur le disque. Cette solution n'est valide qu'en local, pas en production où les applications sont déployées séparément.

### Solution 1 : utiliser les workspaces npm

**Description**

Utiliser la feature workspaces que fourni NPM depuis la version 7.

**Avantage(s) :**

- Chaque version des dépendances est installée une seule fois

Sur un PC 4CPU 2,3Ghz avec débit descendant de 676Mb/s
- La taille des dossiers node_modules est divisé par deux, passant de 3,17 à 1,51 GB
- Le temps d'installation est divisé par deux, passant de 454s à 209s
- Moins de run script npm. Avec l'option `--workspace` nous pouvons spécifier le workspace sur lequel exécuter la commande

```
// avant
npm run start:admin
> cd admin && npm start

// après
npm start --workspace=admin
```

**Inconvénient(s) :**

Pour que le gain soit effectif, il faut que les applications aient un nombre suffisant de dépendances en commun. On peut s'attendre à ce que les 4 front-end EmberJs aient des librairies en commun, mais beaucoup moins avec le back-end HapiJs.

Même si c'est le cas, pour que la dépendance puisse être utilisée par plusieurs applications, toutes ces applications devront utiliser la même version de cette librairie. Il y aura donc un travail initial d'alignement de toutes les dépendances partagées entre les applications, sinon il n'y aura pas de bénéfice.

Les montées de versions affecteront toutes les applications. Si une montée de version embarque un changement bloquant, le code de toutes les applications devra être être modifié avant de merger la PR, ce qui augmentera le temps de développement, de revue, et donc le délai de mise à disposition.

Une partie du travail de montées de version est pris en charge par Renovate (lien vers [commit](https://github.com/1024pix/pix/pull/6791/commits/7956548245f6bbfaff21efc4f6ec94672b51aad0)).

En résumé, l'inconvénient est le couplage entre applications.

### Solution 2 : rester dans l'état actuel

**Description**

Utilisation de NPM de manière isolée dans chaque application.

**Avantage(s) :**

Les versions des dépendances communes des applications ne sont pas couplées.

**Inconvénient(s) :**

Les mêmes versions des dépendances sont dupliquées.

## Décision

Nous avons choisi d'utiliser les npm workspaces parce que l'avantage d'avoir _chaque version des dépendances installée une seule fois_ est plus important que les inconvénients.

## Conséquences

- Impact minime sur le workflow des **développeurs.euses**.
  - Depuis la racine du monorepo, nous pouvons exécuter une commande d'un workspace avec l'option `--workspace` (ex: `npm start|test --workspace=api`, `npm run lint --workspace=mon-pix`)
- Impact minime sur le workflow de **CircleCI**.
  - Les commandes utilisent l'option `--workspace`
  - Retrait du cache des node_modules parce que l'installation de toutes les dépendances se fait une fois dans le step `checkout`.
- Légère modification des scripts de déploiement pour **Scalingo**.
  - Une nouvelle variable d'environnement a été introduite `USE_NPM_INSTALL=false` permettant l'exécution de la commande `npm ci` malgré l'absence du fichier **package-lock.json**. C'est une variable Scalingo utilisée par le [buildpack nodejs](https://github.com/Scalingo/nodejs-buildpack/blob/e1357147f5c518bd287ec678d1aaf8fa30667c9e/bin/compile#L274C16-L274C16).
  - Modification du run script npm `scalingo-postbuild` pour copier le contenu du dossier node_modules de la racine vers celui de l'api.
