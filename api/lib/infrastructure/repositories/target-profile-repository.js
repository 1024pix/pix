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
    let targetProfile;

    return BookshelfTargetProfile
      .where({ id })
      .fetch({ withRelated: ['skillIds'] })
      .then((foundTargetProfile) => {
        targetProfile = _toDomain(foundTargetProfile);
        const skillRecordIds = foundTargetProfile.related('skillIds').map((BookshelfSkillId) => BookshelfSkillId.get('skillId'));
        return skillDatasource.findByRecordIds(skillRecordIds);
      })
      .then((skillAssociatedToTargetProfileWIthName) => {
        targetProfile.skills = _toDomainSkills(skillAssociatedToTargetProfileWIthName);
        return targetProfile;
      });
  },

  findByFilters(filters = {}) {
    return BookshelfTargetProfile
      .where(filters)
      .fetchAll()
      .then((availableTargetProfilesBookshelf) => {
        return availableTargetProfilesBookshelf.map(_toDomain);
      });
  },

};
