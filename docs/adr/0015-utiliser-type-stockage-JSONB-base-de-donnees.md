# 15. Utiliser le type de données JSONB en base de données

Date: 2020-11-20

## Status

Accepted

## Context

Jusqu'ici, Pix n'utilise que des types de données primitifs de PostgreSQL (VARCHAR, TIMESTAMP, INTEGER). 
Lors de l'intégration du fournisseur d'identité (IDP) [Pôle Emploi](https://peconnect.pole-emploi.fr/),
il était nécessaire de stocker des propriétés qui, selon le contexte, pouvaient ne pas exister.

Par exemple, les méthodes d'authentification liées à différents IDP sont
- pour l'IDP local (Pix), 2 propriétés: mot de passe + le mot de passe est-il expiré
- pour l'IDP GAR, 1 propriété: identifiant Opaque (IDO/SAMLID)
- pour l'IDP Pôle Emploi, 1 propriété: Subject Identifier (sub)

Il y a un besoin de recherche sur les propriétés suivantes
- identifiant Opaque (IDO/SAMLID)
- Subject Identifier (SUB)

Les 2 critères sont les suivants:
- maintenabilité 
- accès rapide lors de la recherche
 
#### Possibilité 1
Garder les types de données natifs.
Ajouter une colonne pour chacune des 4 propriétés.
L'inconvénient majeur est la maintenabilité.
Quand un développeur affiche le contenu de la table, il est difficile de: 
- savoir ce que représentent ces données;
- et donc de détecter des données incorrectes. 

#### Possibilité 2
Stocker toutes les propriétés au format de représentation JSON dans une seule colonne 

Nous recherchons un format de stockage qui: 
- permet de stocker des données au format de représentation JSON, ex `{ password: 'uhu@@LL^55', shouldChangePassword: false }` ou ` { samlId: 'JKLO-555-HUHUHU }`
- permet les recherches, ex dans knex `where({ value:{ samlId: '455456FFF' } })`
- soit indexable `CREATE UNIQUE INDEX authentication_methods_value_unique ON "authentication-methods"( ("value"->>'samlId') );`

Il existe [2 formats](https://www.postgresql.org/docs/current/datatype-json.html) de stockage 
- JSON: stocke les données au format texte
- JSONB: stocke les données au format binaire => plus performant, permet l'indexation, recherche plus lisible

Le format JSONB est le seul éligible vu nos exigences. 

## Decision
Combiner les deux solutions:

Pour profiter de la rapidité d'exécution connue des recherches sur les types de données natifs, possibilité 1:
- stocker les propriétés SAMLID et SUB dans une seule propriété, qui sera indexée

Pour profiter de la flexibilité du stockage JSONB, possibilité 2:
- stocker les propriétés de l'IDP local (Pix) dans un type JSONB

Note: il aurait été possible de voir si le type de données JSONB avec index permettait des recherches aussi rapides que sur un type primitif.
Le compromis a été de ne pas investiguer cette voie, et de choisir la solution éprouvée, pour gagner du temps.

## Conséquences
Appliquer la décision
