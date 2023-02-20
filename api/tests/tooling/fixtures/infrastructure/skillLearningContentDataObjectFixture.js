const ACTIVE_STATUS = 'actif';

const DEFAULT_ID = 'recSK0X22abcdefgh',
  DEFAULT_HINT_FR_FR = 'Peut-on géo-localiser un lapin sur la banquise ?',
  DEFAULT_HINT_EN_US = 'Can we geo-locate a rabbit on the ice floe?',
  DEFAULT_HINT_STATUS = 'Validé',
  DEFAULT_NAME = '@accesDonnées1',
  DEFAULT_TUTORIAL_ID = 'recCO0X22abcdefgh',
  DEFAULT_LEARNING_TUTORIAL_IDS = ['recSP0X22abcdefgh', 'recSP0X23abcdefgh'],
  DEFAULT_COMPETENCE_ID = 'recCT0X22abcdefgh',
  DEFAULT_STATUS = ACTIVE_STATUS,
  DEFAULT_PIX_VALUE = 2.4,
  DEFAULT_TUBE_ID = 'recTU0X22abcdefgh';

export default function SkillLearningContentDataObjectFixture({
  id = DEFAULT_ID,
  name = DEFAULT_NAME,
  hintEnUs = DEFAULT_HINT_EN_US,
  hintFrFr = DEFAULT_HINT_FR_FR,
  hintStatus = DEFAULT_HINT_STATUS,
  tutorialIds = [DEFAULT_TUTORIAL_ID],
  learningMoreTutorialIds = DEFAULT_LEARNING_TUTORIAL_IDS,
  competenceId = DEFAULT_COMPETENCE_ID,
  pixValue = DEFAULT_PIX_VALUE,
  status = DEFAULT_STATUS,
  tubeId = DEFAULT_TUBE_ID,
} = {}) {
  return {
    id,
    name,
    hint_i18n: {
      en: hintEnUs,
      fr: hintFrFr,
    },
    hintStatus,
    tutorialIds,
    learningMoreTutorialIds,
    competenceId,
    pixValue,
    status,
    tubeId,
  };
}
