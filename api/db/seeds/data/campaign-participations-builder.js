const Assessment = require('../../../lib/domain/models/Assessment');
const KnowledgeElement = require('../../../lib/domain/models/KnowledgeElement');
const {
  CERTIF_REGULAR_USER1_ID, CERTIF_REGULAR_USER2_ID, CERTIF_REGULAR_USER3_ID,
  CERTIF_REGULAR_USER4_ID, CERTIF_REGULAR_USER5_ID,
} = require('./certification/users');
const { PRO_BASICS_BADGE_ID, PRO_TOOLS_BADGE_ID } = require('./badges-builder');
const { DEFAULT_PASSWORD } = require('./users-builder');

module.exports = function addCampaignWithParticipations({ databaseBuilder }) {
  const buildUsers = (users) => users.map((user) => {
    return databaseBuilder.factory.buildUser.withRawPassword({
      ...user,
      rawPassword: DEFAULT_PASSWORD,
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

  const usersNotCompleted = [users[1], users[2], users[3]];
  const usersNotShared = [users[4], users[5], users[6], users[7], users[8]];
  const usersCompletedShared = [users[0], users[9], users[10], users[11], users[12]];

  const participateToCampaignOfAssessment = (campaignId, user, isShared, validatedSkillsCount = null, isImproved = false) => {
    const sharedAt = isShared ? new Date() : null;
    const participantExternalId = user.firstName.toLowerCase() + user.lastName.toLowerCase();
    return databaseBuilder.factory.buildCampaignParticipation({ campaignId, userId: user.id, participantExternalId, isShared, sharedAt, validatedSkillsCount, isImproved });
  };

  const participateComplexAssessmentCampaign = (campaignId, user, state, isShared, isImproved = false) => {
    const { id: userId } = user;
    const validatedSkillsCount = isShared ? 3 : null;
    const { id: campaignParticipationId } = participateToCampaignOfAssessment(campaignId, user, isShared, validatedSkillsCount, isImproved);

    if (['Stéphan', 'Antoine'].includes(user.firstName)) databaseBuilder.factory.buildBadgeAcquisition({ userId, badgeId: PRO_BASICS_BADGE_ID, campaignParticipationId });
    if (['Jaune', 'Antoine'].includes(user.firstName)) databaseBuilder.factory.buildBadgeAcquisition({ userId, badgeId: PRO_TOOLS_BADGE_ID, campaignParticipationId });

    buildAssessmentAndAnswer(userId, campaignParticipationId, state);

    if (isImproved) {
      const { id: newCampaignParticipationId } = participateToCampaignOfAssessment(campaignId, user, isShared, validatedSkillsCount + 1);
      buildAssessmentAndAnswer(userId, newCampaignParticipationId, state, true);
    }
  };

  const buildAssessmentAndAnswer = (userId, campaignParticipationId, state, addInferredKE = false) => {
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

    if (addInferredKE) {
      databaseBuilder.factory.buildKnowledgeElement({
        skillId: 'recDZTKszXX02aXD1',
        assessmentId,
        userId,
        competenceId: 'recIhdrmCuEmCDAzj',
        answerId,
        source: KnowledgeElement.SourceType.INFERRED,
      });
    }
  };

  const participateToCampaignOfTypeProfilesCollection = (campaignId, userId, isShared, isImproved = false) => {
    const today = new Date();

    const sharedAt = isShared ? today : null;

    databaseBuilder.factory.buildCampaignParticipation({
      campaignId,
      userId,
      participantExternalId: userId,
      isShared,
      sharedAt,
    });

    if (isImproved) {
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);
      const oldSharedAt = isShared ? yesterday : null;

      databaseBuilder.factory.buildCampaignParticipation({
        campaignId,
        userId,
        participantExternalId: userId,
        isShared,
        sharedAt: oldSharedAt,
        isImproved,
      });
    }
  };

  usersNotCompleted.forEach((user) => participateComplexAssessmentCampaign(1, user, 'STARTED', false));
  usersNotShared.forEach((user) => participateComplexAssessmentCampaign(1, user, 'COMPLETED', false));
  usersCompletedShared.forEach((user) => participateComplexAssessmentCampaign(1, user, 'COMPLETED', true));

  participateComplexAssessmentCampaign(2, users[0], 'STARTED', false);
  participateComplexAssessmentCampaign(12, users[0], 'COMPLETED', false);
  participateComplexAssessmentCampaign(13, users[0], 'COMPLETED', true);
  participateComplexAssessmentCampaign(14, users[0], 'STARTED', false);
  participateComplexAssessmentCampaign(15, users[0], 'COMPLETED', true);
  participateComplexAssessmentCampaign(16, users[0], 'COMPLETED', true, true);

  participateToCampaignOfTypeProfilesCollection(18, users[0].id, true, true);

  usersNotCompleted.forEach((user) => participateToCampaignOfTypeProfilesCollection(6, user.id, false));
  usersNotShared.forEach((user) => participateToCampaignOfTypeProfilesCollection(6, user.id, false));
  usersCompletedShared.forEach((user) => participateToCampaignOfTypeProfilesCollection(6, user.id, true));
  [CERTIF_REGULAR_USER1_ID, CERTIF_REGULAR_USER2_ID, CERTIF_REGULAR_USER3_ID].forEach((userId) => participateToCampaignOfTypeProfilesCollection(6, userId, true));
  [CERTIF_REGULAR_USER4_ID, CERTIF_REGULAR_USER5_ID].forEach((userId) => participateToCampaignOfTypeProfilesCollection(6, userId, false));
};
