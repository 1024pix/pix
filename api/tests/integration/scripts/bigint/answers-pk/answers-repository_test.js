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

      // when
      await copyIntIdToBigintId({ startAt, endAt });

      // then
      const result = await knex('answers').count('id').whereBetween('id', [startAt, endAt]).whereNotNull('intId');

      expect(result[0].count).to.equal(2);
    });

    it('should not update out of range range', async function () {
      // given
      const startAt = 1;
      const endAt = 1;
      databaseBuilder.factory.buildAnswer({ id: 1 });
      databaseBuilder.factory.buildAnswer({ id: 2 });
      await databaseBuilder.commit();

      // when
      await copyIntIdToBigintId({ startAt, endAt });

      // then
      const result = await knex('answers').count('id').where('id', '>', endAt).whereNull('intId');

      expect(result[0].count).to.equal(1);
    });
  });
});
