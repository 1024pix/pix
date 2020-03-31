const faker = require('faker');
const Skill = require('../../../../lib/domain/models/Skill');

const buildSkill = function buildSkill({
  id = `rec${faker.random.uuid()}`,
  name = `${buildRandomTubeName()}${faker.random.number(8)}`,
  pixValue = faker.random.number(4),
  competenceId = `rec${faker.random.uuid()}`,
  tutorialIds = [],
  tubeId = `rec${faker.random.uuid()}`,
} = {}) {
  return new Skill({
    id,
    name,
    pixValue,
    competenceId,
    tutorialIds,
    tubeId,
  });
};

buildSkill.buildRandomTubeName = buildRandomTubeName;
module.exports = buildSkill;

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
