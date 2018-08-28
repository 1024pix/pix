const TargetProfile = require('../../domain/models/TargetProfile');
const BookshelfTargetProfile = require('../../infrastructure/data/target-profile');
const skillDatasource = require('../../infrastructure/datasources/airtable/skill-datasource');
const Skill = require('../../domain/models/Skill');

module.exports = {

  get(id) {

    return BookshelfTargetProfile
      .where({ id })
      .fetch({ withRelated: ['skillIds'] })
      .then((bookshelfTargetProfile) => {
        return _fetchTargetProfileSkillDataObjects(bookshelfTargetProfile)
          .then((skillDataObjects) => {
            return _convertDataObjectsIntoDomain(bookshelfTargetProfile, skillDataObjects);
          });
      });
  },

  findPublicTargetProfiles() {

    return BookshelfTargetProfile
      .where({ isPublic: true })
      .fetchAll({ withRelated: ['skillIds'] })
      .then((bookshelfTargetProfiles) => {
        const promises = bookshelfTargetProfiles.map((bookshelfTargetProfile) => {

          return _fetchTargetProfileSkillDataObjects(bookshelfTargetProfile)
            .then((skillDataObjects) => {
              return _convertDataObjectsIntoDomain(bookshelfTargetProfile, skillDataObjects);
            });
        });

        return Promise.all(promises);
      });
  },

  findTargetProfilesByOrganizationId(organizationId) {

    return BookshelfTargetProfile
      .where({ organizationId })
      .fetchAll({ withRelated: ['skillIds'] })
      .then((bookshelfTargetProfiles) => {
        const promises = bookshelfTargetProfiles.map((bookshelfTargetProfile) => {

          return _fetchTargetProfileSkillDataObjects(bookshelfTargetProfile)
            .then((skillDataObjects) => {
              return _convertDataObjectsIntoDomain(bookshelfTargetProfile, skillDataObjects);
            });
        });

        return Promise.all(promises);
      });
  },

};

function _fetchTargetProfileSkillDataObjects(bookshelfTargetProfile) {
  const skillRecordIds = bookshelfTargetProfile
    .related('skillIds')
    .map((BookshelfSkillId) => BookshelfSkillId.get('skillId'));
  return skillDatasource.findByRecordIds(skillRecordIds);
}

function _convertDataObjectsIntoDomain(bookshelfTargetProfile, skillAssociatedToTargetProfileWIthName) {
  const targetProfile = _toDomain(bookshelfTargetProfile);
  targetProfile.skills = _toDomainSkills(skillAssociatedToTargetProfileWIthName);
  return targetProfile;
}

function _toDomain(targetProfileBookshelf) {
  return new TargetProfile({
    id: targetProfileBookshelf.get('id'),
    name: targetProfileBookshelf.get('name'),
    isPublic: Boolean(targetProfileBookshelf.get('isPublic')),
    organizationId: targetProfileBookshelf.get('organizationId'),
    skills: []
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
