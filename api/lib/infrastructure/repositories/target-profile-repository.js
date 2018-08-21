const BookshelfTargetProfile = require('../../infrastructure/data/target-profile');
const skillDatasource = require('../../infrastructure/datasources/airtable/skill-datasource');
const Skill = require('../../domain/models/Skill');
const TargetProfile = require('../../domain/models/TargetProfile');

module.exports = {

  get(id) {

    return BookshelfTargetProfile
      .where({ id })
      .fetch({ withRelated: ['skillIds'] })
      .then((bookshelfTargetProfile) => {
        return _fetchTargetProfileSkillDataObjects(bookshelfTargetProfile)
          .then((skillDataObjects) => {

            return _toDomain(bookshelfTargetProfile, skillDataObjects);
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

              return _toDomain(bookshelfTargetProfile, skillDataObjects);
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

              return _toDomain(bookshelfTargetProfile, skillDataObjects);
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

function _toDomain(targetProfileBookshelf, associatedSkillDataObjects) {

  const associatedSkills = associatedSkillDataObjects.map(_toDomainSkill);

  return new TargetProfile({
    id: targetProfileBookshelf.get('id'),
    name: targetProfileBookshelf.get('name'),
    isPublic: Boolean(targetProfileBookshelf.get('isPublic')),
    organizationId: targetProfileBookshelf.get('organizationId'),
    skills: associatedSkills,
  });
}

function _toDomainSkill(skillDataObject) {
  return new Skill({
    id: skillDataObject.id,
    name: skillDataObject.name,
  });
}
