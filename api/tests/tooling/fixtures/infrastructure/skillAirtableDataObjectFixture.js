const { DEFAULT_TUTORIAL_ID, DEFAULT_PIX_VALUE, DEFAULT_NAME, DEFAULT_LEARNING_TUTORIAL_IDS, DEFAULT_COMPETENCE_ID, DEFAULT_STATUS, DEFAULT_HINT_STATUS, DEFAULT_ID, DEFAULT_HINT_FR_FR, DEFAULT_HINT_EN_US, DEFAULT_TUBE_ID }  = require('./skillRawAirTableFixture');

module.exports = function SkillAirtableDataObjectFixture({
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
