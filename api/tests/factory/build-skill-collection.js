const buildSkill = require('./build-skill');

module.exports = function BuildSkillCollection({
  name = buildSkill.buildRandomTubeName(),
  minLevel = 3,
  maxLevel = 5,
} = {}) {
  const collection = [];

  for (let i = minLevel; i <= maxLevel; i += 1) {
    collection.push(buildSkill({ name: `${name}${i}` }));
  }

  return collection;
};
