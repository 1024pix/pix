import lodash from 'lodash';

const { pick } = lodash;

import { CampaignParticipant } from '../../domain/models/CampaignParticipant.js';
import { CampaignToStartParticipation } from '../../domain/models/CampaignToStartParticipation.js';
import { AlreadyExistingCampaignParticipationError, NotFoundError } from '../../domain/errors.js';
import * as campaignRepository from '../repositories/campaign-repository.js';
import { knex } from '../../../db/knex-database-connection.js';

async function save(campaignParticipant, domainTransaction) {
  const newlyCreatedOrganizationLearnerId = await _createNewOrganizationLearner(
    campaignParticipant.organizationLearner,
    domainTransaction.knexTransaction,
  );
  if (newlyCreatedOrganizationLearnerId) {
    campaignParticipant.campaignParticipation.organizationLearnerId = newlyCreatedOrganizationLearnerId;
  }

  await _updatePreviousParticipation(
    campaignParticipant.previousCampaignParticipationForUser,
    domainTransaction.knexTransaction,
  );
  const campaignParticipationId = await _createNewCampaignParticipation(
    domainTransaction.knexTransaction,
    campaignParticipant.campaignParticipation,
  );
  await _createAssessment(campaignParticipant.assessment, campaignParticipationId, domainTransaction.knexTransaction);
  return campaignParticipationId;
}

async function _createNewOrganizationLearner(organizationLearner, queryBuilder) {
  if (organizationLearner) {
    const existingOrganizationLearner = await queryBuilder('view-active-organization-learners')
      .where({
        userId: organizationLearner.userId,
        organizationId: organizationLearner.organizationId,
      })
      .first();

    if (existingOrganizationLearner) {
      const [{ id }] = await queryBuilder('organization-learners').update({ isDisabled: false }).returning('id');
      return id;
    } else {
      const [{ id }] = await queryBuilder('organization-learners').insert(
        {
          userId: organizationLearner.userId,
          organizationId: organizationLearner.organizationId,
          firstName: organizationLearner.firstName,
          lastName: organizationLearner.lastName,
        },
        ['id'],
      );
      return id;
    }
  }
}

async function _updatePreviousParticipation(campaignParticipation, queryBuilder) {
  if (campaignParticipation) {
    await queryBuilder('campaign-participations')
      .update({ isImproved: campaignParticipation.isImproved })
      .where({ id: campaignParticipation.id });
  }
}

async function _createNewCampaignParticipation(queryBuilder, campaignParticipation) {
  try {
    const [{ id }] = await queryBuilder('campaign-participations')
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

async function _createAssessment(assessment, campaignParticipationId, queryBuilder) {
  if (assessment) {
    const assessmentAttributes = pick(assessment, ['userId', 'method', 'state', 'type', 'courseId', 'isImproving']);
    await queryBuilder('assessments').insert({ campaignParticipationId, ...assessmentAttributes });
  }
}

async function get({ userId, campaignId, domainTransaction }) {
  const userIdentity = await _getUserIdentityForTrainee(userId, domainTransaction);

  const campaignToStartParticipation = await _getCampaignToStart(campaignId, domainTransaction);

  const organizationLearner = await _getOrganizationLearner(campaignId, userId, domainTransaction);

  const previousCampaignParticipationForUser = await _findpreviousCampaignParticipationForUser(
    campaignId,
    userId,
    domainTransaction,
  );

  return new CampaignParticipant({
    userIdentity,
    campaignToStartParticipation,
    organizationLearner,
    previousCampaignParticipationForUser,
  });
}

function _getUserIdentityForTrainee(userId, domainTransaction) {
  return domainTransaction.knexTransaction('users').select('id', 'firstName', 'lastName').where({ id: userId }).first();
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
  const organizationLearner = { id: null, hasParticipated: false };
  const row = await domainTransaction
    .knexTransaction('campaigns')
    .select({ id: 'view-active-organization-learners.id', campaignParticipationId: 'campaign-participations.id' })
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
    organizationLearner.id = row.id;
    organizationLearner.hasParticipated = Boolean(row.campaignParticipationId);
  }
  return organizationLearner;
}

async function _findpreviousCampaignParticipationForUser(campaignId, userId, domainTransaction) {
  const campaignParticipationAttributes = await domainTransaction
    .knexTransaction('campaign-participations')
    .select('id', 'participantExternalId', 'validatedSkillsCount', 'status', 'deletedAt')
    .where({ campaignId, userId, isImproved: false })
    .first();

  if (!campaignParticipationAttributes) return null;
  return {
    id: campaignParticipationAttributes.id,
    participantExternalId: campaignParticipationAttributes.participantExternalId,
    validatedSkillsCount: campaignParticipationAttributes.validatedSkillsCount,
    status: campaignParticipationAttributes.status,
    isDeleted: Boolean(campaignParticipationAttributes.deletedAt),
  };
}

export { get, save };
