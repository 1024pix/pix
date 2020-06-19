const Bookshelf = require('../bookshelf');

require('./badge-criterion');
require('./badge-partner-competence');
require('./target-profile');

const modelName = 'Badge';

module.exports = Bookshelf.model(modelName, {

  tableName: 'badges',
  requireFetch: false,

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
  modelName
});
