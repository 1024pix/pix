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
    'Titre pratique fr-fr',
    'Titre pratique en-us',
    'Description pratique fr-fr',
    'Description pratique en-us',
    'Competences (id persistant)',
  ],

  fromAirTableObject(airtableRecord) {

    return {
      id: airtableRecord.get('id persistant'),
      name: airtableRecord.get('Nom'),
      title: airtableRecord.get('Titre'),
      description: airtableRecord.get('Description'),
      practicalTitleFrFr: airtableRecord.get('Titre pratique fr-fr'),
      practicalTitleEnUs: airtableRecord.get('Titre pratique en-us'),
      practicalDescriptionFrFr: airtableRecord.get('Description pratique fr-fr'),
      practicalDescriptionEnUs: airtableRecord.get('Description pratique en-us'),
      competenceId: _.head(airtableRecord.get('Competences (id persistant)')),
    };
  },

  async findByNames(tubeNames) {
    const tubes = await this.list();
    return tubes.filter((tubeData) => _.includes(tubeNames, tubeData.name));
  },

  async findByRecordIds(tubeIds) {
    const tubes = await this.list();
    return tubes.filter(({ id }) => tubeIds.includes(id));
  },

});
