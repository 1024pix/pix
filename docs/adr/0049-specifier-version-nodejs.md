# 49. Spécifier la version de NodeJS

Date : 2023-07-03

Remplace l'[ADR #18](./0018-specifier-version-nodejs.md).

## État

Amende [0018-specifier-version-nodejs.md][0018]

[0018]: ./0018-specifier-version-nodejs.md

En discussion

## Contexte

Avec l'ADR 18, nous avons choisi :
- PAAS : préciser la version majeure de Node uniquement.
- CI : préciser une version exacte de Node.
- Local : préciser la version majeure de Node uniquement.

Nous avons constaté plusieurs limites à ce choix :
- L'API ne fonctionne plus en version antérieure à Node@v16.15. L'ADR précédant ne nous permet pas de fixer de version mineure minimum donc un risque d'incompatibilité est présent.
- Fixer la version majeure uniquement peut provoquer des problèmes de reproductibilité car nos 3 environnements ont chacun une version de Node différente. Notamment en local, il est arrivé que certains développeurs restent en version antérieure à la 16.15 lorsque nous avons dû supprimer la compatibilité de ces versions.

### Solution n°1 : Forcer la même version exacte minimum de Node sur tous les environnements

Cette solution consiste à mettre à jour les 3 versions des 3 environnements en même temps.

#### Avantages
- Limite l'écart de version possible entre les 3 environnements.
- Clarification du choix de version compatible.
- Moins de gestion de compatibilité sur des versions non gérées.
- Automatisable avec Renovate.
- Mises à jour de sécurité de Node en local plus régulière.
- Alerte en local que la version utilisée n'est pas bonne.

#### Inconvénients
- Nécessite des `nvm install` plus réguliers.
- On synchronise les montées de versions de Node avec les mises à jour des images Node de Circle CI.
- Retard minime possible à cause du délai de mise à jour des versions de Node côté Circle CI.

### Solution n°2 : Forcer la même version exacte minimum de Node en local et sur le PAAS

Notre CI évoluerai de son côté, pour éviter la synchronisation avec les images Node Circle CI.

#### Avantages
- Limite l'écart de version possible entre les 3 environnements.
- Clarification du choix de version compatible.
- Moins de gestion de compatibilité sur des versions non gérées.
- Automatisable avec Renovate.
- Mises à jour de sécurité de Node en local plus régulière.
- Alerte en local que la version utilisée n'est pas bonne.

#### Inconvénients
- Nécessite des `nvm install` plus réguliers.
- La reproductibilité en CI n'est pas assurée.

### Solution n°3 : Ajouter la version mineure minimum de Node en local et sur le PAAS

Permettre de spécifier une version mineure (en plus de la majeure) pour préciser la version minimale nécessaire. C'est ce qui a été fait sur le PAAS pour l'API avec #6512 car elle ne fonctionnait plus avec des versions inférieures à la 16.15 de Node.

#### Avantages
- Gestion plus fine de la compatibilité.
- Permet de forcer la mise à jour des développeurs quand une version mineure n'est plus compatible.

#### Inconvénients
- La reproductibilité entre les 3 environnements n'est pas assurée.
- Non automatisable avec Renovate.
- Nécessite des `nvm install` plus réguliers.

## Décision

Lors des Tech Days 2023, une équipe s'est formée sur le sujet des montées de version. Après avoir corrigé la version de Node embarquée dans l'API qui était non maintenue nous avons expérimenté les montées de version automatisées de Node sur [un fork du monorepo](https://github.com/1024pix/pix-renovate-test).

NB : Après six mois, les versions impaires (9, 11, etc.), ne sont plus maintenues et sont donc hors LTS [voir la doc](https://nodejs.dev/en/about/releases/)

En faisant évoluer [notre configuration Renovate](https://github.com/1024pix/renovate-config), nous avons observé que l'outil force l'ajout du numéro de patch si on précise la version mineure requise.

Fort de ces expérimentations, l'équipe propose de choisir [la solution 1](### Solution n°1 : Forcer la même version exacte minimum de Node sur tous les environnements).

## Conséquences

Il faut migrer le format d'écriture des numéros de versions de Node.js :
- Dans les `.nvmrc`, préciser le numéro de version exacte. Exemple : `16.20.1`
- Dans les `package.json`, préciser le numéro de version exacte minimum de `node`. On propose d'utiliser le même format que pour les dépendances. Exemple : `^16.20.1`.
- Dans les `package.json`, ne pas préciser le numéro de version exacte minimum de `npm` pour utiliser celle embarquée par défaut par Node.js. On peut directement supprimer cette contrainte pour éviter les soucis lors des futures de migration de Node.

Renovate nous proposera dès lors les montées de versions groupées de Node dès qu'une nouvelle version de l'image Node Circle CI est publiée.

On peut commencer cette migration par le monorepo, avant de migrer nos dépendances comme `pix-ui`.

Sur le PAAS, rien ne change car on utilisera toujours la dernière version disponible.
