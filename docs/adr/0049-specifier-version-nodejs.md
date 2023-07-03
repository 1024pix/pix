# 18. Spécifier la version de NodeJS

Date : 2023-07-03

Remplace l'[ADR #18](./0018-specifier-version-nodejs.md).

## État

Amende [0018-specifier-version-nodejs.md][0018]

[0018]: ./0018-specifier-version-nodejs.md

En discussion

## Contexte

Suite à l'ADR 18, nous avons constaté plusieurs limites à notre manière de préciser les versions de Node.js compatibles :
- On ne peut pas fixer de version mineure de Node.js malgré que l'API ne fonctionne pas dans les version antérieures à la 16.15. Toute personne souhaitant installer Pix peut avoir ce soucis.
- Les développeurs peuvent ne pas monter leur version de Node.js pendant très longtemps, ce qui induit un écart important entre la version utilisée en local, de la CI et de l'exécution en production. Cet écart ne permet pas de prévoir les comportements de l'application entre ces 3 environnements.
- Ces écarts sont assez difficiles à comprendre.

### Solution n°1 : Forcer la même version complète de Node sur les environnements

On peut mettre à jour les 3 versions correspondantes aux 3 environnements en même temps.

#### Avantages
- Pas d'écart de version possible entre les 3 environnements.
- Clarification du choix de version : toujours la même.
- Moins de gestion de compatibilité sur des versions non gérées.
- Probablement automatisable.
- Mises à jour de Node pour les développeurs plus régulière.

#### Inconvénients
- Mises à jour de Node pour les développeurs plus régulière, nécessite des `nvm install`/`nvm use`.
- On calque les montées de versions de Node au bon vouloir de Circle CI de mettre à jour leurs images.
- Retard minime possible à cause du délai de mise à jour des versions de Node côté Circle CI.

### Solution n°2 : Forcer la même version complète de Node dans le .nvmrc et le `engines`.

Pour ne pas se lier à Circle CI.

#### Avantages
- Aucun écart lié à Node entre l'environnement de dev et de production.
- Écart de version minime entre les 3 environnements.
- Moins de gestion de compatibilité sur des versions non gérées.
- Probablement automatisable.
- Mises à jour de Node pour les développeurs plus régulière.
- Minimise les soucis de sécurité potentiels en production.

#### Inconvénients
- La CI peut ne pas être exactement la même version que les 2 autres environnements.
- Mises à jour de Node pour les développeurs plus régulière, nécessite des `nvm install`/`nvm use`.

### Solution n°3 : Ajouter une version mineure de Node dans le .nvmrc et le `engines`

Permettre de spécifier une version mineure (en plus de la majeure) pour préciser la version minimale nécessaire. C'est ce qui a été fait pour l'API avec #6512 car elle ne fonctionnait plus à partir d'une certaine version mineure de Node.

#### Avantages
- Gestion plus fine de la compatibilité.
- Permet de forcer la mise à jour des développeurs quand une version mineure n'est plus compatible.
- Garantie qu'on utilise la dernière version de Node en production donc normalement une meilleure sécurité.

#### Inconvénients
- C'est subjectif de savoir si une montée de version est nécessaire ou pas. Il faut préciser quand est-ce que c'est nécessaire ?
- L'écart entre les versions des 3 environnements (et les soucis que ça cause) reste présent.

## Décision
A discuter en Tech Days avant de faire une proposition.

## Conséquences

/!\ Compatibilité Pix UI lors de la mise à jour.
