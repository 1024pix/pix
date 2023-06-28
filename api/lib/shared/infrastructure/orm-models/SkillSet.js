import { Bookshelf } from '../bookshelf.js';

import './Badge.js';

const modelName = 'SkillSet';

const BookshelfSkillSet = Bookshelf.model(
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

export { BookshelfSkillSet };
