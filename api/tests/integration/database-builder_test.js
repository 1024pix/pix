const { expect, databaseBuilder } = require('../test-helper');

const { UserNotFoundError } = require('../../lib/domain/errors');
const userRepository = require('../../lib/infrastructure/repositories/user-repository');

describe('Integration | Infrastructure | database', () => {

  beforeEach(async () => {
    await databaseBuilder.clearAllTables();
  });

  it('should list all tables', async () => {
    // when
    const tableNames = await databaseBuilder.listAllTableNames();
    // then
    expect(tableNames).to.include('users');
  });

  it('should clear all tables', async () => {
    // given
    const { id } = databaseBuilder.factory.buildUser();
    await databaseBuilder.commit();

    // when
    await databaseBuilder.clearAllTables();

    // then
    await expect(userRepository.get(id)).to.be.rejectedWith(UserNotFoundError);
  });
});
