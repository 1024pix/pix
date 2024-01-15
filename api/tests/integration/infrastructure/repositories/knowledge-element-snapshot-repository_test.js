import { knex, expect, databaseBuilder, domainBuilder, catchErr } from '../../../test-helper.js';
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

    before(function () {
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

  describe('#findByUserIdsAndSnappedAtDatesSyncCampaignParticipationIdForAssessment', function () {
    let userId1, userId2;
    let campaignParticipationId1, campaignParticipationId2, campaignParticipationId3;
    let snappedAt1, snappedAt2, snappedAt3;
    let knowledgeElement1, knowledgeElement2, knowledgeElement3;
    let learningContent;

    before(async function () {
      userId1 = databaseBuilder.factory.buildUser().id;
      userId2 = databaseBuilder.factory.buildUser().id;

      const skill1 = domainBuilder.buildSkill({ id: 'skill1', tubeId: 'tube1', competenceId: 'competence1' });
      const skill2 = domainBuilder.buildSkill({ id: 'skill2', tubeId: 'tube1', competenceId: 'competence1' });
      const skill3 = domainBuilder.buildSkill({ id: 'skill3', tubeId: 'tube2', competenceId: 'competence2' });
      const tube1 = domainBuilder.buildTube({
        id: 'tube1',
        skills: [skill1, skill2],
        competenceId: 'competence1',
      });
      const tube2 = domainBuilder.buildTube({ id: 'tube2', skills: [skill3], competenceId: 'competence2' });
      const competence1 = domainBuilder.buildCompetence({ id: 'competence1', tubes: [tube1] });
      const competence2 = domainBuilder.buildCompetence({ id: 'competence2', tubes: [tube2] });
      const area = domainBuilder.buildArea({ id: 'area1', competences: [competence1, competence2] });
      const framework = domainBuilder.buildFramework({ areas: [area] });
      learningContent = domainBuilder.buildCampaignLearningContent.fromFrameworks([framework]);

      snappedAt1 = new Date('2020-01-02');
      campaignParticipationId1 = databaseBuilder.factory.buildCampaignParticipation({
        userId: userId1,
        sharedAt: snappedAt1,
      }).id;
      knowledgeElement1 = databaseBuilder.factory.buildKnowledgeElement({
        userId: userId1,
        competenceId: learningContent.skills[0].competenceId,
        skillId: learningContent.skills[0].id,
      });
      databaseBuilder.factory.buildKnowledgeElementSnapshot({
        userId: userId1,
        snappedAt: snappedAt1,
        snapshot: JSON.stringify([knowledgeElement1]),
      });

      snappedAt2 = new Date('2020-02-02');
      campaignParticipationId2 = databaseBuilder.factory.buildCampaignParticipation({
        userId: userId2,
        sharedAt: snappedAt2,
      }).id;
      knowledgeElement2 = databaseBuilder.factory.buildKnowledgeElement({
        userId: userId2,
        competenceId: learningContent.skills[1].competenceId,
        skillId: learningContent.skills[1].id,
      });
      databaseBuilder.factory.buildKnowledgeElementSnapshot({
        userId: userId2,
        snappedAt: snappedAt2,
        snapshot: JSON.stringify([knowledgeElement2]),
      });

      snappedAt3 = new Date('2022-02-02');
      campaignParticipationId3 = databaseBuilder.factory.buildCampaignParticipation({
        userId: userId2,
        sharedAt: snappedAt3,
      }).id;
      knowledgeElement3 = databaseBuilder.factory.buildKnowledgeElement({
        userId: userId2,
        competenceId: learningContent.skills[2].competenceId,
        skillId: learningContent.skills[2].id,
      });
      databaseBuilder.factory.buildKnowledgeElementSnapshot({
        userId: userId2,
        snappedAt: snappedAt3,
        snapshot: JSON.stringify([knowledgeElement3]),
      });

      await databaseBuilder.commit();
    });

    it('should find knowledge elements snapshoted grouped by campaign participation id for given userIds and their respective dates', async function () {
      // when
      const knowledgeElementsByUserId =
        await knowledgeElementSnapshotRepository.findByUserIdsAndSnappedAtDatesSyncCampaignParticipationIdForAssessment(
          [
            [userId1, snappedAt1],
            [userId2, snappedAt2],
            [userId2, snappedAt3],
          ],
          learningContent,
        );

      // then
      expect(knowledgeElementsByUserId).lengthOf(3);

      const firstCampaignParticipationResult = knowledgeElementsByUserId.find(
        (knowledgeElementByUserId) => knowledgeElementByUserId.campaignParticipationId === campaignParticipationId1,
      );
      expect(firstCampaignParticipationResult.knowledgeElements).to.deep.equal({
        competence1: [knowledgeElement1],
        competence2: [],
      });
      expect(firstCampaignParticipationResult.userId).to.deep.equal(userId1);

      const secondCampaignParticipationResult = knowledgeElementsByUserId.find(
        (knowledgeElementByUserId) => knowledgeElementByUserId.campaignParticipationId === campaignParticipationId2,
      );
      expect(secondCampaignParticipationResult.knowledgeElements).to.deep.equal({
        competence1: [knowledgeElement2],
        competence2: [],
      });
      expect(secondCampaignParticipationResult.userId).to.deep.equal(userId2);

      const thirdCampaignParticipationResult = knowledgeElementsByUserId.find(
        (knowledgeElementByUserId) => knowledgeElementByUserId.campaignParticipationId === campaignParticipationId3,
      );
      expect(thirdCampaignParticipationResult.knowledgeElements).to.deep.equal({
        competence1: [],
        competence2: [knowledgeElement3],
      });
      expect(thirdCampaignParticipationResult.userId).to.deep.equal(userId2);
    });

    it('should return empty list of snapshoted knowledge elements given unmatching dates', async function () {
      // when
      const snappedAt = new Date('2023-02-01');
      const knowledgeElementsByUserId =
        await knowledgeElementSnapshotRepository.findByUserIdsAndSnappedAtDatesSyncCampaignParticipationIdForAssessment(
          [[userId1, snappedAt]],
          learningContent,
        );

      // then
      expect(knowledgeElementsByUserId).lengthOf(0);
    });

    it('should return empty list of snapshoted knowledge elements given unmatching userId', async function () {
      const userId = databaseBuilder.factory.buildUser().id;

      await databaseBuilder.commit();
      // when
      const knowledgeElementsByUserId =
        await knowledgeElementSnapshotRepository.findByUserIdsAndSnappedAtDatesSyncCampaignParticipationIdForAssessment(
          [[userId, snappedAt1]],
          learningContent,
        );

      // then
      expect(knowledgeElementsByUserId).lengthOf(0);
    });
  });
});
