const bluebird = require('bluebird');
const BookshelfTargetProfile = require('../../infrastructure/data/target-profile');
const skillDatasource = require('../../infrastructure/datasources/airtable/skill-datasource');
const targetProfileAdapter = require('../adapters/target-profile-adapter');
const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter');
const { knex } = require('../bookshelf');
const { isUniqConstraintViolated, foreignKeyConstraintViolated } = require('../utils/knex-utils.js');
const { NotFoundError, AlreadyExistingEntityError } = require('../../domain/errors');

module.exports = {

  async get(id) {
    const targetProfileBookshelf = await BookshelfTargetProfile
      .where({ id })
      .fetch({ withRelated: ['skillIds'] });

    if (!targetProfileBookshelf) {
      throw new NotFoundError(`Le profil cible avec l'id ${id} n'existe pas`);
    }

    return _getWithAirtableSkills(targetProfileBookshelf);
  },

  async getByCampaignId(campaignId) {
    const targetProfileBookshelf = await BookshelfTargetProfile
      .query((qb) => {
        qb.innerJoin('campaigns', 'campaigns.targetProfileId', 'target-profiles.id');
        qb.innerJoin('target-profiles_skills', 'target-profiles_skills.targetProfileId', 'target-profiles.id');
      })
      .where({ 'campaigns.id': campaignId })
      .fetch({ require: true, withRelated: [
        'skillIds', {
          stages: function(query) {
            query.orderBy('threshold', 'ASC');
          },
        }],
      });

    return _getWithAirtableSkills(targetProfileBookshelf);
  },

  async getByCampaignParticipationId(campaignParticipationId) {
    const targetProfileBookshelf = await BookshelfTargetProfile
      .query((qb) => {
        qb.innerJoin('campaigns', 'campaigns.targetProfileId', 'target-profiles.id');
        qb.innerJoin('campaign-participations', 'campaign-participations.campaignId', 'campaigns.id');
        qb.innerJoin('target-profiles_skills', 'target-profiles_skills.targetProfileId', 'target-profiles.id');
      })
      .where({ 'campaign-participations.id': campaignParticipationId })
      .fetch({ require: true, withRelated: [
        'skillIds', {
          stages: function(query) {
            query.orderBy('threshold', 'ASC');
          },
        }],
      });

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
        qb.whereIn('id', targetProfileIds);
      })
      .fetchAll();

    return bookshelfToDomainConverter.buildDomainObjects(BookshelfTargetProfile, targetProfilesBookshelf);
  },

  findPaginatedFiltered({ filter, page }) {
    return BookshelfTargetProfile
      .query((qb) => _setSearchFiltersForQueryBuilder(filter, qb))
      .fetchPage({
        page: page.number,
        pageSize: page.size,
      })
      .then(({ models, pagination }) => {
        const targetProfiles = bookshelfToDomainConverter.buildDomainObjects(BookshelfTargetProfile, models);
        return { models: targetProfiles, pagination };
      });
  },

  async attachOrganizations(targetProfile) {
    const rows = targetProfile.organizations.map((organizationId) => {
      return {
        organizationId,
        targetProfileId: targetProfile.id,
      };
    });
    try {
      await knex.batchInsert('target-profile-shares', rows);
    } catch (error) {
      if (foreignKeyConstraintViolated(error)) {
        const organizationId = error.detail.match(/=\((\d+)\)/)[1];
        throw new NotFoundError(`L'organization  avec l'id ${organizationId} n'existe pas`);
      }
      if (isUniqConstraintViolated(error)) {
        const organizationId = error.detail.match(/=\((\d+),/)[1];
        throw new AlreadyExistingEntityError(`Le profil cible est déjà associé à l’organisation ${organizationId}.`);
      }
    }
  },

  async isAttachedToOrganizations(targetProfile) {
    const attachedOrganizations = await knex('target-profile-shares')
      .select('organizationId')
      .whereIn('organizationId', targetProfile.organizations);

    return attachedOrganizations.some((e) => e);
  },
};

async function _getWithAirtableSkills(targetProfile) {
  const associatedSkillAirtableDataObjects = await _getAirtableDataObjectsSkills(targetProfile);

  return targetProfileAdapter.fromDatasourceObjects({
    bookshelfTargetProfile: targetProfile, associatedSkillAirtableDataObjects,
  });
}

function _getAirtableDataObjectsSkills(bookshelfTargetProfile) {
  const skillRecordIds = bookshelfTargetProfile.related('skillIds').map((BookshelfSkillId) => BookshelfSkillId.get('skillId'));
  return skillDatasource.findOperativeByRecordIds(skillRecordIds);
}

function _setSearchFiltersForQueryBuilder(filter, qb) {
  const { name, id } = filter;
  if (name) {
    qb.whereRaw('LOWER("name") LIKE ?', `%${name.toLowerCase()}%`);
  }
  if (id) {
    qb.where({ id });
  }
}
