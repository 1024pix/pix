# 3. Langages, frameworks et technologies

Date: 2019-08-23

## État

Accepted

## Contexte

Chez Pix, nous croyons que l'avenir de l'IT passe par :

- le **Web** plutôt que les clients lourds ou applications mobiles natives, 
- l'**Open Source** plutôt que les solutions propriétaires 
- et les **standards** universels (HTML, CSS, HTTP, REST, etc.) plutôt que des solutions inédites

Sur la base de ces convictions et selon l'approche de *design émergent*, nous devons régulièrement faire face à des choix d'architecture, de services ou de technologies. Cette prise de décisions doit se faire en veillant à la cohérence, l'évolutivité et l'adéquation de la plateforme logicielle par raport à la mission de Pix et sa stratégie de développement dans le marché qui est le nôtre.

## Décision

### Limiter les technologies et leur diversité

En phase avec le proverbe *less is more*, nous pensons que la simplicité d'un SI découle (entre autres) de la réduction des ressources impliquées et de leur bon usage, aux justes fins.

L'ajout d'un langage, d'un frameworks ou de tout autre brique logicielle au sein du SI et de l'architecture de la plateforme Pix DOIT faire l'objet d'une étude approfondie. Le but de cette étude est de contrôler la complexité liée au nombre et à la nature des composants du SI ainsi qu'à leurs interactions ou interdépendances.

Par ailleurs, limiter les technologies permet de limiter les expertises requises pour développer de façon autonome, productive et confortable le projet ; et ainsi :

- faciliter le recrutement
- simplifier la montée en compétence des nouveaux membres de l'équipe
- réduire l'effort et le coût de maintenance

### Privilégier JavaScript
 
Nous pensons que JavaScript est un langage d'avenir permettant dès aujourd'hui de développer tout type d'applications logicielles (IHM Web, API & back-office, CLI, scripts & utilitaires) avec un haut degré de qualité (en termes de complexité métier, UX, tech, archi ou méthodo).

Ainsi, nous adoptons JavaScript (langage), Node.js (plateforme) et NPM (écosystème) comme technologies centrales et principales de Pix.

La création d'applications Web, API, CLI ou de scripts DOIT privilégier une solution JS/Node.js. Pour rappel, JavaScript fait partie, avec HTML et CSS, des 3 langages supportés par tout navigateur Web récents ou moins.

Si le service, l'activité ou le programme à accomplir ne s'y prête pas, on PEUT utiliser un autre langage, écosystème, technologies. Ex : pour faire du calcul de type Data Science, il semble préférable de privilégier Python ou R.

Nous faisons le choix de NPM comme gestionnaire de package plutôt que Yarn pour les raisons suivantes : 

- NPM est nativement inclus dans Node.js, ce qui en fait le standard *de facto* 
- NPM a rejoint Yarn niveaux fonctionnalités, performances et sécurité
- [NPM conserve une longueur d'avance](https://www.npmtrends.com/npm-vs-yarn) en termes de tendances


### Privilégier des solutions Open Source

Nous privilégions l'usage de technologies Open Source pour les raisons suivantes :

- convictions éthiques
- indépendance de Pix vis-à-vis d'éventuels éditeurs
- accès au code source qui permet de comprendre, étendre ou intégrer la solution à notre contexte / besoin 
- accès à la communauté (plutôt qu'un obscur support)
- approche et solution plus proches des standards
- qualité de la solution (nombre de contributeurs potentiellement infini VS. une poignée d'employés) : bugs, sécurité, etc.
- coût / économie

On PEUT toutefois utiliser des technologies ou services propriétaires si c'est la meilleure solution pour un problème donné, ex : 

- Mailjet pour la gestion d'e-mails, 
- Airtable pour le référentiel pédagogique, 
- prismic.io pour le contenu éditorial, 
- Freshdesk pour le support.

## Conséquences

A4H
