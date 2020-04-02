const _ = require('lodash');
const datasource = require('./datasource');

const ACTIVATED_STATUS = 'actif';

module.exports = datasource.extend({

  modelName: 'Skill',

  tableName: 'Acquis',

  usedFields: [
    'id persistant',
    'Nom',
    'Indice',
    'Statut de l\'indice',
    'Comprendre (id persistant)',
    'En savoir plus (id persistant)',
    'PixValue',
    'Compétence (via Tube) (id persistant)',
    'Status',
    'Tube (id persistant)',
  ],

  fromAirTableObject(airtableRecord) {

    return {
      id: airtableRecord.get('id persistant'),
      name: airtableRecord.get('Nom'),
      hint: airtableRecord.get('Indice'),
      hintStatus: airtableRecord.get('Statut de l\'indice') || 'no status',
      tutorialIds: airtableRecord.get('Comprendre (id persistant)') || [],
      learningMoreTutorialIds: airtableRecord.get('En savoir plus (id persistant)') || [],
      pixValue: airtableRecord.get('PixValue'),
      competenceId: _.head(airtableRecord.get('Compétence (via Tube) (id persistant)')),
      status: airtableRecord.get('Status'),
      tubeId: _.head(airtableRecord.get('Tube (id persistant)')),
    };
  },

  async findActiveSkills() {
    const skills = await this.list();
    return _.filter(skills, { status: ACTIVATED_STATUS });
  },

  async findByRecordIds(skillIds) {
    const skills = await this.list();
    return skills.filter((skillData) =>
      skillData.status === ACTIVATED_STATUS &&
      _.includes(skillIds, skillData.id));
  },

  async findByCompetenceId(competenceId) {
    const skills = await this.list();
    return _.filter(skills, { status: ACTIVATED_STATUS, competenceId });
  },

});
