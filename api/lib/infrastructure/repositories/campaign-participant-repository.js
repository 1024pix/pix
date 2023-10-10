import lodash from 'lodash';
import { CampaignParticipant } from '../../domain/models/CampaignParticipant.js';
import { KnowledgeElement } from '../../domain/models/KnowledgeElement.js';
import { OrganizationLearnerForStartingParticipation } from '../../domain/read-models/OrganizationLearnerForStartingParticipation.js';
import { CampaignToStartParticipation } from '../../domain/models/CampaignToStartParticipation.js';
import { UserIdentity } from '../../domain/read-models/UserIdentity.js';
import { AlreadyExistingCampaignParticipationError, NotFoundError } from '../../domain/errors.js';
import * as campaignRepository from '../repositories/campaign-repository.js';
import { knex } from '../../../db/knex-database-connection.js';
import { PreviousCampaignParticipation } from '../../domain/read-models/PreviousCampaignParticipation.js';

const { pick } = lodash;

async function save({
  userId,
  campaignParticipant,
  domainTransaction,
  competenceEvaluationRepository,
  assessmentRepository,
  knowledgeElementRepository,
}) {
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

  if (campaignParticipant.shouldResetKnowledgeElementsAndRestartAssessments) {
    const skills = await campaignRepository.findAllSkills({
      campaignId: campaignParticipant.campaignToStartParticipation.id,
      domainTransaction,
    });
    const skillIds = skills.map(({ id }) => id);

    console.log('YOUHOU', skills);
    await _resetKnowledgeElements({
      userId,
      skillIds,
      knowledgeElementRepository,
      domainTransaction,
    });
    await _restartAssessments({
      userId,
      skills,
      competenceEvaluationRepository,
      assessmentRepository,
      domainTransaction,
    });
  }

  return campaignParticipationId;
}

async function _restartAssessments({
  userId,
  skills,
  competenceEvaluationRepository,
  assessmentRepository,
  domainTransaction,
}) {
  const competenceEvaluations = await competenceEvaluationRepository.findByUserId(userId);
  const competenceIds = skills.map(({ competenceId }) => competenceId);

  const assessmentsToRestart = competenceEvaluations
    .filter((competenceEvaluation) => competenceIds.includes(competenceEvaluation.competenceId))
    .map(({ assessmentId }) => assessmentId);

  await assessmentRepository.setAssessmentsAsStarted({
    assessmentIds: assessmentsToRestart,
    domainTransaction,
  });
}

async function _resetKnowledgeElements({ userId, skillIds, knowledgeElementRepository, domainTransaction }) {
  const knowledgeElements = await knowledgeElementRepository.findUniqByUserId({ userId, domainTransaction });

  const knowledgeElementsToReset = knowledgeElements
    .filter((ke) => skillIds.includes(ke.skillId))
    .map(KnowledgeElement.reset);

  await knowledgeElementRepository.batchSave({
    knowledgeElements: knowledgeElementsToReset,
    domainTransaction,
  });
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
      if (existingOrganizationLearner.isDisabled) {
        await queryBuilder('organization-learners')
          .update({ isDisabled: false })
          .where({ id: existingOrganizationLearner.id })
          .returning('id');
      }

      return existingOrganizationLearner.id;
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

async function get({ userId, campaignId, domainTransaction, campaignRepository }) {
  const userIdentity = await _getUserIdentityForTrainee(userId, domainTransaction);

  const areKnowledgeElementsResettable = await campaignRepository.areKnowledgeElementsResettable({
    id: campaignId,
    domainTransaction,
  });

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
    areKnowledgeElementsResettable,
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

export { get, save };
