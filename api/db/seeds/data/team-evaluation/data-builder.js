import { Training } from '../../../../src/devcomp/domain/models/Training.js';
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
import evalCampaignRecommendationEngineUser from './users/eval-campaign-recommendation-engine.js';
import evalCampaignWithBadgesUser from './users/eval-campaign-with-badges.js';
import evalCampaignWithStagesUser from './users/eval-campaign-with-stages.js';

export async function teamEvaluationDataBuilder({ databaseBuilder }) {
  createScoOrganization(databaseBuilder);
  await createCoreTargetProfile(databaseBuilder);
  createTrainings(databaseBuilder);

  await createAssessmentCampaign(databaseBuilder);

  // Other users
  await evalCampaignWithBadgesUser(databaseBuilder);
  await evalCampaignWithStagesUser(databaseBuilder);
  await evalCampaignRecommendationEngineUser(databaseBuilder);

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
  await tooling.targetProfile.createBadge({
    databaseBuilder,
    targetProfileId,
    cappedTubesDTO,
    badgeId: 702,
    altMessage: '1 RT certifiable, acquis',
    imageUrl: 'https://assets.pix.org/badges/Pix_plus_Edu-2-Confirme-certif.svg',
    message: '1 RT certifiable, acquis',
    title: '1 RT certifiable, acquis',
    key: 'SOME_KEY_FOR_RT_702',
    isCertifiable: true,
    isAlwaysVisible: true,
    configBadge: {
      criteria: [
        {
          scope: 'CampaignParticipation',
          threshold: 0,
        },
      ],
    },
  });
  await tooling.targetProfile.createBadge({
    databaseBuilder,
    targetProfileId,
    cappedTubesDTO,
    badgeId: 703,
    altMessage: '1 RT certifiable, acquis',
    imageUrl: 'https://assets.pix.org/badges/Production-de-ressources.svg',
    message: '1 RT certifiable, acquis',
    title: '1 RT certifiable, acquis',
    key: 'SOME_KEY_FOR_RT_703',
    isCertifiable: true,
    isAlwaysVisible: true,
    configBadge: {
      criteria: [
        {
          scope: 'CampaignParticipation',
          threshold: 0,
        },
      ],
    },
  });
  await tooling.targetProfile.createBadge({
    databaseBuilder,
    targetProfileId,
    cappedTubesDTO,
    badgeId: 704,
    altMessage: '1 RT certifiable, acquis',
    imageUrl: 'https://assets.pix.org/badges/ML_navigation.svg',
    message: '1 RT certifiable, acquis',
    title: '1 RT certifiable, acquis',
    key: 'SOME_KEY_FOR_RT_704',
    isCertifiable: true,
    isAlwaysVisible: true,
    configBadge: {
      criteria: [
        {
          scope: 'CampaignParticipation',
          threshold: 0,
        },
      ],
    },
  });
  await tooling.targetProfile.createBadge({
    databaseBuilder,
    targetProfileId,
    cappedTubesDTO,
    badgeId: 705,
    altMessage: '1 RT certifiable, acquis',
    imageUrl: 'https://assets.pix.org/badges/Ma%C3%AEtre%20de%20la%20collaboration.svg',
    message: '1 RT certifiable, acquis',
    title: '1 RT certifiable, acquis',
    key: 'SOME_KEY_FOR_RT_705',
    isCertifiable: true,
    isAlwaysVisible: true,
    configBadge: {
      criteria: [
        {
          scope: 'CampaignParticipation',
          threshold: 0,
        },
      ],
    },
  });
  await tooling.targetProfile.createStages({
    databaseBuilder,
    targetProfileId,
    cappedTubesDTO,
    type: 'LEVEL',
    countStages: 4,
    includeFirstSkill: true,
    customMessage:
      "Vous avez acquis une bonne compréhension des fondamentaux de l’intelligence artificielle. Quelques points restent à améliorer pour renforcer pour mieux utiliser cette nouvelle technologie. Votre score montre une bonne compréhension que vous avez de bonnes pratiques. Avec un peu plus d'entraînement, vous serez prêt à mieux communiquer avec une intelligence artificielle ",
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
    recommendationEngine: true,
  });
}

