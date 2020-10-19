module.exports = function campaignsBuilder({ databaseBuilder }) {

  databaseBuilder.factory.buildCampaign({
    id: 1,
    name: 'Pro - Campagne d’évaluation 5.1',
    code: 'AZERTY123',
    type: 'ASSESSMENT',
    organizationId: 1,
    creatorId: 2,
    targetProfileId: 2,
    idPixLabel: 'identifiant entreprise',
    title: null,
    customLandingPageText: null,
  });

  databaseBuilder.factory.buildCampaign({
    id: 2,
    name: 'Pro - Campagne d’évaluation PIC',
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
    name: 'Sup - Campagne d’évaluation PIC',
    code: 'AZERTY789',
    type: 'ASSESSMENT',
    organizationId: 2,
    creatorId: 7,
    targetProfileId: 1,
    title: null,
    customLandingPageText: null,
    idPixLabel: null,
  });

  databaseBuilder.factory.buildCampaign({
    id: 4,
    name: 'Sco - Collège - Campagne d’évaluation Badges',
    code: 'BADGES123',
    type: 'ASSESSMENT',
    organizationId: 3,
    creatorId: 4,
    targetProfileId: 984165,
    title: null,
    customLandingPageText: null,
    idPixLabel: null,
  });

  databaseBuilder.factory.buildCampaign({
    id: 5,
    name: 'Pro - Campagne Pix Emploi',
    code: 'QWERTY789',
    type: 'ASSESSMENT',
    organizationId: 4,
    creatorId: 3,
    targetProfileId: 100321,
    title: null,
    customLandingPageText: null,
    idPixLabel: 'identifiant pôle emploi',
    externalIdHelpImageUrl: 'https://placekitten.com/g/500/300',
    alternativeTextToExternalIdHelpImage: 'Votre identifiant est le nom du premier chaton',
  });

  databaseBuilder.factory.buildCampaign({
    id: 6,
    name: 'Pro - Campagne de collecte de profils',
    code: 'SNAP123',
    type: 'PROFILES_COLLECTION',
    organizationId: 1,
    creatorId: 2,
    idPixLabel: 'email',
    title: null,
    customLandingPageText: null,
  });

  databaseBuilder.factory.buildCampaign({
    id: 7,
    name: 'Sco - Collège - Campagne de collecte de profils',
    code: 'SNAP456',
    type: 'PROFILES_COLLECTION',
    organizationId: 3,
    creatorId: 6,
    idPixLabel: null,
    title: null,
    customLandingPageText: 'Veuillez envoyer votre profil',
  });

  databaseBuilder.factory.buildCampaign({
    id: 8,
    name: 'Sco - Lycée - Campagne d’évaluation Badges',
    code: 'BADGES456',
    type: 'ASSESSMENT',
    organizationId: 6,
    creatorId: 5,
    targetProfileId: 984165,
    idPixLabel: null,
    title: null,
    customLandingPageText: null,
  });

  databaseBuilder.factory.buildCampaign({
    id: 9,
    name: 'Sco - Agriculture - Campagne d’évaluation Badges',
    code: 'BADGES789',
    type: 'ASSESSMENT',
    organizationId: 7,
    creatorId: 7,
    targetProfileId: 984165,
    idPixLabel: null,
    title: null,
    customLandingPageText: null,
  });

  databaseBuilder.factory.buildCampaign({
    id: 10,
    name: 'Sup - Campagne de collecte de profils',
    code: 'SNAP789',
    type: 'PROFILES_COLLECTION',
    organizationId: 2,
    creatorId: 7,
    idPixLabel: null,
    title: null,
    customLandingPageText: null,
  });
};
