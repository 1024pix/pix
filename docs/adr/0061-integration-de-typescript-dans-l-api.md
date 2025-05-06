# 61. Intégration de TypeScript dans l'API

Date : 2025-05-06

## État

En cours

## Contexte

Notre base de code API, écrite en JavaScript, compte près de 120 000 lignes et a plus de 9 ans. Des études, tests et réflexions ont été menés sur l'intégration de TypeScript dans l'API, notamment lors des TechDays 2022, suite à un sondage global au sein de l'équipe Engineering. **La conclusion a été de procéder à l'utilisation de TypeScript dans l'API** pour répondre à plusieurs enjeux :

- **Qualité, robustesse et maintenabilité accrues :** 
  - **Sécurité des types  :** Le code non typé est plus difficile à maintenir et à comprendre. Le typage clarifie le code et réduit les erreurs de typage, renforçant ainsi sa robustesse et facilitant sa maintenance à long terme. Cela peut également renforcer notre approche de Domain-Driven Design (DDD), en nous incitant à mieux définir nos objets et leurs usages.
  - **Vérification des types :** Permettra de sécuriser le code en détectant et en empêchant les erreurs courantes telles que les mauvais usages des objets, les incohérences de type, les erreurs de type (TypeError), ainsi que les erreurs liées aux valeurs nulles ou non définies ("is null" ou "undefined"). Cela assurera une meilleure fiabilité du code en production.
- **Autodocumentation :** TypeScript sert de documentation vivante du code, éliminant le besoin d'utiliser JSDoc pour définir le typage des interfaces (par exemple, pour les API internes), ce qui est souvent difficile à maintenir.
- **Amélioration de l'outillage :** TypeScript permet un usage avancé des outils IDE (auto-complétion, navigation, documentation) permettant d'améliorer ainsi l'efficacité et l'expérience de développement.

L'objectif de cet ADR est de statuer sur **un processus de mise en place progressif de TypeScript dans l'API**.

### Hors périmètre
- La mise en place de Typescript sur les applications frontend est exclu de cette ADR.

## Décision

Pour éviter un effet "Big Bang" lors de l'intégration de TypeScript, nous proposons une approche progressive en plusieurs étapes :
1. **Intégration d'un runtime TypeScript** dans l'API.
2. **Outillage de l'API :** Mettre en place des outils de développement pour TypeScript, tels que le type checking et le linting.
3. **Documentation des bonnes pratiques :** Initialiser une documentation des bonnes pratiques de développement TypeScript spécifiques à Pix.
4. **Phase pilote :** Utiliser TypeScript dans l'API par des équipes pilotes et affiner les bonnes pratiques.
5. **Conduite du changement :** Établir un plan de conduite du changement pour l'intégration de TypeScript dans l'API, incluant des sessions de formation comme des MEJ, Kata, Dojo, Bootcamp, etc.
6. **Lancement progressif :** Commencer l'intégration progressive de TypeScript dans l'API dans l'ensemble des équipes.

### Choix de Runtime typescript

**Décision du Runtime :** Utilisation du module natif TypeScript de NodeJs.
> NodeJS propose à partir de la version 24 un support partiel de TypeScript nativement. Le périmètre supporté répond au besoins Pix autour de TS. De plus, les fonctionnalités manquantes (enums, parameter properties...) seront disponibles dans les versions suivantes. Voir [NodeJS 14 Modules Typescript documentation](https://nodejs.org/docs/latest-v24.x/api/typescript.html#typescript-features). Cette solution permet l'utilisation du runtime natif NodeJS (sans étape de build).

**Mise en place du Runtime :**
La version du NodeJS v24 sera disponible en Octobre 2025 en version LTS.

En attendant la disponibilité de NodeJS v24 et pour anticiper l'intégration progressive de TypeScript dans Pix avec les équipes pilotes, nous avons décidé d'utiliser temporairement le runtime `tsx`. La configuration Typescript sera celle recommandée par NodeJS afin d'utiliser les features supportées par NodeJS v24. (voir [NodeJS 14 Modules Typescript documentation](https://nodejs.org/docs/latest-v24.x/api/typescript.html#typescript-features))

Nous prévoyons une période de 2 semaines d'expérimentation de `tsx` en production afin de mesurer son impact: CPU, Mémoire, Scaling...

`NodeJS v23` contient également le module TypeScript natif, mais cette version n'est pas LTS et sa phase de maintenance se termine en mai 2025. C'est pourquoi nous avons exclu son utilisation.

Dès que la version NodeJS v24 sera disponible, nous remplacerons l'utilisation de `tsx` par le runtime NodeJS v24 natif.

**Runtime vs Compilation ?**
La compilation du code TypeScript en Javascript a été écartée afin de ne pas ajouter une étape de build supplémentaire dans les workflows de CI/CD.
(exemple: compilation avec `tsc` ou `swc`)

## Conséquences

Plan pour la mise en place de Typescript dans l’API :

1. Création d’[une PR](https://github.com/1024pix/pix/pull/12119 "https://github.com/1024pix/pix/pull/12119") sur la mise en place du runtime TS.
  - 2 semaines d’expérimentation en production avec `tsx` et validation par les captains de l’utilisation de `tsx` en production. (scaling iso `node`, cpu, pas de fuite mémoire…)
2. Mise en place des équipes Pilotes de volontaires pour l’intégration de TypeScript.
  - Utilisation de TypeScript sur les nouvelles Epix. (création de code TS et mise à jour de JS)
  - Initialisation de la documentation des bonnes pratiques.
  - Mettre en place la stack d’outillage : `type-check`, `linter`
  - Itération sur la documentation des bonnes pratiques, des patterns et de l’outillage.
3. Sessions de conduite de changement et formation des équipes :
  - Diffusion de la documentation des bonnes pratiques et des patterns de développement TypeScript chez Pix.
  - MEJ sur des sujets précis (spécificité du language, bonnes pratiques et patterns chez Pix)
  - Kata et Dojo pour la formation et mise en pratiques
4. Dès la disponiblitité de NodeJS 24 en LTS (Active) et dispo sur Scalingo et CircleCI => remplacer `tsx` par `node`
5. Lancement de l'intégration progressive de TypeScript dans l'API pour l'ensemble des équipes Pix :
  - Tous les nouveaux fichiers sont créés en TypeScript.
  - Les fichiers JavaScript seront convertis progressivement et par opportunisme en TypeScript.
