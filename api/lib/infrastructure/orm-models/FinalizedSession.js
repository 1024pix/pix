import { Bookshelf } from '../bookshelf.js';

const modelName = 'FinalizedSession';

const BookshelfFinalizedSession = Bookshelf.model(
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

export { BookshelfFinalizedSession };
