const buildSkill = require('./build-skill');

module.exports = function BuildSkillCollection({
  name = buildSkill.buildRandomTubeName(),
  minLevel = 3,
  maxLevel = 5,
} = {}) {
  const collection = [];

  for (let i = minLevel; i <= maxLevel; ++i) {
    collection.push(buildSkill({ id: `rec${name}${i}`, name: `${name}${i}`, difficulty: i }));
  }

  return collection;
};
