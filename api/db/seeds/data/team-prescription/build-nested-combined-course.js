import { PRO_ORGANIZATION_ID } from '../common/constants.js';

/**
 * POC: a combined course whose items are combined courses.
 *
 * Target scenario, self-contained (it shares nothing with the other combined course
 * fixtures): three themed children, each a diagnosis plus a module, then a final
 * assessment covering the three themes, and an attestation delivered by the PARENT
 * when half of the assessed subjects are mastered.
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
    "Trois parcours pour comprendre l'intelligence artificielle, puis un bilan qui reprend les trois thématiques. Chaque étape est un parcours complet, avec son évaluation et son module.",
  rewardRequirementsDescription:
    'Terminez les trois thématiques, puis maîtrisez la moitié des sujets évalués par le bilan.',
};

const BILAN = {
  campaignCode: 'BILANIA1',
  name: "Bilan : culture de l'IA",
  targetProfileName: "Bilan culture de l'IA",
};

// Real tubes and skills from the learning content. The modules are the DEMO ones on
// purpose: every real content module carries interactive activities (custom, qab,
// qcu-*) that cannot be walked through without answering, and runs 13 to 17 grains,
// which makes the chain undemoable in a meeting. Only two such demo modules exist, so
// the third theme is a diagnosis on its own — which also shows that children need not
// share the same composition. Giving it a real module is one line:
// ia-fonctionnement-ind is d03cef94-74af-463d-8901-c886b48d6e0b.
const THEMES = [
  {
    combinedCourseCode: 'IADECOUV',
    name: "L'IA, comment ça marche ?",
    description: "Une évaluation pour situer vos connaissances, puis un module pour comprendre ce qui se cache derrière le mot « IA ».",
    campaignCode: 'DIAGIA1',
    campaignName: "Diagnostic : les généralités de l'IA",
    tube: { id: 'tube1khBbCQ6l3h0nO', level: 2 },
    skillIds: ['skillSrz72rrZ1svW7', 'skill2mTsL9gpMLkBFH'],
    moduleId: 'eeeb4951-6f38-4467-a4ba-0c85ed71321a', // demo-combinix-1
  },
  {
    combinedCourseCode: 'IADROIT',
    name: "IA et droit d'auteur",
    description: "Une évaluation pour situer vos connaissances, puis un module sur ce que vous pouvez créer et diffuser avec une IA générative.",
    campaignCode: 'DIAGIA2',
    campaignName: "Diagnostic : IA et droit d'auteur",
    tube: { id: 'tube1Dv6ySGMHKX8it', level: 3 },
    skillIds: ['skill1yZMIdN77l5SbL', 'skill12U1iI3iKGHOJ1'],
    moduleId: 'f32a2238-4f65-4698-b486-15d51935d335', // demo-combinix-2
  },
  {
    combinedCourseCode: 'IAENVIRO',
    name: 'IA et impact environnemental',
    description: 'Une évaluation pour situer vos connaissances, puis un module sur ce que consomme réellement une IA générative.',
    campaignCode: 'DIAGIA3',
    campaignName: "Diagnostic : l'impact environnemental de l'IA",
    tube: { id: 'tube2e8oftoVpKncEm', level: 4 },
    skillIds: ['skill2Hvro2sD8LgfoS', 'skill2frakfSQIDgGS5'],
    moduleId: null,
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
    buildTargetProfileTube,
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
    customResultPageButtonUrl: `/parcours/${theme.combinedCourseCode}`,
  });
  theme.skillIds.forEach((skillId) => buildCampaignSkill({ campaignId, skillId }));

  // No training attached: the module is a plain item, never a recommendation,
  // so the demo runs the same way whatever the diagnosis score.
  const successRequirements = [campaignParticipationRequirement(campaignId)];
  if (theme.moduleId) {
    successRequirements.push(passageRequirement(theme.moduleId));
  }

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
