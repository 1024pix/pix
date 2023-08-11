import { Bookshelf } from '../bookshelf.js';

import './TargetProfile.js';

const modelName = 'Badge';

const BookshelfBadge = Bookshelf.model(
  modelName,
  {
    tableName: 'badges',

    targetProfile() {
      return this.belongsTo('TargetProfile', 'targetProfileId');
    },
  },
  {
    modelName,
  },
);

export { BookshelfBadge };
