const TargetProfile = require('../../domain/models/TargetProfile');
const Stage = require('../../domain/models/Stage');
const skillAdapter = require('./skill-adapter');

module.exports = {

  fromDatasourceObjects({ bookshelfTargetProfile, associatedSkillLearningContentDataObjects: associatedSkillDatasourceObjects }) {

    const skills = associatedSkillDatasourceObjects.map(skillAdapter.fromDatasourceObject);
    const targetProfileStages = bookshelfTargetProfile.related('stages');
    const hasStages = targetProfileStages && targetProfileStages.models;
    const stages = hasStages ? targetProfileStages.models.map((stage) => new Stage(stage.attributes)) : [];

    return new TargetProfile({
      id: bookshelfTargetProfile.get('id'),
      name: bookshelfTargetProfile.get('name'),
      imageUrl: bookshelfTargetProfile.get('imageUrl'),
      isPublic: Boolean(bookshelfTargetProfile.get('isPublic')),
      organizationId: bookshelfTargetProfile.get('organizationId'),
      outdated: bookshelfTargetProfile.get('outdated'),
      skills,
      stages,
    });
  },
};
