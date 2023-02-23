const Bookshelf = require('../bookshelf.js');

require('./Badge.js');

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
