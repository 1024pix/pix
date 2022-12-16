# 31. Supprimer une propriété de type texte 

Date : 2022-02-16

## Etat

Accepté

## Contexte

Lors de la réalisation de [cette pull request](https://github.com/1024pix/pix/pull/3953).
Nous avons besoin de supprimer une propriété de type texte sur un objet déjà présent en base de données, par exemple la description d'un badge.
Il existe actuellement plusieurs manières de le faire côté front :
1. envoyer une chaîne vide
2. envoyer null

La deuxième possibilité se traduit généralement par une ternaire qui vérifie si la chaîne est vide avant de l'envoyer à l'API.

Côté API, il existe aussi plusieurs manières de valider les chaînes de caractères reçues :
- `Joi.string().required().allow('')` - La propriété doit être présente mais on accepte les chaînes vides
- `Joi.string().required().allow(null)` - La propriété doit être présente mais on accepte null
- `Joi.string().empty('').allow(null).optional()` - La propriété n'est pas obligatoire, on accepte null et une chaîne vide est considéré comme `undefined`
- `Joi.string().allow(null).optional()` - La propriété n'est pas obligatoire et on accepte null

On peut déduire des validations précédentes un certains nombre de cas:
1. La propriété n'est pas présente dans le payload
2. La propriété vaut chaîne vide
3. La propriété vaut null
4. La propriété est une chaîne de caractère non vide

Chacun de ces cas laisse transparaître une intention plus ou moins claire :
1. On veut vider le champ ou ne rien faire ?
2. On veut vider le champ ou on veut stocker une chaîne vide ?
3. On veut vider le champ
4. On veut mettre à jour le champ

On constate que dans les deux premiers cas il peut y avoir un doute.

On souhaiterait donc :
- Faciliter les choix des développeurs lorsqu'il doivent écrire la validation côté API
- Définir une manière claire de supprimer une propriété de type texte

### Les difficultés rencontrées aujourd'hui

Il est important aussi de préciser que par le passé, suite à des mises à jours de données manuelles, il y a des chaînes vides au lieu de `NULL` (SQL),  ce qui avait une incidence sur la manière dont la donnée était interpretée par l'API. 

### Solution n°1 : Utiliser la valeur `null` 

La valeur `null` est utilisée pour signifier qu'on veut supprimer une propriété de type texte.

On n'autorise que deux intentions claires côté validation :
1. supprimer la propriété avec la valeur `null`
2. mettre à jour la propriété avec une chaîne de caractères différente de `""` 

#### Avantages 

- Deux intentions clairement définies, il n'y a pas de questions à se poser
- Le code de l'API a majoritairement été pensé pour gérer la valeur `null` dû à notre utilisation de Postgres
- La validation à l'heure actuelle tend vers une utilisation de la value `null` en majorité

#### Inconvénients

- API est plus restrictive
- Néccessite une ternaire côté front `valeur.trim() === "" ? null : valeur` (cet inconvénient peut être mitigé avec l'usage d'un transform Ember)

### Solution n°2 : Utiliser la valeur `""` 

La valeur `""` est utilisée pour signifier qu'on veut supprimer une propriété de type texte. 

On n'autorise que deux intentions claires côté validation :
1. supprimer la propriété avec la valeur `""`
2. mettre à jour la propriété avec une chaîne de caractères différente de `""` 

#### Avantages 

- Deux intentions clairement définies, il n'y a pas de questions à se poser
- Pas de gestion spécifique sur les chaînes côté front (pas de ternaire avant l'envoi à l'API)

#### Inconvénients

- On faut changer le code backend pour gérer les chaînes vides correctement côté API
- Dans la majorité des usages en termes de validation on utilise `null` à l'heure actuelle
- API est plus restrictive

Si on décide de stocker en base de données la valeur `""` :

- On se prive des opérateurs SQL lié à la valeur `NULL` (ex: `IS NULL/IS NOT NULL`)

### Solution n°3 : Utiliser des solutions spécifiques 

On va définir la validation des propriétés de type texte en fonction des usages pour avoir la solution la plus adaptée possible.

On n'autorise des valeurs multiples côté validation qui peuvent réfléter un ensemble d'intentions diverses (`""`, `" "`, une chaîne différente de `""` ou `" "`, `undefined` ou encore `null`).

#### Avantages 

- On a une solution adaptée à notre cas particulier qui justifie l'usage d'une chaîne vide plutôt que `null` 
- API permissive

#### Inconvénients

- Les développeurs doivent systématiquement se poser la question (charge cognitive en plus)
- Les intentions ne sont pas clairement définies entre (`""`, `null` ou `undefined`). Elles peuvent varier d'un usage à un autre.
- Pas d'uniformisation du design de l'API

### Décisions

On choisit donc la solution n°1 qui semble répondre le mieux à la problématique.

### Conséquences

On utilise la validation Joi (dans le routeur ou le domaine) suivante pour les propriétés de type texte : 

```js
Joi.string().allow(null).required()
```

On ajoute le transform suivante dans les applications Ember pour éviter l'utilisation de ternaire :

```js
import Transform from '@ember-data/serializer/transform';

export default class StringTransform extends Transform {

 serialize(string) {
   if (string.trim() === '') {
     return null;
   }
   return string;
 }

 deserialize(string) {
   return string;
 }
}
```
