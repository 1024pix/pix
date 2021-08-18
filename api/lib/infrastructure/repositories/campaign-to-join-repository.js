const CampaignToJoin = require('../../domain/read-models/CampaignToJoin');
const { NotFoundError, ForbiddenAccess, AlreadyExistingCampaignParticipationError } = require('../../domain/errors');
const skillDatasource = require('../datasources/learning-content/skill-datasource');

class CampaignToJoinRepository {
  constructor(queryBuilder) {
    this.queryBuilder = queryBuilder;
  }

  async get(id) {
    const result = await this.queryBuilder('campaigns')
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
  }

  async checkCampaignIsJoinableByUser(campaign, userId) {
    await _checkCanAccessToCampaign(this.queryBuilder, campaign, userId);
    await _checkCanParticipateToCampaign(this.queryBuilder, campaign, userId);
  }

  async getByCode(code) {
    const result = await this.queryBuilder('campaigns')
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
      .select(this.queryBuilder.raw(`EXISTS(SELECT true FROM "organization-tags"
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
  }
}

async function _checkCanAccessToCampaign(queryBuilder, campaign, userId) {
  if (campaign.isArchived) {
    throw new ForbiddenAccess('Vous n\'êtes pas autorisé à rejoindre la campagne');

  }

  if (campaign.isRestricted && await _hasNoSchoolingRegistration(queryBuilder, userId, campaign)) {
    throw new ForbiddenAccess('Vous n\'êtes pas autorisé à rejoindre la campagne');
  }
}

async function _hasNoSchoolingRegistration(queryBuilder, userId, campaign) {
  const registrations = await queryBuilder .select('schooling-registrations.id')
    .from('schooling-registrations')
    .where({ userId, organizationId: campaign.organizationId });

  return registrations.length === 0;
}

async function _checkCanParticipateToCampaign(queryBuilder, campaign, userId) {
  if (campaign.multipleSendings && await _cannotImproveResults(queryBuilder, campaign.id, userId)) {
    throw new ForbiddenAccess('Vous ne pouvez pas repasser la campagne');
  }
  if (!campaign.multipleSendings && await _hasAlreadyParticipatedToCampaign(queryBuilder, campaign.id, userId)) {
    throw new AlreadyExistingCampaignParticipationError(`User ${userId} has already a campaign participation with campaign ${campaign.id}`);
  }
}

async function _hasAlreadyParticipatedToCampaign(queryBuilder, campaignId, userId) {
  const { count } = await queryBuilder('campaign-participations')
    .count('id')
    .where({ userId, campaignId })
    .first();
  return count > 0;
}

async function _cannotImproveResults(queryBuilder, campaignId, userId) {
  const targetProfileSkillIds = await queryBuilder('target-profiles_skills')
    .select('skillId')
    .join('campaigns', 'campaigns.targetProfileId', 'target-profiles_skills.targetProfileId')
    .where({ 'campaigns.id': campaignId });

  const operativeTargetProfileSkillIds = await skillDatasource.findOperativeByRecordIds(targetProfileSkillIds.map(({ skillId }) => skillId));

  const { count } = await queryBuilder('campaign-participations')
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

module.exports = CampaignToJoinRepository;
