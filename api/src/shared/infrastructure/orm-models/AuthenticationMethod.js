import './User.js';

import { Bookshelf } from '../bookshelf.js';

const modelName = 'AuthenticationMethod';

const BookshelfAuthenticationMethod = Bookshelf.model(
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
  },
);

export { BookshelfAuthenticationMethod };
