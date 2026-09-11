import { PRO_ORGANIZATION_ID } from '../common/constants.js';

/**
 * POC: a combined course whose items are combined courses.
 *
 * Target scenario, self-contained (it shares nothing with the other combined course
 * fixtures): three themed children, each a diagnosis followed by a personalised program
 * of recommended modules, then a final assessment covering the three themes, and an
 * attestation delivered by the PARENT when half of the assessed subjects are mastered.
 *
 * Everything sits in the PRO organization: a participation is indexed by
 * organizationLearnerId, so a parent could never see a child's participation across
 * organizations.
 */

const ILLUSTRATION = 'https://assets.pix.org/combined-courses/picto-nr-parcours.png';

const PARENT = {
  code: 'IAPARCOUR',
  name: "Culture de l'IA",
  description:
    "Trois parcours pour comprendre l'intelligence artificielle, puis un bilan qui reprend les trois thématiques. Chaque étape est un parcours complet : une évaluation, puis les modules que vos résultats recommandent.",
  rewardRequirementsDescription:
    'Terminez les trois thématiques, puis maîtrisez la moitié des sujets évalués par le bilan.',
};

const BILAN = {
  campaignCode: 'BILANIA1',
  name: "Bilan : culture de l'IA",
  targetProfileName: "Bilan culture de l'IA",
};

// Real tubes, skills and Modulix modules from the learning content. Each module is
// backed by a training whose trigger recommends it whatever the score, so the learner
// always ends up with a personalised program of two to three modules — which is what
// the feature looks like in the end.
const THEMES = [
  {
    combinedCourseCode: 'IADECOUV',
    name: "L'IA, comment ça marche ?",
    description:
      'Une évaluation pour situer vos connaissances, puis les modules recommandés pour comprendre ce qui se cache derrière le mot « IA ».',
    campaignCode: 'DIAGIA1',
    campaignName: "Diagnostic : les généralités de l'IA",
    tube: { id: 'tube1khBbCQ6l3h0nO', level: 2 },
    skillIds: ['skillSrz72rrZ1svW7', 'skill2mTsL9gpMLkBFH'],
    modules: [
      { id: '40ab5711-4025-4052-a269-00fd0448d60a', link: '/modules/cc0cbab7/ia-dit-ia', title: 'IA, vous avez dit IA ?' },
      {
        id: 'd03cef94-74af-463d-8901-c886b48d6e0b',
        link: '/modules/76961c86/ia-fonctionnement-ind',
        title: "Comment l'IA générative apprend-elle à discuter avec vous ?",
      },
      {
        id: '01151659-77c1-41cc-8724-89091357af3d',
        link: '/modules/e67ec5d0/chatgpt-vraiment-neutre',
        title: 'ChatGPT est-il vraiment neutre ?',
      },
    ],
  },
  {
    combinedCourseCode: 'IADROIT',
    name: "IA et droit d'auteur",
    description:
      'Une évaluation pour situer vos connaissances, puis les modules recommandés sur ce que vous pouvez créer et diffuser avec une IA générative.',
    campaignCode: 'DIAGIA2',
    campaignName: "Diagnostic : IA et droit d'auteur",
    tube: { id: 'tube1Dv6ySGMHKX8it', level: 3 },
    skillIds: ['skill1yZMIdN77l5SbL', 'skill12U1iI3iKGHOJ1'],
    modules: [
      {
        id: 'eb919a5a-23e2-4d9f-92a7-12b3265874ba',
        link: '/modules/df76d3d5/ia-droit-auteur-creer-diffuser',
        title: "IA générative et droit d'auteur : créer et diffuser",
      },
      {
        id: '109a3efd-96b3-4c69-8b3b-e8a8efd32688',
        link: '/modules/b1938302/ia-droit-auteur-proteger',
        title: "IA générative et droits d'auteur : comprendre les enjeux",
      },
    ],
  },
  {
    combinedCourseCode: 'IAENVIRO',
    name: 'IA et impact environnemental',
    description:
      'Une évaluation pour situer vos connaissances, puis les modules recommandés sur ce que consomme réellement une IA générative.',
    campaignCode: 'DIAGIA3',
    campaignName: "Diagnostic : l'impact environnemental de l'IA",
    tube: { id: 'tube2e8oftoVpKncEm', level: 4 },
    skillIds: ['skill2Hvro2sD8LgfoS', 'skill2frakfSQIDgGS5'],
    modules: [
      {
        id: '1137b471-e347-4601-abd7-bc82ce587d7e',
        link: '/modules/f4a3d9ed/ia-gen-impact-ava',
        title: "Les IA génératives : quels impacts sur l'environnement ?",
      },
      {
        id: '05ff418a-3329-44bf-9094-14014301df3c',
        link: '/modules/da86e4a7/centre-de-donnee-novice',
        title: "L'impact caché de nos usages numériques en ligne",
      },
      {
        id: '7ee3ef2d-b29d-4029-86cf-f88ceb4ddea2',
        link: '/modules/e89cf72c/centre-de-donnees-mieux-faire',
        title: 'Centres de données : peut-on mieux faire ?',
      },
    ],
  },
];

