const buildCatChallenge = require('./build-cat-challenge');
const buildCatTube = require('./build-cat-tube');
const CatCourse = require('../../lib/cat/course');

module.exports = function buildCatCourse({
  challenges = [buildCatChallenge()],
  competenceSkills = buildCatTube(),
} = {}) {
  return new CatCourse(challenges, competenceSkills);
};
