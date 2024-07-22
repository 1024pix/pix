import { knex } from '../../../db/knex-database-connection.js';
import { CampaignParticipation } from '../../../src/prescription/campaign-participation/domain/models/CampaignParticipation.js';
import { CampaignParticipationStatuses, CampaignTypes } from '../../../src/prescription/shared/domain/constants.js';
import { Assessment } from '../../../src/shared/domain/models/Assessment.js';
import { constants } from '../../domain/constants.js';
import { Campaign } from '../../domain/models/Campaign.js';
import { DomainTransaction } from '../DomainTransaction.js';

const { TO_SHARE } = CampaignParticipationStatuses;

const hasAssessmentParticipations = async function (userId) {
  const { count } = await knex('campaign-participations')
    .count('campaign-participations.id')
    .join('campaigns', 'campaigns.id', 'campaignId')
    .whereNot('campaigns.organizationId', constants.AUTONOMOUS_COURSES_ORGANIZATION_ID)
    .where('campaigns.type', '=', CampaignTypes.ASSESSMENT)
    .andWhere({ userId })
    .first();
  return count > 0;
};

const getCodeOfLastParticipationToProfilesCollectionCampaignForUser = async function (userId) {
  const result = await knex('campaign-participations')
    .select('campaigns.code')
    .join('campaigns', 'campaigns.id', 'campaignId')
    .where({ userId })
    .whereNull('campaign-participations.deletedAt')
    .whereNull('archivedAt')
    .andWhere({ status: TO_SHARE })
    .andWhere({ 'campaigns.type': CampaignTypes.PROFILES_COLLECTION })
    .orderBy('campaign-participations.createdAt', 'desc')
    .first();
  return result?.code || null;
};

const get = async function (id) {
  const knexConn = DomainTransaction.getConnection();
  const campaignParticipation = await knexConn('campaign-participations').where({ id }).first();
  const campaign = await knexConn('campaigns').where({ id: campaignParticipation.campaignId }).first();
  const assessments = await knexConn('assessments').where({ campaignParticipationId: id });
  return new CampaignParticipation({
    ...campaignParticipation,
    campaign: new Campaign(campaign),
    assessments: assessments.map((assessment) => new Assessment(assessment)),
  });
};

const findLatestOngoingByUserId = async function (userId) {
  const campaignParticipations = await knex('campaign-participations')
    .join('campaigns', 'campaigns.id', 'campaign-participations.campaignId')
    .whereNull('campaigns.archivedAt')
    .where({ userId })
    .orderBy('campaign-participations.createdAt', 'DESC')
    .select('campaign-participations.*');
  const campaigns = await knex('campaigns').whereIn(
    'id',
    campaignParticipations.map((campaignParticipation) => campaignParticipation.campaignId),
  );
  const assessments = await knex('assessments')
    .whereIn(
      'campaignParticipationId',
      campaignParticipations.map((campaignParticipation) => campaignParticipation.id),
    )
    .orderBy('createdAt');
  return campaignParticipations.map((campaignParticipation) => {
    const campaign = campaigns.find((campaign) => campaign.id === campaignParticipation.campaignId);
    return new CampaignParticipation({
      ...campaignParticipation,
      campaign: new Campaign(campaign),
      assessments: assessments
        .filter((assessment) => assessment.campaignParticipationId === campaignParticipation.id)
        .map((assessment) => new Assessment(assessment)),
    });
  });
};

const findOneByCampaignIdAndUserId = async function ({ campaignId, userId }) {
  const campaignParticipation = await knex('campaign-participations')
    .where({ userId, isImproved: false, campaignId })
    .first();
  if (!campaignParticipation) return null;
  const assessments = await knex('assessments').where({ campaignParticipationId: campaignParticipation.id });
  return new CampaignParticipation({
    ...campaignParticipation,
    assessments: assessments.map((assessment) => new Assessment(assessment)),
  });
};

const isRetrying = async function ({ campaignParticipationId }) {
  const { id: campaignId, userId } = await knex('campaigns')
    .select('campaigns.id', 'userId')
    .join('campaign-participations', 'campaigns.id', 'campaignId')
    .where({ 'campaign-participations.id': campaignParticipationId })
    .first();

  const campaignParticipations = await knex('campaign-participations')
    .select('sharedAt', 'isImproved')
    .where({ campaignId, userId });

  return (
    campaignParticipations.length > 1 &&
    campaignParticipations.some((participation) => !participation.isImproved && !participation.sharedAt)
  );
};

export {
  findLatestOngoingByUserId,
  findOneByCampaignIdAndUserId,
  get,
  getCodeOfLastParticipationToProfilesCollectionCampaignForUser,
  hasAssessmentParticipations,
  isRetrying,
};
