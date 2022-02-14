const pick = require('lodash/pick');
const CampaignParticipant = require('../../domain/models/CampaignParticipant');
const CampaignToStartParticipation = require('../../domain/models/CampaignToStartParticipation');
const { AlreadyExistingCampaignParticipationError, NotFoundError } = require('../../domain/errors');
const skillDatasource = require('../datasources/learning-content/skill-datasource');

async function save(campaignParticipant, domainTransaction) {
  const newlyCreatedSchoolingRegistrationId = await _createNewSchoolingRegistration(
    campaignParticipant.schoolingRegistration,
    domainTransaction.knexTransaction
  );
  if (newlyCreatedSchoolingRegistrationId) {
    campaignParticipant.campaignParticipation.schoolingRegistrationId = newlyCreatedSchoolingRegistrationId;
  }

  await _updatePreviousParticipation(
    campaignParticipant.previousCampaignParticipation,
    domainTransaction.knexTransaction
  );
  const campaignParticipationId = await _createNewCampaignParticipation(
    domainTransaction.knexTransaction,
    campaignParticipant.campaignParticipation
  );
  await _createAssessment(campaignParticipant.assessment, campaignParticipationId, domainTransaction.knexTransaction);
  return campaignParticipationId;
}

async function _createNewSchoolingRegistration(schoolingRegistration, queryBuilder) {
  if (schoolingRegistration) {
    const [newlyCreatedSchoolingRegistrationId] = await queryBuilder('schooling-registrations')
      .insert({
        userId: schoolingRegistration.userId,
        organizationId: schoolingRegistration.organizationId,
        firstName: schoolingRegistration.firstName,
        lastName: schoolingRegistration.lastName,
      })
      .returning('id');
    return newlyCreatedSchoolingRegistrationId;
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
    const [id] = await queryBuilder('campaign-participations')
      .insert({
        campaignId: campaignParticipation.campaignId,
        userId: campaignParticipation.userId,
        status: campaignParticipation.status,
        schoolingRegistrationId: campaignParticipation.schoolingRegistrationId,
        participantExternalId: campaignParticipation.participantExternalId,
      })
      .returning('id');

    return id;
  } catch (error) {
    if (error.constraint === 'campaign_participations_campaignid_userid_isimproved') {
      throw new AlreadyExistingCampaignParticipationError(
        `User ${campaignParticipation.userId} has already a campaign participation with campaign ${campaignParticipation.campaignId}`
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

  const schoolingRegistrationId = await _getSchoolingRegistrationId(campaignId, userId, domainTransaction);

  const previousCampaignParticipation = await _getPreviousCampaignParticipation(campaignId, userId, domainTransaction);

  return new CampaignParticipant({
    userIdentity,
    campaignToStartParticipation,
    schoolingRegistrationId,
    previousCampaignParticipation,
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
      'archivedAt',
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
  const skillIds = await domainTransaction
    .knexTransaction('target-profiles_skills')
    .join('campaigns', 'campaigns.targetProfileId', 'target-profiles_skills.targetProfileId')
    .where({ 'campaigns.id': campaignId })
    .pluck('skillId');

  const skills = await skillDatasource.findOperativeByRecordIds(skillIds);

  return new CampaignToStartParticipation({ ...campaignAttributes, skillCount: skills.length });
}

async function _getSchoolingRegistrationId(campaignId, userId, domainTransaction) {
  const [id] = await domainTransaction
    .knexTransaction('campaigns')
    .join('schooling-registrations', 'schooling-registrations.organizationId', 'campaigns.organizationId')
    .where({ 'campaigns.id': campaignId, userId, isDisabled: false })
    .pluck('schooling-registrations.id');

  return id;
}

async function _getPreviousCampaignParticipation(campaignId, userId, domainTransaction) {
  return domainTransaction
    .knexTransaction('campaign-participations')
    .select('id', 'participantExternalId', 'validatedSkillsCount', 'status')
    .where({ campaignId, userId, isImproved: false })
    .first();
}

module.exports = {
  get,
  save,
};