const MASTERY_THRESHOLD = 50;

function campaignParticipationRequirement(campaignId) {
  return {
    requirement_type: 'campaignParticipations',
    comparison: 'all',
    data: {
      campaignId: { data: campaignId, comparison: 'equal' },
      status: { data: 'SHARED', comparison: 'equal' },
    },
  };
}

function passageRequirement(moduleId) {
  return {
    requirement_type: 'passages',
    comparison: 'all',
    data: {
      moduleId: { data: moduleId, comparison: 'equal' },
      isTerminated: { data: true, comparison: 'equal' },
    },
  };
}

function combinedCourseRequirement(combinedCourseId) {
  return {
    requirement_type: 'combinedCourses',
    comparison: 'all',
    data: {
      combinedCourseId: { data: combinedCourseId, comparison: 'equal' },
      status: { data: 'COMPLETED', comparison: 'equal' },
    },
  };
}

function cappedTubesRequirement(cappedTubes) {
  return {
    requirement_type: 'cappedTubes',
    data: {
      cappedTubes,
      threshold: MASTERY_THRESHOLD,
      name: "Sujets de la culture de l'IA",
    },
  };
}

function buildThemedChild(databaseBuilder, theme) {
  const {
    buildCampaign,
    buildCampaignSkill,
    buildCombinedCourse,
    buildCombinedCourseBlueprint,
    buildQuestForCombinedCourse,
    buildTargetProfile,
    buildTargetProfileTraining,
    buildTargetProfileTube,
    buildTraining,
    buildTrainingTrigger,
    buildTrainingTriggerTube,
  } = databaseBuilder.factory;

  const { id: targetProfileId } = buildTargetProfile({
    name: theme.name,
    description: `Sujets de la thématique « ${theme.name} »`,
  });
  buildTargetProfileTube({ targetProfileId, tubeId: theme.tube.id, level: theme.tube.level });

  const { id: campaignId } = buildCampaign({
    targetProfileId,
    organizationId: PRO_ORGANIZATION_ID,
    name: theme.campaignName,
    title: 'Évaluation de vos connaissances',
    code: theme.campaignCode,
    customResultPageButtonText: 'Continuer',
    // the end of a diagnosis leads back to the PARENT, through the page that stands for
    // the computation of the personalised program
    customResultPageButtonUrl: `/parcours/${PARENT.code}/chargement`,
  });
  theme.skillIds.forEach((skillId) => buildCampaignSkill({ campaignId, skillId }));

  // A modulix training per module makes it recommendable: before the diagnosis the
  // child announces « Programme personnalisé de modules », and after it the recommended
  // modules show up as activities. The trigger recommends whatever the score, so the
  // demo behaves the same in every result bracket.
  theme.modules.forEach((module) => {
    const { id: trainingId } = buildTraining({
      title: module.title,
      internalTitle: module.title,
      link: module.link,
      type: 'modulix',
      duration: '0 years 0 mons 0 days 0 hours 10 mins 0.0 secs',
      locales: ['fr', 'fr-fr'],
      editorName: 'Pix',
      editorLogoUrl: 'https://assets.pix.org/modules/placeholder-details.svg',
      isDisabled: false,
    });
    const { id: trainingTriggerId } = buildTrainingTrigger({ trainingId, threshold: 0, type: 'prerequisite' });
    buildTrainingTriggerTube({ trainingTriggerId, tubeId: theme.tube.id, level: theme.tube.level });
    buildTargetProfileTraining({ targetProfileId, trainingId });
  });

  const successRequirements = [
    campaignParticipationRequirement(campaignId),
    ...theme.modules.map((module) => passageRequirement(module.id)),
  ];

  const { id: blueprintQuestId } = buildQuestForCombinedCourse({ successRequirements });
  const { id: combinedCourseBlueprintId } = buildCombinedCourseBlueprint({
    name: theme.name,
    internalName: theme.name,
    description: theme.description,
    illustration: ILLUSTRATION,
    questId: blueprintQuestId,
  });

  const { id: questId } = buildQuestForCombinedCourse({ successRequirements });
  const { id: combinedCourseId } = buildCombinedCourse({
    code: theme.combinedCourseCode,
    name: theme.name,
    organizationId: PRO_ORGANIZATION_ID,
    description: theme.description,
    illustration: ILLUSTRATION,
    combinedCourseBlueprintId,
    questId,
  });

  return combinedCourseId;
}

