const Assessment = require('../../../lib/domain/models/Assessment');
const KnowledgeElement = require('../../../lib/domain/models/KnowledgeElement');
const {
  CERTIF_REGULAR_USER1_ID, CERTIF_REGULAR_USER2_ID, CERTIF_REGULAR_USER3_ID,
  CERTIF_REGULAR_USER4_ID, CERTIF_REGULAR_USER5_ID,
} = require('./certification/users');
const { PRO_BASICS_BADGE_ID } = require('./badges-builder');

module.exports = function addCampaignWithParticipations({ databaseBuilder }) {
  const buildUsers = (users) => users.map((user) => {
    return databaseBuilder.factory.buildUser.withRawPassword({
      ...user,
      rawPassword: 'pix123',
    });
  });

  const users = buildUsers([
    { firstName: 'Jaune', lastName: 'Attend', email: 'jaune.attend@example.net' },
    { firstName: 'Mélanie', lastName: 'Darboo' },
    { firstName: 'Matteo', lastName: 'Lorenzio' },
    { firstName: 'Jérémy', lastName: 'Bugietta' },
    { firstName: 'Léo', lastName: 'Subzéro' },
    { firstName: 'Forster', lastName: 'Gillay Djones' },
    { firstName: 'Thierry', lastName: 'Donckele' },
    { firstName: 'Stéphan', lastName: 'Deumonaco' },
    { firstName: 'Lise', lastName: 'Nelkay' },
    { firstName: 'Sébastien', lastName: 'Serra Oupas' },
    { firstName: 'Thomas', lastName: 'Whiskas' },
    { firstName: 'Antoine', lastName: 'Boiduvin' },
    { firstName: 'Brandone', lastName: 'Bro' },
  ]);

  const pixMembersNotCompleted = [users[0], users[1], users[2], users[3]];
  const pixMembersNotShared = [users[4], users[5], users[6], users[7], users[8]];
  const pixMembersCompletedShared = [users[9], users[10], users[11], users[12]];

  const participateToCampaignOfAssessment = (campaignId, user, isShared) => {
    const sharedAt = isShared ? new Date() : null;
    const participantExternalId = user.firstName.toLowerCase() + user.lastName.toLowerCase();
    return databaseBuilder.factory.buildCampaignParticipation({ campaignId, userId: user.id, participantExternalId, isShared, sharedAt });
  };

  const participateComplexAssessmentCampaign = (campaignId, user, state, isShared) => {
    const { id: userId } = user;
    const { id: campaignParticipationId } = participateToCampaignOfAssessment(campaignId, user, isShared);
    if (['Jaune', 'Antoine'].includes(user.firstName)) databaseBuilder.factory.buildBadgeAcquisition({ userId, badgeId: PRO_BASICS_BADGE_ID });

    const { id: assessmentId } = databaseBuilder.factory.buildAssessment({
      userId,
      type: Assessment.types.CAMPAIGN,
      state: Assessment.states[state],
      campaignParticipationId,
    });
    const { id: answerId } = databaseBuilder.factory.buildAnswer({
      result: 'ok',
      assessmentId,
      challengeId: 'recqxUPlzYVbbTtFP',
    });
    databaseBuilder.factory.buildKnowledgeElement({
      skillId: 'recGd7oJ2wVEyKmPS',
      assessmentId,
      userId,
      competenceId: 'recIhdrmCuEmCDAzj',
      answerId,
    });
    databaseBuilder.factory.buildKnowledgeElement({
      skillId: 'recVv1eoSLW7yFgXv',
      assessmentId,
      userId,
      competenceId: 'recIhdrmCuEmCDAzj',
      answerId,
      source: KnowledgeElement.SourceType.INFERRED,
    });
    databaseBuilder.factory.buildKnowledgeElement({
      skillId: 'recVywppdS4hGEekR',
      assessmentId,
      userId,
      competenceId: 'recIhdrmCuEmCDAzj',
      answerId,
      source: KnowledgeElement.SourceType.INFERRED,
    });
  };

  const participateToCampaignOfTypeProfilesCollection = (userId, isShared) => {
    const sharedAt = isShared ? new Date() : null;
    databaseBuilder.factory.buildCampaignParticipation({ campaignId: 6, userId, participantExternalId: userId, isShared, sharedAt });
  };

  pixMembersNotCompleted.forEach((member) => participateComplexAssessmentCampaign(1, member, 'STARTED', false));
  pixMembersNotShared.forEach((member) => participateComplexAssessmentCampaign(1, member, 'COMPLETED', false));
  pixMembersCompletedShared.forEach((member) => participateComplexAssessmentCampaign(1, member, 'COMPLETED', true));

  pixMembersNotCompleted.forEach((member) => participateToCampaignOfAssessment(6, member, false));
  pixMembersNotShared.forEach((member) => participateToCampaignOfAssessment(6, member, false));
  pixMembersCompletedShared.forEach((member) => participateToCampaignOfAssessment(6, member, true));

  participateComplexAssessmentCampaign(2, users[0], 'STARTED', false);
  participateComplexAssessmentCampaign(11, users[0], 'COMPLETED', false);
  participateComplexAssessmentCampaign(12, users[0], 'COMPLETED', true);

  [CERTIF_REGULAR_USER1_ID, CERTIF_REGULAR_USER2_ID, CERTIF_REGULAR_USER3_ID].forEach((userId) => participateToCampaignOfTypeProfilesCollection(userId, true));
  [CERTIF_REGULAR_USER4_ID, CERTIF_REGULAR_USER5_ID].forEach((userId) => participateToCampaignOfTypeProfilesCollection(userId, false));
};
