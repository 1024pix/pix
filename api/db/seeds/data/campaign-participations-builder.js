const _ = require('lodash');
const Assessment = require('../../../lib/domain/models/Assessment');
const CampaignParticipation = require('../../../lib/domain/models/CampaignParticipation');
const KnowledgeElement = require('../../../lib/domain/models/KnowledgeElement');
const {
  CERTIF_REGULAR_USER1_ID, CERTIF_REGULAR_USER2_ID, CERTIF_REGULAR_USER3_ID,
  CERTIF_REGULAR_USER4_ID, CERTIF_REGULAR_USER5_ID,
} = require('./certification/users');
const { PRO_BASICS_BADGE_ID, PRO_TOOLS_BADGE_ID } = require('./badges-builder');
const { SUP_STUDENT_ASSOCIATED_ID, SUP_STUDENT_DISABLED_ID } = require('./organizations-sup-builder');
const { SCO_STUDENT_ID, SCO_FRENCH_USER_ID, SCO_FOREIGNER_USER_ID, SCO_DISABLED_USER_ID } = require('./organizations-sco-builder');
const { DEFAULT_PASSWORD } = require('./users-builder');

const { SHARED, TO_SHARE, STARTED } = CampaignParticipation.statuses;

function _buildUsers({ databaseBuilder, users }) {
  return users.map((user) => databaseBuilder.factory.buildUser.withRawPassword({ ...user, rawPassword: DEFAULT_PASSWORD }));
}

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

