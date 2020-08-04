const { DEFAULT_TUTORIAL_ID, DEFAULT_PIX_VALUE, DEFAULT_NAME, DEFAULT_LEARNING_TUTORIAL_IDS, DEFAULT_COMPETENCE_ID, DEFAULT_STATUS, DEFAULT_HINT_STATUS, DEFAULT_ID, DEFAULT_HINT, DEFAULT_HINT_FRFR, DEFAULT_HINT_ENUS, DEFAULT_TUBE_ID }  = require('./skillRawAirTableFixture');

module.exports = function SkillAirtableDataObjectFixture({
  id = DEFAULT_ID,
  name = DEFAULT_NAME,
  hint = DEFAULT_HINT,
  hintEnUs = DEFAULT_HINT_ENUS,
  hintFrFr = DEFAULT_HINT_FRFR,
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
    hint,
    hintEnUs,
    hintFrFr,
    hintStatus,
    tutorialIds,
    learningMoreTutorialIds,
    competenceId,
    pixValue,
    status,
    tubeId,
  };
};
