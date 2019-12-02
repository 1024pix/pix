const _ = require('lodash');
const datasource = require('./datasource');

const ACTIVATED_STATUS = ['actif'];

module.exports = datasource.extend({

  tableName: 'Acquis',

  usedFields: [
    'Nom',
    'Indice',
    'Statut de l\'indice',
    'Comprendre',
    'En savoir plus',
    'PixValue',
    'Compétence (via Tube)',
    'Status',
  ],

  fromAirTableObject(airtableSkillObject) {
    return {
      id: airtableSkillObject.getId(),
      name: airtableSkillObject.get('Nom'),
      hint: airtableSkillObject.get('Indice'),
      hintStatus: airtableSkillObject.get('Statut de l\'indice') || 'no status',
      tutorialIds: airtableSkillObject.get('Comprendre') || [],
      learningMoreTutorialIds: airtableSkillObject.get('En savoir plus') || [],
      pixValue: airtableSkillObject.get('PixValue'),
      competenceId: airtableSkillObject.get('Compétence (via Tube)')[0],
    };
  },

  airtableFilter(rawSkill) {
    return _.includes(rawSkill.fields['Status'], ACTIVATED_STATUS);
  },

  findByRecordIds(skillRecordIds) {
    return this.list({ filter: (rawSkill) => _.includes(skillRecordIds, rawSkill.id) });
  },

  findByCompetenceId(competenceId) {
    return this.list({ filter: (rawSkill) => _.includes(rawSkill.fields['Compétence (via Tube)'], competenceId) });
  },

});
