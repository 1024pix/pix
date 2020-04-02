# 9. Redesign de Pix API

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


## Conséquences

La fin de la mise en œuvre de ce chantier sera l'occasion de monter la version majeure de la plateforme de 2.x à 3.X !

### Architecture


