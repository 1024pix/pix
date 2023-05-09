import { Bookshelf } from '../bookshelf.js';

import './Badge.js';

const modelName = 'BadgeCriterion';

const BookshelfBadgeCriteri = Bookshelf.model(
  modelName,
  {
    tableName: 'badge-criteria',

    badge() {
      return this.belongsTo('Badge');
    },
  },
  {
    modelName,
  }
);

export { BookshelfBadgeCriteri };
