import { knex, expect, databaseBuilder, catchErr } from '../../../test-helper.js';
import { KnowledgeElement } from '../../../../lib/domain/models/KnowledgeElement.js';
import * as knowledgeElementSnapshotRepository from '../../../../lib/infrastructure/repositories/knowledge-element-snapshot-repository.js';
import { AlreadyExistingEntityError } from '../../../../lib/domain/errors.js';
import { DomainTransaction } from '../../../../lib/infrastructure/DomainTransaction.js';

describe('Integration | Repository | KnowledgeElementSnapshotRepository', function () {
  describe('#save', function () {
    it('should save knowledge elements snapshot for a userId and a date', async function () {
      // given
      const snappedAt = new Date('2019-04-01');
      const userId = databaseBuilder.factory.buildUser().id;
      const knowledgeElement1 = databaseBuilder.factory.buildKnowledgeElement({
        userId,
        createdAt: new Date('2019-03-01'),
      });
      const knowledgeElement2 = databaseBuilder.factory.buildKnowledgeElement({
        userId,
        createdAt: new Date('2019-03-01'),
      });
      const knowledgeElements = [knowledgeElement1, knowledgeElement2];
      await databaseBuilder.commit();

      // when
      await knowledgeElementSnapshotRepository.save({ userId, snappedAt, knowledgeElements });

      // then
      const actualUserSnapshot = await knex.select('*').from('knowledge-element-snapshots').first();
      expect(actualUserSnapshot.userId).to.deep.equal(userId);
      expect(actualUserSnapshot.snappedAt).to.deep.equal(snappedAt);
      const actualKnowledgeElements = [];
      for (const knowledgeElementData of actualUserSnapshot.snapshot) {
        actualKnowledgeElements.push(
          new KnowledgeElement({
            ...knowledgeElementData,
            createdAt: new Date(knowledgeElementData.createdAt),
          }),
        );
      }
      expect(actualKnowledgeElements).to.deep.equal(knowledgeElements);
    });

    it('should throw an error if knowledge elements snapshot already exist for userId and a date', async function () {
      // given
      const snappedAt = new Date('2019-04-01');
      const userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildKnowledgeElementSnapshot({ userId, snappedAt });
      await databaseBuilder.commit();

      // when
      const error = await catchErr(knowledgeElementSnapshotRepository.save)({
        userId,
        snappedAt,
        knowledgeElements: [],
      });

      // then
      expect(error).to.be.instanceOf(AlreadyExistingEntityError);
    });

    context('when a transaction is given transaction', function () {
      it('saves knowledge elements snapshot using a transaction', async function () {
        const snappedAt = new Date('2019-04-01');
        const userId = databaseBuilder.factory.buildUser().id;
        const knowledgeElement1 = databaseBuilder.factory.buildKnowledgeElement({
          userId,
          createdAt: new Date('2019-03-01'),
        });
        const knowledgeElements = [knowledgeElement1];
        await databaseBuilder.commit();

        await DomainTransaction.execute((domainTransaction) => {
          return knowledgeElementSnapshotRepository.save({ userId, snappedAt, knowledgeElements, domainTransaction });
        });

        const actualUserSnapshot = await knex.select('*').from('knowledge-element-snapshots').first();
        expect(actualUserSnapshot.userId).to.deep.equal(userId);
        expect(actualUserSnapshot.snappedAt).to.deep.equal(snappedAt);
        const actualKnowledgeElements = [];
        for (const knowledgeElementData of actualUserSnapshot.snapshot) {
          actualKnowledgeElements.push(
            new KnowledgeElement({
              ...knowledgeElementData,
              createdAt: new Date(knowledgeElementData.createdAt),
            }),
          );
        }
        expect(actualKnowledgeElements).to.deep.equal(knowledgeElements);
      });

      it('does not save knowledge elements snapshot using a transaction', async function () {
        const snappedAt = new Date('2019-04-01');
        const userId = databaseBuilder.factory.buildUser().id;
        const knowledgeElement1 = databaseBuilder.factory.buildKnowledgeElement({
          userId,
          createdAt: new Date('2019-03-01'),
        });
        const knowledgeElements = [knowledgeElement1];
        await databaseBuilder.commit();

        try {
          await DomainTransaction.execute(async (domainTransaction) => {
            await knowledgeElementSnapshotRepository.save({ userId, snappedAt, knowledgeElements, domainTransaction });
            throw new Error();
          });
          // eslint-disable-next-line no-empty
        } catch (error) {}

        const snapshots = await knex.select('*').from('knowledge-element-snapshots');
        expect(snapshots).to.be.empty;
      });
    });
  });

  describe('#findByUserIdsAndSnappedAtDates', function () {
    let userId1;
    let userId2;

    beforeEach(function () {
      userId1 = databaseBuilder.factory.buildUser().id;
      userId2 = databaseBuilder.factory.buildUser().id;
      return databaseBuilder.commit();
    });

    it('should find knowledge elements snapshoted grouped by userId for userIds and their respective dates', async function () {
      // given
      const snappedAt1 = new Date('2020-01-02');
      const knowledgeElement1 = databaseBuilder.factory.buildKnowledgeElement({ userId: userId1 });
      databaseBuilder.factory.buildKnowledgeElementSnapshot({
        userId: userId1,
        snappedAt: snappedAt1,
        snapshot: JSON.stringify([knowledgeElement1]),
      });
      const snappedAt2 = new Date('2020-02-02');
      const knowledgeElement2 = databaseBuilder.factory.buildKnowledgeElement({ userId: userId2 });
      databaseBuilder.factory.buildKnowledgeElementSnapshot({
        userId: userId2,
        snappedAt: snappedAt2,
        snapshot: JSON.stringify([knowledgeElement2]),
      });
      await databaseBuilder.commit();

      // when
      const knowledgeElementsByUserId = await knowledgeElementSnapshotRepository.findByUserIdsAndSnappedAtDates({
        [userId1]: snappedAt1,
        [userId2]: snappedAt2,
      });

      // then
      expect(knowledgeElementsByUserId[userId1]).to.deep.equal([knowledgeElement1]);
      expect(knowledgeElementsByUserId[userId2]).to.deep.equal([knowledgeElement2]);
    });

    it('should return null associated to userId when user does not have a snapshot', async function () {
      // when
      const knowledgeElementsByUserId = await knowledgeElementSnapshotRepository.findByUserIdsAndSnappedAtDates({
        [userId1]: new Date('2020-04-01T00:00:00Z'),
      });

      expect(knowledgeElementsByUserId[userId1]).to.be.null;
    });
  });
});
