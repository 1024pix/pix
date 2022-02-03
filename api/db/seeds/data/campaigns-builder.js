const {
  TARGET_PROFILE_PIC_DIAG_INITIAL_ID,
  TARGET_PROFILE_STAGES_BADGES_ID,
  TARGET_PROFILE_ONE_COMPETENCE_ID,
  TARGET_PROFILE_SIMPLIFIED_ACCESS_ID,
  TARGET_PROFILE_PIX_EMPLOI_CLEA_ID,
  TARGET_PROFILE_PIX_DROIT_ID,
  TARGET_PROFILE_PIX_EDU_FORMATION_INITIALE_2ND_DEGRE,
  TARGET_PROFILE_PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE,
} = require('./target-profiles-builder');
const { PRO_COMPANY_ID, PRO_POLE_EMPLOI_ID, PRO_MED_NUM_ID } = require('./organizations-pro-builder');
const { SCO_MIDDLE_SCHOOL_ID, SCO_HIGH_SCHOOL_ID, SCO_AGRI_ID, SCO_AEFE_ID } = require('./organizations-sco-builder');
const { SUP_UNIVERSITY_ID } = require('./organizations-sup-builder');
const POLE_EMPLOI_CAMPAIGN_ID = 5;

module.exports = {
  campaignsBuilder,
  POLE_EMPLOI_CAMPAIGN_ID,
};

function campaignsBuilder({ databaseBuilder }) {
  _buildCampaignForSco(databaseBuilder);
  _buildCampaignForSup(databaseBuilder);
  _buildCampaignForPro(databaseBuilder);
}

function _buildCampaignForSco(databaseBuilder) {
  databaseBuilder.factory.buildCampaign({
    id: 4,
    name: 'Sco - Collège - Campagne d’évaluation Badges',
    code: 'SCOBADGE1',
    type: 'ASSESSMENT',
    organizationId: SCO_MIDDLE_SCHOOL_ID,
    creatorId: 4,
    ownerId: 4,
    targetProfileId: TARGET_PROFILE_STAGES_BADGES_ID,
    assessmentMethod: 'SMART_RANDOM',
    title: null,
    customLandingPageText: null,
    idPixLabel: null,
    createdAt: new Date('2020-01-01'),
  });

  databaseBuilder.factory.buildCampaign({
    id: 7,
    name: 'Sco - Collège - Campagne de collecte de profils',
    code: 'SCOCOLECT',
    type: 'PROFILES_COLLECTION',
    organizationId: SCO_MIDDLE_SCHOOL_ID,
    creatorId: 6,
    ownerId: 6,
    idPixLabel: null,
    title: null,
    customLandingPageText: 'Veuillez envoyer votre profil',
    createdAt: new Date('2020-01-02'),
  });

  databaseBuilder.factory.buildCampaign({
    id: 8,
    name: 'Sco - Lycée - Campagne d’évaluation Badges',
    code: 'SCOBADGE2',
    type: 'ASSESSMENT',
    organizationId: SCO_HIGH_SCHOOL_ID,
    creatorId: 5,
    ownerId: 5,
    targetProfileId: TARGET_PROFILE_STAGES_BADGES_ID,
    assessmentMethod: 'SMART_RANDOM',
    idPixLabel: null,
    title: null,
    customLandingPageText: null,
    createdAt: new Date('2020-01-03'),
  });

  databaseBuilder.factory.buildCampaign({
    id: 9,
    name: 'Sco - Agriculture - Campagne d’évaluation Badges',
    code: 'SCOBADGE3',
    type: 'ASSESSMENT',
    organizationId: SCO_AGRI_ID,
    creatorId: 5,
    ownerId: 4,
    targetProfileId: TARGET_PROFILE_STAGES_BADGES_ID,
    assessmentMethod: 'SMART_RANDOM',
    idPixLabel: null,
    title: null,
    customLandingPageText: null,
    createdAt: new Date('2020-01-04'),
  });

  databaseBuilder.factory.buildCampaign({
    id: 23,
    name: 'Sco - AEFE - Campagne d’évaluation Pix+ Édu initiale',
    code: 'PIXEDUINI',
    type: 'ASSESSMENT',
    organizationId: SCO_AEFE_ID,
    creatorId: 4,
    ownerId: 5,
    targetProfileId: TARGET_PROFILE_PIX_EDU_FORMATION_INITIALE_2ND_DEGRE,
    assessmentMethod: 'SMART_RANDOM',
    title: null,
    customLandingPageText: null,
    idPixLabel: null,
    createdAt: new Date('2020-01-07'),
  });

  databaseBuilder.factory.buildCampaign({
    id: 24,
    name: 'Sco - AEFE - Campagne d’évaluation Pix+ Édu continue',
    code: 'PIXEDUCON',
    type: 'ASSESSMENT',
    organizationId: SCO_AEFE_ID,
    creatorId: 4,
    ownerId: 5,
    targetProfileId: TARGET_PROFILE_PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE,
    assessmentMethod: 'SMART_RANDOM',
    title: null,
    customLandingPageText: null,
    idPixLabel: null,
    createdAt: new Date('2020-01-07'),
  });
}

