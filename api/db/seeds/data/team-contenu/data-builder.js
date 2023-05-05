const tooling = require('../common/tooling');
// TODO créer les campaign skills
const TEAM_CONTENU_OFFSET = 5000;
// IDS
/// USERS
const PRO_ORGANIZATION_USER_ID = TEAM_CONTENU_OFFSET;
/// ORGAS
const PRO_ORGANIZATION_ID = TEAM_CONTENU_OFFSET;

async function teamContenuDataBuilder({ databaseBuilder }) {
  _createProOrganization(databaseBuilder);
  await _createCoreTargetProfile(databaseBuilder);
  await _createDiverseTargetProfile(databaseBuilder);
  await _createAssessmentCampaign(databaseBuilder);
}

module.exports = {
  teamContenuDataBuilder,
};

function _createProOrganization(databaseBuilder) {
  databaseBuilder.factory.buildOrganization({
    id: PRO_ORGANIZATION_ID,
    type: 'PRO',
    name: 'Orga team contenu',
    isManagingStudents: false,
    externalId: 'CONTENU',
  });
  databaseBuilder.factory.buildUser.withRawPassword({
    id: PRO_ORGANIZATION_USER_ID,
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
  });
  databaseBuilder.factory.buildMembership({
    userId: PRO_ORGANIZATION_USER_ID,
    organizationId: PRO_ORGANIZATION_ID,
    organizationRole: 'ADMIN',
  });
}

async function _createAssessmentCampaign(databaseBuilder) {
  await tooling.campaign.createCampaign({
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
    organizationId: PRO_ORGANIZATION_ID,
    creatorId: PRO_ORGANIZATION_USER_ID,
    ownerId: PRO_ORGANIZATION_USER_ID,
    targetProfileId: null,
    customResultPageText: 'customResultPageText',
    customResultPageButtonText: 'customResultPageButtonText',
    customResultPageButtonUrl: 'customResultPageButtonUrl',
    multipleSendings: false,
    assessmentMethod: 'SMART_RANDOM',
  });
}

async function _createCoreTargetProfile(databaseBuilder) {
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
  const { targetProfileId, cappedTubesDTO } = await tooling.targetProfile.createTargetProfile({
    databaseBuilder,
    targetProfileId: 500,
    name: 'Profil cible Pur Pix (Niv3 ~ 5)',
    isPublic: true,
    ownerOrganizationId: PRO_ORGANIZATION_ID,
    isSimplifiedAccess: false,
    description:
      'Profil cible pur pix (Niv3 ~ 5) avec 1 RT double critère (tube et participation) et des paliers NIVEAUX',
    configTargetProfile,
  });
  tooling.targetProfile.createBadge({
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
  tooling.targetProfile.createStages({
    databaseBuilder,
    targetProfileId,
    cappedTubesDTO,
    type: 'LEVEL',
    countStages: 4,
    includeFirstSkill: true,
  });
}

async function _createDiverseTargetProfile(databaseBuilder) {
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
  const { targetProfileId, cappedTubesDTO } = await tooling.targetProfile.createTargetProfile({
    databaseBuilder,
    targetProfileId: 501,
    name: 'Profil cible Pix et un autre réf (Niv1 ~ 8)',
    isPublic: true,
    ownerOrganizationId: PRO_ORGANIZATION_ID,
    isSimplifiedAccess: false,
    description: 'Profil cible pur pix et un autre réf (Niv1 ~ 8) et des paliers SEUILS',
    configTargetProfile,
  });
  tooling.targetProfile.createStages({
    databaseBuilder,
    targetProfileId,
    cappedTubesDTO,
    type: 'THRESHOLD',
    countStages: 4,
  });
}
