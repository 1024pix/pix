import Bookshelf from '../bookshelf';

import './Badge';

const modelName = 'SkillSet';

export default Bookshelf.model(
  modelName,
  {
    tableName: 'skill-sets',

    badge() {
      return this.belongsTo('Badge');
    },
  },
  {
    modelName,
  }
);
