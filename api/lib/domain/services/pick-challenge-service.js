const hashInt = require('hash-int');
const UNEXISTING_ITEM = null;

module.exports = {
  // TODO: add locale argument (with default to 'fr-fr'?)
  pickChallenge(skills, randomSeed) {
    if (skills.length === 0) {
      return UNEXISTING_ITEM;
    }
    const key = Math.abs(hashInt(randomSeed));
    const chosenSkill = skills[key % skills.length];
    // TODO: filter challenges to get only locale compliant ones
    return chosenSkill.challenges[key % chosenSkill.challenges.length];
  }
};
