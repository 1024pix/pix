const { knex, expect, databaseBuilder } = require('../../../test-helper');
const knowledgeElementSnapshotRepository = require('../../../../lib/infrastructure/repositories/knowledge-element-snapshot-repository');
const KnowledgeElement = require('../../../../lib/domain/models/KnowledgeElement');
const BookshelfKnowledgeElementSnapshot = require('../../../../lib/infrastructure/data/knowledge-element-snapshot');

describe('Integration | Repository | KnowledgeElementSnapshotRepository', () => {

  afterEach(() => {
    return knex('knowledge-element-snapshots').delete();
  });

  describe('#save', () => {
    it('should save an empty knowledge element snapshot for a userId and a date', async () => {
      const userId = 1;
      const date = new Date('2020-01-01');
      const knowledgeElements = [];

      await knowledgeElementSnapshotRepository.save({ userId, date, knowledgeElements });

      const result = await new BookshelfKnowledgeElementSnapshot().where({ userId, createdAt: date }).fetch();

      expect(result.toJSON()).to.deep.contains({
        userId,
        createdAt: date,
        snapshot: knowledgeElements,
      });
    });

    it('should save knowledge elements snapshot for a userId and a date', async () => {
      const userId = 1;
      const date = new Date('2020-01-02');

      const knowledgeElements = [
        new KnowledgeElement({
          id: 1,
          source: 'foo',
          status: 'foo',
          earnedPix: 1,
          createdAt: new Date('2020-01-01'),
          answerId: 1,
          assessmentId: 1,
          skillId: 1,
          userId: 1,
          competenceId: 1
        }),
        new KnowledgeElement({
          id: 2,
          source: 'bar',
          status: 'bar',
          earnedPix: 2,
          createdAt: new Date('2020-02-02'),
          answerId: 2,
          assessmentId: 2,
          skillId: 2,
          userId: 2,
          competenceId: 2
        }),
      ];

      await knowledgeElementSnapshotRepository.save({ userId, date, knowledgeElements });

      const result = await knowledgeElementSnapshotRepository.find({ userId, date });

      expect(result).to.deep.equal(knowledgeElements);
    });
  });

  describe('#find', () => {
    let userId;
    let expectedKnowledgeElements;
    const date = new Date('2020-01-02');

    beforeEach(() => {
      userId = databaseBuilder.factory.buildUser().id;
      const knowledgeElement1 = databaseBuilder.factory.buildKnowledgeElement({ userId });
      const knowledgeElement2 = databaseBuilder.factory.buildKnowledgeElement({ userId });
      databaseBuilder.factory.buildKnowledgeElement({ userId });
      databaseBuilder.factory.buildKnowledgeElement();
      expectedKnowledgeElements = [ knowledgeElement1, knowledgeElement2 ];
      databaseBuilder.factory.buildKnowledgeElementSnapshot({ userId, createdAt: date, snapshot: JSON.stringify(expectedKnowledgeElements) });

      return databaseBuilder.commit();
    });

    it('should find knowledge elements snapshoted for a userId and a date', async () => {
      // when
      const result = await knowledgeElementSnapshotRepository.find({ userId, date });

      // then
      expect(result).to.deep.equal(expectedKnowledgeElements);
    });

    it('should return null if no snapshot found for the user and date', async () => {
      const knowledgeElements = await knowledgeElementSnapshotRepository.find({ userId: 1, date: new Date('2020-01-01') });

      expect(knowledgeElements).to.equal(null);
    });
  });
});
