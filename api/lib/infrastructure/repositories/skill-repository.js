const Skill = require('../../domain/models/Skill');
const skillDatasource = require('../datasources/airtable/skill-datasource');

function _toDomain(skillData) {
  return new Skill({
    id: skillData.id,
    name: skillData.name,
    pixValue: skillData.pixValue,
    competenceId: skillData.competenceId,
    tutorialIds: skillData.tutorialIds,
    tubeId: skillData.tubeId,
  });
}

module.exports = {

  findActiveByCompetenceId(competenceId) {
    return skillDatasource.findActiveByCompetenceId(competenceId)
      .then((skillDatas) => skillDatas.map(_toDomain));
  },

  findOperativeByCompetenceId(competenceId) {
    return skillDatasource.findOperativeByCompetenceId(competenceId)
      .then((skillDatas) => skillDatas.map(_toDomain));
  },

  findOperativeByIds(skillIds) {
    return skillDatasource.findOperativeByRecordIds(skillIds)
      .then((skillDatas) => skillDatas.map(_toDomain));
  },
};
