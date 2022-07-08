# 4. Traitement du type date sans horaire dans Pix

Date : 2019-11-04

## État

Accepted

## Contexte

Dans l'ensemble des données manipulées dans l'écosystème Pix se trouvent des données telles que des dates de création, de mise à jour,
mais aussi des dates de naissance par exemple. Ces données, qui semblent juste représenter des dates, peuvent en réalité se diviser selon deux catégories :
- Les dates avec horaire qui consistent en de l'horodatage.
- Les dates sans horaire qui représentent simplement un jour précis.

À ce jour, ces dates sont traitées sans distinction dans Pix. Le traitement, le formatage et le stockage ne sont pas uniformes dans l'ensemble
du code produit et sont même parfois dictés par la dépendance à l'origine de la création de la valeur, et ce particulièrement
pour la deuxième catégorie énoncée plus haut à savoir les dates sans horaire.

Dans les faits, cette catégorie de date se retrouve être traitée et stockée à la manière des dates avec horaire: un horaire sans fondement
réel est assigné à ces dates, en général un horaire à minuit heure locale.
L'effet de bord alors le plus critique est que la date soit modifiée lors de la transmission de la donnée entre deux machines n'ayant pas
la même locale.
Cet effet est visible sur nos machines locales : 
```
$ date
Thu Nov  7 09:29:39 CET 2019

$ docker-compose exec -T postgres bash -c 'date'
Thu Nov  7 08:29:39 UTC 2019
```
Prenons en exemple la date du 23 Février 2018 (2018-02-23). Côté API, dans le cas initial où elle est représentée à l'aide de l'objet JS ```Date```, 
nous obtenons en réalité ```2018-02-23T00:00:00.000Z```. Cette date est ensuite envoyée vers la base de données qui va la recevoir en tenant compte
de sa propre locale, et va donc se transformer en ```2018-02-22T23:00:00.000Z```, puis tronquée pour correspondre à un type DATE de PostgreSQL pour
finalement devenir '2018-02-22'. La date est donc définitivement altérée.
Exemple de résultats dans les tests en local avant mise en application des recommandations :
```
  1) Integration | Repository | Session
       #get
         should return session informations in a session Object:

      AssertionError: expected { Object (id, accessCode, ...) } to have deep property 'date' of Fri, 23 Feb 2018 00:00:00 GMT, but got Thu, 22 Feb 2018 23:00:00 GMT
      + expected - actual

      -[Date: 2018-02-22T23:00:00.000Z]
      +[Date: 2018-02-23T00:00:00.000Z]

      at Context.it.only (tests/integration/infrastructure/repositories/session-repository_test.js:193:37)
```

## Décision

Il faut maîtriser le formatage des dates sans horaire à des points stratégiques des applications et être clair sur la manière de manipuler
ce type de date.

Une date sans horaire doit être représentée sous la forme d'une chaîne 'YYYY-MM-DD' selon les directives de l'organisation internationale de 
normalisation (norme ISO 8601).

Dans l'écosystème Pix, nous nous assurons de cette représentation à 2 endroits stratégiques :
- À la conversion des valeurs brutes retournées par la base de données en type Javascript par l'interface node-postgres.
- À la sérialisation des valeurs générées par les applications fronts vers l'API.

## Conséquences

Les valeurs lues depuis la base de données contenues dans une colonne ayant le type PostgreSQL DATE seront toujours retournées
en chaîne 'YYYY-MM-DD' :
```
const types = require('pg').types;
types.setTypeParser(types.builtins.DATE, (value) => value);
```

Les dates sans horaire dans les applications fronts doivent être typées à l'aide de la transform créée à cet effet 'date-only' :
```
// certif/app/models/certification-candidate.js
import DS from 'ember-data';

export default DS.Model.extend({
  firstName: DS.attr('string'),
  lastName: DS.attr('string'),
  birthdate: DS.attr('date-only'),
  birthCity: DS.attr('string'),
  birthProvinceCode: DS.attr('string'),
  birthCountry: DS.attr('string'),
  externalId: DS.attr('string'),
  extraTimePercentage: DS.attr('number'),
});
```
```
// certif/app/transforms/date-only.js
import DS from 'ember-data';

export default DS.Transform.extend({
  serialize: function(date) {
    return date;
  },
  deserialize: function(date) {
    const dateRegex = '^[0-9]{4}-[0-9]{2}-[0-9]{2}$';
    if (date.search(dateRegex) === 0) {
      return date;
    }
    return null;
  }
});
```

Les dates sans horaire reçues dans l'API depuis l'extérieur doivent toujours être validées au moment de leur désérialisation :
  
```
// api/infrastructure/serializers/certification-candidate-serializer.js
  deserialize(json) {
    if (!isValidDate(json.data.attributes.birthdate)) {
      throw new WrongDateFormatError();
    }
```
