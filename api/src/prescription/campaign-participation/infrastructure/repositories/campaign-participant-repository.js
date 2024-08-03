import pick from 'lodash/pick.js';

import { knex } from '../../../../../db/knex-database-connection.js';
import * as campaignRepository from '../../../../../lib/infrastructure/repositories/campaign-repository.js';
import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import {
  AlreadyExistingCampaignParticipationError,
  OrganizationLearnersCouldNotBeSavedError,
} from '../../../../shared/domain/errors.js';
import { NotFoundError } from '../../../../shared/domain/errors.js';
import { OrganizationLearnerForStartingParticipation } from '../../../../shared/domain/read-models/OrganizationLearnerForStartingParticipation.js';
import { UserIdentity } from '../../../../shared/domain/read-models/UserIdentity.js';
import * as knexUtils from '../../../../shared/infrastructure/utils/knex-utils.js';
import { CampaignParticipant } from '../../domain/models/CampaignParticipant.js';
import { CampaignToStartParticipation } from '../../domain/models/CampaignToStartParticipation.js';
import { PreviousCampaignParticipation } from '../../domain/models/PreviousCampaignParticipation.js';

async function save({ campaignParticipant }) {
  const newlyCreatedOrganizationLearnerId = await _createNewOrganizationLearner(
    campaignParticipant.organizationLearner,
  );
  if (newlyCreatedOrganizationLearnerId) {
    campaignParticipant.campaignParticipation.organizationLearnerId = newlyCreatedOrganizationLearnerId;
  }

  await _updatePreviousParticipation(campaignParticipant.previousCampaignParticipationForUser);
  const campaignParticipationId = await _createNewCampaignParticipation(campaignParticipant.campaignParticipation);
  await _createAssessment(campaignParticipant.assessment, campaignParticipationId);
  return campaignParticipationId;
}

async function get({ userId, campaignId, organizationFeatureAPI }) {
  const userIdentity = await _getUserIdentityForTrainee(userId);

  const campaignToStartParticipation = await _getCampaignToStart({
    campaignId,

    organizationFeatureAPI,
  });

  const organizationLearner = await _getOrganizationLearner(campaignId, userId);

  const previousCampaignParticipationForUser = await _findpreviousCampaignParticipationForUser({
    campaignId,
    userId,
    isCampaignMultipleSendings: campaignToStartParticipation.multipleSendings,
  });

  return new CampaignParticipant({
    userIdentity,
    campaignToStartParticipation,
    organizationLearner,
    previousCampaignParticipationForUser,
  });
}

async function _createNewOrganizationLearner(organizationLearner) {
  const knexConnection = DomainTransaction.getConnection();

  if (organizationLearner) {
    const existingOrganizationLearner = await knexConnection('view-active-organization-learners')
      .where({
        userId: organizationLearner.userId,
        organizationId: organizationLearner.organizationId,
      })
      .first();

    if (existingOrganizationLearner) {
      if (existingOrganizationLearner.isDisabled) {
        await knexConnection('organization-learners')
          .update({ isDisabled: false, updatedAt: new Date() })
          .where({ id: existingOrganizationLearner.id })
          .returning('id');
      }

      return existingOrganizationLearner.id;
    } else {
      try {
        const [{ id }] = await knexConnection('organization-learners').insert(
          {
            userId: organizationLearner.userId,
            organizationId: organizationLearner.organizationId,
            firstName: organizationLearner.firstName,
            lastName: organizationLearner.lastName,
          },
          ['id'],
        );
        return id;
      } catch (error) {
        if (knexUtils.isUniqConstraintViolated(error) && error.constraint === 'one_active_organization_learner') {
          throw new OrganizationLearnersCouldNotBeSavedError(
            `User ${organizationLearner.userId} already inserted into ${organizationLearner.organizationId}`,
          );
        }

        throw error;
      }
    }
  }
}

async function _updatePreviousParticipation(campaignParticipation) {
  const knexConnection = DomainTransaction.getConnection();
  if (campaignParticipation) {
    await knexConnection('campaign-participations')
      .update({ isImproved: campaignParticipation.isImproved })
      .where({ id: campaignParticipation.id });
  }
}

