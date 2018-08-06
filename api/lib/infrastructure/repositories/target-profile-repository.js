const TargetProfile = require('../../domain/models/TargetProfile');
const BookshelfTargetProfile = require('../../infrastructure/data/target-profile');

const skillDatasource = require('../../infrastructure/datasources/airtable/skill-datasource');
const Skill = require('../../domain/models/Skill');

function _toDomain(targetProfileBookshelf) {
  return new TargetProfile({
    id: targetProfileBookshelf.get('id'),
    name: targetProfileBookshelf.get('name'),
  });
}

function _toDomainSkills(skillsDataObjects) {
  return skillsDataObjects.map((skillDataObject) => {
    return new Skill({
      id: skillDataObject.id,
      name: skillDataObject.name
    });
  });
}

module.exports = {

  get(id) {
    return BookshelfTargetProfile
      .where({ id })
      .fetch({ withRelated: ['skillIds'] })
      .then(async (foundTargetProfile) => {
        const skillRecordIds = foundTargetProfile.related('skillIds').map((BookshelfSkillId) => BookshelfSkillId.get('skillId'));
        const skillAssociatedToTargetProfileWIthName = await skillDatasource.findByRecordIds(skillRecordIds);
        const targetProfile = _toDomain(foundTargetProfile);
        targetProfile.skills = _toDomainSkills(skillAssociatedToTargetProfileWIthName);
        return targetProfile;
      });
  }

};
