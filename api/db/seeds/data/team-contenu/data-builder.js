const { createCampaign } = require('../common/campaign-tooling');
const { createTargetProfile, createBadge, createStages } = require('../common/target-profile-tooling');
const { PRO_COMPANY_ID } = require('../organizations-pro-builder');

async function richTargetProfilesBuilder({ databaseBuilder }) {
  await _createTargetProfile500(databaseBuilder);
  await _createTargetProfile501(databaseBuilder);
  await _createCampaign500(databaseBuilder);
}

module.exports = {
  richTargetProfilesBuilder,
};

async function _createCampaign500(databaseBuilder) {
  const organizationId = databaseBuilder.factory.buildOrganization({
    type: 'PRO',
    name: 'Orga team contenu',
    isManagingStudents: false,
    externalId: 'CONTENU',
  }).id;

  const userId = databaseBuilder.factory.buildUser.withRawPassword({
    firstName: 'Orga PRO',
    lastName: 'Contenu',
    email: 'contenu-orga-pro@example.net',
    cgu: true,
    lang: 'fr',
    lastTermsOfServiceValidatedAt: new Date(),
    lastPixOrgaTermsOfServiceValidatedAt: new Date(),
    mustValidateTermsOfService: false,
    pixOrgaTermsOfServiceAccepted: false,
    pixCertifTermsOfServiceAccepted: false,
    hasSeenAssessmentInstructions: false,
    rawPassword: 'pix123',
    shouldChangePassword: false,
  }).id;

  databaseBuilder.factory.buildMembership({
    userId,
    organizationId,
    organizationRole: 'ADMIN',
  });

  await createCampaign({
    databaseBuilder,
    campaignId: 500,
    name: 'Campagne team-contenu',
    code: 'CONTEN123',
    title: 'Campagne team-contenu',
    idPixLabel: null,
    externalIdHelpImageUrl: null,
    alternativeTextToExternalIdHelpImage: null,
    customLandingPageText: null,
    isForAbsoluteNovice: false,
    archivedAt: null,
    archivedBy: null,
    type: 'ASSESSMENT',
    createdAt: undefined,
    organizationId,
    creatorId: userId,
    ownerId: userId,
    targetProfileId: null,
    customResultPageText: 'customResultPageText',
    customResultPageButtonText: 'customResultPageButtonText',
    customResultPageButtonUrl: 'customResultPageButtonUrl',
    multipleSendings: false,
    assessmentMethod: 'SMART_RANDOM',
  });
}

async function _createTargetProfile500(databaseBuilder) {
  const configTargetProfile = {
    frameworks: [
      {
        chooseCoreFramework: true,
        countTubes: 30,
        minLevel: 3,
        maxLevel: 5,
      },
    ],
  };
  const configBadge = {
    criteria: [
      {
        scope: 'CappedTubes',
        threshold: 60,
      },
      {
        scope: 'CampaignParticipation',
        threshold: 50,
      },
    ],
  };
  const { targetProfileId, cappedTubesDTO } = await createTargetProfile({
    databaseBuilder,
    targetProfileId: 500,
    name: 'Profil cible Pur Pix (Niv3 ~ 5)',
    isPublic: true,
    ownerOrganizationId: PRO_COMPANY_ID,
    isSimplifiedAccess: false,
    description:
      'Profil cible pur pix (Niv3 ~ 5) avec 1 RT double critère (tube et participation) et des paliers NIVEAUX',
    configTargetProfile,
  });
  createBadge({
    databaseBuilder,
    targetProfileId,
    cappedTubesDTO,
    badgeId: 600,
    altMessage: '1 RT double critère Campaign & Tubes',
    imageUrl: 'some_image.svg',
    message: '1 RT double critère Campaign & Tubes',
    title: '1 RT double critère Campaign & Tubes',
    key: 'SOME_KEY_FOR_RT_600',
    isCertifiable: false,
    isAlwaysVisible: false,
    configBadge,
  });
  createStages({
    databaseBuilder,
    targetProfileId,
    cappedTubesDTO,
    type: 'LEVEL',
    countStages: 4,
    includeFirstSkill: true,
  });
}

async function _createTargetProfile501(databaseBuilder) {
  const configTargetProfile = {
    frameworks: [
      {
        chooseCoreFramework: true,
        countTubes: 5,
        minLevel: 1,
        maxLevel: 8,
      },
      {
        chooseCoreFramework: false,
        countTubes: 3,
        minLevel: 1,
        maxLevel: 8,
      },
    ],
  };
  const { targetProfileId, cappedTubesDTO } = await createTargetProfile({
    databaseBuilder,
    targetProfileId: 501,
    name: 'Profil cible Pix et un autre réf (Niv1 ~ 8)',
    isPublic: true,
    ownerOrganizationId: PRO_COMPANY_ID,
    isSimplifiedAccess: false,
    description: 'Profil cible pur pix et un autre réf (Niv1 ~ 8) et des paliers SEUILS',
    configTargetProfile,
  });
  createStages({
    databaseBuilder,
    targetProfileId,
    cappedTubesDTO,
    type: 'THRESHOLD',
    countStages: 4,
  });
}
