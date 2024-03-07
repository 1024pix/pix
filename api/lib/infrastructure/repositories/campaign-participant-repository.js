import { knex } from '../../../db/knex-database-connection.js';
import { CampaignParticipant } from '../../../src/prescription/campaign-participation/domain/models/CampaignParticipant.js';
import { CampaignToStartParticipation } from '../../../src/prescription/campaign-participation/domain/models/CampaignToStartParticipation.js';
import { PreviousCampaignParticipation } from '../../../src/prescription/campaign-participation/domain/models/PreviousCampaignParticipation.js';
import { NotFoundError } from '../../../src/shared/domain/errors.js';
import { OrganizationLearnerForStartingParticipation } from '../../domain/read-models/OrganizationLearnerForStartingParticipation.js';
import { UserIdentity } from '../../domain/read-models/UserIdentity.js';
import * as campaignRepository from '../repositories/campaign-repository.js';

async function get({ userId, campaignId, domainTransaction }) {
  const userIdentity = await _getUserIdentityForTrainee(userId, domainTransaction);

  const campaignToStartParticipation = await _getCampaignToStart(campaignId, domainTransaction);

  const organizationLearner = await _getOrganizationLearner(campaignId, userId, domainTransaction);

  const previousCampaignParticipationForUser = await _findpreviousCampaignParticipationForUser({
    campaignId,
    userId,
    isCampaignMultipleSendings: campaignToStartParticipation.multipleSendings,
    domainTransaction,
  });

  return new CampaignParticipant({
    userIdentity,
    campaignToStartParticipation,
    organizationLearner,
    previousCampaignParticipationForUser,
  });
}

async function _getUserIdentityForTrainee(userId, domainTransaction) {
  const userIdentity = await domainTransaction
    .knexTransaction('users')
    .select('id', 'firstName', 'lastName')
    .where({ id: userId })
    .first();

  return new UserIdentity(userIdentity);
}

async function _getCampaignToStart(campaignId, domainTransaction) {
  const campaignAttributes = await domainTransaction
    .knexTransaction('campaigns')
    .join('organizations', 'organizations.id', 'organizationId')
    .select([
      'campaigns.id',
      'campaigns.type',
      'idPixLabel',
      'campaigns.archivedAt',
      'isManagingStudents AS isRestricted',
      'multipleSendings',
      'assessmentMethod',
      'organizationId',
    ])
    .where({ 'campaigns.id': campaignId })
    .first();

  if (!campaignAttributes) {
    throw new NotFoundError(`La campagne d'id ${campaignId} n'existe pas ou son accès est restreint`);
  }
  const skillIds = await campaignRepository.findSkillIds({ campaignId, domainTransaction });

  return new CampaignToStartParticipation({ ...campaignAttributes, skillCount: skillIds.length });
}

async function _getOrganizationLearner(campaignId, userId, domainTransaction) {
  const row = await domainTransaction
    .knexTransaction('campaigns')
    .select({
      id: 'view-active-organization-learners.id',
      campaignParticipationId: 'campaign-participations.id',
      isDisabled: 'view-active-organization-learners.isDisabled',
    })
    .join(
      'view-active-organization-learners',
      'view-active-organization-learners.organizationId',
      'campaigns.organizationId',
    )
    .leftJoin(
      'campaign-participations',
      function () {
        this.on('campaign-participations.organizationLearnerId', 'view-active-organization-learners.id');
        this.on('campaign-participations.campaignId', 'campaigns.id');
        this.on('campaign-participations.deletedAt', knex.raw('IS'), knex.raw('NULL'));
        this.on('campaign-participations.isImproved', knex.raw('false'));
        this.on('campaign-participations.userId', '!=', 'view-active-organization-learners.userId');
      },
      'view-active-organization-learners.id',
    )
    .where({
      'campaigns.id': campaignId,
      'view-active-organization-learners.userId': userId,
      isDisabled: false,
    })
    .first();

  if (row) {
    return new OrganizationLearnerForStartingParticipation({
      id: row.id,
      hasParticipated: Boolean(row.campaignParticipationId),
      isDisabled: row.isDisabled,
    });
  }

  return new OrganizationLearnerForStartingParticipation({
    id: null,
    hasParticipated: false,
    isDisabled: false,
  });
}

async function _findpreviousCampaignParticipationForUser({
  campaignId,
  userId,
  isCampaignMultipleSendings,
  domainTransaction,
}) {
  const campaignParticipationAttributes = await domainTransaction
    .knexTransaction('campaign-participations')
    .select('id', 'participantExternalId', 'validatedSkillsCount', 'status', 'deletedAt', 'sharedAt')
    .where({ campaignId, userId, isImproved: false })
    .first();

  if (!campaignParticipationAttributes) return null;

  const isTargetProfileResetAllowed = await _isTargetProfileResetAllowed(campaignId, domainTransaction);
  const isOrganizationLearnerActive = await _isOrganizationLearnerActive(userId, campaignId, domainTransaction);

  return new PreviousCampaignParticipation({
    id: campaignParticipationAttributes.id,
    participantExternalId: campaignParticipationAttributes.participantExternalId,
    validatedSkillsCount: campaignParticipationAttributes.validatedSkillsCount,
    status: campaignParticipationAttributes.status,
    isDeleted: Boolean(campaignParticipationAttributes.deletedAt),
    sharedAt: campaignParticipationAttributes.sharedAt,
    isCampaignMultipleSendings,
    isTargetProfileResetAllowed,
    isOrganizationLearnerActive,
  });
}

async function _isTargetProfileResetAllowed(campaignId, domainTransaction) {
  const targetProfile = await domainTransaction
    .knexTransaction('target-profiles')
    .join('campaigns', 'campaigns.targetProfileId', 'target-profiles.id')
    .where('campaigns.id', campaignId)
    .first('areKnowledgeElementsResettable');

  return targetProfile ? targetProfile.areKnowledgeElementsResettable : false;
}

async function _isOrganizationLearnerActive(userId, campaignId, domainTransaction) {
  const organizationLearner = await domainTransaction
    .knexTransaction('view-active-organization-learners')
    .select('view-active-organization-learners.isDisabled')
    .join('organizations', 'organizations.id', 'view-active-organization-learners.organizationId')
    .join('campaigns', 'campaigns.organizationId', 'organizations.id')
    .where({ 'campaigns.id': campaignId })
    .andWhere({ 'view-active-organization-learners.userId': userId })
    .first();
  return !organizationLearner?.isDisabled;
}

export { get };
