const Bookshelf = require('../bookshelf.js');

require('./BadgeCriterion.js');
require('./SkillSet.js');
require('./TargetProfile.js');

const modelName = 'Badge';

module.exports = Bookshelf.model(
  modelName,
  {
    tableName: 'badges',

    targetProfile() {
      return this.belongsTo('TargetProfile', 'targetProfileId');
    },

    badgeCriteria() {
      return this.hasMany('BadgeCriterion', 'badgeId');
    },

    skillSets() {
      return this.hasMany('SkillSet', 'badgeId');
    },
  },
  {
    modelName,
  }
);
