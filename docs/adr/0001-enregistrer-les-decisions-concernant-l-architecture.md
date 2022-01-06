# 1. Enregistrer les décisions concernant l'architecture

Date : 2019-04-25

## État

Accepté

## Contexte

Sur ce projet, nous avons besoin de :

- prendre facilement des décisions concernant l'architecture;
- pouvoir comprendre pourquoi une décision a été prise dans le passé, afin de prendre une autre décision si les
  circonstances ont changé;
- savoir qu'une décision donnée a été modifiée ou remplacée par une décision ultérieure. Voir

Voir [l'issue originale](https://github.com/1024pix/pix/issues/480)

### Solution n°1 : Architecture Decision Record

**Description**

Les *Architecture Decision Records* (*ADR*) de Michael Nygard obéissent aux règles
suivantes ([article original](http://thinkrelevance.com/blog/2011/11/15/documenting-architecture-decisions)):

- we will keep a collection of records for "architecturally significant" decisions
- this collection will be kept in the project repository
- each record will be a short text file, with just a few parts
- if a decision is reversed, we will keep the old one around, marking it as superseded
- we will use a lightweight text formatting language

**Avantage(s):**

- ouvrir une *pull request* sur une *ADR* permettent un échange pour prendre une décision d'architecture
- accessibles au quotidien sans coût d'outillage
- la connaissance reste dans le projet, malgré le départ des développeurs
- cela permet de partager la connaissance au reste du monde, le repository étant Open-source

**Inconvénient(s):**

- il faut passer du temps à rédiger les *ADR*

### Solution n°2 : Connaissance tacite et informelle

**Description**

Si les développeurs :

- travaillent en pair-programming ou en mob programming;
- effectuent des revues de code;
- changent d'équipe régulièrement.

Alors il est possible que :

- les développeurs se réunissent pour prendre des décisions d'architecture;
- les développeurs ayant pris ces décisions d'architecture les exposent par oral à ceux récemment arrivés;
- cette exposition se fait lors du développement et des revues de code.

**Avantage(s):**

- aucun coût direct de mise en oeuvre

**Inconvénient(s):**

- si la transmission n'est pas effectuée, la connaissance est perdue
- la connaissance n'est pas partagée avec le reste du monde

## Décision

Nous avons choisi la solution n°1, à savoir les ADR, car le temps passé à créer un ADR est minimal par rapport au risque
encouru si la connaissance est perdue.

## Conséquences

Matérialiser cette décision sous la forme d'un ADR autoportant.

En d'autres termes, ce fichier est :

- le premier ADR;
- un template pour les prochains ADR.

Il existe également un outil CLI ([adr-tools](https://github.com/npryce/adr-tools)) qui permet de générer ce template.
