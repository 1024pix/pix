const DEFAULT_ID = 'recSK0X22abcdefgh',
  DEFAULT_HINT = 'Peut-on géo-localiser un lapin sur la banquise ?',
  DEFAULT_HINT_STATUS = 'Validé',
  DEFAULT_NAME = '@accesDonnées1',
  DEFAULT_TUTORIAL_ID = 'recCO0X22abcdefgh',
  DEFAULT_COMPETENCE_ID = 'recCT0X22abcdefgh',
  DEFAULT_PIX_VALUE = 2.4,
  DEFAULT_TUBE_ID = 'recTU0X22abcdefgh',
  DEFAULT_VERSION = 1,
  DEFAULT_LEVEL = 1;

export default function ({
  id = DEFAULT_ID,
  name = DEFAULT_NAME,
  hint = DEFAULT_HINT,
  hintStatus = DEFAULT_HINT_STATUS,
  tutorialIds = [DEFAULT_TUTORIAL_ID],
  competenceId = DEFAULT_COMPETENCE_ID,
  pixValue = DEFAULT_PIX_VALUE,
  tubeId = DEFAULT_TUBE_ID,
  version = DEFAULT_VERSION,
  level = DEFAULT_LEVEL,
} = {}) {
  return {
    id,
    name,
    hint,
    hintStatus,
    tutorialIds,
    pixValue,
    competenceId,
    tubeId,
    version,
    level,
  };
}
