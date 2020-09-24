const AirtableRecord = require('airtable').Record;

module.exports = function areaRawAirTableFixture(id = 'recvoGdo7z2z7pXWa') {
  return new AirtableRecord('Domaine', id, {
    'id': id,
    'fields': {
      'id persistant': id,
      'Competences (identifiants) (id persistant)': [
        'recsvLz0W2ShyfD63',
        'recNv8qhaY887jQb2',
        'recIkYm646lrGvLNT',
      ],
      'Code': '1',
      'Titre fr-fr': 'Information et données',
      'Titre en-us': 'Information and data',
      'Nom': '1. Information et données',
      'Competences (nom complet)': [
        '1.1 Mener une recherche et une veille d’information',
        '1.3 Traiter des données',
        '1.2 Gérer des données',
      ],
      'Couleur': 'jaffa',
    },
    'createdTime': '2017-06-13T13:15:26.000Z',
  });
};
