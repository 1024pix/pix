const { DEFAULT_TUTORIAL_ID, DEFAULT_PIX_VALUE, DEFAULT_NAME, DEFAULT_COMPETENCE_ID, DEFAULT_HINT_STATUS, DEFAULT_ID, DEFAULT_HINT, DEFAULT_TUBE_ID }  = require('../../fixtures/infrastructure/skillRawAirTableFixture');

module.exports = function({
  id = DEFAULT_ID,
  name = DEFAULT_NAME,
  hint = DEFAULT_HINT,
  hintStatus = DEFAULT_HINT_STATUS,
  tutorialIds = [DEFAULT_TUTORIAL_ID],
  competenceId = DEFAULT_COMPETENCE_ID,
  pixValue = DEFAULT_PIX_VALUE,
  tubeId = DEFAULT_TUBE_ID,
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
  };
};
