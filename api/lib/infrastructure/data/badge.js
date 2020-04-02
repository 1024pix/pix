const Bookshelf = require('../bookshelf');

require('./badge-partner-competence');
require('./target-profile');

module.exports = Bookshelf.model('Badge', {

  tableName: 'badges',

  badgePartnerCompetences() {
    return this.hasMany('BadgePartnerCompetence', 'badgeId');
  },

});
