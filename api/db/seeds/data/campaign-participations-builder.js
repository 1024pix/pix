import _ from 'lodash';
import Assessment from '../../../lib/domain/models/Assessment';
import CampaignParticipationStatuses from '../../../lib/domain/models/CampaignParticipationStatuses';
import KnowledgeElement from '../../../lib/domain/models/KnowledgeElement';
import { PIX_SUPER_ADMIN_ID } from './users-builder';

const { SHARED, STARTED } = CampaignParticipationStatuses;

function _mapAssessmentStateFromParticipationStatus(status) {
  if (status === STARTED) {
    return Assessment.states.STARTED;
  }
  return Assessment.states.COMPLETED;
}

function _buildAssessmentAndAnswer({ databaseBuilder, userId, campaignParticipationId, status, hasSomeFailures }) {
  const { id: assessmentId } = databaseBuilder.factory.buildAssessment({
    userId,
    type: Assessment.types.CAMPAIGN,
    state: _mapAssessmentStateFromParticipationStatus(status),
    campaignParticipationId,
  });

  const { id: answerId } = databaseBuilder.factory.buildAnswer({
    result: 'ok',
    assessmentId,
    challengeId: 'recqxUPlzYVbbTtFP',
  });

  databaseBuilder.factory.buildKnowledgeElement({
    skillId: 'recGd7oJ2wVEyKmPS', //connexionSmart3
    assessmentId,
    userId,
    competenceId: 'recIhdrmCuEmCDAzj',
    answerId,
  });
  databaseBuilder.factory.buildKnowledgeElement({
    skillId: 'recVv1eoSLW7yFgXv', //connexionSmart1
    assessmentId,
    userId,
    competenceId: 'recIhdrmCuEmCDAzj',
    answerId,
    source: KnowledgeElement.SourceType.INFERRED,
  });
  databaseBuilder.factory.buildKnowledgeElement({
    skillId: 'recVywppdS4hGEekR', //connexionSmart2
    assessmentId,
    userId,
    competenceId: 'recIhdrmCuEmCDAzj',
    answerId,
    source: KnowledgeElement.SourceType.INFERRED,
  });

  const { id: otherAnswerId } = databaseBuilder.factory.buildAnswer({
    result: hasSomeFailures ? 'ko' : 'ok',
    assessmentId,
    challengeId: 'recawBkXqLRXK4zzT',
  });

  databaseBuilder.factory.buildKnowledgeElement({
    skillId: 'recmB2623CruGvA1b', //problemeImprimante4
    assessmentId,
    userId,
    competenceId: 'recIhdrmCuEmCDAzj',
    answerId: otherAnswerId,
    status: hasSomeFailures ? KnowledgeElement.StatusType.INVALIDATED : KnowledgeElement.StatusType.VALIDATED,
    earnedPix: hasSomeFailures ? 0 : 2,
  });

  databaseBuilder.factory.buildKnowledgeElement({
    skillId: 'recOyQOjUhDKTO7UN', //problemeImprimante3
    assessmentId,
    userId,
    competenceId: 'recIhdrmCuEmCDAzj',
    answerId: otherAnswerId,
    status: hasSomeFailures ? KnowledgeElement.StatusType.INVALIDATED : KnowledgeElement.StatusType.VALIDATED,
    earnedPix: hasSomeFailures ? 0 : 2,
  });

  databaseBuilder.factory.buildKnowledgeElement({
    skillId: 'recKFUQ2CzcYHrxPR', //problemeImprimante2
    assessmentId,
    userId,
    competenceId: 'recIhdrmCuEmCDAzj',
    answerId: otherAnswerId,
    status: hasSomeFailures ? KnowledgeElement.StatusType.INVALIDATED : KnowledgeElement.StatusType.VALIDATED,
    earnedPix: hasSomeFailures ? 0 : 2,
    source: KnowledgeElement.SourceType.INFERRED,
  });
}

function participateToAssessmentCampaign({ databaseBuilder, campaignId, user, organizationLearnerId, status, isImprovingOldParticipation = false, deleted = false }) {
  const today = new Date();
  const sharedAt = status === SHARED ? today : null;
  const deletedAt = deleted ? today : null;
  const deletedBy = deleted ? PIX_SUPER_ADMIN_ID : null;

  const { id: userId } = user;
  const { id: campaignParticipationId } = databaseBuilder.factory.buildCampaignParticipation({
    campaignId,
    userId,
    organizationLearnerId,
    participantExternalId: userId,
    createdAt: user.createdAt,
    status,
    sharedAt,
    deletedAt,
    deletedBy,
  });

  _buildAssessmentAndAnswer({ databaseBuilder, userId, campaignParticipationId, status, hasSomeFailures: _.sample([true, false]) });

  if (isImprovingOldParticipation) {
    const { id: oldCampaignParticipationId } = databaseBuilder.factory.buildCampaignParticipation({
      campaignId,
      userId,
      organizationLearnerId,
      participantExternalId: userId,
      status: SHARED,
      createdAt: user.createdAt,
      sharedAt: user.createdAt,
      isImproved: true,
    });
    _buildAssessmentAndAnswer({ databaseBuilder, userId, campaignParticipationId: oldCampaignParticipationId, status: SHARED, hasSomeFailures: true });
  }
  return campaignParticipationId;
}

function participateToProfilesCollectionCampaign({ databaseBuilder, campaignId, user, organizationLearnerId, status, isImprovingOldParticipation = false, deleted = false, isCertifiable = null }) {
  const today = new Date();
  const sharedAt = status === SHARED ? today : null;
  const deletedAt = deleted ? today : null;
  const deletedBy = deleted ? PIX_SUPER_ADMIN_ID : null;

  const { id: userId } = user;
  databaseBuilder.factory.buildCampaignParticipation({
    campaignId,
    userId,
    organizationLearnerId,
    participantExternalId: userId,
    status,
    createdAt: user.createdAt,
    sharedAt,
    deletedAt,
    deletedBy,
    isCertifiable,
  });

  if (isImprovingOldParticipation) {
    databaseBuilder.factory.buildCampaignParticipation({
      campaignId,
      userId,
      organizationLearnerId,
      participantExternalId: userId,
      status: SHARED,
      createdAt: user.createdAt,
      sharedAt: user.createdAt,
      isImproved: true,
      isCertifiable,
    });
  }
}

export default {
  participateToAssessmentCampaign,
  participateToProfilesCollectionCampaign,
};
