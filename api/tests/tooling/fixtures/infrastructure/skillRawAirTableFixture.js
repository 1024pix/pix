const AirtableRecord = require('airtable').Record;

module.exports = function skillRawAirTableFixture() {
  return new AirtableRecord('Skill', 'recTIddrkopID28Ep',{
    'id': 'recTIddrkopID28Ep',
    'fields': {
      'Nom': '@accesDonnées1',
      'Indice': 'Peut-on géo-localiser un téléphone lorsqu’il est éteint ?',
      'Statut de l\'indice': 'Validé',
      'Status': 'actif',
      'Epreuves': [
        'recF2iWmZKIuOsKO1',
        'recYu7YmDXXt5Owo8',
        'recbH4xMDsDZnRzzN'
      ],
      'Compétence': [
        'recofJCxg0NqTqTdP'
      ],
      'Comprendre': [
        'receomyzL0AmpMFGw'
      ],
      'En savoir plus': [
        'recQbjXNAPsVJthXh',
        'rec3DkUX0a6RNi2Hz'
      ],
      'Tags': [
        'recdUq3RwhedQoRwS'
      ]
    },
    'createdTime': '2018-01-31T12:41:07.000Z'
  });
};
