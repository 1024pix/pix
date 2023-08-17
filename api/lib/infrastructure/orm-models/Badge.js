import './BadgeCriterion.js';
import './SkillSet.js';
import './TargetProfile.js';

import { Bookshelf } from '../bookshelf.js';

const modelName = 'Badge';

const BookshelfBadge = Bookshelf.model(
  modelName,
  {
    tableName: 'badges',

    targetProfile() {
      return this.belongsTo('TargetProfile', 'targetProfileId');
    },

    badgeCriteria() {
      return this.hasMany('BadgeCriterion', 'badgeId');
    },

    skillSets() {
      return this.hasMany('SkillSet', 'badgeId');
    },
  },
  {
    modelName,
  },
);

export { BookshelfBadge };
