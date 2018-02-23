const Bookshelf = require('../bookshelf');

require('./assessment');

module.exports = Bookshelf.model('Correction', {

  tableName: 'corrections',

  assessment() {
    return this.belongsTo('Assessments');
  },

  competenceMarks() {
    return this.hasMany('CompetenceMarks', 'correctionId');
  }

});
