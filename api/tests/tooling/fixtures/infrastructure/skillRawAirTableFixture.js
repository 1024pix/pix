const AirtableRecord = require('airtable').Record;

module.exports = function skillRawAirTableFixture({ id } = { id: 'recTIddrkopID28Ep' }) {
  return new AirtableRecord('Skill', id,{
    'id': id,
    'fields': {
      'id persistant': id,
      'Nom': '@accesDonnées1',
      'Indice': 'Peut-on géo-localiser un téléphone lorsqu’il est éteint ?',
      'Statut de l\'indice': 'Validé',
      'Status': 'actif',
      'Epreuves': [
        'recF2iWmZKIuOsKO1',
        'recYu7YmDXXt5Owo8',
        'recbH4xMDsDZnRzzN'
      ],
      'Compétence (via Tube) (id persistant)': [
        'recofJCxg0NqTqTdP'
      ],
      'Comprendre (id persistant)': [
        'receomyzL0AmpMFGw'
      ],
      'PixValue': 2.4,
      'En savoir plus (id persistant)': [
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
