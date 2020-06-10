const bluebird = require('bluebird');
const BookshelfTargetProfile = require('../../infrastructure/data/target-profile');
const skillDatasource = require('../../infrastructure/datasources/airtable/skill-datasource');
const targetProfileAdapter = require('../adapters/target-profile-adapter');
const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter');

module.exports = {

  async get(id) {
    const targetProfileBookshelf = await BookshelfTargetProfile
      .where({ id })
      .fetch({ withRelated: ['skillIds'] });

    return _getWithAirtableSkills(targetProfileBookshelf);
  },

  async getByCampaignId(campaignId) {
    const targetProfileBookshelf = await BookshelfTargetProfile
      .query((qb) => qb.innerJoin('campaigns', 'campaigns.targetProfileId', 'target-profiles.id'))
      .query((qb) => qb.innerJoin('target-profiles_skills', 'target-profiles_skills.targetProfileId', 'target-profiles.id'))
      .where({ 'campaigns.id': campaignId })
      .fetch({ require: true, withRelated: ['skillIds'] });

    return _getWithAirtableSkills(targetProfileBookshelf);
  },

  async findAllTargetProfilesOrganizationCanUse(organizationId) {
    const targetProfilesBookshelf = await BookshelfTargetProfile
      .query((qb) => {
        qb.where({ 'organizationId': organizationId, 'outdated': false });
        qb.orWhere({ 'isPublic': true, 'outdated': false });
      })
      .fetchAll({ withRelated: ['skillIds'] });

    return bluebird.mapSeries(targetProfilesBookshelf, _getWithAirtableSkills);
  },

  async findByIds(targetProfileIds) {
    const targetProfilesBookshelf = await BookshelfTargetProfile
      .query((qb) => {
        qb.whereIn('id',  targetProfileIds);
      })
      .fetchAll();

    return bookshelfToDomainConverter.buildDomainObjects(BookshelfTargetProfile, targetProfilesBookshelf);
  },
};

async function _getWithAirtableSkills(targetProfile) {
  const associatedSkillAirtableDataObjects = await _getAirtableDataObjectsSkills(targetProfile);

  return targetProfileAdapter.fromDatasourceObjects({
    bookshelfTargetProfile: targetProfile, associatedSkillAirtableDataObjects
  });
}

function _getAirtableDataObjectsSkills(bookshelfTargetProfile) {
  const skillRecordIds = bookshelfTargetProfile.related('skillIds').map((BookshelfSkillId) => BookshelfSkillId.get('skillId'));
  return skillDatasource.findByRecordIds(skillRecordIds);
}
