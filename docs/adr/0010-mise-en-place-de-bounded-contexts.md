# 10. Mise en place de _bounded contexts_

Date : 2020-04-02

## État

Draft

## Contexte

> les organisations qui conçoivent des systèmes [...] sont contraintes de produire des designs qui sont des copies de la structure de communication de leur organisation.
> — M. Conway

L'architecture logicielle de Pix API a été pensée et initiée il y a 3 ans. 

Depuis, beaucoup de choses ont changé :

- **métier** : de nouvelles activités stratégiques sont apparues (évaluation, gestion des comptes & accès, prescription, certification, administration)
- **organisation** : nous sommes passés d'1 équipe de 6 personnes à 4 équipes produit de 6 personnes
- **technique** : les technologies et leurs fonctionnalités ont évoluées de même que notre compréhension et notre maîtrise de celles-ci ainsi que de certains concepts (clean architecture, architecture hexagonale, etc.)
- **culturelle** : les développeurs de cette époque ont quitté le projet

En regard de tous ces changements, nos patterns, nos pratiques et nos standards ont finalement peu évolués. Ce qui nous pose de plus en plus de problèmes :

- du fait du départ de leur porteur principal, certaines initiatives n'ont pas été jusqu'au bout (ex : passage des Services aux Use cases, mise en ouvre du pattern RORO, etc.)
- les objets du Domaine comme les objets de Response sont désormais des objets obèses, fourre-tout, potentiellement incomplets ou inintelligents et le plus souvent sous-utilisés car multi-usages
- les standards et règles d'implémentation, qui s'accomodaient bien d'un fonctionnement en comité restreint, s'avèrent gênantes ou contre-productives, quand elles ne sont pas tout simplement oubliées
- il en va de même pour le design de l'API, qui cumule les conséquences néfastes des 2 points précédents

Enfin, le succès de Pix et le développement de ses partenariats font émerger de nouveaux besoins que l'API, sous sa forme actuelle, risque d'empêcher ou limiter : 

- interconnexion multiple et diverse avec des SI partenaires / clients / fournisseurs
- caractère open-contribution de la plateforme afin de favoriser sont adoption par le plus grand nombre (dont l'international), le recrutement de collaborateurs ou l'émergence d'innovation

Tous ces freins, douleurs, risques ou opportunités nous poussent à croire qu'il est aujourd'hui temps pour Pix de dépoussiérer son API et de revoir son architecture.

## Décision

Nous prenons la décision de réorganiser le code source de l'application Pix API en contextes métier (_Bounded Contexts_, a.k.a. BC).

La mise en œuvre des BC suit les principes directeurs suivants :
1. **Architecture hexagonale** à 3 couches plutôt que clean architecture à 4 couches
1. Nommage des contextes par **finalité métier** plutôt que par application cible
1. Matérialisation de ces contextextes par **modules de code**
1. Utilisation de **plugins Hapi.js** pour matérialiser ces modules de code
1. **Duplication de circonstance** pour les données utiles à plusieurs contextes

## Conséquences

### Architecture hexagonale 

Les 3 couches retenues sont : 
- application
- domain
- infrastructure

### Contextes métiers

Les contextes métier retenus sont :
- content : référentiel pédagogique, caching des épreuves
- assessment : poser des questions, recueillir et évaluer des réponses
- accounts : comptes, accès, mots de passe, interconnexion 
- profile : calculer un profil de compétence, ainsi que ses attributes (ex : badges)
- training : analyse, accompagnement, prescription, formation 
- certification : examen, logisitique, jury
- admin : back-office, CRUD

> Remarque : cet ordre correspond à l'apparition historique des fonctionnalités de Pix : nous avons commencé par 
> élaborer des questions, que nous avons converties pour pouvoir les soumettre aux utilisateurs, sur des tests de démo.
> Nous avons ensuite ajouter les fonctionnalités relatives aux comptes & accès, avec persistence des réponses, ce qui 
> nous a permis d'élaborer un profil de compétences pour chacun et de proposer une expérience adaptée et adaptative. 
> Suite à ça, nous avons développé l'activité de prescription, puis de certification (dont l'outillage pour le jury).
> Finalement, nous avons dû nous attaquer à nous outiller nous-mêmes pour pouvoir gérer l'assistance aux utilisateurs 
> et leurs demandes de support.   

Ces contextes sont susceptibles d'être modifiés en fonction des évolutions des activités, du business model et autres aléas inhérents au GIP PIX, ainsi que des obligations techniques de la plateforme.

### Anatomie du code

La nouvelle arborescence générale du code de Pix API devient :

```
api
 └ bin
    └ www
 └ db
 └ lib
    └ accounts
    └ admin
    └ assessment
    └ certification
    └ content
    └ profile
    └ training
 └ server.js
```

> Les répertoires ou fichiers non impactés par cet décision d'architecture ne sont pas mentionnés. 

Chaque module de code respecte la même organisation de code :

```
api/lib/<context>
 └ application
    └ routes
    └ controllers
    └ prehandlers
    └ …
 └ domain
    └ models (aggregates, entities, value objects)
    └ services
    └ usecases
    └ validators
    └ …
 └ infrastructure
    └ adapters
    └ converters
    └ serializers
    └ repositories
    └ …
```

### Utilisation de plugins Hapi.js

Hapi.js recommande de découper son code en modules métier. À ces fins, le framework propose le mécanisme des plugins, l'équivalent des middlewares sous Express.js. 

> hapi has an extensive and powerful plugin system that allows you to very easily break your application up into isolated pieces of business logic, and reusable utilities. You can either add an existing plugin to your application, or create your own.

### Gestion des communs

Il existe 2 types de commun :
- les communs techniques
- les communs fonctionnels

**Communs techniques**

Certaines classes ou modules techniques doivent être mutualisées, ex : `DomainTransaction`, `logger`, `knex`, `bookshelf`, etc.

Ces composants sont gérés dans un répertoire `api/lib/commons`.

```
api/lib/commons
 └ config
    └ environment.js
 └ prehandlers
    └ check-resource-access.js
    └ check-role-pix-master.js
    └ …
 └ serializers
    └ jsonapi
       └ bad-request-error.js
       └ index.js
       └ internal-error.js
       └ …
    └ …
```

**Communs fonctionnels**

Il se peut que des concepts métier soient pertinents dans plusieurs contextes, pour plusieurs finalités, pour servir 
plusieurs applications (Pix App, Pix Orga, Pix Admin). Bien que la duplication de code soit le plus souvent 
déconseillée, nous prenons le parti de pratiquer la duplication de code des modèles de deomain métier, par contexte. 
Ainsi, nous acceptons que l'entité `Scorecard` (ou un synonyme) se retrouve partiellement ou complètement dupliquée dans
le contexte de prescription et de celui d'administration (des utilisateurs).

Le gain attendu est une véritable autonomisation du contexte et des développeurs agissant sur le domaine concerné.

L'inconvénient est une augmentation & duplication de lignes de code, ainsi qu'une "charge d'évolution" (penser aux 
impacts sur les différents contextes lorsque l'ont fait évoluer une table ou un concept) à prendre en compte lors de 
certains changements applicatifs.  

## Liens

- [Architecture Hexagonale : trois principes et un exemple d'implémentation](https://blog.octo.com/architecture-hexagonale-trois-principes-et-un-exemple-dimplementation/)
- [BoundedContext](https://martinfowler.com/bliki/BoundedContext.html)
- [Hapi.js | Plugins](https://hapi.dev/tutorials/plugins)
