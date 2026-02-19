import { COUNTRY_CANADA_CODE } from '../common/constants.js';
import * as tooling from '../common/tooling/index.js';
import { acceptPixOrgaTermsOfService } from '../common/tooling/legal-documents.js';
import { ADMINISTRATION_TEAM_SOLO_ID, ORGANIZATION_LEARNER_TYPE_STUDENT_ID } from '../team-acquisition/constants.js';
import createAutonomousCourses from './autonomous-courses/create-autonomous-courses.js';
import {
  ASSESSMENT_CAMPAIGN_PIX_ID,
  SCO_ORGANIZATION_ID,
  SCO_ORGANIZATION_USER_ID,
  TARGET_PROFILE_PIX_ID,
} from './constants.js';
import evalCampaignWithBadgesUser from './users/eval-campaign-with-badges.js';
import evalCampaignWithStagesUser from './users/eval-campaign-with-stages.js';

export async function teamEvaluationDataBuilder({ databaseBuilder }) {
  createScoOrganization(databaseBuilder);
  await createCoreTargetProfile(databaseBuilder);
  await createAssessmentCampaign(databaseBuilder);

  // Other users
  await evalCampaignWithBadgesUser(databaseBuilder);
  await evalCampaignWithStagesUser(databaseBuilder);

  // Autonomous courses
  await createAutonomousCourses(databaseBuilder);
}

function createScoOrganization(databaseBuilder) {
  databaseBuilder.factory.buildOrganization({
    id: SCO_ORGANIZATION_ID,
    type: 'SCO',
    name: 'Sco Orga team eval',
    isManagingStudents: false,
    externalId: 'EVAL',
    administrationTeamId: ADMINISTRATION_TEAM_SOLO_ID,
    organizationLearnerTypeId: ORGANIZATION_LEARNER_TYPE_STUDENT_ID,
    countryCode: COUNTRY_CANADA_CODE,
  });
  databaseBuilder.factory.buildUser.withRawPassword({
    id: SCO_ORGANIZATION_USER_ID,
    firstName: 'Orga Sco',
    lastName: 'Team Eval',
    email: 'eval-sco@example.net',
    cgu: true,
    lang: 'fr',
    lastTermsOfServiceValidatedAt: new Date(),
    mustValidateTermsOfService: false,
    pixCertifTermsOfServiceAccepted: false,
    hasSeenAssessmentInstructions: false,
  });

  acceptPixOrgaTermsOfService(databaseBuilder, SCO_ORGANIZATION_USER_ID);

  databaseBuilder.factory.buildMembership({
    userId: SCO_ORGANIZATION_USER_ID,
    organizationId: SCO_ORGANIZATION_ID,
    organizationRole: 'ADMIN',
  });
}

async function createCoreTargetProfile(databaseBuilder) {
  const configTargetProfile = {
    frameworks: [
      {
        chooseCoreFramework: true,
        countTubes: 30,
        minLevel: 3,
        maxLevel: 7,
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
    name: 'Profil cible Pur Pix (Niv3 ~ 6)',
    isSimplifiedAccess: false,
    description:
      'Profil cible pur pix (Niv3 ~ 6) avec 1 RT double critère (tube et participation) et des paliers NIVEAUX',
    configTargetProfile,
  });
  databaseBuilder.factory.buildTargetProfileShare({
    organizationId: SCO_ORGANIZATION_ID,
    targetProfileId: TARGET_PROFILE_PIX_ID,
  });

  await tooling.targetProfile.createBadge({
    databaseBuilder,
    targetProfileId,
    cappedTubesDTO,
    badgeId: 700,
    altMessage: '1 RT double critère Campaign & Tubes',
    imageUrl: 'https://assets.pix.org/badges/Logos_badge_Prêt-CléA_Num NEW 2020.svg',
    message: '1 RT double critère Campaign & Tubes',
    title: '1 RT double critère Campaign & Tubes',
    key: 'SOME_KEY_FOR_RT_700',
    isCertifiable: false,
    isAlwaysVisible: true,
    configBadge,
  });
  await tooling.targetProfile.createBadge({
    databaseBuilder,
    targetProfileId,
    cappedTubesDTO,
    badgeId: 701,
    altMessage: '1 RT simple critère Campaign',
    imageUrl: 'https://assets.pix.org/badges/Pix_plus_Droit-%20Pret-certif_Bronze--Initie.svg',
    message: '1 RT simple critère Campaign',
    title: '1 RT simple critère Campaign',
    key: 'SOME_KEY_FOR_RT_701',
    isCertifiable: false,
    isAlwaysVisible: true,
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

async function createAssessmentCampaign(databaseBuilder) {
  await tooling.campaign.createAssessmentCampaign({
    databaseBuilder,
    campaignId: ASSESSMENT_CAMPAIGN_PIX_ID,
    name: 'Campagne evaluation team-eval',
    code: 'EVAL12345',
    title: 'Campagne evaluation team-evaluation',
    externalIdLabel: null,
    externalIdHelpImageUrl: null,
    alternativeTextToExternalIdHelpImage: null,
    customLandingPageText: null,
    isForAbsoluteNovice: false,
    archivedAt: null,
    archivedBy: null,
    createdAt: undefined,
    organizationId: SCO_ORGANIZATION_ID,
    creatorId: SCO_ORGANIZATION_USER_ID,
    ownerId: SCO_ORGANIZATION_USER_ID,
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
