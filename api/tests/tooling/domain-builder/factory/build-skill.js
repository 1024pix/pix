import Skill from '../../../../lib/domain/models/Skill';

const buildSkill = function buildSkill({
  id = 'recSK123',
  name = '@sau6',
  pixValue = 3,
  competenceId = 'recCOMP123',
  tutorialIds = [],
  learningMoreTutorialIds = [],
  tubeId = 'recTUB123',
  version = 1,
  difficulty = 6,
} = {}) {
  return new Skill({
    id,
    name,
    pixValue,
    competenceId,
    tutorialIds,
    learningMoreTutorialIds,
    tubeId,
    version,
    difficulty,
  });
};

buildSkill.buildRandomTubeName = buildRandomTubeName;
export default buildSkill;

/**
 * A tube name starts by a @ and contains between 3 and 15 other letters
 * @returns {generatedRandomTubeName}
 */
function buildRandomTubeName() {
  const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const MAX_TUBE_NAME_LENGHT = 15;
  const MIN_TUBE_NAME_LENGHT = 3;

  function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
  }

  let generatedTubeName = '@';
  const tubeNameLength = getRandomInt(MIN_TUBE_NAME_LENGHT, MAX_TUBE_NAME_LENGHT);

  for (let index = 0; index < tubeNameLength; index++) {
    generatedTubeName += LETTERS.charAt(Math.floor(Math.random() * LETTERS.length));
  }

  return generatedTubeName;
}
