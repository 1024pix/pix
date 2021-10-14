const Bookshelf = require('../bookshelf');

require('./Badge');

const modelName = 'SkillSet';

module.exports = Bookshelf.model(
  modelName,
  {
    tableName: 'skill-sets',

    badge() {
      return this.belongsTo('Badge');
    },
  },
  {
    modelName,
  }
);
