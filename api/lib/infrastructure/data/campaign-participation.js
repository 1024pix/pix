const Bookshelf = require('../bookshelf');

require('./assessment');
require('./campaign');

module.exports = Bookshelf.model('CampaignParticipation', {

  tableName: 'campaign-participations',

});
