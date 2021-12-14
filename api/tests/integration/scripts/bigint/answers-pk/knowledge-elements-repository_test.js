const { expect, databaseBuilder } = require('../../../../test-helper');
const { copyIntIdToBigintId } = require('../../../../../scripts/bigint/answers-pk/knowledge-elements-repository');
const { knex } = require('../../../../../db/knex-database-connection');

describe('Integration | Repository | knowledge-elements-repository.js', function () {
  describe('#copyIntIdToBigintId', function () {
    it('should update specified range', async function () {
      // given
      const startAt = 1;
      const endAt = 2;
      databaseBuilder.factory.buildKnowledgeElement({ id: 1 });
      databaseBuilder.factory.buildKnowledgeElement({ id: 2 });
      await databaseBuilder.commit();
      await knex.from('knowledge-elements').whereBetween('id', [1, 2]).update({ answer_bigintId: -1 });

      // when
      await copyIntIdToBigintId({ startAt, endAt });

      // then
      const result = await knex
        .from('knowledge-elements')
        .count('id')
        .whereBetween('id', [startAt, endAt])
        .whereNot('answer_bigintId', -1);

      expect(result[0].count).to.equal(2);
    });

    it('should not update out of migration range rows', async function () {
      // given
      const startAt = 1;
      const endAt = 1;
      databaseBuilder.factory.buildKnowledgeElement({ id: 1 });
      databaseBuilder.factory.buildKnowledgeElement({ id: 2 });
      await databaseBuilder.commit();
      await knex.from('knowledge-elements').where('id', 2).update({ answer_bigintId: 999 });

      // when
      await copyIntIdToBigintId({ startAt, endAt });

      // then
      const { answer_bigintId } = await knex
        .from('knowledge-elements')
        .select('answer_bigintId')
        .where({ id: 2 })
        .first();
      expect(answer_bigintId).to.equal(999);
    });
  });
});
