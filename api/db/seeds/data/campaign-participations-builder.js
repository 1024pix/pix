const Assessment = require('../../../lib/domain/models/Assessment');
const KnowledgeElement = require('../../../lib/domain/models/KnowledgeElement');

module.exports = function addCampaignWithParticipations({ databaseBuilder }) {

  const pixMembersNotCompleted = [
    { firstName: 'Mélanie', lastName: 'Darboo' },
    { firstName: 'Matteo', lastName: 'Lorenzio' },
    { firstName: 'Jérémy', lastName: 'Bugietta' },
    { firstName: 'Léo', lastName: 'Subzéro' },
  ];

  const pixMembersNotShared = [
    { firstName: 'Forster', lastName: 'Gillay Djones' },
    { firstName: 'Thierry', lastName: 'Donckele' },
    { firstName: 'Jaune', lastName: 'Attend' },
    { firstName: 'Stéphan', lastName: 'Deumonaco' },
    { firstName: 'Lise', lastName: 'Nelkay' }
  ];

  const pixMembersCompletedShared = [
    { firstName: 'Sébastien', lastName: 'Serra Oupas' },
    { firstName: 'Thomas', lastName: 'Whiskas' },
    { firstName: 'Antoine', lastName: 'Boiduvin' },
    { firstName: 'Brandone', lastName: 'Bro' }
  ];

  const startCampaign = (member, state, isShared) => {
    const { id: userId } = databaseBuilder.factory.buildUser(member);
    const { id: assessmentId } = databaseBuilder.factory.buildAssessment({
      userId,
      type: Assessment.types.SMARTPLACEMENT,
      state: Assessment.states[state]
    });
    const participantExternalId = member.firstName.toLowerCase() + member.lastName.toLowerCase();
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
      answerId
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

    const sharedAt = isShared ? new Date() : null;
    databaseBuilder.factory.buildCampaignParticipation({ campaignId: 1, userId, assessmentId, participantExternalId, isShared, sharedAt });
  };

  pixMembersNotCompleted.forEach((member) => startCampaign(member, 'STARTED', false));
  pixMembersNotShared.forEach((member) => startCampaign(member, 'COMPLETED', false));
  pixMembersCompletedShared.forEach((member) => startCampaign(member, 'COMPLETED', true));
};
