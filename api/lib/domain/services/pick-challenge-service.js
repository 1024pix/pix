const hashInt = require('hash-int');
const UNEXISTING_ITEM = null;

module.exports = {
  pickChallenge(skills, randomSeed) {
    if (skills.length === 0) {
      return UNEXISTING_ITEM;
    }
    const key = Math.abs(hashInt(randomSeed));
    const chosenSkill = skills[key % skills.length];
    // TODO: Filter on selected language only
    return chosenSkill.challenges[key % chosenSkill.challenges.length];
  }
};
