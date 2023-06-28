import { Bookshelf } from '../bookshelf.js';

const modelName = 'Stage';
import './TargetProfile.js';

const BookshelfStage = Bookshelf.model(
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

export { BookshelfStage };
