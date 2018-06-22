const Bookshelf = require('../bookshelf');
const Campaign = require('../../domain/models/Campaign');

require('./user');
require('./organization');

module.exports = Bookshelf.model('Campaign', {

  tableName: 'campaigns',

  toDomainEntity() {
    return new Campaign(this.toJSON());
  }

});
