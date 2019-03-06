module.exports = function campaignsBuilder({ databaseBuilder }) {

  databaseBuilder.factory.buildCampaign({
    id: 1,
    name: 'Campagne 1',
    code: 'AZERTY123',
    organizationId: 1,
    creatorId: 2,
    targetProfileId: 1,
    idPixLabel: 'identifiant entreprise',
  });

  databaseBuilder.factory.buildCampaign({
    id: 2,
    name: 'Campagne 2',
    code: 'AZERTY456',
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
    organizationId: 2,
    creatorId: 2,
    targetProfileId: 1,
  });
};
