import * as tooling from '../common/tooling/index.js';

const TEAM_CONTENU_OFFSET_ID = 5000;
// IDS
/// USERS
const PRO_ORGANIZATION_USER_ID = TEAM_CONTENU_OFFSET_ID;
const PRO_CERTIFICATION_CENTER_USER_ID = TEAM_CONTENU_OFFSET_ID + 1;
const CERTIFIABLE_USER_ID = TEAM_CONTENU_OFFSET_ID + 2;
const PERFECT_PROFILE_USER_ID = TEAM_CONTENU_OFFSET_ID + 3;
/// ORGAS
const PRO_ORGANIZATION_ID = TEAM_CONTENU_OFFSET_ID;
// TARGET PROFILES
const TARGET_PROFILE_PIX_ID = TEAM_CONTENU_OFFSET_ID;
const TARGET_PROFILE_PIX_AND_MORE_ID = TEAM_CONTENU_OFFSET_ID + 1;
// CAMPAIGNS
const ASSESSMENT_CAMPAIGN_PIX_ID = TEAM_CONTENU_OFFSET_ID;
const PROFILES_COLLECTION_CAMPAIGN_PIX_ID = TEAM_CONTENU_OFFSET_ID + 1;
/// CERTIFICATION CENTERS
const PRO_CERTIFICATION_CENTER_ID = TEAM_CONTENU_OFFSET_ID;

async function teamContenuDataBuilder({ databaseBuilder }) {
  _createProOrganization(databaseBuilder);
  _createProCertificationCenter(databaseBuilder);
  await _createCoreTargetProfile(databaseBuilder);
  await _createDiverseTargetProfile(databaseBuilder);
  await _createTraining(databaseBuilder);
  await _createAssessmentCampaign(databaseBuilder);
  await _createProfilesCollectionCampaign(databaseBuilder);
  await _createCertifiableUser(databaseBuilder);
  await _createPerfectProfileUser(databaseBuilder);
}

export { teamContenuDataBuilder };

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

