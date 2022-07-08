# 11. Organisation des fichiers de traductions

Date : 2020-07-09

## État

En cours d'expérimentation

## Contexte

L'application App de Pix va avoir une version anglaise. Pour cela, nous devons traduire les textes présents sur l'application `mon-pix`.
Pour gérer la traduction, nous utilisons l'add-on Ember `ember-intl`. Les traductions sont disponibles au format JSON dans le dossier `translations`.
Le fichier JSON de la langue française sera directement envoyé à notre traductrice. 

## Décision

### Fichiers de traductions
Les textes se trouvent dans des fichiers uniques `fr.json`/`en.json`.

Les textes sont rangés par ordre alphabétique des clés de traduction.

Les fichiers de traduction contiennent :
- Une partie `common` : tous les mots que l'on peut retrouver dans toutes les pages de Pix (ex: Pix, Annuler, Obligatoire), les mots liés à des composants réutilisés partout
- Une partie `navigation` : lien des menus, liens "Retour à l'accueil"
- Une partie `api-error-messages` : les traductions des erreurs remontées par l'API
- Une partie pour les pages `pages` : (ex : `pages.list-certifications`, `pages.challenges`)

Dans la partie `common` :
- Une partie `actions` avec les actions disponibles à plusieurs endroits (Annuler, etc...)
- Une partie `fields` avec les champs de formulaire utilisés à plusieurs endroits

Dans chaque page : 
- Un `title` avec le titre de la page (en premier dans les traductions de la page)
- Une partie `actions` représentant les actions/boutons possibles. Chaque `action` contient:
    - un `label`: il s'agit du texte visible contenu dans le bouton
    - un `extra-information`: il s'agit du texte contenu dans l'attribut html `title`

Les clés de traduction utilisées doivent aider à comprendre le contexte de la phrase.
Il se base sur l'intention et ne reprend pas forcément la terminologie des attributs html lorsque l'intention n'y est pas claire.

Les variables doivent être écrites en kebab-case (ex : `certification-header-title`)

### Tests

- Le `setupIntl` pour les tests d'intégration se fait dans `setupIntegration` pour les tests d'intégration
- Les tests ont pour local `fr`
- On ne test pas les traductions (le plugin vérifie la présence de la traduction) 

### Build

En cas d'absence de traduction dans un fichier, le build de l'application échoue.

## Utilisation du service de traduction

### Dates

Pour gérer les dates (et les formats) : `{{format-date this.certification.date format='L'}}`.
Les formats sont dans le fichier `mon-pix/app/formats.js`

Pour gérer les durées: `{{moment-duration tutorial.duration}}`, où:
- `tutorial.duration` contient la durée au format HH:mm:ss, 
- `moment-duration` traduit ici la durée en toutes lettres (l'expression retourne par exemple "3 minutes")

Il est également possible de mettre le formattage directement au niveau de la traduction avec cette syntaxe:
`"key": "Mon texte à la date du {maDate, date, L} à {monHeure, time, hhmm}

Ne pas oublier d'indiquer les locales prises en charge dans le tableau `moment.includeLocales` du fihier `mon-pix/config/environment.js`

### Paramètres

Il est possible de passer des paramètres au helper `t`:
- dans le hbs:
```html
{{t 'challenge.title' stepNumber=this.stepNumber totalChallengeNumber=this.totalChallengeNumber}}
```
- dans le js
```js
this.intl.t('challenge.title', { stepNumber, totalChallengeNumber })
```
- dans le json:
```json
"challenge": {
    "title": "Épreuve {stepNumber} sur {totalChallengeNumber}"
}
```
### Pluriels

Pour gérer le pluriel : `"description": "{ daysBeforeReset, plural, =0 {0 day} =1 {1 day} other {# days} } left before reset."`

### Pour les futures développements :

Pour les développements à venir, les textes des maquettes doivent être envoyés aux traducteurs en avance.
Dans le cas de retard dans les traductions : 
- Ajouter les textes dans fr.json
- Dans en.json, mettre une traduction anglaise (à vérifier en internet)
- Le fichier fr.json sera fourni aux traducteurs qui nous fourniront un nouveau en.json

## Références : 
- https://ember-intl.github.io/ember-intl/





