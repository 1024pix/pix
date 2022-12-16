# 12. utiliser-ember-pour-le-developpement-d-applications-front

Date: 2020-07-13

## État

Accepted

## Contexte

> Cette ADR est une "rétro-ADR" qui explique un choix effectué et mis en œuvre depuis 4 ans.  

Pix a vu le jour une nuit de juin 2016, veille d'un Open Lab (grosse réunion avec des responsables de l'Éducation nationale, de l'Enseignement supérieur et autres DRH & DSI d'acteurs majeurs du CAC 40).

La toute première version de l'application se résumait à 2 simples pages HTML/CSS. L'objectif était de présenter un concept et démontrer une vision pour valider nos hypothèses métier, rassurer/engager un max de partenaires potentiels avec nous et enclencher une dynamique.

La présentation fut un franc succès et dans les jours qui ont suivis, il a fallu se poser la question de la suite : nos pratiques (c'était facile, XP, pratiques agiles + craft + Ops), l'infra, et surtout notre stack technique.  

À ce moment, l'équipe technique était composée de 2 développeurs full-stack. Nous avons longtemps réfléchi au framework à utiliser : Play Framework, React, Vue, Angular, Backbone, jQuery, Meteor.

Nos besoins / envies / espoirs à ce moment là étaient les suivants :

- permettre une approche orientée plateforme, avec un "bloc API" central, lequel serait consommé par plusieurs applications Web front ou mobile, qui pourraient être développées par n'importe quelle personne de n'importe quelle future équipe (nous n'avions pas encore d'organisation en Product Teams, mais c'était un élément de vision globale) selon des façons de faire uniforme
- permettre une expérience utilisateur réactive, donc un style d'architecture SPA ou hybride (qui n'en était qu'à ses prémisses) plutôt que SSR-only 
- être au plus proche des concepts et standards du Web et des paradigmes de développement modernes (routage, gestion de l'état du système, sécurité, accessibilité, performance, etc.)
- être bien documenté
- reposer sur une communauté et d'un environnement actifs et de qualité (addons, outillage, forums, meetups, confs, etc.)
- démontrer une maturité (éviter le *Hype Driven Development*)
- présenter des garanties d'évolution et de maintenance

Sans oublier, nos contraintes d'archi technologiques :

- Limiter les technologies et leur diversité  
- privilégier des solutions JavaScript
- privilégier des solutions Open Source

Parmi les contraintes que nous n'avons pas forcément retenues :

- montée en compétence : nous estimions avoir suffisamment d'expérience dans le dev Web front-end
- le fait d'être appuyé par un GAFAM : bien mais pas vital 


## Décision

Suite à des premiers travaux exploratoires, nous avons éliminé [Météor](https://www.meteor.com/), [Phénix](https://github.com/phoenixframework/phoenix) et [ELM](https://elm-lang.org/). Nous avons estimé qu'ils ne correspondaient pas à nos besoins fonctionnels (pas besoin de temps réel ou de synchronisation multi-clients avancée) et que la montée en compétence serait un frein.

Nous avons alors pensé à [Play Framework](https://www.playframework.com/) ou [Spring Boot](https://spring.io/projects/spring-boot), que nous avions déjà eu l'occasion d'utiliser en production sur des gros projets et qui possédaient le côté rassurant qui nous avait manqué lors de nos expérimentations techniques avec les solutions précédentes. Mais ils ne couvraient pas plusieurs critères : architecture SPA, JavaScript, communauté, garanties d'évolution (à peine 1 release minor tous les 2 ans).

Nous nous sommes recentré sur les frameworks Web JS. Pour l'avoir vécu / subi, nous avons éliminé la solution *vanilla JS*, car elle ne permet pas de coller simplement aux standards du Web, qu'il y a un gros efforts de documentation ou encore car elle ne permet pas de bénéficier des dernières avancées technologiques comme la gestion d'un DOM virtuel ou d'un store d'état interne.

Nous avons éliminé les *libraries* ou frameworks trop anciens dont l'avenir semblait appartenir au passé : [jQuery](https://jquery.com/), [Backbone](https://backbonejs.org/), [Marionnette.js](https://marionettejs.com/).

Nous avons éliminé les technologies trop nouvelles ou d'estime : [Aurelia](https://aurelia.io/), [Durandal](http://durandaljs.com/), [Mithril](https://mithril.js.org/).

À partir de là, il nous restait : [AngularJS](https://angularjs.org/) / [Angular](https://angular.io/), [Ember](https://emberjs.com/), [React](https://reactjs.org/) et [Vue](https://vuejs.org/).

À cette époque, AngularJS (v1.x) était plutôt bien implanté, mais React avait déjà pris l'ascendant, notamment en terme de communauté et d'activité sur GitHub / NPM. L'équipe Google travaillait déjà depuis plusieurs mois sur Angular (v2.x+) et une version bêta était disponible. Malheureusement Google avait déjà annoncé une incompatibilité entre les 2 versions. Ajouté à cela une confiance rompue envers les technos et la gouvernance de frameworks Web Open Source par Google (cf. GWT, Dart, Polymer, etc.), nous avons éliminé AngularJS & Angular.

React était le framework le plus en vogue, mais nous avions un doute quant au "syndrôme Google", à savoir oublier le passé et la communauté sur un coup de tête de l'équipe (chez Facebook) en charge du projet. Par ailleurs, il existait déjà le phénomène propre à la communauté React de proposer 10 solutions viables pour 1 problème donné (ex : Hooks, Redux, Mobx, etc.). Nous avions peur de ne pas parvenir à définir une stack unique et consistante entre les multiple projets front-end anvisagés. Enfin le fait de mettre du HTML et du CSS dans du JS ne nous a pas paru respecter les standards. Nous avons éliminé React.

Vue était le framework avec la plus forte progression en terme de *hype*. Nous avons été très agréablement surpris par la simplicité de l'outil, sa qualité et de façon générale sa *developer experience*. Mais nous avons été refroidi par le fait qu'à l'époque, la lib reposait quasi-exclusivement sur 1 unique contributeur, sans gros sponsor ou référence derrière (hormis [Alibaba.com](https://madewithvuejs.com/alibaba)). Nous avons éliminé Vue pour cette raison.

Finalement, nous avons - encore une fois, il faut bien se remettre dans le contexte - retenu Ember.

Les raisons qui nous ont convaincues à l'époque et qui restent d'actualité :

- le côté full-framework
- l'aspect conventions over configuration
- la réutilisabilité qui en découle (compatible avec une vision d'une architecture orientée plateforme)
- le CLI
- la maturité du framework (2009) par rapport à tous les autres
- la modernité (componentisation, Glimmer, SPA, SSR, PWA, etc.)
- la qualité du code
- la documentation

## Conséquences

Nous avions anticipé certains écueils qui se sont malheureusement avérés :

- la montée en compétence longue et difficile sous bien des aspects (notamment le côté "conventions over configuration" qui est à double tranchant)
- la communauté plus restreinte que React, Vue et Angular 
- et donc un défaut de documentation ou de plugins au goût du jour 
- la gestion du state avec Ember Data
- le fait de devoir implémenter / respecter JSON API (si on ne veut pas s'attirer les foudres d'Ember #TrueStory)
- les tests applicatifs avec Mirage

En revanche, dès lors que : 

- on respecte le framework
- on suit la doc
- on met régulièrement à jour les versions d'Ember
- on respecte les standards du Web
- on fait des tests automatisés
- on respecte les pratiques craft (bien nommer et découper son code, refactorer souvent, etc.)

… on obtient des applications modernes de qualité qui, si elles ne sont pas les plus simples ou les plus amusantes à maintenir, permettent d'atteindre le million d'utilisateurs dans des conditions tout à fait acceptables.
 
