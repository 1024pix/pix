# 29. Formater les templates Ember

Date : 2021-07-20

## État

En cours

## Contexte
Nous avons besoin de formater le code pour faciliter sa lecture.
Cet ADR se propose de choisir une solution pour les templates handlebars.
Il ne remet pas en cause l'outil de lint (eslint) et son plugin pour les templates handlebars.
Une ambigüité peut néanmoins faire surface, car l'outil propose des règles syntaxiques, donc de formatage.

### Lint et formatage
Les outils d'analyse statique de code, c’est-à-dire sans exécution du code testé, sont aussi appelés outils de lint.
Il existe une ambigüité avec d'autres outils, ceux de formatage, pour deux raisons.  

En premier lieu, leur domaine d'application se chevauche.
Le formatage s'occupe de la mise en page, c’est-à-dire de la présentation du code source à l'écran, pour le développeur.
Son but est de rendre le code plus intelligible en effectuant des micro-décisions (ex: indentation, espace non-significatif).
Un code modifié par un outil de formatage ne changera pas de comportement lors de son exécution (ex: tests 
automatisés). Ceci dit, un outil de lint peut disposer de fonctionnalités de formatage.

Ensuite, leur mode de fonctionnement tend à se rapprocher.
Un outil de formatage applique une série de transformations au code brut pour obtenir un code standardisé.
A l'origine, il n'a aucune fonctionnalité d'assistance (ex: suggérer l'ajout d'indentation à un endroit).
Au contraire, l'outil de lint ne modifie pas le code, il ne fait que l'inspecter pour produire un rapport.
Or:
- les outils de lint proposent également des fonctionnalités `auto-fix`
- les outils de formatage proposent également des fonctionnalités `dry-run`

### Configuration

#### Linter
Les linter contiennent des règles qui peuvent être activées (et configurées) individuellement, par exemple 
une règle de formatage: présence d'une ligne vide en fin de fichier [eol-last](https://eslint.org/docs/rules/eol-last).
Les linter proposent des configurations standard, aussi appelées `preset`, qui rassemblent des règles, par exemple celle 
de [eslint](https://github.com/eslint/eslint/blob/master/conf/eslint-recommended.js). 

#### Formater

Certains formaters ne proposent quasiment aucune configuration, et ne garantissent pas la continuité des 
règles appliquées, c’est-à-dire qu'une nouvelle release du formater peut entraîner un nouveau formatage
en l'absence de modification du fichier.

[L'argumentation](https://prettier.io/docs/en/why-prettier.html) d'un de ces formater, `Prettier` est que cela
permet au développeur de se concentrer sur d'autres tâches lors de l'implémentation et de la revue.

Par exemple, il existe [20 options pour Prettier](https://prettier.io/docs/en/options.html#end-of-line))

Un exemple de comportement non configurable est la présence obligatoire d'une ligne vide en fin de fichier,
[spécifié par POSIX](https://stackoverflow.com/questions/729692/why-should-text-files-end-with-a-newline/729795).
La plupart du temps, le code est exécuté sur des distributions Linux non certifiées POSIX: faut-il faire figurer
cette ligne vide ? Prettier répond ["Oui" partout](https://github.com/prettier/prettier/issues/6360).

Pour résumer
> By far the biggest reason for adopting Prettier is to stop all the ongoing debates over styles.
[Source](https://prettier.io/docs/en/option-philosophy.html)

### Templates Ember (hbs)

Les templates utilisés par Ember (hbs - handlebars) ont pour cible le html.

Un html peut présenter :
- une structure assez profonde (nombre de niveaux), malgré l'approche orientée composants;
- des éléments avec de nombreux attributs.

De plus, il n'existe pas d'éditeur visuel handlebars. 

En conséquence, un formatage approprié est important. 

### Approche Pix
Jusqu'ici, l'approche utilisée est:
- outil de lint;
- avec de nombreuses [configurations spécifiques](../../.eslintrc.yaml).

Nous ne connaissons pas le besoin à l'origine des configurations spécifiques.


### Solution n°1: utiliser les règles syntaxiques du linter natif
Le linter natif [ember-template-lint](https://github.com/ember-template-lint) propose des règles d'inspection du 
formatage. Elles sont embarquées dans le preset `stylistic`, voici une [règle en exemple](https://github.com/ember-template-lint/ember-template-lint/blob/master/docs/rule/linebreak-style.md).

Avantages:
- configurable
- bibliothèque déjà présente

Inconvénients:
- pas d'option `auto-fix` sur le formatage [pour l'instant](https://github.com/ember-template-lint/ember-template-lint/issues/1180): la reprise d'historique (ex: indentation) doit notamment être faite manuellement

### Solution n°2: utiliser le formater Prettier
Avantages:
- très peu configurable (20 options en tout)
- le code en cours d'écriture et la reprise d'historique sont automatiquement corrigés

Inconvénients:
- abandon imposé de certaines règles, par exemple l'absence de ligne vide en fin de fichier
- support considéré comme expérimental

Prettier peut déclenché :
- indépendamment
- par le linter (eslint-template-lint) via le plugin [ember-template-lint-plugin-prettier](https://github.com/ember-template-lint/ember-template-lint-plugin-prettier)

## Décisions

Comme il n'y a pas consensus, mais qu'aucun argument n'est apporté contre Prettier,
décision est prise d'essayer Prettier sur un repository de taille réduite (Pix Admin)
et de faire un bilan d'ici quelques mois.

## Conséquences

Installer Prettier.

L'intégrer au linter pour qu'il soit intégré à la CI (installer le plugin [ember-template-lint-plugin-prettier](https://github.com/ember-template-lint/ember-template-lint-plugin-prettier)).

Ajouter une tâche npm qui permet de formater, car tous les IDE ne prennent pas en compte la configuration de
Prettier via eslint-template-lint, stockée dans le fichier `.template-lintrc.js`.

`"lint:hbs:fix": "prettier **/*.hbs --write --parser=glimmer"`
