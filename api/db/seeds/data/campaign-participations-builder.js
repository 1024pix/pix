const Assessment = require('../../../lib/domain/models/Assessment');

module.exports = function addCampaignWithParticipations({ databaseBuilder }) {

  const pixMembers = [
    { firstName: 'Mélanie', lastName: 'Boudard' },
    { firstName: 'Mathieu', lastName: 'Laurent' },
    { firstName: 'Jérémy', lastName: 'Buget' },
    { firstName: 'Léo', lastName: 'Jacquemin' },
    { firstName: 'Forster', lastName: 'Groux' },
    { firstName: 'Thierry', lastName: 'Loesch' },
    { firstName: 'Jonathan', lastName: 'Perret' },
    { firstName: 'Stéphane', lastName: 'Bedeau' },
    { firstName: 'Lise', lastName: 'Quesnel' },
    { firstName: 'Sébastien', lastName: 'Roccaserra' },
    { firstName: 'Thomas', lastName: 'Wickham' },
    { firstName: 'Antoine', lastName: 'Boileau' },
  ];

  const startCampaign = (member) => {
    const { id: userId } = databaseBuilder.factory.buildUser(member);
    const { id: assessmentId } = databaseBuilder.factory.buildAssessment({ userId, type: Assessment.types.SMARTPLACEMENT });
    const participantExternalId = member.firstName.toLowerCase() + member.lastName.toLowerCase();
    databaseBuilder.factory.buildCampaignParticipation({ campaignId: 1, userId, assessmentId, participantExternalId });
  };

  pixMembers.forEach(startCampaign);
};

