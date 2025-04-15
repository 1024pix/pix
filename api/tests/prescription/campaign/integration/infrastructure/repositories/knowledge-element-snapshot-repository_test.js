import * as knowledgeElementSnapshotRepository from '../../../../../../src/prescription/campaign/infrastructure/repositories/knowledge-element-snapshot-repository.js';
import { KnowledgeElementCollection } from '../../../../../../src/prescription/shared/domain/models/KnowledgeElementCollection.js';
import { DomainTransaction } from '../../../../../../src/shared/domain/DomainTransaction.js';
import { databaseBuilder, domainBuilder, expect, knex } from '../../../../../test-helper.js';

describe('Integration | Repository | KnowledgeElementSnapshotRepository', function () {
  describe('#save', function () {
    it('should create a new knowledge elements snapshot when no snapshot exist for given campaignParticipationId', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation().id;
      const knowledgeElement1 = databaseBuilder.factory.buildKnowledgeElement({
        userId,
        createdAt: new Date('2019-03-01'),
      });
      const knowledgeElement2 = databaseBuilder.factory.buildKnowledgeElement({
        userId,
        createdAt: new Date('2019-03-01'),
      });
      const knowledgeElements = new KnowledgeElementCollection([knowledgeElement1, knowledgeElement2]);
      await databaseBuilder.commit();

      // when
      await knowledgeElementSnapshotRepository.save({
        snapshot: knowledgeElements.toSnapshot(),
        campaignParticipationId,
      });

      // then
      const actualUserSnapshot = await knex.select('*').from('knowledge-element-snapshots').first();
      expect(actualUserSnapshot.campaignParticipationId).to.deep.equal(campaignParticipationId);
      expect(actualUserSnapshot.snapshot).to.deep.equal(JSON.parse(knowledgeElements.toSnapshot()));
    });

    it('should update the existing knowledge elements snapshot when snapshot exists for given campaignParticipationId', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation().id;
      const knowledgeElement1 = databaseBuilder.factory.buildKnowledgeElement({
        userId,
        createdAt: new Date('2019-03-01'),
        skillId: 'acquis1',
      });
      const knowledgeElement2 = databaseBuilder.factory.buildKnowledgeElement({
        userId,
        createdAt: new Date('2019-03-01'),
        skillId: 'acquis2',
      });
      const knowledgeElement3 = databaseBuilder.factory.buildKnowledgeElement({
        userId,
        createdAt: new Date('2019-03-01'),
        skillId: 'acquis3',
      });
      const knowledgeElementsBefore = new KnowledgeElementCollection([knowledgeElement1, knowledgeElement2]);
      databaseBuilder.factory.buildKnowledgeElementSnapshot({
        campaignParticipationId,
        snapshot: knowledgeElementsBefore.toSnapshot(),
      });
      await databaseBuilder.commit();
      const knowledgeElementsAfter = new KnowledgeElementCollection([
        knowledgeElement1,
        knowledgeElement2,
        knowledgeElement3,
      ]);

      // when
      await knowledgeElementSnapshotRepository.save({
        snapshot: knowledgeElementsAfter.toSnapshot(),
        campaignParticipationId,
      });

      // then
      const actualUserSnapshot = await knex.select('*').from('knowledge-element-snapshots').first();
      expect(actualUserSnapshot.campaignParticipationId).to.deep.equal(campaignParticipationId);
      expect(actualUserSnapshot.snapshot).to.deep.equal(JSON.parse(knowledgeElementsAfter.toSnapshot()));
    });

    context('when a transaction is given transaction', function () {
      it('saves knowledge elements snapshot using a transaction', async function () {
        const userId = databaseBuilder.factory.buildUser().id;
        const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation().id;

        const knowledgeElement1 = databaseBuilder.factory.buildKnowledgeElement({
          userId,
          createdAt: new Date('2019-03-01'),
        });
        const knowledgeElements = new KnowledgeElementCollection([knowledgeElement1]);

        await databaseBuilder.commit();

        await DomainTransaction.execute(async () => {
          await knowledgeElementSnapshotRepository.save({
            snapshot: knowledgeElements.toSnapshot(),
            campaignParticipationId,
          });
        });
        const actualUserSnapshot = await knex.select('*').from('knowledge-element-snapshots').first();
        expect(actualUserSnapshot.campaignParticipationId).to.deep.equal(campaignParticipationId);
        expect(actualUserSnapshot.snapshot).to.deep.equal(JSON.parse(knowledgeElements.toSnapshot()));
      });

      it('does not save knowledge elements snapshot using a transaction', async function () {
        const userId = databaseBuilder.factory.buildUser().id;
        const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation().id;
        const knowledgeElement1 = databaseBuilder.factory.buildKnowledgeElement({
          userId,
          createdAt: new Date('2019-03-01'),
        });
        const knowledgeElements = [knowledgeElement1];
        await databaseBuilder.commit();

        try {
          await DomainTransaction.execute(async () => {
            await knowledgeElementSnapshotRepository.save({
              knowledgeElements,
              campaignParticipationId,
            });
            throw new Error();
          });
          // eslint-disable-next-line no-empty
        } catch {}

        const snapshots = await knex.select('*').from('knowledge-element-snapshots');
        expect(snapshots).to.be.empty;
      });
    });
  });

  describe('#findByCampaignParticipationIds', function () {
    let userId1, userId2, campaignParticipationId, secondCampaignParticipationId, otherCampaignParticipationId;

    beforeEach(function () {
      userId1 = databaseBuilder.factory.buildUser().id;
      userId2 = databaseBuilder.factory.buildUser().id;

      campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({ userId: userId1 }).id;
      secondCampaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({ userId: userId2 }).id;
      otherCampaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({ userId: userId2 }).id;
      return databaseBuilder.commit();
    });

    it('should return an empty object when there is no snapshot', async function () {
      // given
      // when
      const knowledgeElementsByUserId = await knowledgeElementSnapshotRepository.findByCampaignParticipationIds([
        campaignParticipationId,
        secondCampaignParticipationId,
      ]);
      // then
      expect(knowledgeElementsByUserId).to.deep.equal({});
    });

    it('should return only keys corresponding to existing snapshots', async function () {
      // given
      const knowledgeElement1 = databaseBuilder.factory.buildKnowledgeElement({ userId: userId1 });
      databaseBuilder.factory.buildKnowledgeElementSnapshot({
        snapshot: new KnowledgeElementCollection([knowledgeElement1]).toSnapshot(),
        campaignParticipationId,
      });

      await databaseBuilder.commit();
      // when
      const knowledgeElementsByUserId = await knowledgeElementSnapshotRepository.findByCampaignParticipationIds([
        campaignParticipationId,
        secondCampaignParticipationId,
      ]);
      // then
      expect(knowledgeElementsByUserId).to.deep.equal({
        [campaignParticipationId]: [
          {
            ...knowledgeElement1,
            id: undefined,
            assessmentId: undefined,
            userId: undefined,
            answerId: undefined,
          },
        ],
      });
    });

    it('should find knowledge elements snapshoted grouped by campaignParticipationIds', async function () {
      // given
      const knowledgeElement1 = databaseBuilder.factory.buildKnowledgeElement({ userId: userId1 });
      databaseBuilder.factory.buildKnowledgeElementSnapshot({
        snapshot: new KnowledgeElementCollection([knowledgeElement1]).toSnapshot(),
        campaignParticipationId,
      });

      const knowledgeElement2 = databaseBuilder.factory.buildKnowledgeElement({ userId: userId2 });
      databaseBuilder.factory.buildKnowledgeElementSnapshot({
        snapshot: new KnowledgeElementCollection([knowledgeElement2]).toSnapshot(),
        campaignParticipationId: secondCampaignParticipationId,
      });

      const knowledgeElement3 = databaseBuilder.factory.buildKnowledgeElement({ userId: userId2 });
      databaseBuilder.factory.buildKnowledgeElementSnapshot({
        snapshot: new KnowledgeElementCollection([knowledgeElement3]).toSnapshot(),
        campaignParticipationId: otherCampaignParticipationId,
      });

      await databaseBuilder.commit();

      // when
      const knowledgeElementsByUserId = await knowledgeElementSnapshotRepository.findByCampaignParticipationIds([
        campaignParticipationId,
        secondCampaignParticipationId,
      ]);

      // then
      expect(knowledgeElementsByUserId).to.deep.equals({
        [campaignParticipationId]: [
          {
            ...knowledgeElement1,
            id: undefined,
            assessmentId: undefined,
            userId: undefined,
            answerId: undefined,
          },
        ],
        [secondCampaignParticipationId]: [
          {
            ...knowledgeElement2,
            id: undefined,
            assessmentId: undefined,
            userId: undefined,
            answerId: undefined,
          },
        ],
      });
    });
  });

  describe('#findCampaignParticipationKnowledgeElementSnapshots', function () {
    let userId1, userId2;
    let snappedAt1, snappedAt2, snappedAt3;
    let knowledgeElement1, knowledgeElement2, knowledgeElement3;
    let campaignParticipationId1, campaignParticipationId2, campaignParticipationId3;
    let learningContent, campaignLearningContent;

    beforeEach(async function () {
      userId1 = databaseBuilder.factory.buildUser().id;
      userId2 = databaseBuilder.factory.buildUser().id;
      campaignParticipationId1 = 123;
      campaignParticipationId2 = 456;
      campaignParticipationId3 = 789;

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
      learningContent = domainBuilder.buildLearningContent([framework]);
      campaignLearningContent = domainBuilder.buildCampaignLearningContent(learningContent);

      snappedAt1 = new Date('2020-01-02');
      databaseBuilder.factory.buildCampaignParticipation({
        id: campaignParticipationId1,
        userId: userId1,
        sharedAt: snappedAt1,
      });
      knowledgeElement1 = databaseBuilder.factory.buildKnowledgeElement({
        userId: userId1,
        competenceId: campaignLearningContent.skills[0].competenceId,
        skillId: campaignLearningContent.skills[0].id,
      });
      databaseBuilder.factory.buildKnowledgeElementSnapshot({
        snapshot: new KnowledgeElementCollection([knowledgeElement1]).toSnapshot(),
        campaignParticipationId: campaignParticipationId1,
      });

      snappedAt2 = new Date('2020-02-02');
      databaseBuilder.factory.buildCampaignParticipation({
        id: campaignParticipationId2,
        userId: userId2,
        sharedAt: snappedAt2,
      });
      knowledgeElement2 = databaseBuilder.factory.buildKnowledgeElement({
        userId: userId2,
        competenceId: campaignLearningContent.skills[1].competenceId,
        skillId: campaignLearningContent.skills[1].id,
      });
      databaseBuilder.factory.buildKnowledgeElementSnapshot({
        snapshot: new KnowledgeElementCollection([knowledgeElement2]).toSnapshot(),
        campaignParticipationId: campaignParticipationId2,
      });

      snappedAt3 = new Date('2022-02-02');
      databaseBuilder.factory.buildCampaignParticipation({
        id: campaignParticipationId3,
        userId: userId2,
        sharedAt: snappedAt3,
      });
      knowledgeElement3 = databaseBuilder.factory.buildKnowledgeElement({
        userId: userId2,
        competenceId: campaignLearningContent.skills[2].competenceId,
        skillId: campaignLearningContent.skills[2].id,
      });
      databaseBuilder.factory.buildKnowledgeElementSnapshot({
        snapshot: new KnowledgeElementCollection([knowledgeElement3]).toSnapshot(),
        campaignParticipationId: campaignParticipationId3,
      });

      await databaseBuilder.commit();
    });

    it('should find knowledge elements snapshoted grouped by campaign participation id for given userIds and their respective dates', async function () {
      // when
      const knowledgeElementsByUserId =
        await knowledgeElementSnapshotRepository.findCampaignParticipationKnowledgeElementSnapshots([
          campaignParticipationId1,
          campaignParticipationId2,
          campaignParticipationId3,
        ]);

      // then
      expect(knowledgeElementsByUserId).lengthOf(3);

      expect(knowledgeElementsByUserId).to.deep.members([
        {
          knowledgeElements: [
            {
              ...knowledgeElement1,
              id: undefined,
              assessmentId: undefined,
              userId: undefined,
              answerId: undefined,
            },
          ],
          campaignParticipationId: campaignParticipationId1,
        },
        {
          knowledgeElements: [
            {
              ...knowledgeElement2,
              id: undefined,
              assessmentId: undefined,
              userId: undefined,
              answerId: undefined,
            },
          ],
          campaignParticipationId: campaignParticipationId2,
        },
        {
          knowledgeElements: [
            {
              ...knowledgeElement3,
              id: undefined,
              assessmentId: undefined,
              userId: undefined,
              answerId: undefined,
            },
          ],
          campaignParticipationId: campaignParticipationId3,
        },
      ]);
    });
  });
});
