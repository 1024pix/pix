const expect = require('chai').expect;
const { knex } = require('../../../db/knex-database-connection');

const DatabaseBuilder = require('../../tooling/database-builder/database-builder');
const databaseBuilder = new DatabaseBuilder({ knex });
const { UserNotFoundError } = require('../../../lib/domain/errors');
const UserRepository = require('../../../lib/infrastructure/repositories/user-repository');

describe('UserRepository', () => {
  afterEach(function() {
    return databaseBuilder.clean();
  });

  it('thows an error when there is no user with the given id', async () => {
    databaseBuilder.factory.buildUser({ id: 2 });
    await databaseBuilder.commit();

    let error = null;
    try {
      await UserRepository.get(1);
    } catch (e) {
      error = e;
    }

    expect(error).to.be.an.instanceOf(UserNotFoundError);
    expect(error.message).to.equal('User not found for ID 1');
  });

});
