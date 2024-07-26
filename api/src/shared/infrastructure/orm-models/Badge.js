import './TargetProfile.js';

import { Bookshelf } from '../../../../lib/infrastructure/bookshelf.js';

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
