import Bookshelf from '../bookshelf';

import './Badge';
import './User';

const modelName = 'BadgeAcquisition';

export default Bookshelf.model(
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
