const AirtableRecord = require('airtable').Record;

module.exports = function areaRawAirTableFixture() {
  return new AirtableRecord('Domaine', 'recvoGdo7z2z7pXWa', {
    'id': 'recvoGdo7z2z7pXWa',
    'fields': {
      'id persistant': 'recvoGdo7z2z7pXWa',
      'Competences (identifiants) (id persistant)': [
        'recsvLz0W2ShyfD63',
        'recNv8qhaY887jQb2',
        'recIkYm646lrGvLNT',
      ],
      'Code': '1',
      'Titre': 'Information et données',
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
