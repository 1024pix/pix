import {
  generateKnowledgeElementSnapshots,
  getEligibleCampaignParticipations,
} from '../../../../scripts/prod/generate-knowledge-element-snapshots-for-campaigns.js';
import { KnowledgeElementCollection } from '../../../../src/prescription/shared/domain/models/KnowledgeElementCollection.js';
import { databaseBuilder, domainBuilder, expect, knex, sinon } from '../../../test-helper.js';

describe('Integration | Scripts | generate-knowledge-element-snapshots-for-campaigns.js', function () {
  describe('#getEligibleCampaignParticipations', function () {
    const maxParticipationCountToGet = 5;

    it('should not return not shared campaign participations', async function () {
      // given
      const campaignId = databaseBuilder.factory.buildCampaign({ archivedAt: null }).id;
      databaseBuilder.factory.buildCampaignParticipation({ campaignId, sharedAt: null });
      await databaseBuilder.commit();

      // when
      const campaignParticipationData = await getEligibleCampaignParticipations(maxParticipationCountToGet);

      // then
      expect(campaignParticipationData).to.have.lengthOf(0);
    });

    it('should not return campaign participations with a not empty snapshot', async function () {
      // given
      const campaignId = databaseBuilder.factory.buildCampaign({ archivedAt: null }).id;
      const userId = databaseBuilder.factory.buildUser().id;
      const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
        campaignId,
        sharedAt: new Date('2020-01-01'),
        userId,
      });
      databaseBuilder.factory.buildKnowledgeElementSnapshot({
        campaignParticipationId: campaignParticipation.id,
      });
      await databaseBuilder.commit();

      // when
      const campaignParticipationData = await getEligibleCampaignParticipations(maxParticipationCountToGet);
      const knowledgeElementSnapshot = await knex('knowledge-element-snapshots').first();
      // then
      expect(campaignParticipationData).to.have.lengthOf(0);
      expect(knowledgeElementSnapshot.snapshot[0]).to.not.be.empty;
    });

    it('should return shared campaign participations from active campaigns that have an empty snapshot', async function () {
      // given
      const campaignId = databaseBuilder.factory.buildCampaign({ archivedAt: null }).id;
      const userId = databaseBuilder.factory.buildUser().id;
      const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
        campaignId,
        sharedAt: new Date('2020-01-01'),
        userId,
      });
      databaseBuilder.factory.buildKnowledgeElementSnapshot({
        campaignParticipationId: campaignParticipation.id,
        snapshot: {},
      });
      await databaseBuilder.commit();

      // when
      const campaignParticipationData = await getEligibleCampaignParticipations(maxParticipationCountToGet);

      // then
      expect(campaignParticipationData).to.have.lengthOf(1);
      expect(campaignParticipationData[0]).to.deep.equal({
        id: campaignParticipation.id,
        userId: campaignParticipation.userId,
        sharedAt: campaignParticipation.sharedAt,
      });
    });
  });

  describe('#generateKnowledgeElementSnapshots', function () {
    let knowledgeElementRepositoryStub;
    let knowledgeElementSnapshotRepositoryStub;

    beforeEach(function () {
      knowledgeElementRepositoryStub = {
        findUniqByUserId: sinon.stub(),
      };
      knowledgeElementSnapshotRepositoryStub = {
        save: sinon.stub(),
      };
    });

    it('should save snapshots', async function () {
      // given
      const concurrency = 1;
      const campaignParticipationData = [{ id: 1, userId: 1, sharedAt: new Date('2020-01-01') }];
      const expectedKnowledgeElements = [domainBuilder.buildKnowledgeElement({ userId: 1 })];
      knowledgeElementRepositoryStub.findUniqByUserId
        .withArgs({
          userId: campaignParticipationData[0].userId,
          limitDate: campaignParticipationData[0].sharedAt,
        })
        .resolves(expectedKnowledgeElements);

      // when
      await generateKnowledgeElementSnapshots(campaignParticipationData, concurrency, {
        knowledgeElementRepository: knowledgeElementRepositoryStub,
        knowledgeElementSnapshotRepository: knowledgeElementSnapshotRepositoryStub,
      });

      // then
      expect(knowledgeElementSnapshotRepositoryStub.save).to.have.been.calledWithExactly({
        snapshot: new KnowledgeElementCollection(expectedKnowledgeElements).toSnapshot(),
        campaignParticipationId: campaignParticipationData[0].id,
      });
    });
  });
});
