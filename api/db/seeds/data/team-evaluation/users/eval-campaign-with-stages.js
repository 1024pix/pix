import dayjs from 'dayjs';

import * as tooling from '../../common/tooling/index.js';
import { TEAM_EVALUATION_OFFSET_ID } from '../constants.js';

export default async function initUser(databaseBuilder) {
  const ALL_PURPOSE_ID = TEAM_EVALUATION_OFFSET_ID + 2;

  /**
   * User configuration
   */
  // 1. Build user
  const user = databaseBuilder.factory.buildUser.withRawPassword({
    id: ALL_PURPOSE_ID,
    firstName: 'User campaign with stages',
    lastName: 'Team Eval',
    email: 'eval-campaign-with-stages@example.net',
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
  const targetProfile1 = await tooling.targetProfile.createTargetProfile({
    databaseBuilder,
    targetProfileId: ALL_PURPOSE_ID,
    name: 'Profil cible palier par niveau à 0',
    isPublic: true,
    ownerOrganizationId: TEAM_EVALUATION_OFFSET_ID,
    isSimplifiedAccess: false,
    description: 'Profil cible avec un palier par niveau à 0',
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
  const targetProfile2 = await tooling.targetProfile.createTargetProfile({
    databaseBuilder,
    targetProfileId: ALL_PURPOSE_ID + 1,
    name: 'Profil cible paliers "Premier acquis" et un niveau à 0',
    isPublic: true,
    ownerOrganizationId: TEAM_EVALUATION_OFFSET_ID,
    isSimplifiedAccess: false,
    description: 'Profil cible avec un palier "Premier acquis" et un niveau à 0',
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
  const targetProfile3 = await tooling.targetProfile.createTargetProfile({
    databaseBuilder,
    targetProfileId: ALL_PURPOSE_ID + 2,
    name: 'Profil cible paliers par niveaux',
    isPublic: true,
    ownerOrganizationId: TEAM_EVALUATION_OFFSET_ID,
    isSimplifiedAccess: false,
    description: 'Profil cible avec des paliers par niveaux',
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
  const targetProfile4 = await tooling.targetProfile.createTargetProfile({
    databaseBuilder,
    targetProfileId: ALL_PURPOSE_ID + 3,
    name: 'Profil cible palier par seuil à 0',
    isPublic: true,
    ownerOrganizationId: TEAM_EVALUATION_OFFSET_ID,
    isSimplifiedAccess: false,
    description: 'Profil cible avec un palier par seuil à 0',
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
  const targetProfile5 = await tooling.targetProfile.createTargetProfile({
    databaseBuilder,
    targetProfileId: ALL_PURPOSE_ID + 4,
    name: 'Profil cible paliers "Premier acquis" et un seuil à 0',
    isPublic: true,
    ownerOrganizationId: TEAM_EVALUATION_OFFSET_ID,
    isSimplifiedAccess: false,
    description: 'Profil cible avec un palier "Premier acquis" et un niveau à 0',
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
  const targetProfile6 = await tooling.targetProfile.createTargetProfile({
    databaseBuilder,
    targetProfileId: ALL_PURPOSE_ID + 5,
    name: 'Profil cible paliers par seuils',
    isPublic: true,
    ownerOrganizationId: TEAM_EVALUATION_OFFSET_ID,
    isSimplifiedAccess: false,
    description: 'Profil cible avec des paliers par seuils',
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
  const stages1 = await tooling.targetProfile.createStages({
    databaseBuilder,
    targetProfileId: targetProfile1.targetProfileId,
    cappedTubesDTO: targetProfile1.cappedTubesDTO,
    type: 'LEVEL',
    countStages: 1,
    includeFirstSkill: false,
  });
  const stages2 = await tooling.targetProfile.createStages({
    databaseBuilder,
    targetProfileId: targetProfile2.targetProfileId,
    cappedTubesDTO: targetProfile2.cappedTubesDTO,
    type: 'LEVEL',
    countStages: 2,
    includeFirstSkill: true,
  });
  const stages3 = await tooling.targetProfile.createStages({
    databaseBuilder,
    targetProfileId: targetProfile3.targetProfileId,
    cappedTubesDTO: targetProfile3.cappedTubesDTO,
    type: 'LEVEL',
    countStages: 6,
    includeFirstSkill: false,
  });
  const stages4 = await tooling.targetProfile.createStages({
    databaseBuilder,
    targetProfileId: targetProfile4.targetProfileId,
    cappedTubesDTO: targetProfile4.cappedTubesDTO,
    type: 'THRESHOLD',
    countStages: 1,
    includeFirstSkill: false,
  });
  const stages5 = await tooling.targetProfile.createStages({
    databaseBuilder,
    targetProfileId: targetProfile5.targetProfileId,
    cappedTubesDTO: targetProfile5.cappedTubesDTO,
    type: 'THRESHOLD',
    countStages: 2,
    includeFirstSkill: true,
  });
  const stages6 = await tooling.targetProfile.createStages({
    databaseBuilder,
    targetProfileId: targetProfile6.targetProfileId,
    cappedTubesDTO: targetProfile6.cappedTubesDTO,
    type: 'THRESHOLD',
    countStages: 6,
    includeFirstSkill: false,
  });

  /**
   * Campaign-participation configuration
   */
  // 1. Build campaign with a specific campaign code
  const campaign1 = await tooling.campaign.createAssessmentCampaign({
    databaseBuilder,
    organizationId: TEAM_EVALUATION_OFFSET_ID,
    ownerId: TEAM_EVALUATION_OFFSET_ID,
    name: 'Campagne avec des paliers par niveaux - niveau à 0 ',
    code: 'EVALSTAG1',
    targetProfileId: targetProfile1.targetProfileId,
    idPixLabel: null,
    configCampaign: { participantCount: 0 },
  });
  const campaign2 = await tooling.campaign.createAssessmentCampaign({
    databaseBuilder,
    organizationId: TEAM_EVALUATION_OFFSET_ID,
    ownerId: TEAM_EVALUATION_OFFSET_ID,
    name: 'Campagne avec des paliers par niveaux - niveau à 0  et un "Premier Acquis"',
    code: 'EVALSTAG2',
    targetProfileId: targetProfile2.targetProfileId,
    idPixLabel: null,
    configCampaign: { participantCount: 0 },
  });
  const campaign3 = await tooling.campaign.createAssessmentCampaign({
    databaseBuilder,
    organizationId: TEAM_EVALUATION_OFFSET_ID,
    ownerId: TEAM_EVALUATION_OFFSET_ID,
    name: 'Campagne avec des paliers par niveau - niveau à 0 et paliers de niveaux',
    code: 'EVALSTAG3',
    targetProfileId: targetProfile3.targetProfileId,
    idPixLabel: null,
    configCampaign: { participantCount: 0 },
  });
  const campaign4 = await tooling.campaign.createAssessmentCampaign({
    databaseBuilder,
    organizationId: TEAM_EVALUATION_OFFSET_ID,
    ownerId: TEAM_EVALUATION_OFFSET_ID,
    name: 'Campagne avec des paliers par seuil - seuil à 0',
    code: 'EVALSTAG4',
    targetProfileId: targetProfile4.targetProfileId,
    idPixLabel: null,
    configCampaign: { participantCount: 0 },
  });
  const campaign5 = await tooling.campaign.createAssessmentCampaign({
    databaseBuilder,
    organizationId: TEAM_EVALUATION_OFFSET_ID,
    ownerId: TEAM_EVALUATION_OFFSET_ID,
    name: 'Campagne avec des paliers par seuil - seuil à 0 et un "Premier Acquis"',
    code: 'EVALSTAG5',
    targetProfileId: targetProfile5.targetProfileId,
    idPixLabel: null,
    configCampaign: { participantCount: 0 },
  });
  const campaign6 = await tooling.campaign.createAssessmentCampaign({
    databaseBuilder,
    organizationId: TEAM_EVALUATION_OFFSET_ID,
    ownerId: TEAM_EVALUATION_OFFSET_ID,
    name: "Campagne d'évaluation SCO - seuil à 0 et paliers de seuil",
    code: 'EVALSTAG6',
    targetProfileId: targetProfile6.targetProfileId,
    idPixLabel: null,
    configCampaign: { participantCount: 0 },
  });

  // 2. Build campaign-participation
  const campaignParticipation1 = databaseBuilder.factory.buildCampaignParticipation({
    campaignId: campaign1.campaignId,
    userId: user.id,
    organizationLearnerId: organizationLearner.id,
    masteryRate: 0.5,
    pixScore: 500,
    validatedSkillsCount: 5,
    isCertifiable: true,
    status: 'TO_SHARE',
  });
  const campaignParticipation2 = databaseBuilder.factory.buildCampaignParticipation({
    campaignId: campaign2.campaignId,
    userId: user.id,
    organizationLearnerId: organizationLearner.id,
    masteryRate: 0.9,
    pixScore: 500,
    validatedSkillsCount: 5,
    isCertifiable: true,
    status: 'TO_SHARE',
  });
  const campaignParticipation3 = databaseBuilder.factory.buildCampaignParticipation({
    campaignId: campaign3.campaignId,
    userId: user.id,
    organizationLearnerId: organizationLearner.id,
    masteryRate: 0.7,
    pixScore: 500,
    validatedSkillsCount: 5,
    isCertifiable: true,
    status: 'TO_SHARE',
  });
  const campaignParticipation4 = databaseBuilder.factory.buildCampaignParticipation({
    campaignId: campaign4.campaignId,
    userId: user.id,
    organizationLearnerId: organizationLearner.id,
    masteryRate: 0.5,
    pixScore: 500,
    validatedSkillsCount: 5,
    isCertifiable: true,
    status: 'TO_SHARE',
  });
  const campaignParticipation5 = databaseBuilder.factory.buildCampaignParticipation({
    campaignId: campaign5.campaignId,
    userId: user.id,
    organizationLearnerId: organizationLearner.id,
    masteryRate: 0.5,
    pixScore: 500,
    validatedSkillsCount: 5,
    isCertifiable: true,
    status: 'TO_SHARE',
  });
  const campaignParticipation6 = databaseBuilder.factory.buildCampaignParticipation({
    campaignId: campaign6.campaignId,
    userId: user.id,
    organizationLearnerId: organizationLearner.id,
    masteryRate: 0.5,
    pixScore: 500,
    validatedSkillsCount: 5,
    isCertifiable: true,
    status: 'TO_SHARE',
  });

  const allCampaignParticipations = [
    campaignParticipation1,
    campaignParticipation2,
    campaignParticipation3,
    campaignParticipation4,
    campaignParticipation5,
    campaignParticipation6,
  ];

  // 3. Build stage-acquisitions
  [
    { stages: stages1, campaignParticipation: campaignParticipation1 },
    { stages: stages2, campaignParticipation: campaignParticipation2 },
    { stages: stages3, campaignParticipation: campaignParticipation3 },
    { stages: stages4, campaignParticipation: campaignParticipation4 },
    { stages: stages5, campaignParticipation: campaignParticipation5 },
    { stages: stages6, campaignParticipation: campaignParticipation6 },
  ].forEach(({ stages, campaignParticipation }) => {
    stages.stageIds.forEach((stageId) => {
      databaseBuilder.factory.buildStageAcquisition({
        userId: user.id,
        campaignParticipationId: campaignParticipation.id,
        stageId,
      });
    });
  });

  /**
   * Assesment-result configuration
   */
  const answersAndKEFromAdvancedProfile = await tooling.profile.getAnswersAndKnowledgeElementsForAdvancedProfile();

  allCampaignParticipations.forEach((campaignParticipation) => {
    // 1. Build assessment
    const assessment = databaseBuilder.factory.buildAssessment({
      userId: user.id,
      type: 'CAMPAIGN',
      campaignParticipationId: campaignParticipation.id,
    });

    // 2. Build assessment result
    databaseBuilder.factory.buildAssessmentResult({
      assessmentId: assessment.id,
    });

    // 3. Knowledge elements configuration (we need some acquired KEs to have stages)
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
  });
}
