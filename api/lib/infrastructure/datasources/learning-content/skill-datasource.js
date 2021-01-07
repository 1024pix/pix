const _ = require('lodash');
const datasource = require('./datasource');

const ACTIVE_STATUS = 'actif';
const OPERATIVE_STATUSES = ['actif', 'archivé'];

module.exports = datasource.extend({

  modelName: 'Skill',

  tableName: 'Acquis',

  usedFields: [
    'id persistant',
    'Nom',
    'Indice',
    'Indice fr-fr',
    'Indice en-us',
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
      hintFrFr: airtableRecord.get('Indice fr-fr'),
      hintEnUs: airtableRecord.get('Indice en-us'),
      hintStatus: airtableRecord.get('Statut de l\'indice') || 'no status',
      tutorialIds: airtableRecord.get('Comprendre (id persistant)') || [],
      learningMoreTutorialIds: airtableRecord.get('En savoir plus (id persistant)') || [],
      pixValue: airtableRecord.get('PixValue'),
      competenceId: _.head(airtableRecord.get('Compétence (via Tube) (id persistant)')),
      status: airtableRecord.get('Status'),
      tubeId: _.head(airtableRecord.get('Tube (id persistant)')),
    };
  },

  async findActive() {
    const skills = await this.list();
    return _.filter(skills, { status: ACTIVE_STATUS });
  },

  async findOperative() {
    const skills = await this.list();
    return _.filter(skills, (skill) => _.includes(OPERATIVE_STATUSES, skill.status));
  },

  async findOperativeByRecordIds(skillIds) {
    const skills = await this.list();
    return skills.filter((skillData) =>
      _.includes(OPERATIVE_STATUSES, skillData.status)
      && _.includes(skillIds, skillData.id));
  },

  async findActiveByCompetenceId(competenceId) {
    const skills = await this.list();
    return _.filter(skills, { status: ACTIVE_STATUS, competenceId });
  },

  async findOperativeByCompetenceId(competenceId) {
    const skills = await this.list();
    return _.filter(skills, (skill) =>
      skill.competenceId === competenceId
      && _.includes(OPERATIVE_STATUSES, skill.status));
  },

});
