const Bookshelf = require('../bookshelf');

require('./badge-partner-competence-view-model');
require('./target-profile');

module.exports = Bookshelf.model('EndOfParticipationBadgeViewModel', {

  tableName: 'badges',

  badgePartnerCompetences() {
    return this.hasMany('BadgePartnerCompetenceViewModel', 'badgeId');
  },
});
