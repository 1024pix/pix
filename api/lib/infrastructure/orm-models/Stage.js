import Bookshelf from '../bookshelf';

const modelName = 'Stage';
import './TargetProfile';

export default Bookshelf.model(
  modelName,
  {
    tableName: 'stages',
    hasTimestamps: ['createdAt', 'updatedAt'],

    targetProfile() {
      return this.belongsTo('TargetProfile', 'targetProfileId');
    },
  },
  {
    modelName,
  }
);
