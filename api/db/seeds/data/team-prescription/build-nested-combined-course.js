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

// Real tubes, skills and Modulix modules from the learning content.
//
// Each module is backed by a modulix training whose trigger depends on the diagnosis
// score, exactly as the feature works: a `goal` trigger recommends below its threshold,
// a `prerequisite` one above it. So a learner always ends up with a personalised program
// of two modules per theme — a different pair in the 0-49 % and 50-100 % brackets.
const LOW_BRACKET = 'low';
const HIGH_BRACKET = 'high';

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
      {
        bracket: LOW_BRACKET,
        id: '40ab5711-4025-4052-a269-00fd0448d60a',
        link: '/modules/cc0cbab7/ia-dit-ia',
        title: 'IA, vous avez dit IA ?',
      },
      {
        bracket: LOW_BRACKET,
        id: '71618929-fcc9-415e-a3f3-9582545d7a78',
        link: '/modules/797ea8fb/ia-fonctionnement-debut',
        title: 'Comment font les IA génératives pour répondre à nos demandes ?',
      },
      {
        bracket: HIGH_BRACKET,
        id: 'd03cef94-74af-463d-8901-c886b48d6e0b',
        link: '/modules/76961c86/ia-fonctionnement-ind',
        title: "Comment l'IA générative apprend-elle à discuter avec vous ?",
      },
      {
        bracket: HIGH_BRACKET,
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
        bracket: LOW_BRACKET,
        id: 'eb919a5a-23e2-4d9f-92a7-12b3265874ba',
        link: '/modules/df76d3d5/ia-droit-auteur-creer-diffuser',
        title: "IA générative et droit d'auteur : créer et diffuser",
      },
      {
        bracket: LOW_BRACKET,
        id: 'c8607621-09ab-4601-be7d-68ed9c914c30',
        link: '/modules/9be9cfae/ia-hallu',
        title: 'Elles hallucinent, ces IA génératives !',
      },
      {
        bracket: HIGH_BRACKET,
        id: '109a3efd-96b3-4c69-8b3b-e8a8efd32688',
        link: '/modules/b1938302/ia-droit-auteur-proteger',
        title: "IA générative et droits d'auteur : comprendre les enjeux",
      },
      {
        bracket: HIGH_BRACKET,
        id: '8aa17e6d-3470-479d-838d-ff6923de6686',
        link: '/modules/05b24fee/ia-deepfakes',
        title: 'Les deepfakes : c’est quoi ?',
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
        bracket: LOW_BRACKET,
        id: '1137b471-e347-4601-abd7-bc82ce587d7e',
        link: '/modules/f4a3d9ed/ia-gen-impact-ava',
        title: "Les IA génératives : quels impacts sur l'environnement ?",
      },
      {
        bracket: LOW_BRACKET,
        id: '05ff418a-3329-44bf-9094-14014301df3c',
        link: '/modules/da86e4a7/centre-de-donnee-novice',
        title: "L'impact caché de nos usages numériques en ligne",
      },
      {
        bracket: HIGH_BRACKET,
        id: '7ee3ef2d-b29d-4029-86cf-f88ceb4ddea2',
        link: '/modules/e89cf72c/centre-de-donnees-mieux-faire',
        title: 'Centres de données : peut-on mieux faire ?',
      },
      {
        bracket: HIGH_BRACKET,
        id: '17592ba2-c3ed-4273-88fa-a3715067e875',
        link: '/modules/80f5e3b1/effets-environnementaux-indirects',
        title: 'Les effets environnementaux indirects du numérique',
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

  // Before the diagnosis the child announces « Programme personnalisé de modules »;
  // after it, the modules of the learner's bracket show up as activities.
  theme.modules.forEach((module) => {
    const trigger =
      module.bracket === LOW_BRACKET
        ? { type: 'goal', threshold: 49 }
        : { type: 'prerequisite', threshold: 50 };
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
    const { id: trainingTriggerId } = buildTrainingTrigger({
      trainingId,
      threshold: trigger.threshold,
      type: trigger.type,
    });
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
    // POC : le PDF est généré depuis un template stocké sur S3. Aucun template propre au
    // POC n'existe, donc on réutilise celui des attestations 6e — le visuel parle de 6e,
    // mais le téléchargement aboutit partout où les seeds standard fonctionnent.
    templateName: 'sixth-grade-attestation-template',
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
