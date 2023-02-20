import Bookshelf from '../bookshelf';

import './Assessment';
import './Campaign';
import './User';

const modelName = 'CampaignParticipation';

export default Bookshelf.model(
  modelName,
  {
    tableName: 'campaign-participations',
    hasTimestamps: ['createdAt', null],

    assessments() {
      return this.hasMany('Assessment', 'campaignParticipationId');
    },

    campaign() {
      return this.belongsTo('Campaign', 'campaignId');
    },

    user() {
      return this.belongsTo('User', 'userId');
    },

    parse(rawAttributes) {
      if (rawAttributes && rawAttributes.sharedAt) {
        rawAttributes.sharedAt = new Date(rawAttributes.sharedAt);
      }

      return rawAttributes;
    },
  },
  {
    modelName,
  }
);
