import Bookshelf from '../bookshelf';

import './Badge';

const modelName = 'BadgeCriterion';

export default Bookshelf.model(
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
