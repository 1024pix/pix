import Skill from '../../domain/models/Skill';

export default {
  fromDatasourceObject(datasourceObject) {
    return new Skill({
      id: datasourceObject.id,
      name: datasourceObject.name,
      pixValue: datasourceObject.pixValue,
      competenceId: datasourceObject.competenceId,
      tutorialIds: datasourceObject.tutorialIds,
      tubeId: datasourceObject.tubeId,
      version: datasourceObject.version,
      difficulty: datasourceObject.level,
    });
  },
};
