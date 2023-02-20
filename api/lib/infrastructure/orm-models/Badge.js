import Bookshelf from '../bookshelf';

import './BadgeCriterion';
import './SkillSet';
import './TargetProfile';

const modelName = 'Badge';

export default Bookshelf.model(
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
  }
);
