const Bookshelf = require('../bookshelf');

require('./assessment');

module.exports = Bookshelf.model('Skill', {
  tableName: 'skills',

  assessment() {
    return this.belongsTo('Assessment');
  }
});
