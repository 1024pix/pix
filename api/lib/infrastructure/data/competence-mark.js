const Bookshelf = require('../bookshelf');

require('./correction');

module.exports = Bookshelf.model('CompetenceMark', {

  tableName: 'competence-marks',

  correction() {
    return this.belongsTo('Corrections');
  }
});