function createTrainings(databaseBuilder) {
  const inPersonTrainingId = databaseBuilder.factory.buildTraining({
    title: 'Apprendre à manger une chocolatine comme les français',
    internalTitle: 'Apprendre à manger une chocolatine comme les français',
    link: 'https://example.net',
    duration: '00:30:00',
    editorName: 'Pix',
    editorLogoUrl: 'https://assets.pix.org/contenu-formatif/editeur/pix-logo.svg',
    locales: ['fr', 'fr-fr'],
    type: 'in-person-training',
    deliveryMode: Training.modes.ONSITE,
    objectives: [
      'Tenir la chocolatine sans la casser',
      'Savoir la croquer avec élégance, en évitant de faire tomber la garniture',
      'Intégrer la culture française autour de la chocolatine',
    ],
    program:
      'Cette formation intensive alterne théorie et pratique pour maîtriser l’art de déguster une chocolatine. Après une introduction culturelle (chocolatine vs. pain au chocolat, son histoire en France), les participants apprennent la posture idéale, la technique de préhension et la mastication parfaite (sans éclaboussures de chocolat). Un atelier pratique permet de tester ses compétences, suivi d’un quiz final pour valider son niveau de "Françaisitude". À la fin, les participants repartent avec un diplôme (et des miettes sur les doigts). 🥐🇫🇷',
    registrationRequired: true,
  }).id;

  const moduleTrainingId = databaseBuilder.factory.buildTraining({
    title: 'Bac à sable',
    internalTitle: 'Bac à sable',
    link: '/modules/6a68bf32/bac-a-sable',
    duration: '00:25:00',
    editorName: 'Pix',
    editorLogoUrl: 'https://assets.pix.org/contenu-formatif/editeur/pix-logo.svg',
    locales: ['fr-fr'],
    type: 'modulix',
    deliveryMode: Training.modes.REMOTE,
    objectives: ['Non régression fonctionnelle', 'Test de nouvelles modalités'],
    program:
      "<p>Ce module est dédié à des tests internes à Pix.</p><p>Il contient normalement l'intégralité des fonctionnalités disponibles à date.</p>",
    registrationRequired: false,
  }).id;

  const otherModuleTrainingId = databaseBuilder.factory.buildTraining({
    title: 'Ce qu’il faut éviter de dire à une IA générative',
    internalTitle: 'Ce qu’il faut éviter de dire à une IA générative',
    link: '/modules/e71a9bdd/iagenethique',
    duration: '00:10:00',
    editorName: 'Pix',
    editorLogoUrl: 'https://assets.pix.org/contenu-formatif/editeur/pix-logo.svg',
    locales: ['fr-fr'],
    type: 'modulix',
    deliveryMode: Training.modes.HYBRID,
    registrationRequired: false,
    objectives: [
      '<p>Comprendre que les conversations avec les IA génératives sont réutilisées</p>',
      '<p>Savoir rédiger un prompt qui n’inclut pas d’informations personnelles</p>',
      '<p>Connaître les risques du partage de données sensibles avec l’IA générative</p>',
    ],
    program:
      '<p>Quand vous discutez avec un logiciel d’intelligence artificielle (IA) générative, la conversation n’est pas privée.</p><p>Tout ce que vous écrivez peut être enregistré et parfois réutilisé pour améliorer l’IA.</p><p>Dans ce module, vous allez comprendre pourquoi les échanges avec une IA générative ne sont pas totalement privés et quelles informations il vaut mieux éviter d’écrire dans vos instructions (prompts).</p>',
  }).id;

  _addTrainingTriggerAndLinkToTargetProfile(inPersonTrainingId, databaseBuilder);
  _addTrainingTriggerAndLinkToTargetProfile(moduleTrainingId, databaseBuilder);
  _addTrainingTriggerAndLinkToTargetProfile(otherModuleTrainingId, databaseBuilder);
}

function _addTrainingTriggerAndLinkToTargetProfile(trainingId, databaseBuilder) {
  databaseBuilder.factory.buildTargetProfileTraining({
    targetProfileId: TARGET_PROFILE_PIX_ID,
    trainingId: trainingId,
  });

  const frTrainingTriggerId = databaseBuilder.factory.buildTrainingTrigger({
    trainingId: trainingId,
    threshold: 0,
    type: 'prerequisite',
  }).id;

  databaseBuilder.factory.buildTrainingTriggerTube({
    trainingTriggerId: frTrainingTriggerId,
    tubeId: 'tube1NLpOetQhutFlA',
    level: 2,
  });
}
