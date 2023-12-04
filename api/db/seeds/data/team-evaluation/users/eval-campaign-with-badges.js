import { TEAM_EVALUATION_OFFSET_ID } from '../constants.js';
import * as tooling from '../../common/tooling/index.js';
import dayjs from 'dayjs';

export default async function initUser(databaseBuilder) {
  const ALL_PURPOSE_ID = TEAM_EVALUATION_OFFSET_ID + 1;

  /**
   * User configuration
   */
  // 1. Build user
  const user = databaseBuilder.factory.buildUser.withRawPassword({
    id: ALL_PURPOSE_ID,
    firstName: 'User campaign with badges',
    lastName: 'Team Eval',
    email: 'eval-campaign-with-badges@example.net',
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

  // 2. Link user to organization
  databaseBuilder.factory.buildMembership({
    userId: user.id,
    organizationId: TEAM_EVALUATION_OFFSET_ID,
    organizationRole: 'ADMIN',
  });

  // 3. Transform it into an organization learner
  const organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
    userId: user.id,
    organizationId: TEAM_EVALUATION_OFFSET_ID,
  });

  /**
   * Target-profile configuration
   */
  // 1. Build target-profile
  const { targetProfileId, cappedTubesDTO } = await tooling.targetProfile.createTargetProfile({
    databaseBuilder,
    targetProfileId: ALL_PURPOSE_ID,
    name: 'Profil cible paliers et RT acquis',
    isPublic: true,
    ownerOrganizationId: TEAM_EVALUATION_OFFSET_ID,
    isSimplifiedAccess: false,
    description: 'Profil cible avec des paliers par niveaux et avec des RT acquis, certifiables et en lacune',
    configTargetProfile: {
      frameworks: [
        {
          chooseCoreFramework: true,
          countTubes: 10,
          minLevel: 5,
          maxLevel: 6,
        },
      ],
    },
  });

  // 2. Build target-profile stages
  await tooling.targetProfile.createStages({
    databaseBuilder,
    targetProfileId,
    cappedTubesDTO,
    type: 'THRESHOLD',
    countStages: 4,
  });

  // 3. Build target-profile badges
  const commonBadgesProps = {
    databaseBuilder,
    targetProfileId,
    cappedTubesDTO,
  };

  const badgesToCreate = [
    // Acquired + Not certifiable
    {
      altMessage: '1 RT non-certifiable, acquis et valide',
      imageUrl: 'https://images.pix.fr/badges/Pix_plus_Droit- Pret-certif_Bronze--Initie.svg',
      message: '1 RT non-certifiable, acquis et valide',
      title: '1 RT non-certifiable, acquis et valide',
      isCertifiable: false,
      isAlwaysVisible: false,
      configBadge: {
        criteria: [
          {
            scope: 'CampaignParticipation',
            threshold: 0,
          },
        ],
      },
    },
    {
      altMessage: '1 RT non-certifiable, acquis, valide et en lacune',
      imageUrl: 'https://images.pix.fr/badges/Pix_plus_Edu-Initie-PREMIER-DEGRE.svg',
      message: '1 RT non-certifiable, acquis, valide et en lacune',
      title: '1 RT non-certifiable, acquis, valide et en lacune',
      isCertifiable: false,
      isAlwaysVisible: true,
      configBadge: {
        criteria: [
          {
            scope: 'CampaignParticipation',
            threshold: 10,
          },
        ],
      },
    },
    // Acquired + Certifiables
    {
      altMessage: '1 RT certifiable, acquis et valide',
      imageUrl: 'https://images.pix.fr/badges/Badge_Pixome%CC%80tre-plane%CC%80te.svg',
      message: '1 RT certifiable, acquis et valide',
      title: '1 RT certifiable, acquis et valide',
      isCertifiable: true,
      isAlwaysVisible: false,
      configBadge: {
        criteria: [
          {
            scope: 'CampaignParticipation',
            threshold: 0,
          },
        ],
      },
    },
    {
      altMessage: '1 RT certifiable, acquis, valide et en lacune',
      imageUrl: 'https://images.pix.fr/badges/Pix_plus_Edu-2-Confirme-certif.svg',
      message: '1 RT certifiable, acquis, valide et en lacune',
      title: '1 RT certifiable, acquis, valide et en lacune',
      isCertifiable: true,
      isAlwaysVisible: true,
      configBadge: {
        criteria: [
          {
            scope: 'CampaignParticipation',
            threshold: 10,
          },
        ],
      },
    },
    // Not-acquired + Always visible (displayed)
    {
      altMessage: '1 RT certifiable, non-acquis et en lacune',
      imageUrl: 'https://images.pix.fr/badges/Pix_plus_Edu-3-Avance-certif.svg',
      message: '1 RT certifiable, non-acquis et en lacune',
      title: '1 RT certifiable, non-acquis et en lacune',
      isCertifiable: true,
      isAlwaysVisible: true,
      configBadge: {
        criteria: [
          {
            scope: 'CampaignParticipation',
            threshold: 100,
          },
        ],
      },
    },
    {
      altMessage: '1 RT non-certifiable, non-acquis et en lacune',
      imageUrl: 'https://images.pix.fr/badges/Pix_plus_Edu-2-Confirme.svg',
      message: '1 RT non-certifiable, non-acquis et en lacune',
      title: '1 RT non-certifiable, non-acquis et en lacune',
      isCertifiable: false,
      isAlwaysVisible: true,
      configBadge: {
        criteria: [
          {
            scope: 'CampaignParticipation',
            threshold: 100,
          },
        ],
      },
    },
    // Not-acquired + Not always visible (not displayed)
    {
      altMessage: '1 RT certifiable, non-acquis et pas en lacune',
      imageUrl: 'https://images.pix.fr/badges/Pix_plus_Edu-3-Avance-certif.svg',
      message: '1 RT certifiable, non-acquis et pas en lacune',
      title: '1 RT certifiable, non-acquis et pas en lacune',
      isCertifiable: true,
      isAlwaysVisible: false,
      configBadge: {
        criteria: [
          {
            scope: 'CampaignParticipation',
            threshold: 100,
          },
        ],
      },
    },
    {
      altMessage: '1 RT non-certifiable, non-acquis et pas en lacune',
      imageUrl: 'https://images.pix.fr/badges/Pix_plus_Edu-2-Confirme.svg',
      message: '1 RT non-certifiable, non-acquis et pas en lacune',
      title: '1 RT non-certifiable, non-acquis et pas en lacune',
      isCertifiable: false,
      isAlwaysVisible: false,
      configBadge: {
        criteria: [
          {
            scope: 'CampaignParticipation',
            threshold: 100,
          },
        ],
      },
    },
  ];
  const buildedBadges = [];
  let badgeIndex = 0;

  for await (const badge of badgesToCreate) {
    const newBadge = await tooling.targetProfile.createBadge({
      ...commonBadgesProps,
      badgeId: ALL_PURPOSE_ID + badgeIndex,
      key: `SOME_KEY_FOR_RT_${ALL_PURPOSE_ID + badgeIndex}`,
      ...badge,
    });

    buildedBadges.push(newBadge);

    badgeIndex++;
  }

  /**
   * Campaign-participation configuration
   */
  // 1. Build campaign with a specific campaign code
  const campaign = await tooling.campaign.createAssessmentCampaign({
    databaseBuilder,
    organizationId: TEAM_EVALUATION_OFFSET_ID,
    ownerId: TEAM_EVALUATION_OFFSET_ID,
    name: "Campagne d'évaluation SCO - envoi simple",
    code: 'EVALBADGE',
    targetProfileId: targetProfileId,
    idPixLabel: null,
    configCampaign: { participantCount: 0 },
  });

  // 2. Build campaign-participation
  const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
    campaignId: campaign.campaignId,
    userId: user.id,
    organizationLearnerId: organizationLearner.id,
    masteryRate: 0.5,
    pixScore: 500,
    validatedSkillsCount: 5,
    isCertifiable: true,
    status: 'TO_SHARE',
  });

  // 3. Build wanted badges acquisitions
  const acquiredBadges = badgesToCreate.filter((badge) => badge.configBadge.criteria[0].threshold < 100);

  for (const badge of buildedBadges.slice(0, acquiredBadges.length)) {
    databaseBuilder.factory.buildBadgeAcquisition({
      badgeId: badge.badgeId,
      userId: user.id,
      campaignParticipationId: campaignParticipation.id,
    });
  }

  /**
   * Assesment-result configuration
   */
  // 1. Build assessment
  const assessment = await databaseBuilder.factory.buildAssessment({
    userId: user.id,
    type: 'CAMPAIGN',
    campaignParticipationId: campaignParticipation.id,
  });

  // 2. Build assessment result
  databaseBuilder.factory.buildAssessmentResult({
    assessmentId: assessment.id,
  });

  /**
   * Knowledge elements configuration
   * (we need some acquired KEs to have valid badges)
   */
  const answersAndKEFromAdvancedProfile = await tooling.profile.getAnswersAndKnowledgeElementsForAdvancedProfile();

  for (const { answerData, keData } of answersAndKEFromAdvancedProfile) {
    const answer = databaseBuilder.factory.buildAnswer({
      assessmentId: assessment.id,
      answerData,
    });

    databaseBuilder.factory.buildKnowledgeElement({
      assessmentId: assessment.id,
      answerId: answer.id,
      userId: user.id,
      ...keData,
      createdAt: dayjs().subtract(1, 'day'),
    });
  }
}
