# 31. Uniformiser la validation des chaînes de caractères

Date : 2022-02-16

## Etat

En cours

## Contexte

Lors de la réalisation de la pull request https://github.com/1024pix/pix/pull/3953.
On s'est rendu compte qu'il n'est pas trivial de vider un champ de base données.
Il existe actuellement plusieurs manière de le faire côté front :
1. envoyer une chaîne vide
2. envoyer null

La deuxième solution se traduit généralement par une ternaire qui vérifie si la chaîne est vide avant de l'envoyer à l'API :

```js
const customLandingPageTextTrim = this.form.customLandingPageText ? this.form.customLandingPageText.trim() : null;
```

Côté API, il existe aussi plusieurs manière de valider les chaînes de caractères reçues :
1. `Joi.string().required().allow('')` - La propriété doit être présente mais on accepte les chaînes vides
2. `Joi.string().required().allow(null)` - La propriété doit être présente mais on accepte null
3. `Joi.string().empty('').allow(null).optional()` - La propriété n'est pas obligatoire mais on accepte null et une chaîne vide est considéré comme `undefined`
4. `Joi.string().allow(null).optional()` - La propriété n'est pas obligatoire mais on accepte null

On peut déduire de cette validation un certains nombre de cas:
1. La propriété n'est pas présente dans le payload
2. La propriété vaut chaîne vide
3. La propriété vaut null
4. La propriété est une chaîne de caractère non vide

Chaque état devrait laisser transparaître une intention:
1. On veut vider le champ ou ne rien faire ?
2. On veut vider le champ ou on veut stocker une chaîne vide ?
3. On veut vider le champ
4. On veut mettre à jour le champ

On constate que dans le deux premiers cas il peut y avoir un doute.

Malgré tout il se dégage de l'existant que dans la majorité des cas la validation 1. est utilisée et par conséquent on utilise une ternaire côté front pour gérer les chaînes vides.

### Les difficultés rencontrées aujourd'hui

Il est important aussi de préciser que par le passé on a eu des bugs lié à l'utilisation d'adminer. Il est arrivé qu'avec adminer on stocke des chaînes vides au lieu de null ce qui avait une incidence sur la manière dont la donnée était interpreté par l'API.

### Solution : Réduire le nombre de valeurs acceptées par le backend 

N'autoriser que deux intentions claires côté validation :
1. On veut vider le champ
2. On veut mettre à jour le champ

Ce qui se traduit côté joi par la ligne suivante :
`Joi.string().required().allow(null)`

Cela implique que côté front on doit vérifier les chaînes vides. C'est fastidieux de le faire au niveau de chaque formulaire.
Heureusement il existe le mécanisme de Transform côté Ember.

```js
import Transform from '@ember-data/serializer/transform';

export default class StringTransform extends Transform {

 serialize(string) {
   if (string === '') {
     return null;
   }
   return string;
 }

 deserialize(string) {
   return string;
 }
}
```

On pourrait donc une fois par application définir comment sont sérialisé les chaînes de caractères. Cela permet de ne faire la ternaire qu'une seule fois.

### Décisions

### Conséquences
