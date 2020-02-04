const _ = require('lodash');
const datasource = require('./datasource');

const ACTIVATED_STATUS = 'actif';

module.exports = datasource.extend({

  modelName: 'Skill',

  tableName: 'Acquis',

  usedFields: [
    'id',
    'Nom',
    'Indice',
    'Statut de l\'indice',
    'Comprendre',
    'En savoir plus',
    'PixValue',
    'Compétence (via Tube)',
    'Status',
  ],

  fromAirTableObject(airtableRecord) {

    let competenceId;
    if (airtableRecord.get('Compétence (via Tube)')) {
      competenceId = airtableRecord.get('Compétence (via Tube)')[0];
    }

    return {
      id: airtableRecord.get('id'),
      name: airtableRecord.get('Nom'),
      hint: airtableRecord.get('Indice'),
      hintStatus: airtableRecord.get('Statut de l\'indice') || 'no status',
      tutorialIds: airtableRecord.get('Comprendre') || [],
      learningMoreTutorialIds: airtableRecord.get('En savoir plus') || [],
      pixValue: airtableRecord.get('PixValue'),
      competenceId,
      status: airtableRecord.get('Status'),
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
