const BookshelfTargetProfile = require('../../infrastructure/data/target-profile');
const skillDatasource = require('../../infrastructure/datasources/airtable/skill-datasource');
const targetProfileAdapter = require('../adapters/target-profile-adapter');
const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter');

module.exports = {

  get(id) {
    return BookshelfTargetProfile
      .where({ id })
      .fetch({ withRelated: ['skillIds', 'sharedWithOrganizations'] })
      .then(_getWithAirtableSkills);
  },

  getByCampaignId(campaignId) {
    return BookshelfTargetProfile
      .query((qb) => qb.innerJoin('campaigns', 'campaigns.targetProfileId', 'target-profiles.id'))
      .query((qb) => qb.innerJoin('target-profiles_skills', 'target-profiles_skills.targetProfileId', 'target-profiles.id'))
      .where({ 'campaigns.id': campaignId })
      .fetch({ require: true, withRelated: ['skillIds'] })
      .then(_getWithAirtableSkills);
  },

  findPublicTargetProfiles() {
    return BookshelfTargetProfile
      .where({ isPublic: true })
      .fetchAll({ withRelated: ['skillIds'] })
      .then((bookshelfTargetProfiles) => Promise.all(bookshelfTargetProfiles.map(_getWithAirtableSkills)));
  },

  findTargetProfilesOwnedByOrganizationId(organizationId) {
    return BookshelfTargetProfile
      .where({ organizationId })
      .fetchAll({ withRelated: ['skillIds'] })
      .then((bookshelfTargetProfiles) => Promise.all(bookshelfTargetProfiles.map(_getWithAirtableSkills)));
  },

  findAllTargetProfilesOrganizationCanUse(organizationId) {
    return BookshelfTargetProfile
      .query((qb) => {
        qb.where({ 'organizationId': organizationId, 'outdated': false });
        qb.orWhere({ 'isPublic': true, 'outdated': false });
      })
      .fetchAll({ withRelated: ['skillIds'] })
      .then((bookshelfTargetProfiles) => Promise.all(bookshelfTargetProfiles.map(_getWithAirtableSkills)));
  },

  findByIds(targetProfileIds) {
    return BookshelfTargetProfile
      .query((qb) => {
        qb.whereIn('id',  targetProfileIds);
      })
      .fetchAll()
      .then((foundTargetProfiles) => bookshelfToDomainConverter.buildDomainObjects(BookshelfTargetProfile, foundTargetProfiles));
  },
};

function _getWithAirtableSkills(targetProfile) {
  return _getAirtableDataObjectsSkills(targetProfile)
    .then((associatedSkillAirtableDataObjects) => targetProfileAdapter.fromDatasourceObjects({
      bookshelfTargetProfile: targetProfile, associatedSkillAirtableDataObjects
    }));
}

function _getAirtableDataObjectsSkills(bookshelfTargetProfile) {
  const skillRecordIds = bookshelfTargetProfile.related('skillIds').map((BookshelfSkillId) => BookshelfSkillId.get('skillId'));
  return skillDatasource.findByRecordIds(skillRecordIds);
}
