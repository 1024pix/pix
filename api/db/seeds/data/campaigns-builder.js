const { times } = require('lodash');

module.exports = function campaignsBuilder({ databaseBuilder }) {

  databaseBuilder.factory.buildCampaign({
    id: 1,
    name: 'Campagne 1',
    code: 'AZERTY123',
    type: 'ASSESSMENT',
    organizationId: 1,
    creatorId: 2,
    targetProfileId: 2,
    idPixLabel: 'identifiant entreprise',
  });

  databaseBuilder.factory.buildCampaign({
    id: 2,
    name: 'Campagne 2',
    code: 'AZERTY456',
    type: 'ASSESSMENT',
    title: 'Parcours recherche avancée',
    customLandingPageText: 'Ce parcours est proposé aux collaborateurs de Dragon & Co',
    organizationId: 1,
    creatorId: 2,
    targetProfileId: 1,
    idPixLabel: null,
  });

  databaseBuilder.factory.buildCampaign({
    id: 3,
    name: 'Campagne without logo',
    code: 'AZERTY789',
    type: 'ASSESSMENT',
    organizationId: 2,
    creatorId: 2,
    targetProfileId: 1,
  });

  databaseBuilder.factory.buildCampaign({
    id: 4,
    name: 'Campagne restreinte',
    code: 'RESTRICTD',
    type: 'ASSESSMENT',
    organizationId: 3,
    creatorId: 4,
    targetProfileId: 1,
  });

  databaseBuilder.factory.buildCampaign({
    id: 5,
    name: 'Campagne Pix Emploi',
    code: 'QWERTY789',
    type: 'ASSESSMENT',
    organizationId: 1,
    creatorId: 2,
    targetProfileId: 100321,
    idPixLabel: 'identifiant pôle emploi',
    externalIdHelpImageUrl: 'https://placekitten.com/g/500/300',
    alternativeTextToExternalIdHelpImage: 'Votre identifiant est le nom du premier chaton',
  });

  databaseBuilder.factory.buildCampaign({
    id: 6,
    name: 'Campagne Collecte Profils',
    code: 'SNAP123',
    type: 'PROFILES_COLLECTION',
    organizationId: 1,
    creatorId: 2,
    idPixLabel: 'identifiant élève',
    title: null,
  });

  databaseBuilder.factory.buildCampaign({
    id: 7,
    name: 'Campagne Collecte Profils restreinte',
    code: 'SNAP456',
    type: 'PROFILES_COLLECTION',
    organizationId: 3,
    creatorId: 4,
    title: null,
  });

  databaseBuilder.factory.buildCampaign({
    id: 8,
    name: 'Campagne Pix Emploi',
    code: 'BADGES789',
    type: 'ASSESSMENT',
    organizationId: 1,
    creatorId: 2,
    targetProfileId: 984165,
    idPixLabel: 'identifiant entreprise',
  });

  databaseBuilder.factory.buildCampaign({
    id: 9,
    name: 'Campagne restreinte',
    code: 'SCO2RES',
    type: 'ASSESSMENT',
    organizationId: 6,
    creatorId: 4,
    targetProfileId: 1,
  });

  const createThatManyCampaigns = 30;
  const startingCampaignId = 100;
  const aUserId = 4;
  const anotherUserId = 9;
  const isEven = (n)=>{ n % 2; };

  times(
    createThatManyCampaigns,
    (i) => databaseBuilder.factory.buildCampaign({
      id: startingCampaignId + i,
      name: 'Campagne restreinte n°' + i,
      code: 'SCO2RES' + i,
      type: 'ASSESSMENT',
      organizationId: 3,
      creatorId: isEven(i) ? aUserId : anotherUserId,
      targetProfileId: 1,
    }),
  );

};
