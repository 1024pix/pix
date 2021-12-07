const { expect, databaseBuilder } = require('../../../../test-helper');
const { copyIntIdToBigintId } = require('../../../../../scripts/bigint/answers-pk/answers-repository');
const { knex } = require('../../../../../db/knex-database-connection');

describe('Integration | Repository | answers-repository.js', function () {
  describe('#copyIntIdToBigintId', function () {
    it('should update specified range', async function () {
      // given
      const startAt = 1;
      const endAt = 2;
      databaseBuilder.factory.buildAnswer({ id: 1 });
      databaseBuilder.factory.buildAnswer({ id: 2 });
      await databaseBuilder.commit();
      await knex.from('answers').whereBetween('id', [1, 2]).update({ bigintId: -1 });

      // when
      await copyIntIdToBigintId({ startAt, endAt });

      // then
      const result = await knex
        .from('answers')
        .count('id')
        .whereBetween('id', [startAt, endAt])
        .whereNot('bigintId', -1);

      expect(result[0].count).to.equal(2);
    });

    it('should not update out of migration range rows', async function () {
      // given
      const startAt = 1;
      const endAt = 1;
      databaseBuilder.factory.buildAnswer({ id: 1 });
      databaseBuilder.factory.buildAnswer({ id: 2 });
      await databaseBuilder.commit();
      await knex.from('answers').where('id', 2).update({ bigintId: 999 });

      // when
      await copyIntIdToBigintId({ startAt, endAt });

      // then
      const { bigintId } = await knex.from('answers').select('bigintId').where({ id: 2 }).first();
      expect(bigintId).to.equal(999);
    });
  });
});
