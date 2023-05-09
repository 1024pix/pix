import { Bookshelf } from '../bookshelf.js';

import './Badge.js';
import './User.js';

const modelName = 'BadgeAcquisition';

const BookshelfBadgeAcquisition = Bookshelf.model(
  modelName,
  {
    tableName: 'badge-acquisitions',

    badge() {
      return this.belongsTo('Badge', 'badgeId');
    },

    user() {
      return this.belongsTo('User', 'userId');
    },
  },
  {
    modelName,
  }
);

export { BookshelfBadgeAcquisition };
