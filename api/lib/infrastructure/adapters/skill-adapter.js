const Skill = require('../../domain/models/Skill');

module.exports = {

  fromDatasourceObject(datasourceObject) {
    return new Skill({
      id: datasourceObject.id,
      name: datasourceObject.name,
      pixValue: datasourceObject.pixValue,
      competenceId: datasourceObject.competenceId,
      tutorialIds: datasourceObject.tutorialIds,
      tubeId: datasourceObject.tubeId,
    });
  },
};