async function _createNewCampaignParticipation(campaignParticipation) {
  const knexConnection = DomainTransaction.getConnection();
  try {
    const [{ id }] = await knexConnection('campaign-participations')
      .insert({
        campaignId: campaignParticipation.campaignId,
        userId: campaignParticipation.userId,
        status: campaignParticipation.status,
        organizationLearnerId: campaignParticipation.organizationLearnerId,
        participantExternalId: campaignParticipation.participantExternalId,
      })
      .returning('id');

    return id;
  } catch (error) {
    if (error.constraint === 'campaign_participations_campaignid_userid_isimproved_deleted') {
      throw new AlreadyExistingCampaignParticipationError(
        `User ${campaignParticipation.userId} has already a campaign participation with campaign ${campaignParticipation.campaignId}`,
      );
    }
    throw error;
  }
}

async function _createAssessment(assessment, campaignParticipationId) {
  const knexConnection = DomainTransaction.getConnection();
  if (assessment) {
    const assessmentAttributes = pick(assessment, ['userId', 'method', 'state', 'type', 'courseId', 'isImproving']);
    await knexConnection('assessments').insert({ campaignParticipationId, ...assessmentAttributes });
  }
}

async function _getUserIdentityForTrainee(userId) {
  const knexConn = DomainTransaction.getConnection();
  const userIdentity = await knexConn('users').select('id', 'firstName', 'lastName').where({ id: userId }).first();

  return new UserIdentity(userIdentity);
}

async function _getCampaignToStart({ campaignId, organizationFeatureAPI }) {
  const knexConnection = DomainTransaction.getConnection();
  const campaignAttributes = await knexConnection('campaigns')
    .join('organizations', 'organizations.id', 'organizationId')
    .select([
      'campaigns.id',
      'campaigns.type',
      'idPixLabel',
      'campaigns.archivedAt',
      'campaigns.deletedAt',
      'isManagingStudents',
      'multipleSendings',
      'assessmentMethod',
      'organizationId',
    ])
    .where({ 'campaigns.id': campaignId })
    .first();

  if (!campaignAttributes) {
    throw new NotFoundError(`La campagne d'id ${campaignId} n'existe pas ou son accès est restreint`);
  }
  const skillIds = await campaignRepository.findSkillIds({ campaignId });

  const { hasLearnersImportFeature } = await organizationFeatureAPI.getAllFeaturesFromOrganization(
    campaignAttributes.organizationId,
  );

  return new CampaignToStartParticipation({
    ...campaignAttributes,
    hasLearnersImportFeature,
    skillCount: skillIds.length,
  });
}

async function _getOrganizationLearner(campaignId, userId) {
  const knexConnection = DomainTransaction.getConnection();
  const row = await knexConnection('campaigns')
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

async function _findpreviousCampaignParticipationForUser({ campaignId, userId, isCampaignMultipleSendings }) {
  const knexConnection = DomainTransaction.getConnection();
  const campaignParticipationAttributes = await knexConnection('campaign-participations')
    .select('id', 'participantExternalId', 'validatedSkillsCount', 'status', 'deletedAt', 'sharedAt')
    .where({ campaignId, userId, isImproved: false })
    .first();

  if (!campaignParticipationAttributes) return null;

  const isTargetProfileResetAllowed = await _isTargetProfileResetAllowed(campaignId);
  const isOrganizationLearnerActive = await _isOrganizationLearnerActive(userId, campaignId);

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

async function _isTargetProfileResetAllowed(campaignId) {
  const knexConnection = DomainTransaction.getConnection();
  const targetProfile = await knexConnection('target-profiles')
    .join('campaigns', 'campaigns.targetProfileId', 'target-profiles.id')
    .where('campaigns.id', campaignId)
    .first('areKnowledgeElementsResettable');

  return targetProfile ? targetProfile.areKnowledgeElementsResettable : false;
}

async function _isOrganizationLearnerActive(userId, campaignId) {
  const knexConnection = DomainTransaction.getConnection();
  const organizationLearner = await knexConnection('view-active-organization-learners')
    .select('view-active-organization-learners.isDisabled')
    .join('organizations', 'organizations.id', 'view-active-organization-learners.organizationId')
    .join('campaigns', 'campaigns.organizationId', 'organizations.id')
    .where({ 'campaigns.id': campaignId })
    .andWhere({ 'view-active-organization-learners.userId': userId })
    .first();
  return !organizationLearner?.isDisabled;
}

export { get, save };
