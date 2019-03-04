const Assessment = require('../../../lib/domain/models/Assessment');

module.exports = function addCampaignWithParticipations({ databaseBuilder }) {

  const pixMembers = [
    { firstName: 'Mélanie', lastName: 'Darboo' },
    { firstName: 'Matteo', lastName: 'Lorenzio' },
    { firstName: 'Jérémy', lastName: 'Bugietta' },
    { firstName: 'Léo', lastName: 'Subzéro' },
    { firstName: 'Forster', lastName: 'Gillay Djones' },
    { firstName: 'Thierry', lastName: 'Donckele' },
    { firstName: 'Jaune', lastName: 'Attend' },
    { firstName: 'Stéphan', lastName: 'Deumonaco' },
    { firstName: 'Lise', lastName: 'Nelkay' },
    { firstName: 'Sébastien', lastName: 'Serra Oupas' },
    { firstName: 'Thomas', lastName: 'Whiskas' },
    { firstName: 'Antoine', lastName: 'Boiduvin' },
    { firstName: 'Brandone', lastName: 'Bro' },
  ];

  const startCampaign = (member) => {
    const { id: userId } = databaseBuilder.factory.buildUser(member);
    const { id: assessmentId } = databaseBuilder.factory.buildAssessment({ userId, type: Assessment.types.SMARTPLACEMENT });
    const participantExternalId = member.firstName.toLowerCase() + member.lastName.toLowerCase();
    databaseBuilder.factory.buildCampaignParticipation({ campaignId: 1, userId, assessmentId, participantExternalId });
  };

  pixMembers.forEach(startCampaign);
};

