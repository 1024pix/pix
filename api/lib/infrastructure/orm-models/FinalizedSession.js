import Bookshelf from '../bookshelf';

const modelName = 'FinalizedSession';

export default Bookshelf.model(
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