function _buildCampaignForSup(databaseBuilder) {
  databaseBuilder.factory.buildCampaign({
    id: 3,
    name: 'Sup - Campagne d’évaluation PIC',
    code: 'SUPPIC123',
    type: 'ASSESSMENT',
    organizationId: SUP_UNIVERSITY_ID,
    creatorId: 7,
    ownerId: 7,
    targetProfileId: TARGET_PROFILE_PIC_DIAG_INITIAL_ID,
    assessmentMethod: 'SMART_RANDOM',
    title: null,
    customLandingPageText: null,
    idPixLabel: null,
    createdAt: new Date('2020-01-05'),
  });

  databaseBuilder.factory.buildCampaign({
    id: 10,
    name: 'Sup - Campagne de collecte de profils',
    code: 'SUPCOLECT',
    type: 'PROFILES_COLLECTION',
    organizationId: SUP_UNIVERSITY_ID,
    creatorId: 8,
    ownerId: 7,
    idPixLabel: null,
    title: null,
    customLandingPageText: null,
    createdAt: new Date('2020-01-06'),
  });

  databaseBuilder.factory.buildCampaign({
    id: 20,
    name: 'Sup - Campagne d\'évaluation Pix+ Droit',
    code: 'SUPDROIT1',
    type: 'ASSESSMENT',
    organizationId: SUP_UNIVERSITY_ID,
    creatorId: 7,
    ownerId: 8,
    targetProfileId: TARGET_PROFILE_PIX_DROIT_ID,
    assessmentMethod: 'SMART_RANDOM',
    title: null,
    customLandingPageText: null,
    idPixLabel: null,
    createdAt: new Date('2020-01-08'),
  });
}

