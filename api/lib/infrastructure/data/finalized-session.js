const Bookshelf = require('../bookshelf');

const modelName = 'FinalizedSession';

module.exports = Bookshelf.model(modelName, {

  tableName: 'finalized-sessions',
  requireFetch: true,
  parse(rawAttributes) {
    rawAttributes.sessionDate = rawAttributes.date;
    rawAttributes.sessionTime = rawAttributes.time;

    return rawAttributes;
  },

}, {
  modelName,
});
