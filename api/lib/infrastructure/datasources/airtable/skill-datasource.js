const _ = require('lodash');
const airtable = require('../../airtable');
const datasource = require('./datasource');

const tableName = 'Acquis';

const usedFields = [
  'Nom',
  'Indice',
  'Statut de l\'indice',
  'Comprendre',
  'En savoir plus',
  'PixValue',
  'Compétence (via Tube)',
  'Status',
];

const ACTIVATED_STATUS = ['actif'];

function fromAirTableObject(airtableSkillObject) {
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
}

module.exports = datasource.extend({

  tableName,

  usedFields,

  fromAirTableObject,

  airtableFilter(rawSkill) {
    return _.includes(rawSkill.fields['Status'], ACTIVATED_STATUS);
  },

  get(id) {
    return airtable.getRecord(tableName, id)
      .then(fromAirTableObject);
  },

  findByRecordIds(skillRecordIds) {
    return this.list({ filter: (rawSkill) => _.includes(skillRecordIds, rawSkill.id) });
  },

  findByCompetenceId(competenceId) {
    return this.list({ filter: (rawSkill) => _.includes(rawSkill.fields['Compétence (via Tube)'], competenceId) });
  },

});
