import Bookshelf from '../bookshelf';
import jsonColumns from 'bookshelf-json-columns';

import './User';

const modelName = 'AuthenticationMethod';

export default Bookshelf.model(
  modelName,
  {
    tableName: 'authentication-methods',
    hasTimestamps: ['createdAt', 'updatedAt'],

    user() {
      return this.belongsTo('User');
    },
  },
  {
    modelName,
    jsonColumns: ['authenticationComplement'],
  }
);
