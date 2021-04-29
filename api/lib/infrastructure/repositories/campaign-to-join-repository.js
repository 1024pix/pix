const { knex } = require('../bookshelf');
const CampaignToJoin = require('../../domain/read-models/CampaignToJoin');
const { NotFoundError, ForbiddenAccess, AlreadyExistingCampaignParticipationError } = require('../../domain/errors');
const skillDatasource = require('../datasources/learning-content/skill-datasource');
const DomainTransaction = require('../DomainTransaction');

module.exports = {

  async get(id, domainTransaction = DomainTransaction.emptyTransaction()) {
    const knexConn = domainTransaction.knexTransaction || knex;
    const result = await knexConn('campaigns')
      .select('campaigns.*')
      .select({
        'organizationId': 'organizations.id',
        'organizationName': 'organizations.name',
        'organizationType': 'organizations.type',
        'organizationLogoUrl': 'organizations.logoUrl',
        'organizationIsManagingStudents': 'organizations.isManagingStudents',
        'targetProfileName': 'target-profiles.name',
        'targetProfileImageUrl': 'target-profiles.imageUrl',
      })
      .join('organizations', 'organizations.id', 'campaigns.organizationId')
      .leftJoin('target-profiles', 'target-profiles.id', 'campaigns.targetProfileId')
      .where('campaigns.id', id)
      .first();

    if (!result) {
      throw new NotFoundError(`La campagne d'id ${id} n'existe pas ou son accès est restreint`);
    }

    return new CampaignToJoin(result);
  },

  async getByCode(code) {
    const result = await knex('campaigns')
      .select('campaigns.*')
      .select({
        'organizationId': 'organizations.id',
        'organizationName': 'organizations.name',
        'organizationType': 'organizations.type',
        'organizationLogoUrl': 'organizations.logoUrl',
        'organizationIsManagingStudents': 'organizations.isManagingStudents',
        'targetProfileName': 'target-profiles.name',
        'targetProfileImageUrl': 'target-profiles.imageUrl',
        'targetProfileIsSimplifiedAccess': 'target-profiles.isSimplifiedAccess',
      })
      // eslint-disable-next-line no-restricted-syntax
      .select(knex.raw(`EXISTS(SELECT true FROM "organization-tags"
        JOIN tags ON "organization-tags"."tagId" = "tags".id
        WHERE "tags"."name" = 'POLE EMPLOI' AND "organization-tags"."organizationId" = "organizations".id) as "organizationIsPoleEmploi"`))
      .join('organizations', 'organizations.id', 'campaigns.organizationId')
      .leftJoin('target-profiles', 'target-profiles.id', 'campaigns.targetProfileId')
      .leftJoin('organization-tags', 'organization-tags.organizationId', 'organizations.id')
      .leftJoin('tags', 'tags.id', 'organization-tags.tagId')
      .where('campaigns.code', code)
      .first();

    if (!result) {
      throw new NotFoundError(`La campagne au code ${code} n'existe pas ou son accès est restreint`);
    }

    return new CampaignToJoin(result);
  },

  async checkCampaignIsJoinableByUser(campaign, userId, domainTransaction = DomainTransaction.emptyTransaction()) {
    await _checkCanAccessToCampaign(campaign, userId, domainTransaction);
    await _checkCanParticipateToCampaign(campaign, userId, domainTransaction);
  },
};

async function _checkCanAccessToCampaign(campaign, userId, domainTransaction) {
  if (campaign.isArchived) {
    throw new ForbiddenAccess('Vous n\'êtes pas autorisé à rejoindre la campagne');

  }

  if (campaign.isRestricted && await _hasNoSchoolingRegistration(userId, campaign, domainTransaction)) {
    throw new ForbiddenAccess('Vous n\'êtes pas autorisé à rejoindre la campagne');
  }
}

async function _hasNoSchoolingRegistration(userId, campaign, domainTransaction) {
  const knexConn = domainTransaction.knexTransaction || knex;
  const registrations = await knexConn
    .select('schooling-registrations.id')
    .from('schooling-registrations')
    .where({ userId, organizationId: campaign.organizationId });

  return registrations.length === 0;
}

async function _checkCanParticipateToCampaign(campaign, userId, domainTransaction) {
  if (campaign.multipleSendings && await _cannotImproveResults(campaign.id, userId, domainTransaction)) {
    throw new ForbiddenAccess('Vous ne pouvez pas repasser la campagne');
  }
  if (!campaign.multipleSendings && await _hasAlreadyParticipatedToCampaign(campaign.id, userId, domainTransaction)) {
    throw new AlreadyExistingCampaignParticipationError(`User ${userId} has already a campaign participation with campaign ${campaign.id}`);
  }
}

async function _hasAlreadyParticipatedToCampaign(campaignId, userId, domainTransaction) {
  const knexConn = domainTransaction.knexTransaction || knex;

  const { count } = await knexConn('campaign-participations')
    .count('id')
    .where({ userId, campaignId })
    .first();
  return count > 0;
}

async function _cannotImproveResults(campaignId, userId, domainTransaction) {
  const knexConn = domainTransaction.knexTransaction || knex;

  const targetProfileSkillIds = await knexConn('target-profiles_skills')
    .select('skillId')
    .join('campaigns', 'campaigns.targetProfileId', 'target-profiles_skills.targetProfileId')
    .where({ 'campaigns.id': campaignId });

  const operativeTargetProfileSkillIds = await skillDatasource.findOperativeByRecordIds(targetProfileSkillIds.map(({ skillId }) => skillId));

  const { count } = await knexConn('campaign-participations')
    .count('id')
    .where({ userId, campaignId, isImproved: false })
    .andWhere((builder) => {
      builder
        .whereNull('sharedAt')
        .orWhere('validatedSkillsCount', '>=', operativeTargetProfileSkillIds.length);
    })
    .first();

  return count > 0;
}
