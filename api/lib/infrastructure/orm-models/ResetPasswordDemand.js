import Bookshelf from '../bookshelf';

import './User';

const modelName = 'ResetPasswordDemand';

export default Bookshelf.model(
  modelName,
  {
    tableName: 'reset-password-demands',
    hasTimestamps: ['createdAt', 'updatedAt'],

    user() {
      return this.belongsTo('User', 'email');
    },
  },
  {
    modelName,
  }
);
