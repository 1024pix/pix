const { knex, expect, databaseBuilder } = require('../../../test-helper');
const KnowledgeElement = require('../../../../lib/domain/models/KnowledgeElement');
const knowledgeElementSnapshotRepository = require('../../../../lib/infrastructure/repositories/knowledge-element-snapshot-repository');

describe('Integration | Repository | KnowledgeElementSnapshotRepository', () => {

  describe('#save', () => {

    afterEach(() => {
      return knex('knowledge-element-snapshots').delete();
    });

    it('should save knowledge elements snapshot for a userId and a date', async () => {
      // given
      const snappedAt = new Date('2019-04-01');
      const userId = databaseBuilder.factory.buildUser().id;
      const knowledgeElement1 = databaseBuilder.factory.buildKnowledgeElement({ userId, createdAt: new Date('2019-03-01') });
      const knowledgeElement2 = databaseBuilder.factory.buildKnowledgeElement({ userId, createdAt: new Date('2019-03-01') });
      const knowledgeElements =  [knowledgeElement1,knowledgeElement2];
      await databaseBuilder.commit();

      // when
      await knowledgeElementSnapshotRepository.save({ userId, snappedAt, knowledgeElements });

      // then
      const actualUserSnapshot = await knex.select('*').from('knowledge-element-snapshots').first();
      expect(actualUserSnapshot.userId).to.deep.equal(userId);
      expect(actualUserSnapshot.snappedAt).to.deep.equal(snappedAt);
      const actualKnowledgeElements = [];
      for (const knowledgeElementData of actualUserSnapshot.snapshot) {
        actualKnowledgeElements.push(new KnowledgeElement({
          ...knowledgeElementData,
          createdAt: new Date(knowledgeElementData.createdAt),
        }));
      }
      expect(actualKnowledgeElements).to.deep.equal(knowledgeElements);
    });
  });
});