function _createProCertificationCenter(databaseBuilder) {
  databaseBuilder.factory.buildCertificationCenter({
    id: PRO_CERTIFICATION_CENTER_ID,
    type: 'PRO',
    name: 'Centre de certif Contenu',
  });
  databaseBuilder.factory.buildUser.withRawPassword({
    id: PRO_CERTIFICATION_CENTER_USER_ID,
    firstName: 'Centre de certif PRO',
    lastName: 'Contenu',
    email: 'contenu-centre-pro@example.net',
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
  databaseBuilder.factory.buildCertificationCenterMembership({
    userId: PRO_CERTIFICATION_CENTER_USER_ID,
    certificationCenterId: PRO_CERTIFICATION_CENTER_ID,
  });
}

async function _createAssessmentCampaign(databaseBuilder) {
  await tooling.campaign.createAssessmentCampaign({
    databaseBuilder,
    campaignId: ASSESSMENT_CAMPAIGN_PIX_ID,
    name: 'Campagne evaluation team-contenu',
    code: 'CONTEN123',
    title: 'Campagne evaluation team-contenu',
    idPixLabel: null,
    externalIdHelpImageUrl: null,
    alternativeTextToExternalIdHelpImage: null,
    customLandingPageText: null,
    isForAbsoluteNovice: false,
    archivedAt: null,
    archivedBy: null,
    createdAt: undefined,
    organizationId: PRO_ORGANIZATION_ID,
    creatorId: PRO_ORGANIZATION_USER_ID,
    ownerId: PRO_ORGANIZATION_USER_ID,
    targetProfileId: TARGET_PROFILE_PIX_ID,
    customResultPageText: 'customResultPageText',
    customResultPageButtonText: 'customResultPageButtonText',
    customResultPageButtonUrl: 'https://pix.fr/',
    multipleSendings: false,
    assessmentMethod: 'SMART_RANDOM',
    configCampaign: {
      participantCount: 30,
    },
  });
}

async function _createProfilesCollectionCampaign(databaseBuilder) {
  await tooling.campaign.createProfilesCollectionCampaign({
    databaseBuilder,
    campaignId: PROFILES_COLLECTION_CAMPAIGN_PIX_ID,
    name: 'Campagne collecte profils team-contenu',
    code: 'CONTEN456',
    title: 'Campagne collecte profils team-contenu',
    idPixLabel: null,
    externalIdHelpImageUrl: null,
    alternativeTextToExternalIdHelpImage: null,
    customLandingPageText: null,
    isForAbsoluteNovice: false,
    archivedAt: null,
    archivedBy: null,
    createdAt: undefined,
    organizationId: PRO_ORGANIZATION_ID,
    creatorId: PRO_ORGANIZATION_USER_ID,
    ownerId: PRO_ORGANIZATION_USER_ID,
    customResultPageText: 'customResultPageText',
    customResultPageButtonText: 'customResultPageButtonText',
    customResultPageButtonUrl: 'customResultPageButtonUrl',
    multipleSendings: false,
    assessmentMethod: 'SMART_RANDOM',
    configCampaign: {
      participantCount: 20,
      profileDistribution: { beginner: 5, intermediate: 5, advanced: 9, perfect: 1 },
    },
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
    targetProfileId: TARGET_PROFILE_PIX_ID,
    name: 'Profil cible Pur Pix (Niv3 ~ 5)',
    isPublic: true,
    ownerOrganizationId: PRO_ORGANIZATION_ID,
    isSimplifiedAccess: false,
    description:
      'Profil cible pur pix (Niv3 ~ 5) avec 1 RT double critère (tube et participation) et des paliers NIVEAUX',
    configTargetProfile,
  });
  await tooling.targetProfile.createBadge({
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
  await tooling.targetProfile.createBadge({
    databaseBuilder,
    targetProfileId,
    cappedTubesDTO,
    badgeId: 601,
    altMessage: '1 RT simple critère Campaign',
    imageUrl: 'some_other_image.svg',
    message: '1 RT simple critère Campaign',
    title: '1 RT simple critère Campaign',
    key: 'SOME_KEY_FOR_RT_601',
    isCertifiable: false,
    isAlwaysVisible: false,
    configBadge,
  });
  await tooling.targetProfile.createStages({
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
    targetProfileId: TARGET_PROFILE_PIX_AND_MORE_ID,
    name: 'Profil cible Pix et un autre réf (Niv1 ~ 8)',
    isPublic: true,
    ownerOrganizationId: PRO_ORGANIZATION_ID,
    isSimplifiedAccess: false,
    description: 'Profil cible pur pix et un autre réf (Niv1 ~ 8) et des paliers SEUILS',
    configTargetProfile,
  });
  await tooling.targetProfile.createStages({
    databaseBuilder,
    targetProfileId,
    cappedTubesDTO,
    type: 'THRESHOLD',
    countStages: 4,
  });
}

async function _createCertifiableUser(databaseBuilder) {
  const userId = databaseBuilder.factory.buildUser.withRawPassword({
    id: CERTIFIABLE_USER_ID,
    firstName: 'Certifiable',
    lastName: 'Contenu',
    email: 'certifiable-contenu-user@example.net',
    cgu: true,
    lang: 'fr',
    lastTermsOfServiceValidatedAt: new Date(),
    lastPixOrgaTermsOfServiceValidatedAt: new Date(),
    mustValidateTermsOfService: false,
    pixOrgaTermsOfServiceAccepted: false,
    pixCertifTermsOfServiceAccepted: false,
    hasSeenAssessmentInstructions: false,
    shouldChangePassword: false,
  }).id;

  await tooling.profile.createCertifiableProfile({
    databaseBuilder,
    userId,
  });
}

async function _createPerfectProfileUser(databaseBuilder) {
  const userId = databaseBuilder.factory.buildUser.withRawPassword({
    id: PERFECT_PROFILE_USER_ID,
    firstName: 'Perfect',
    lastName: 'Profile User',
    email: 'perfect-profile-user@example.net',
    cgu: true,
    lang: 'fr',
    lastTermsOfServiceValidatedAt: new Date(),
    lastPixOrgaTermsOfServiceValidatedAt: new Date(),
    mustValidateTermsOfService: false,
    pixOrgaTermsOfServiceAccepted: false,
    pixCertifTermsOfServiceAccepted: false,
    hasSeenAssessmentInstructions: false,
    shouldChangePassword: false,
  }).id;

  await tooling.profile.createPerfectProfile({
    databaseBuilder,
    userId,
  });
}

async function _createTraining(databaseBuilder) {
  const configTriggers = [
    {
      type: 'goal',
      threshold: 80,
      frameworks: [
        {
          chooseCoreFramework: true,
          countTubes: 15,
          minLevel: 1,
          maxLevel: 2,
        },
        {
          chooseCoreFramework: false,
          countTubes: 2,
          minLevel: 5,
          maxLevel: 7,
        },
      ],
    },
    {
      type: 'prerequisite',
      threshold: 10,
      frameworks: [
        {
          chooseCoreFramework: true,
          countTubes: 5,
          minLevel: 1,
          maxLevel: 4,
        },
      ],
    },
  ];
  await tooling.training.createTraining({
    databaseBuilder,
    trainingId: TEAM_CONTENU_OFFSET_ID,
    title: 'Contenu formatif / équipe contenu',
    link: 'https://www.youtube.com/watch?v=qq09UkPRdFY',
    type: 'webinaire',
    duration: '00:04:08',
    locale: 'fr-fr',
    editorName: 'Mariah Carey',
    editorLogoUrl: 'some-butterfly-logo.svg',
    attachedTargetProfileIds: [TARGET_PROFILE_PIX_ID],
    configTriggers,
  });
}
