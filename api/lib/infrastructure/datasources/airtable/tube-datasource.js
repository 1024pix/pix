const _ = require('lodash');
const datasource = require('./datasource');

module.exports = datasource.extend({

  modelName: 'Tube',

  tableName: 'Tubes',

  usedFields: [
    'id persistant',
    'Nom',
    'Titre',
    'Description',
    'Titre pratique',
    'Description pratique',
    'Competences'
  ],

  fromAirTableObject(airtableRecord) {

    let competenceId;
    if (airtableRecord.get('Competences')) {
      competenceId = airtableRecord.get('Competences')[0];
    }

    return {
      id: airtableRecord.get('id persistant'),
      name: airtableRecord.get('Nom'),
      title: airtableRecord.get('Titre'),
      description: airtableRecord.get('Description'),
      practicalTitle: airtableRecord.get('Titre pratique'),
      practicalDescription: airtableRecord.get('Description pratique'),
      competenceId,
    };
  },

  async findByNames(tubeNames) {
    const tubes = await this.list();
    return tubes.filter((tubeData) => _.includes(tubeNames, tubeData.name));
  },

});
