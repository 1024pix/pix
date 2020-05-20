const Bookshelf = require('../bookshelf');

require('./badge-criterion');
require('./badge-partner-competence');
require('./target-profile');

module.exports = Bookshelf.model('Badge', {

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
});
