const Bookshelf = require('../bookshelf');

require('./end-of-participation-badge-view-model');

module.exports = Bookshelf.model('BadgePartnerCompetenceViewModel', {
  tableName: 'badge-partner-competences',

  badge() {
    return this.belongsTo('EndOfParticipationBadgeViewModel');
  },
});
