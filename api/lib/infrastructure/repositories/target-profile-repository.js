const BookshelfTargetProfile = require('../../infrastructure/data/target-profile');
const skillDatasource = require('../../infrastructure/datasources/airtable/skill-datasource');
const targetProfileAdapter = require('../adapters/target-profile-adapter');

module.exports = {

  get(id) {

    return BookshelfTargetProfile
      .where({ id })
      .fetch({ withRelated: ['skillIds'] })
      .then(_getBookshelfTargetProfileAndAssociatedSkillAirtableDataObjects)
      .then(([bookshelfTargetProfile, associatedSkillAirtableDataObjects]) => {

        return targetProfileAdapter.fromDatasourceObjects({
          bookshelfTargetProfile,
          associatedSkillAirtableDataObjects,
        });
      });
  },

  findPublicTargetProfiles() {

    return BookshelfTargetProfile
      .where({ isPublic: true })
      .fetchAll({ withRelated: ['skillIds'] })
      .then((bookshelfTargetProfiles) => {
        const promises = bookshelfTargetProfiles.map((bookshelfTargetProfile) => {

          return _getBookshelfTargetProfileAndAssociatedSkillAirtableDataObjects(bookshelfTargetProfile)
            .then(([bookshelfTargetProfile, associatedSkillAirtableDataObjects]) => {

              return targetProfileAdapter.fromDatasourceObjects({
                bookshelfTargetProfile,
                associatedSkillAirtableDataObjects,
              });
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

          return _getBookshelfTargetProfileAndAssociatedSkillAirtableDataObjects(bookshelfTargetProfile)
            .then(([bookshelfTargetProfile, associatedSkillAirtableDataObjects]) => {

              return targetProfileAdapter.fromDatasourceObjects({
                bookshelfTargetProfile,
                associatedSkillAirtableDataObjects,
              });
            });
        });

        return Promise.all(promises);
      });
  },
};

function _getBookshelfTargetProfileAndAssociatedSkillAirtableDataObjects(bookshelfTargetProfile) {

  const skillRecordIds = bookshelfTargetProfile
    .related('skillIds')
    .map((BookshelfSkillId) => BookshelfSkillId.get('skillId'));

  return Promise.all([
    bookshelfTargetProfile,
    skillDatasource.findByRecordIds(skillRecordIds),
  ]);
}
