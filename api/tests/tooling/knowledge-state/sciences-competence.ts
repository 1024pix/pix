/**
 * A synthetic competence for the twin scenarios, added to the minimal
 * release: a deep tube with a gap, levels 1 to 7 without the 4, and a tube
 * with a single level. The minimal release has two levels per tube, which
 * leaves the floor, the ceiling and the direct levels of a knowledge state
 * with little to do. Two of the deep levels have a second challenge, so that
 * a skill can be asked again on another challenge.
 */
const AREA_ID = 'recZwplcNbXVlDVlx';
const COMPETENCE_ID = 'recTwinsSciences';
const THEMATIC_ID = 'recTwinsThemSciences';
const PIX_VALUE = 4;

type TubeShape = { id: string; name: string; slug: string; title: string; levels: number[]; twice: number[] };

const tubeShapes: TubeShape[] = [
  {
    id: 'recTwinsTubePlanetes',
    name: 'planètes',
    slug: 'Planetes',
    title: 'Planètes',
    levels: [1, 2, 3, 5, 6, 7],
    twice: [3, 6],
  },
  { id: 'recTwinsTubeElements', name: 'éléments', slug: 'Elements', title: 'Éléments', levels: [4], twice: [] },
];

const skillId = (tube: TubeShape, level: number) => `recTwins${tube.slug}${level}`;

const buildSkill = (tube: TubeShape, level: number) => ({
  id: skillId(tube, level),
  name: `${tube.name}${level}`,
  hintStatus: null,
  tutorialIds: [],
  learningMoreTutorialIds: [],
  pixValue: PIX_VALUE,
  competenceId: COMPETENCE_ID,
  status: 'actif',
  tubeId: tube.id,
  version: null,
  level,
  hint_i18n: { fr: null, en: null },
});

const buildChallenge = (tube: TubeShape, level: number, variant: number) => ({
  id: `recTwinsChal${tube.slug}${level}${variant === 0 ? '' : `v${variant}`}`,
  instruction: `Épreuve ${variant + 1} de niveau ${level} sur les ${tube.name}`,
  proposals: '- Oui\n- Non',
  type: 'QCU',
  solution: '1',
  solutionToDisplay: '',
  t1Status: false,
  t2Status: false,
  t3Status: false,
  status: 'validé',
  skillId: skillId(tube, level),
  embedUrl: null,
  embedTitle: '',
  embedHeight: 500,
  timer: null,
  competenceId: COMPETENCE_ID,
  format: 'mots',
  autoReply: false,
  locales: ['fr', 'fr-fr'],
  alternativeInstruction: '',
  focusable: false,
  genealogy: variant === 0 ? 'Prototype 1' : `Décliné ${variant}`,
  responsive: null,
  illustrationAlt: null,
  illustrationUrl: null,
  shuffled: false,
  alternativeVersion: null,
  accessibility1: null,
  accessibility2: null,
  requireGafamWebsiteAccess: false,
  isIncompatibleIpadCertif: false,
  deafAndHardOfHearing: 'RAS',
  isAwarenessChallenge: false,
  toRephrase: false,
  hasEmbedInternalValidation: false,
  noValidationNeeded: false,
});

const buildTube = (tube: TubeShape) => ({
  id: tube.id,
  name: tube.name,
  practicalTitle_i18n: { fr: tube.title, en: tube.title },
  practicalDescription_i18n: { fr: null, en: null },
  competenceId: COMPETENCE_ID,
  isMobileCompliant: false,
  isTabletCompliant: false,
  thematicId: THEMATIC_ID,
  skillIds: tube.levels.map((level) => skillId(tube, level)),
});

const tubes = tubeShapes.map(buildTube);
const skills = tubeShapes.flatMap((tube) => tube.levels.map((level) => buildSkill(tube, level)));
const challenges = tubeShapes.flatMap((tube) =>
  tube.levels.flatMap((level) =>
    tube.twice.includes(level)
      ? [buildChallenge(tube, level, 0), buildChallenge(tube, level, 1)]
      : [buildChallenge(tube, level, 0)],
  ),
);

const competence = {
  id: COMPETENCE_ID,
  index: '2.3',
  areaId: AREA_ID,
  skillIds: skills.map(({ id }) => id),
  thematicIds: [THEMATIC_ID],
  origin: 'Pix',
  name_i18n: { fr: 'Sciences', en: 'Sciences' },
  description_i18n: { fr: null, en: null },
};

const thematic = {
  id: THEMATIC_ID,
  name_i18n: { fr: 'Test sciences', en: null },
  index: null,
  competenceId: COMPETENCE_ID,
  tubeIds: tubes.map(({ id }) => id),
};

type Release = {
  areas: { id: string; competenceIds: string[] }[];
  competences: unknown[];
  thematics: unknown[];
  tubes: unknown[];
  skills: unknown[];
  challenges: unknown[];
};

/** The release with the sciences competence in its second area. */
export const withSciencesCompetence = <R extends Release>(release: R): R => ({
  ...release,
  areas: release.areas.map((area) =>
    area.id === AREA_ID ? { ...area, competenceIds: [...area.competenceIds, COMPETENCE_ID] } : area,
  ),
  competences: [...release.competences, competence],
  thematics: [...release.thematics, thematic],
  tubes: [...release.tubes, ...tubes],
  skills: [...release.skills, ...skills],
  challenges: [...release.challenges, ...challenges],
});
