const Skill = require('../../domain/models/Skill');
const skillDatasource = require('../datasources/airtable/skill-datasource');

function _toDomain(skillData) {
  return new Skill({
    id: skillData.id,
    name: skillData.name,
    pixValue: skillData.pixValue,
  });
}

module.exports = {

  findByCompetenceId(competenceId) {
    return skillDatasource.findByCompetenceId(competenceId)
      .then((skillDatas) => skillDatas.map(_toDomain));
  },
};
