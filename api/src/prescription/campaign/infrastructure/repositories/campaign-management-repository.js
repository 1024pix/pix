import * as CombinedCourseRepository from '../../../../quest/infrastructure/repositories/combined-courses/combined-course-repository.js';
import { CAMPAIGN_FEATURES } from '../../../../shared/constants.js';
import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { fetchPage } from '../../../../shared/infrastructure/utils/knex-utils.js';
import { CampaignParticipationStatuses, CampaignTypes } from '../../../shared/domain/constants.js';
import { CampaignManagement } from '../../domain/models/CampaignManagement.js';

const { SHARED, STARTED } = CampaignParticipationStatuses;

const get = async function (campaignId) {
  const knexConn = DomainTransaction.getConnection();
  let campaign = await knexConn('campaigns')
    .select({
      id: 'campaigns.id',
      code: 'campaigns.code',
      name: 'campaigns.name',
      isForAbsoluteNovice: 'campaigns.isForAbsoluteNovice',
      createdAt: 'campaigns.createdAt',
      archivedAt: 'campaigns.archivedAt',
      type: 'campaigns.type',
      creatorLastName: 'users.lastName',
      creatorFirstName: 'users.firstName',
      creatorId: 'users.id',
      organizationId: 'campaigns.organizationId',
      organizationName: 'organizations.name',
      targetProfileId: 'campaigns.targetProfileId',
      targetProfileName: 'target-profiles.name',
      title: 'campaigns.title',
      ownerId: 'ownerUser.id',
      ownerLastName: 'ownerUser.lastName',
      ownerFirstName: 'ownerUser.firstName',
      customLandingPageText: 'campaigns.customLandingPageText',
      customResultPageText: 'campaigns.customResultPageText',
      customResultPageButtonText: 'campaigns.customResultPageButtonText',
      customResultPageButtonUrl: 'campaigns.customResultPageButtonUrl',
      multipleSendings: 'campaigns.multipleSendings',
    })
    .join('users', 'users.id', 'campaigns.creatorId')
    .join('users AS ownerUser', 'ownerUser.id', 'campaigns.ownerId')
    .join('organizations', 'organizations.id', 'campaigns.organizationId')
    .leftJoin('target-profiles', 'target-profiles.id', 'campaigns.targetProfileId')
    .where('campaigns.id', campaignId)
    .first();

  if (!campaign) {
    return null;
  }

  const externalIdFeature = await knexConn('campaign-features')
    .select('params')
    .join('features', 'features.id', 'featureId')
    .where({ campaignId: campaign.id, 'features.key': CAMPAIGN_FEATURES.EXTERNAL_ID.key })
    .first();

  const participationCountByStatus = await _countParticipationsByStatus(campaignId, campaign.type);
  campaign = {
    ...campaign,
    ...participationCountByStatus,
    externalIdLabel: externalIdFeature?.params?.label,
    externalIdType: externalIdFeature?.params?.type,
  };

  const combinedCourse = await CombinedCourseRepository.findByCampaignId({ campaignId: campaign.id });
  const isPartOfCombinedCourse = combinedCourse.length === 1;

  return new CampaignManagement({ ...campaign, isPartOfCombinedCourse });
};

const findPaginatedCampaignManagements = async function ({ organizationId, page }) {
  const knexConn = DomainTransaction.getConnection();

  const query = knexConn('campaigns')
    .select({
      id: 'campaigns.id',
      code: 'campaigns.code',
      name: 'campaigns.name',
      createdAt: 'campaigns.createdAt',
      archivedAt: 'campaigns.archivedAt',
      deletedAt: 'campaigns.deletedAt',
      type: 'campaigns.type',
      creatorLastName: 'creatorUser.lastName',
      creatorFirstName: 'creatorUser.firstName',
      creatorId: 'creatorUser.id',
      ownerId: 'ownerUser.id',
      ownerLastName: 'ownerUser.lastName',
      ownerFirstName: 'ownerUser.firstName',
      targetProfileId: 'target-profiles.id',
      targetProfileName: 'target-profiles.name',
    })
    .join('users AS creatorUser', 'creatorUser.id', 'campaigns.creatorId')
    .join('users AS ownerUser', 'ownerUser.id', 'campaigns.ownerId')
    .leftJoin('target-profiles', 'campaigns.targetProfileId', 'target-profiles.id')
    .where('organizationId', organizationId)
    .orderBy('campaigns.createdAt', 'DESC');

  const { results, pagination } = await fetchPage({ queryBuilder: query, paginationParams: page });

  const campaignManagements = [];
  for (const result of results) {
    const combinedCourse = await CombinedCourseRepository.findByCampaignId({ campaignId: result.id });
    const isPartOfCombinedCourse = combinedCourse.length === 1;
    const campaignManagement = new CampaignManagement({ ...result, isPartOfCombinedCourse });
    campaignManagements.push(campaignManagement);
  }

  return { models: campaignManagements, meta: { ...pagination } };
};

async function _countParticipationsByStatus(campaignId, campaignType) {
  const knexConn = DomainTransaction.getConnection();

  const row = await knexConn('campaign-participations')
    .select([
      knexConn.raw(`sum(case when status = ? then 1 else 0 end) as shared`, SHARED),
      knexConn.raw(`sum(case when status = ? then 1 else 0 end) as started`, STARTED),
    ])
    .where({ campaignId, isImproved: false })
    .whereNull('campaign-participations.deletedAt')
    .groupBy('campaignId')
    .first();

  return _mapToParticipationByStatus(row, campaignType);
}

function _mapToParticipationByStatus(row = {}, campaignType) {
  const participationByStatus = {
    shared: row.shared || 0,
    completed: 0,
  };
  if (campaignType === CampaignTypes.ASSESSMENT) {
    participationByStatus.started = row.started || 0;
  }
  return participationByStatus;
}

const findActiveCampaignIdsByOrganization = async ({ organizationId }) => {
  const knexConn = await DomainTransaction.getConnection();
  return knexConn('campaigns').where('organizationId', organizationId).whereNull('deletedAt').pluck('id');
};

export { findActiveCampaignIdsByOrganization, findPaginatedCampaignManagements, get };
