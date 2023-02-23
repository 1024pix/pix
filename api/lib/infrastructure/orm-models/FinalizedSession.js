const Bookshelf = require('../bookshelf.js');

const modelName = 'FinalizedSession';

module.exports = Bookshelf.model(
  modelName,
  {
    tableName: 'finalized-sessions',

    parse(rawAttributes) {
      rawAttributes.sessionDate = rawAttributes.date;
      rawAttributes.sessionTime = rawAttributes.time;

      return rawAttributes;
    },
  },
  {
    modelName,
  }
);
