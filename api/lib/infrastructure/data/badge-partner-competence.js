const Bookshelf = require('../bookshelf');

require('./badge');

module.exports = Bookshelf.model('BadgePartnerCompetence', {
  tableName: 'badge-partner-competences',

  badge() {
    return this.belongsTo('Badge');
  },
});
