# Traductions

## Contexte

Couplage et complexité : les fichiers de traduction sont conçus pour gérer le
texte et pas la logique applicative (notamment la logique applicative des URL)
Quand la logique applicative des URL change on doit éviter de modifier tous les
fichiers de traduction (plus le nombre de locales sera élevé, plus cette
tâche serait difficile).

Dynamicité : parfois les URL nécessitent d'être dynamiques (notamment
avec des query params changeant selon les situations, etc.).
Pour créer ces URL dynamiques il peut être nécessaire de les construire en
fonction de différentes choses uniquement disponibles au moment de l'exécution
des applications (la locale, le domaine, etc.).

Séparation des responsabilités et sécurité : Les traducteurs ne devraient avoir
à gérer ni des URL ni du HTML. Ils ne connaissent pas forcément ces notions
techniques et peuvent facilement faire des erreurs entraînant des régressions,
des risques de sécurité. Les traducteurs peuvent vouloir traduire des bouts de
HTML ou des URL …

## Process de traduction

Les traductions sont séparées par locale dans des fichiers dédiés.

Les équipes alimentent les fichiers de traduction à l'aide de Deepl lors du développement
des fonctionnalités associées.

À la validation d'une PR, toutes les clés de traduction doivent être alimentées.

## Pratiques à suivre

Il faut privilégier :

* les traitements basés sur la notion de locale plutôt que les traitements basés
  sur la notion de langue
* une gestion générique de toutes les locales plutôt qu’une condition pour
  chaque locale
* les phrases et paragraphes auto-porteurs et indépendants

Il faut éviter de :

* mettre du HTML dans les fichiers de traduction

Il ne faut pas :

* mettre des URL dans les fichiers de traduction

### Pour les frontaux

Utilisez l'`urlService` disponible dans tous les frontaux (Pix App, Pix Orga, Pix
Certif, Pix Admin).

Exemple : https://github.com/1024pix/pix/pull/10974

### Pour Pix API

Il y a beaucoup beaucoup moins de besoins de traduction dans Pix API, mais ces
besoins existent pour l’envoi d’emails.

On note que le fichier
[`api/src/shared/infrastructure/utils/url-builder.js`](https://github.com/1024pix/pix/blob/dev/api/src/shared/infrastructure/utils/url-builder.js)
est disponible mais une solution existante à recommander n’existe pas encore.

## Références (ADR, autres docs, PR, etc.)

* [ARD Logique et stratégie de gestion des paramètres régionaux et des langues (locales & languages)](https://github.com/1024pix/pix/blob/dev/docs/adr/0040-locales-languages.md)




