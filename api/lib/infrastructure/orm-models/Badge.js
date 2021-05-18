const Bookshelf = require('../bookshelf');

require('./BadgeCriterion');
require('./BadgePartnerCompetence');
require('./TargetProfile');

const modelName = 'Badge';

module.exports = Bookshelf.model(modelName, {

  tableName: 'badges',

  targetProfile() {
    return this.belongsTo('TargetProfile', 'targetProfileId');
  },

  badgeCriteria() {
    return this.hasMany('BadgeCriterion', 'badgeId');
  },

  badgePartnerCompetences() {
    return this.hasMany('BadgePartnerCompetence', 'badgeId');
  },

}, {
  modelName,
});
