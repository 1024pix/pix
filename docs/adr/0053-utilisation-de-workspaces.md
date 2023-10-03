# 52. Dépendances communes entre applications

Date : 2023-9-13

## État

Acceptée

## Contexte

Chaque application déclare ses propres dépendances avec `npm`, sans les mettre en commun avec les autres applications. En conséquence, ces dépendances sont installées isolément. Chaque application est autoportante.

Si les dépendances sont mises en commun (avec les `workspaces`), elles ne seront téléchargées et installées qu'une seule fois. Cela peut réduire le temps d'installation et la taille occupée sur le disque. Cette solution n'est valide qu'en local, pas en production où les applications sont déployées séparément.

### Solution 1 : Mettre en commun les dépendances : utiliser npm avec workspaces

**Description**

Utiliser la feature workspaces que fournit NPM depuis la version 7.

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

### Solution 2 : Garder les dépedances séparées : utiliser npm sans les workspaces

**Description**

Utilisation de NPM de manière isolée dans chaque application.

**Avantage(s) :**

Les versions des dépendances communes des applications ne sont pas couplées.

**Inconvénient(s) :**

Les dépendances utilisées par plusieurs applications, y compris si elles dépendant de la même version, sont dupliquées sur les environnements locaux et de review-app.

## Décision

Nous avons choisi de ne pas utiliser les npm workspaces parce que le désavantage du couplage est trop important.
