import Bookshelf from '../bookshelf';

import './Assessment';
import './CampaignParticipation';
import './Organization';
import './TargetProfile';
import './User';

const modelName = 'Campaign';

export default Bookshelf.model(
  modelName,
  {
    tableName: 'campaigns',
    hasTimestamps: ['createdAt', null],

    organization() {
      return this.belongsTo('Organization', 'organizationId');
    },

    campaignParticipations() {
      return this.hasMany('CampaignParticipation', 'campaignId');
    },

    targetProfile() {
      return this.belongsTo('TargetProfile', 'targetProfileId');
    },

    creator() {
      return this.belongsTo('User', 'creatorId');
    },
  },
  {
    modelName,
  }
);
