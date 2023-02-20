import { expect, databaseBuilder } from '../../test-helper';
import knexDatabaseConnection from '../../../db/knex-database-connection';
const knex = knexDatabaseConnection.knex;

import { UserNotFoundError } from '../../../lib/domain/errors';
import userRepository from '../../../lib/infrastructure/repositories/user-repository';

describe('Integration | Infrastructure | knex-database-connection', function () {
  it('should connect to the database', async function () {
    // when
    const resultSet = await knex.raw('SELECT 1 as value');

    // then
    expect(resultSet.rows || resultSet).to.deep.equal([{ value: 1 }]);
  });

  it('should empty all tables', async function () {
    // given
    const { id } = databaseBuilder.factory.buildUser();
    await databaseBuilder.commit();

    // when
    await knexDatabaseConnection.emptyAllTables();

    // then
    await expect(userRepository.get(id)).to.be.rejectedWith(UserNotFoundError);
  });

  context('QueryBuilder extension - whereInArray', function () {
    it('should return records that satisfy the where any clause', async function () {
      // given
      databaseBuilder.factory.buildCampaign({ id: 1 });
      databaseBuilder.factory.buildCampaign({ id: 2 });
      databaseBuilder.factory.buildCampaign({ id: 3 });
      await databaseBuilder.commit();

      // when
      const results = await knex.select('id').from('campaigns').whereInArray('id', [3, 2, 5]).orderBy('id');

      // then
      expect(results).to.deep.equal([{ id: 2 }, { id: 3 }]);
    });

    it('should return an empty array when no records satisfy the where any clause', async function () {
      // given
      databaseBuilder.factory.buildCampaign({ id: 1 });
      databaseBuilder.factory.buildCampaign({ id: 2 });
      databaseBuilder.factory.buildCampaign({ id: 3 });
      await databaseBuilder.commit();

      // when
      const results = await knex.select('id').from('campaigns').whereInArray('id', [4, 5]).orderBy('id');

      // then
      expect(results).to.be.empty;
    });
  });
});
