const Bookshelf = require('../bookshelf');

require('./Badge');

const modelName = 'BadgePartnerCompetence';

module.exports = Bookshelf.model(modelName, {

  tableName: 'badge-partner-competences',

  badge() {
    return this.belongsTo('Badge');
  },

}, {
  modelName,
});
