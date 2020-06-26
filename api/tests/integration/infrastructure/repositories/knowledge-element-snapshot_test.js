const { knex, databaseBuilder, expect } = require('../../../test-helper');
const knowledgeElementSnapshotRepository = require('../../../../lib/infrastructure/repositories/knowledge-element-snapshot-repository');
const KnowledgeElement = require('../../../../lib/domain/models/KnowledgeElement');
const BookshelfKnowledgeElementSnapshot = require('../../../../lib/infrastructure/data/knowledge-element-snapshot');

describe('Integration | Repository | KnowledgeElementSnapshotRepository', () => {

  beforeEach(async () => {
    await databaseBuilder.commit();
  });

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
    it('should find knowledge elements snapshoted for a userId and a date', async () => {
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

    it('should find knowledge elements snapshoted only for a userId and a date', async () => {
      const userId1 = 1;
      const userId2 = 2;
      const date1 = new Date('2020-01-02');
      const date2 = new Date('2020-01-03');
      const knowledgeElement1 = new KnowledgeElement({ id: 1 });
      const knowledgeElement2 = new KnowledgeElement({ id: 2 });
      const knowledgeElement3 = new KnowledgeElement({ id: 3 });

      await knowledgeElementSnapshotRepository.save({ userId: userId1, date: date1, knowledgeElements: [knowledgeElement1] });
      await knowledgeElementSnapshotRepository.save({ userId: userId2, date: date2, knowledgeElements: [knowledgeElement2] });
      await knowledgeElementSnapshotRepository.save({ userId: userId1, date: date2, knowledgeElements: [knowledgeElement3] });

      const knowledgeElements = await knowledgeElementSnapshotRepository.find({ userId: userId1, date: date1 });

      expect(knowledgeElements.length).to.equal(1);
      expect(knowledgeElements[0].id).to.equal(1);
    });
  });
});
