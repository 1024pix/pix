const { knex, expect, databaseBuilder } = require('../../../test-helper');
const knowledgeElementSnapshotRepository = require('../../../../lib/infrastructure/repositories/knowledge-element-snapshot-repository');
const KnowledgeElement = require('../../../../lib/domain/models/KnowledgeElement');
const BookshelfKnowledgeElementSnapshot = require('../../../../lib/infrastructure/data/knowledge-element-snapshot');

describe('Integration | Repository | KnowledgeElementSnapshotRepository', () => {

  describe('#save', () => {

    afterEach(() => {
      return knex('knowledge-element-snapshots').delete();
    });

    it('should save an empty knowledge element snapshot for a userId and a date', async () => {
      const userId = 1;
      const snappedAt = new Date('2020-01-01');
      const knowledgeElements = [];

      await knowledgeElementSnapshotRepository.save({ userId, snappedAt, knowledgeElements });

      const result = await new BookshelfKnowledgeElementSnapshot().where({ userId, snappedAt }).fetch();

      expect(result.toJSON()).to.deep.contains({
        userId,
        snappedAt,
        snapshot: knowledgeElements,
      });
    });

    it('should save knowledge elements snapshot for a userId and a date', async () => {
      const userId = 1;
      const snappedAt = new Date('2020-01-02');

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

      await knowledgeElementSnapshotRepository.save({ userId, snappedAt, knowledgeElements });

      const result = await knowledgeElementSnapshotRepository.findOneByUserIdAndDate({ userId, snappedAt });

      expect(result).to.deep.equal(knowledgeElements);
    });
  });

  describe('#findOneByUserIdAndDate', () => {
    let userId;
    let expectedKnowledgeElements;
    const snappedAt = new Date('2020-01-02');

    beforeEach(() => {
      userId = databaseBuilder.factory.buildUser().id;
      const knowledgeElement1 = databaseBuilder.factory.buildKnowledgeElement({ userId });
      const knowledgeElement2 = databaseBuilder.factory.buildKnowledgeElement({ userId });
      databaseBuilder.factory.buildKnowledgeElement({ userId });
      databaseBuilder.factory.buildKnowledgeElement();
      expectedKnowledgeElements = [ knowledgeElement1, knowledgeElement2 ];
      databaseBuilder.factory.buildKnowledgeElementSnapshot({ userId, snappedAt, snapshot: JSON.stringify(expectedKnowledgeElements) });

      return databaseBuilder.commit();
    });

    it('should find knowledge elements snapshoted for a userId and a date', async () => {
      // when
      const knowledgeElements = await knowledgeElementSnapshotRepository.findOneByUserIdAndDate({ userId, snappedAt });

      // then
      expect(knowledgeElements).to.deep.equal(expectedKnowledgeElements);
    });

    it('should return null if no snapshot found for the user and date', async () => {
      const knowledgeElements = await knowledgeElementSnapshotRepository.findOneByUserIdAndDate({ userId: 1, snappedAt: new Date('2020-01-01') });

      expect(knowledgeElements).to.equal(null);
    });
  });

  describe('#findByUserIdsAndDatesGroupedByUserId', () => {
    let userId1;
    let userId2;
    let expectedKnowledgeElements1;
    let expectedKnowledgeElements2;
    const snappedAt1 = new Date('2020-01-02');
    const snappedAt2 = new Date('2020-03-02');

    beforeEach(() => {
      userId1 = databaseBuilder.factory.buildUser().id;
      const knowledgeElement1_1 = databaseBuilder.factory.buildKnowledgeElement({ userId: userId1 });
      const knowledgeElement1_2 = databaseBuilder.factory.buildKnowledgeElement({ userId: userId1 });
      databaseBuilder.factory.buildKnowledgeElement({ userId: userId1 });
      databaseBuilder.factory.buildKnowledgeElement();
      expectedKnowledgeElements1 = [ knowledgeElement1_1, knowledgeElement1_2 ];
      databaseBuilder.factory.buildKnowledgeElementSnapshot({ userId: userId1, snappedAt: snappedAt1, snapshot: JSON.stringify(expectedKnowledgeElements1) });
      userId2 = databaseBuilder.factory.buildUser().id;
      const knowledgeElement2_1 = databaseBuilder.factory.buildKnowledgeElement({ userId: userId2 });
      const knowledgeElement2_2 = databaseBuilder.factory.buildKnowledgeElement({ userId: userId2 });
      databaseBuilder.factory.buildKnowledgeElement({ userId: userId2 });
      databaseBuilder.factory.buildKnowledgeElement();
      expectedKnowledgeElements2 = [ knowledgeElement2_1, knowledgeElement2_2 ];
      databaseBuilder.factory.buildKnowledgeElementSnapshot({ userId: userId2, snappedAt: snappedAt2, snapshot: JSON.stringify(expectedKnowledgeElements2) });

      return databaseBuilder.commit();
    });

    it('should find knowledge elements snapshoted grouped by userId for userIds and their respective dates', async () => {
      // when
      const knowledgeElementsGroupedByUser = await knowledgeElementSnapshotRepository.findByUserIdsAndDatesGroupedByUserId({ [userId1]: snappedAt1, [userId2]: snappedAt2 });

      // then
      expect(knowledgeElementsGroupedByUser[userId1]).to.deep.equal(expectedKnowledgeElements1);
      expect(knowledgeElementsGroupedByUser[userId2]).to.deep.equal(expectedKnowledgeElements2);
    });

    it('should return a result with empty knowledge elements result if no snapshot found for any of the users', async () => {
      const knowledgeElementsGroupedByUser = await knowledgeElementSnapshotRepository.findByUserIdsAndDatesGroupedByUserId({ 1: snappedAt1, 2: snappedAt2 });

      expect(knowledgeElementsGroupedByUser).to.deep.equal({ '1': null, '2': null });
    });
  });
});