function _participateToAssessmentCampaign({ databaseBuilder, campaignId, user, schoolingRegistrationId, status, isImprovingOldParticipation = false }) {
  const today = new Date();
  const sharedAt = status === SHARED ? today : null;

  const { id: userId } = user;
  const { id: campaignParticipationId } = databaseBuilder.factory.buildCampaignParticipation({
    campaignId,
    userId,
    schoolingRegistrationId,
    participantExternalId: userId,
    createdAt: user.createdAt,
    status,
    sharedAt,
  });

  _buildAssessmentAndAnswer({ databaseBuilder, userId, campaignParticipationId, status, hasSomeFailures: _.sample([true, false]) });

  if (isImprovingOldParticipation) {
    const { id: oldCampaignParticipationId } = databaseBuilder.factory.buildCampaignParticipation({
      campaignId,
      userId,
      schoolingRegistrationId,
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

function _participateToProfilesCollectionCampaign({ databaseBuilder, campaignId, user, schoolingRegistrationId, status, isImprovingOldParticipation = false }) {
  const today = new Date();
  const sharedAt = status === SHARED ? today : null;

  const { id: userId } = user;
  databaseBuilder.factory.buildCampaignParticipation({
    campaignId,
    userId,
    schoolingRegistrationId,
    participantExternalId: userId,
    status,
    createdAt: user.createdAt,
    sharedAt,
  });

  if (isImprovingOldParticipation) {
    databaseBuilder.factory.buildCampaignParticipation({
      campaignId,
      userId,
      schoolingRegistrationId,
      participantExternalId: userId,
      status: SHARED,
      createdAt: user.createdAt,
      sharedAt: user.createdAt,
      isImproved: true,
    });
  }
}

function _buildProParticipationsInDifferentStatus({ databaseBuilder, user }) {
  _participateToAssessmentCampaign({ databaseBuilder, campaignId: 2, user, schoolingRegistrationId: null, status: STARTED }); //started
  _participateToAssessmentCampaign({ databaseBuilder, campaignId: 12, user, schoolingRegistrationId: null, status: TO_SHARE }); //to share
  _participateToAssessmentCampaign({ databaseBuilder, campaignId: 13, user, schoolingRegistrationId: null, status: SHARED });//archived + shared
  _participateToAssessmentCampaign({ databaseBuilder, campaignId: 14, user, schoolingRegistrationId: null, status: STARTED });//archived + started
  _participateToAssessmentCampaign({ databaseBuilder, campaignId: 15, user, schoolingRegistrationId: null, status: SHARED });//archived + shared + badges
}

function _buildProAssessmentParticipations({ databaseBuilder, users }) {
  const userIdsNotCompleted = [users[1], users[2]];
  const userIdsNotShared = [users[4], users[5], users[8]];
  const userIdsNotShared2 = [users[6], users[7]];
  const userIdsCompletedShared = [users[10], users[12]];
  const userIdsCompletedShared2 = [users[0], users[9]];
  const userIdsCompletedSharedWith2Badges = [users[3], users[11]];

  userIdsNotCompleted.forEach((user) => _participateToAssessmentCampaign({ databaseBuilder, campaignId: 1, user, schoolingRegistrationId: null, status: STARTED }));
  userIdsNotShared.forEach((user) => _participateToAssessmentCampaign({ databaseBuilder, campaignId: 1, user, schoolingRegistrationId: null, status: TO_SHARE }));
  userIdsNotShared2.forEach((user) => {
    const campaignParticipationId = _participateToAssessmentCampaign({ databaseBuilder, campaignId: 1, user, schoolingRegistrationId: null, status: TO_SHARE });
    databaseBuilder.factory.buildBadgeAcquisition({ userId: user.id, badgeId: PRO_BASICS_BADGE_ID, campaignParticipationId });
  });
  userIdsCompletedShared.forEach((user) => _participateToAssessmentCampaign({ databaseBuilder, campaignId: 1, user, status: SHARED }));
  userIdsCompletedShared2.forEach((user) => {
    const campaignParticipationId = _participateToAssessmentCampaign({ databaseBuilder, campaignId: 1, user, schoolingRegistrationId: null, status: SHARED });
    databaseBuilder.factory.buildBadgeAcquisition({ userId: user.id, badgeId: PRO_TOOLS_BADGE_ID, campaignParticipationId });
  });
  userIdsCompletedSharedWith2Badges.forEach((user) => {
    const campaignParticipationId = _participateToAssessmentCampaign({ databaseBuilder, campaignId: 1, user, schoolingRegistrationId: null, status: SHARED });
    databaseBuilder.factory.buildBadgeAcquisition({ userId: user.id, badgeId: PRO_BASICS_BADGE_ID, campaignParticipationId });
    databaseBuilder.factory.buildBadgeAcquisition({ userId: user.id, badgeId: PRO_TOOLS_BADGE_ID, campaignParticipationId });
  });

  //multiple sendings profiles collection campaign
  userIdsNotCompleted.forEach((user) => _participateToAssessmentCampaign({ databaseBuilder, campaignId: 16, user, schoolingRegistrationId: null, status: STARTED }));
  userIdsNotShared.forEach((user) => _participateToAssessmentCampaign({ databaseBuilder, campaignId: 16, user, schoolingRegistrationId: null, status: TO_SHARE }));
  userIdsNotShared2.forEach((user) => _participateToAssessmentCampaign({ databaseBuilder, campaignId: 16, user, schoolingRegistrationId: null, status: TO_SHARE, isImprovingOldParticipation: true }));
  userIdsCompletedShared.forEach((user) => _participateToAssessmentCampaign({ databaseBuilder, campaignId: 16, user, schoolingRegistrationId: null, status: SHARED }));
  userIdsCompletedShared2.forEach((user) => _participateToAssessmentCampaign({ databaseBuilder, campaignId: 16, user, schoolingRegistrationId: null, status: SHARED, isImprovingOldParticipation: true }));
}

function _buildSupAssessmentParticipations({ databaseBuilder }) {
  const supStudentAssociated = { id: SUP_STUDENT_ASSOCIATED_ID, createdAt: new Date('2022-02-04') };
  const supStudentDisabled = { id: SUP_STUDENT_DISABLED_ID, createdAt: new Date('2022-02-05') };
  _participateToAssessmentCampaign({ databaseBuilder, campaignId: 3, user: supStudentAssociated, schoolingRegistrationId: SUP_STUDENT_ASSOCIATED_ID, status: SHARED });
  _participateToAssessmentCampaign({ databaseBuilder, campaignId: 3, user: supStudentDisabled, schoolingRegistrationId: SUP_STUDENT_DISABLED_ID, status: STARTED });
}

function _buildScoAssessmentParticipations({ databaseBuilder }) {
  const scoStudent = { id: SCO_STUDENT_ID, createdAt: new Date('2022-02-04') };
  const scoStudentFrench = { id: SCO_FRENCH_USER_ID, createdAt: new Date('2022-02-05') };
  const scoStudentForeigner = { id: SCO_FOREIGNER_USER_ID, createdAt: new Date('2022-02-05') };
  const scoStudentDisabled = { id: SCO_DISABLED_USER_ID, createdAt: new Date('2022-02-06') };

  const campaignParticipationId = _participateToAssessmentCampaign({ databaseBuilder, campaignId: 4, user: scoStudent, schoolingRegistrationId: SCO_STUDENT_ID, status: SHARED });
  databaseBuilder.factory.buildBadgeAcquisition({ userId: SCO_STUDENT_ID, badgeId: PRO_BASICS_BADGE_ID, campaignParticipationId });
  databaseBuilder.factory.buildBadgeAcquisition({ userId: SCO_STUDENT_ID, badgeId: PRO_TOOLS_BADGE_ID, campaignParticipationId });

  _participateToAssessmentCampaign({ databaseBuilder, campaignId: 4, user: scoStudentFrench, schoolingRegistrationId: SCO_FRENCH_USER_ID, status: TO_SHARE });
  _participateToAssessmentCampaign({ databaseBuilder, campaignId: 4, user: scoStudentForeigner, schoolingRegistrationId: SCO_FOREIGNER_USER_ID, status: STARTED });
  _participateToAssessmentCampaign({ databaseBuilder, campaignId: 4, user: scoStudentDisabled, schoolingRegistrationId: SCO_DISABLED_USER_ID, status: SHARED });

  _participateToAssessmentCampaign({ databaseBuilder, campaignId: 8, user: scoStudentForeigner, schoolingRegistrationId: SCO_FOREIGNER_USER_ID, status: SHARED });
}

function _buildMedNumAssessmentParticipations({ databaseBuilder }) {
  const anonymousUser = databaseBuilder.factory.buildUser({
    firstName: '',
    lastName: '',
    cgu: false,
    mustValidateTermsOfService: false,
    isAnonymous: true,
    createdAt: new Date('2022-01-01'),
  });
  _participateToAssessmentCampaign({ databaseBuilder, campaignId: 11, user: anonymousUser, schoolingRegistrationId: null, status: SHARED });
}

function _buildProProfilesCollectionParticipations({ databaseBuilder, users }) {
  const userIdsNotShared = [users[1], users[2], users[3], users[4], users[5], users[6], users[7], users[8]];
  const userIdsShared = [users[0], users[9], users[10], users[11], users[12]];
  const certifRegularUser1 = { id: CERTIF_REGULAR_USER1_ID, createdAt: new Date('2022-02-04') };
  const certifRegularUser2 = { id: CERTIF_REGULAR_USER2_ID, createdAt: new Date('2022-02-05') };
  const certifRegularUser3 = { id: CERTIF_REGULAR_USER3_ID, createdAt: new Date('2022-02-05') };
  const certifRegularUser4 = { id: CERTIF_REGULAR_USER4_ID, createdAt: new Date('2022-02-06') };
  const certifRegularUser5 = { id: CERTIF_REGULAR_USER5_ID, createdAt: new Date('2022-02-07') };

  [...userIdsNotShared, certifRegularUser4, certifRegularUser5].forEach((user) => _participateToProfilesCollectionCampaign({ databaseBuilder, campaignId: 6, user, schoolingRegistrationId: null, status: TO_SHARE }));
  [...userIdsShared, certifRegularUser1, certifRegularUser2, certifRegularUser3].forEach((user) => _participateToProfilesCollectionCampaign({ databaseBuilder, campaignId: 6, user, schoolingRegistrationId: null, status: SHARED }));

  //multiple sendings profiles collection campaign
  userIdsShared.forEach((user) => _participateToProfilesCollectionCampaign({ databaseBuilder, campaignId: 18, user, schoolingRegistrationId: null, status: SHARED }));
  userIdsNotShared.forEach((user) => _participateToProfilesCollectionCampaign({ databaseBuilder, campaignId: 18, user, schoolingRegistrationId: null, status: TO_SHARE, isImprovingOldParticipation: true }));
  [certifRegularUser1, certifRegularUser2, certifRegularUser3, certifRegularUser4, certifRegularUser5].forEach((user) => _participateToProfilesCollectionCampaign({ databaseBuilder, campaignId: 18, user, schoolingRegistrationId: null, status: SHARED, isImprovingOldParticipation: true }));
}

function _buildSupProfilesCollectionParticipations({ databaseBuilder }) {
  const supStudentAssociated = { id: SUP_STUDENT_ASSOCIATED_ID, createdAt: new Date('2022-02-06') };
  const supStudentDisabled = { id: SUP_STUDENT_DISABLED_ID, createdAt: new Date('2022-02-07') };
  _participateToProfilesCollectionCampaign({ databaseBuilder, campaignId: 10, user: supStudentAssociated, schoolingRegistrationId: SUP_STUDENT_ASSOCIATED_ID, status: SHARED });
  _participateToProfilesCollectionCampaign({ databaseBuilder, campaignId: 10, user: supStudentDisabled, schoolingRegistrationId: SUP_STUDENT_DISABLED_ID, status: TO_SHARE });
}

function _buildScoProfilesCollectionParticipations({ databaseBuilder }) {
  const scoStudent = { id: SCO_STUDENT_ID, createdAt: new Date('2022-02-05') };
  const scoStudentFrench = { id: SCO_FRENCH_USER_ID, createdAt: new Date('2022-02-06') };
  const scoStudentForeigner = { id: SCO_FOREIGNER_USER_ID, createdAt: new Date('2022-02-07') };
  const scoStudentDisabled = { id: SCO_DISABLED_USER_ID, createdAt: new Date('2022-02-07') };

  _participateToProfilesCollectionCampaign({ databaseBuilder, campaignId: 7, user: scoStudent, schoolingRegistrationId: SCO_STUDENT_ID, status: SHARED });
  _participateToProfilesCollectionCampaign({ databaseBuilder, campaignId: 7, user: scoStudentFrench, schoolingRegistrationId: SCO_FRENCH_USER_ID, status: SHARED });
  _participateToProfilesCollectionCampaign({ databaseBuilder, campaignId: 7, user: scoStudentForeigner, schoolingRegistrationId: SCO_FOREIGNER_USER_ID, status: TO_SHARE });
  _participateToProfilesCollectionCampaign({ databaseBuilder, campaignId: 7, user: scoStudentDisabled, schoolingRegistrationId: SCO_DISABLED_USER_ID, status: SHARED });
}

module.exports = function addParticipantsToCampaigns({ databaseBuilder }) {
  const users = _buildUsers({ databaseBuilder, users: [
    { firstName: 'Jaune', lastName: 'Attend', email: 'jaune.attend@example.net', createdAt: new Date('2022-01-01') },
    { firstName: 'Mélanie', lastName: 'Darboo', createdAt: new Date('2022-01-02') },
    { firstName: 'Matteo', lastName: 'Lorenzio', createdAt: new Date('2022-01-03') },
    { firstName: 'Jérémy', lastName: 'Bugietta', createdAt: new Date('2022-01-03') },
    { firstName: 'Léo', lastName: 'Subzéro', createdAt: new Date('2022-01-05') },
    { firstName: 'Forster', lastName: 'Gillay Djones', createdAt: new Date('2022-01-05') },
    { firstName: 'Thierry', lastName: 'Donckele', createdAt: new Date('2022-01-07') },
    { firstName: 'Stéphan', lastName: 'Deumonaco', createdAt: new Date('2022-01-08') },
    { firstName: 'Lise', lastName: 'Nelkay', createdAt: new Date('2022-01-09') },
    { firstName: 'Sébastien', lastName: 'Serra Oupas', createdAt: new Date('2022-02-03') },
    { firstName: 'Thomas', lastName: 'Whiskas', createdAt: new Date('2022-02-06') },
    { firstName: 'Antoine', lastName: 'Boiduvin', createdAt: new Date('2022-02-07') },
    { firstName: 'Brandone', lastName: 'Bro', createdAt: new Date('2022-02-07') },
  ] });

  _buildProParticipationsInDifferentStatus({ databaseBuilder, user: users[0] });
  _buildProAssessmentParticipations({ databaseBuilder, users });
  _buildProProfilesCollectionParticipations({ databaseBuilder, users });

  _buildSupAssessmentParticipations({ databaseBuilder });
  _buildSupProfilesCollectionParticipations({ databaseBuilder });

  _buildScoAssessmentParticipations({ databaseBuilder });
  _buildScoProfilesCollectionParticipations({ databaseBuilder });

  _buildMedNumAssessmentParticipations({ databaseBuilder });
};