function _buildCampaignForPro(databaseBuilder) {
  databaseBuilder.factory.buildCampaign({
    id: 1,
    name: 'Pro - Campagne d’évaluation 5.1',
    code: 'PROCOMP51',
    type: 'ASSESSMENT',
    organizationId: PRO_COMPANY_ID,
    creatorId: 2,
    ownerId: 2,
    targetProfileId: TARGET_PROFILE_ONE_COMPETENCE_ID,
    assessmentMethod: 'SMART_RANDOM',
    idPixLabel: 'identifiant entreprise',
    title: null,
    customLandingPageText: null,
    customResultPageText: 'Afin de vous faire progresser, nous vous proposons des documents pour aller plus loin dans les compétences que vous venez de tester.',
    customResultPageButtonUrl: 'https://pix.fr/',
    customResultPageButtonText: 'Voir Pix !',
    createdAt: new Date('2020-01-09'),
  });

  databaseBuilder.factory.buildCampaign({
    id: 2,
    name: 'Pro - Campagne d’évaluation PIC - en cours',
    code: 'PROCUSTOM',
    type: 'ASSESSMENT',
    title: 'Parcours en cours',
    customLandingPageText: 'Ce parcours est proposé aux collaborateurs de Dragon & Co',
    organizationId: PRO_COMPANY_ID,
    creatorId: 3,
    ownerId: 2,
    targetProfileId: TARGET_PROFILE_PIC_DIAG_INITIAL_ID,
    assessmentMethod: 'SMART_RANDOM',
    idPixLabel: 'identifiant entreprise',
    externalIdHelpImageUrl: 'https://placekitten.com/g/500/300',
    alternativeTextToExternalIdHelpImage: 'Votre identifiant est le nom du premier chaton',
    customResultPageButtonUrl: 'https://pix.fr/',
    customResultPageButtonText: 'Voir Pix ! Avec du markdown ',
    customResultPageText: `---
__Plus d'infos :)__

- __[Pix](https://pix.fr)__ - Allez sur mon pix !
- __[Google](https://google.fr/)__ - Faites des recherches sur google.

---`,
    createdAt: new Date('2020-01-10'),
  });

  databaseBuilder.factory.buildCampaign({
    id: POLE_EMPLOI_CAMPAIGN_ID,
    name: 'Pro - Campagne Pix Emploi',
    code: 'PIXEMPLOI',
    type: 'ASSESSMENT',
    organizationId: PRO_POLE_EMPLOI_ID,
    creatorId: 2,
    ownerId: 2,
    targetProfileId: TARGET_PROFILE_PIX_EMPLOI_CLEA_ID,
    assessmentMethod: 'SMART_RANDOM',
    title: null,
    customLandingPageText: null,
    idPixLabel: null,
    createdAt: new Date('2020-01-11'),
    multipleSendings: true,
  });

  databaseBuilder.factory.buildCampaign({
    id: 6,
    name: 'Pro - Campagne de collecte de profils',
    code: 'PROCOLECT',
    type: 'PROFILES_COLLECTION',
    organizationId: PRO_COMPANY_ID,
    creatorId: 2,
    ownerId: 2,
    idPixLabel: 'identifiant entreprise',
    title: null,
    customLandingPageText: null,
    createdAt: new Date('2020-01-12'),
  });

  databaseBuilder.factory.buildCampaign({
    id: 11,
    name: 'Pro - Med Num - Parcours simplifié',
    code: 'SIMPLIFIE',
    type: 'ASSESSMENT',
    title: 'Parcours simplifié',
    organizationId: PRO_MED_NUM_ID,
    creatorId: 2,
    ownerId: 2,
    targetProfileId: TARGET_PROFILE_SIMPLIFIED_ACCESS_ID,
    assessmentMethod: 'SMART_RANDOM',
    idPixLabel: null,
    customLandingPageText: null,
    customResultPageText: 'Afin de vous faire progresser, nous vous proposons des documents pour aller plus loin dans les compétences que vous venez de tester.',
    customResultPageButtonUrl: 'https://pix.fr/',
    customResultPageButtonText: 'Voir Pix !',
    createdAt: new Date('2020-01-13'),
  });

  databaseBuilder.factory.buildCampaign({
    id: 12,
    name: 'Pro - Campagne d’évaluation PIC - Non partagé',
    code: 'PROPIC123',
    type: 'ASSESSMENT',
    title: 'Parcours terminé non partagé',
    customLandingPageText: null,
    organizationId: PRO_COMPANY_ID,
    creatorId: 2,
    ownerId: 2,
    targetProfileId: TARGET_PROFILE_PIC_DIAG_INITIAL_ID,
    assessmentMethod: 'SMART_RANDOM',
    idPixLabel: 'identifiant entreprise',
    createdAt: new Date('2020-01-14'),
  });

  databaseBuilder.factory.buildCampaign({
    id: 13,
    name: 'Pro - Campagne d’évaluation PIC - Archivé partagé',
    code: 'ARCHIVED1',
    type: 'ASSESSMENT',
    title: 'Parcours archivé partagé',
    customLandingPageText: null,
    organizationId: PRO_COMPANY_ID,
    creatorId: 3,
    ownerId: 3,
    targetProfileId: TARGET_PROFILE_PIC_DIAG_INITIAL_ID,
    assessmentMethod: 'SMART_RANDOM',
    idPixLabel: 'identifiant entreprise',
    archivedAt: new Date('2020-01-02T15:00:34Z'),
    createdAt: new Date('2020-01-15'),
  });

  databaseBuilder.factory.buildCampaign({
    id: 14,
    name: 'Pro - Campagne d’évaluation PIC - Archivé en cours',
    code: 'ARCHIVED2',
    type: 'ASSESSMENT',
    title: 'Parcours archivé en cours',
    customLandingPageText: null,
    organizationId: PRO_COMPANY_ID,
    creatorId: 2,
    ownerId: 2,
    targetProfileId: TARGET_PROFILE_PIC_DIAG_INITIAL_ID,
    assessmentMethod: 'SMART_RANDOM',
    idPixLabel: 'identifiant entreprise',
    createdAt: new Date('2019-01-01'),
    archivedAt: new Date('2020-01-01T15:00:34Z'),
  });

  databaseBuilder.factory.buildCampaign({
    id: 15,
    name: 'Pro - Campagne d’évaluation PIC - Archivé partagé avec paliers',
    code: 'ARCHIVED3',
    type: 'ASSESSMENT',
    title: 'Parcours archivé avec paliers',
    customLandingPageText: null,
    organizationId: PRO_COMPANY_ID,
    creatorId: 2,
    ownerId: 2,
    targetProfileId: TARGET_PROFILE_PIC_DIAG_INITIAL_ID,
    assessmentMethod: 'SMART_RANDOM',
    idPixLabel: 'identifiant entreprise',
    createdAt: new Date('2019-01-02'),
    archivedAt: new Date('2020-01-01T15:00:34Z'),
  });

  databaseBuilder.factory.buildCampaign({
    id: 16,
    name: 'Pro - Campagne d’évaluation PIC - Terminé & partagé - Envois multiples',
    code: 'PROPICMUL',
    type: 'ASSESSMENT',
    title: 'Parcours terminé partagé - Envois multiple',
    customLandingPageText: null,
    organizationId: PRO_COMPANY_ID,
    creatorId: 2,
    ownerId: 2,
    targetProfileId: TARGET_PROFILE_PIC_DIAG_INITIAL_ID,
    assessmentMethod: 'SMART_RANDOM',
    idPixLabel: 'identifiant entreprise',
    multipleSendings: true,
    createdAt: new Date('2020-01-16'),
  });

  databaseBuilder.factory.buildCampaign({
    id: 17,
    name: 'Pro - Med Num - Parcours novice simplifié',
    code: 'NOVICE123',
    type: 'ASSESSMENT',
    title: 'Pour novice, accès simplifié',
    customLandingPageText: null,
    organizationId: PRO_MED_NUM_ID,
    creatorId: 2,
    ownerId: 2,
    targetProfileId: TARGET_PROFILE_SIMPLIFIED_ACCESS_ID,
    assessmentMethod: 'SMART_RANDOM',
    idPixLabel: null,
    isForAbsoluteNovice: true,
    createdAt: new Date('2020-01-17'),
  });

  databaseBuilder.factory.buildCampaign({
    id: 18,
    name: 'Pro - Campagne de collecte de profils - Envois multiple',
    code: 'PROCOLMUL',
    type: 'PROFILES_COLLECTION',
    organizationId: PRO_COMPANY_ID,
    creatorId: 2,
    ownerId: 2,
    idPixLabel: 'identifiant entreprise',
    title: null,
    customLandingPageText: null,
    multipleSendings: true,
    createdAt: new Date('2020-01-18'),
  });

  databaseBuilder.factory.buildCampaign({
    id: 19,
    name: 'Pro - Campagne d’évaluation FLASH',
    code: 'FLASH1234',
    type: 'ASSESSMENT',
    organizationId: PRO_COMPANY_ID,
    targetProfileId: null,
    assessmentMethod: 'FLASH',
    creatorId: 3,
    ownerId: 3,
    idPixLabel: null,
    title: null,
    customLandingPageText: null,
    createdAt: new Date('2021-11-09'),
  });

  databaseBuilder.factory.buildCampaign({
    id: 21,
    name: 'Pro - Campagne d’évaluation Pix+ Droit',
    code: 'PRODROIT1',
    type: 'ASSESSMENT',
    organizationId: PRO_COMPANY_ID,
    creatorId: 3,
    ownerId: 3,
    targetProfileId: TARGET_PROFILE_PIX_DROIT_ID,
    assessmentMethod: 'SMART_RANDOM',
    title: null,
    customLandingPageText: null,
    idPixLabel: null,
    createdAt: new Date('2020-01-07'),
  });

  databaseBuilder.factory.buildCampaign({
    id: 22,
    name: 'Pro - Campagne d’évaluation Badges',
    code: 'PROBADGE1',
    type: 'ASSESSMENT',
    organizationId: PRO_COMPANY_ID,
    creatorId: 2,
    ownerId: 3,
    targetProfileId: TARGET_PROFILE_STAGES_BADGES_ID,
    assessmentMethod: 'SMART_RANDOM',
    idPixLabel: null,
    title: null,
    customLandingPageText: null,
    createdAt: new Date('2020-01-04'),
  });

}
