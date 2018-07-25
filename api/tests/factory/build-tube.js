const Tube = require('../../lib/domain/models/Tube');

const buildSkillCollection = require('./build-skill-collection');

module.exports = function buildTube({
  skills = buildSkillCollection(),
} = {}) {

  return new Tube({ skills });
};
