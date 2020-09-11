const AirtableRecord = require('airtable').Record;

module.exports = function tubeRawAirTableFixture() {
  return new AirtableRecord('Tubes', 'recTIddrkopID23Fp',{
    'id': 'recTIddrkopID23Fp',
    'fields': {
      'id persistant': 'recTIddrkopID23Fp',
      'Nom': '@Moteur',
      'Titre': 'Moteur de recherche',
      'Description': 'Connaître le fonctionnement d\'un moteur de recherche',
      'Titre pratique fr-fr': 'Outils d\'accès au web',
      'Titre pratique en-us': 'Tools for web',
      'Description pratique': 'Identifier un navigateur web et un moteur de recherche, connaître le fonctionnement du moteur de recherche',
      'Description pratique fr-fr': 'Identifier un navigateur web et un moteur de recherche, connaître le fonctionnement du moteur de recherche',
      'Description pratique en-us': 'Identify a web browser and a search engine, know how the search engine works',
      'Competences (id persistant)': [
        'recsvLz0W2ShyfD63',
      ],
    },
    'createdTime': '2018-01-31T12:41:07.000Z',
  });
};
