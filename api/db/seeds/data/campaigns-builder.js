const { TARGET_PROFILE_PIC_DIAG_INITIAL_ID, TARGET_PROFILE_STAGES_BADGES_ID, TARGET_PROFILE_ONE_COMPETENCE_ID, TARGET_PROFILE_SIMPLIFIED_ACCESS_ID, TARGET_PROFILE_PIX_EMPLOI_CLEA_ID } = require('./target-profiles-builder');

module.exports = function campaignsBuilder({ databaseBuilder }) {
  _buildCampaignForSco(databaseBuilder);
  _buildCampaignForSup(databaseBuilder);
  _buildCampaignForPro(databaseBuilder);
};

function _buildCampaignForSco(databaseBuilder) {
  databaseBuilder.factory.buildCampaign({
    id: 4,
    name: 'Sco - Collège - Campagne d’évaluation Badges',
    code: 'BADGES123',
    type: 'ASSESSMENT',
    organizationId: 3,
    creatorId: 4,
    targetProfileId: TARGET_PROFILE_STAGES_BADGES_ID,
    title: null,
    customLandingPageText: null,
    idPixLabel: null,
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
    targetProfileId: TARGET_PROFILE_STAGES_BADGES_ID,
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
    targetProfileId: TARGET_PROFILE_STAGES_BADGES_ID,
    idPixLabel: null,
    title: null,
    customLandingPageText: null,
  });
}

function _buildCampaignForSup(databaseBuilder) {
  databaseBuilder.factory.buildCampaign({
    id: 3,
    name: 'Sup - Campagne d’évaluation PIC',
    code: 'AZERTY789',
    type: 'ASSESSMENT',
    organizationId: 2,
    creatorId: 7,
    targetProfileId: TARGET_PROFILE_PIC_DIAG_INITIAL_ID,
    title: null,
    customLandingPageText: null,
    idPixLabel: null,
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
}

function _buildCampaignForPro(databaseBuilder) {
  databaseBuilder.factory.buildCampaign({
    id: 1,
    name: 'Pro - Campagne d’évaluation 5.1',
    code: 'AZERTY123',
    type: 'ASSESSMENT',
    organizationId: 1,
    creatorId: 2,
    targetProfileId: TARGET_PROFILE_ONE_COMPETENCE_ID,
    idPixLabel: 'identifiant entreprise',
    title: null,
    customLandingPageText: null,
  });

  databaseBuilder.factory.buildCampaign({
    id: 2,
    name: 'Pro - Campagne d’évaluation PIC - en cours',
    code: 'AZERTY456',
    type: 'ASSESSMENT',
    title: 'Parcours en cours',
    customLandingPageText: 'Ce parcours est proposé aux collaborateurs de Dragon & Co',
    organizationId: 1,
    creatorId: 2,
    targetProfileId: TARGET_PROFILE_PIC_DIAG_INITIAL_ID,
    idPixLabel: null,
  });

  databaseBuilder.factory.buildCampaign({
    id: 5,
    name: 'Pro - Campagne Pix Emploi',
    code: 'QWERTY789',
    type: 'ASSESSMENT',
    organizationId: 4,
    creatorId: 3,
    targetProfileId: TARGET_PROFILE_PIX_EMPLOI_CLEA_ID,
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
    idPixLabel: 'identifiant entreprise',
    title: null,
    customLandingPageText: null,
  });

  databaseBuilder.factory.buildCampaign({
    id: 11,
    name: 'Pro - Med Num - Parcours simplifié',
    code: 'SIMPLIFIE',
    type: 'ASSESSMENT',
    title: 'Parcours simplifié',
    organizationId: 5,
    creatorId: 2,
    targetProfileId: TARGET_PROFILE_SIMPLIFIED_ACCESS_ID,
    customLandingPageText: '',
    idPixLabel: null,
  });

  databaseBuilder.factory.buildCampaign({
    id: 12,
    name: 'Pro - Campagne d’évaluation PIC - Non partagé',
    code: 'AZERTY654',
    type: 'ASSESSMENT',
    title: 'Parcours terminé non partagé',
    customLandingPageText: '',
    organizationId: 1,
    creatorId: 2,
    targetProfileId: TARGET_PROFILE_PIC_DIAG_INITIAL_ID,
    idPixLabel: null,
  });

  databaseBuilder.factory.buildCampaign({
    id: 13,
    name: 'Pro - Campagne d’évaluation PIC - Archivé partagé',
    code: 'ARCHIVED1',
    type: 'ASSESSMENT',
    title: 'Parcours archivé partagé',
    customLandingPageText: '',
    organizationId: 1,
    creatorId: 2,
    targetProfileId: TARGET_PROFILE_PIC_DIAG_INITIAL_ID,
    idPixLabel: null,
    archivedAt: new Date('2020-01-02T15:00:34Z'),
  });

  databaseBuilder.factory.buildCampaign({
    id: 14,
    name: 'Pro - Campagne d’évaluation PIC - Archivé en cours',
    code: 'ARCHIVED2',
    type: 'ASSESSMENT',
    title: 'Parcours archivé en cours',
    customLandingPageText: '',
    organizationId: 1,
    creatorId: 2,
    targetProfileId: TARGET_PROFILE_PIC_DIAG_INITIAL_ID,
    idPixLabel: null,
    archivedAt: new Date('2020-01-01T15:00:34Z'),
  });
}