export const buildNestedCombinedCourse = (databaseBuilder) => {
  const {
    buildAttestation,
    buildCampaign,
    buildCampaignSkill,
    buildCombinedCourse,
    buildCombinedCourseBlueprint,
    buildQuestForCombinedCourse,
    buildTargetProfile,
    buildTargetProfileTube,
  } = databaseBuilder.factory;

  const childCombinedCourseIds = THEMES.map((theme) => buildThemedChild(databaseBuilder, theme));

  // The final assessment covers the three themes at once, so the mastery requirement
  // below is computed on the very subjects it evaluates.
  const { id: bilanTargetProfileId } = buildTargetProfile({
    name: BILAN.targetProfileName,
    description: "Les trois thématiques de la culture de l'IA",
  });
  THEMES.forEach((theme) =>
    buildTargetProfileTube({
      targetProfileId: bilanTargetProfileId,
      tubeId: theme.tube.id,
      level: theme.tube.level,
    }),
  );

  const { id: bilanCampaignId } = buildCampaign({
    targetProfileId: bilanTargetProfileId,
    organizationId: PRO_ORGANIZATION_ID,
    name: BILAN.name,
    title: BILAN.name,
    code: BILAN.campaignCode,
    customResultPageButtonText: 'Continuer',
    customResultPageButtonUrl: `/parcours/${PARENT.code}`,
  });
  THEMES.flatMap((theme) => theme.skillIds).forEach((skillId) =>
    buildCampaignSkill({ campaignId: bilanCampaignId, skillId }),
  );

  const { id: rewardId } = buildAttestation({
    key: 'POCIACULTURE',
    label: "Culture de l'IA",
    templateName: 'poc-ia-culture-attestation-template',
  });

  const successRequirements = [
    ...childCombinedCourseIds.map(combinedCourseRequirement),
    campaignParticipationRequirement(bilanCampaignId),
    cappedTubesRequirement(THEMES.map((theme) => ({ tubeId: theme.tube.id, level: theme.tube.level }))),
  ];

  const { id: blueprintQuestId } = buildQuestForCombinedCourse({
    successRequirements,
    rewardType: 'attestations',
    rewardId,
  });
  const { id: combinedCourseBlueprintId } = buildCombinedCourseBlueprint({
    name: PARENT.name,
    internalName: PARENT.name,
    description: PARENT.description,
    illustration: ILLUSTRATION,
    questId: blueprintQuestId,
    rewardRequirementsDescription: PARENT.rewardRequirementsDescription,
  });

  const { id: questId } = buildQuestForCombinedCourse({
    successRequirements,
    rewardType: 'attestations',
    rewardId,
  });

  buildCombinedCourse({
    code: PARENT.code,
    name: PARENT.name,
    organizationId: PRO_ORGANIZATION_ID,
    description: PARENT.description,
    illustration: ILLUSTRATION,
    combinedCourseBlueprintId,
    questId,
  });
};
