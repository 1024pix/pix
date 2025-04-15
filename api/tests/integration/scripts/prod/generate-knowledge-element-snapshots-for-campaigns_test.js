import {
  generateKnowledgeElementSnapshots,
  getEligibleCampaignParticipations,
} from '../../../../scripts/prod/generate-knowledge-element-snapshots-for-campaigns.js';
import { KnowledgeElementCollection } from '../../../../src/prescription/shared/domain/models/KnowledgeElementCollection.js';
import { databaseBuilder, domainBuilder, expect, sinon } from '../../../test-helper.js';

describe('Integration | Scripts | generate-knowledge-element-snapshots-for-campaigns.js', function () {
  describe('#getEligibleCampaignParticipations', function () {
    const maxParticipationCountToGet = 5;

    it('should avoid returning campaign participations that are not shared', async function () {
      // given
      const campaignId = databaseBuilder.factory.buildCampaign({ archivedAt: null }).id;
      databaseBuilder.factory.buildCampaignParticipation({ campaignId, sharedAt: null });
      await databaseBuilder.commit();

      // when
      const campaignParticipationData = await getEligibleCampaignParticipations(maxParticipationCountToGet);

      // then
      expect(campaignParticipationData).to.have.lengthOf(0);
    });

    it('should avoid returning campaign participations that already have a corresponding snasphot', async function () {
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

      // then
      expect(campaignParticipationData).to.have.lengthOf(0);
    });

    it('should return shared campaign participations from active campaigns that does not have a corresponding snapshot', async function () {
      // given
      const campaignId = databaseBuilder.factory.buildCampaign({ archivedAt: null }).id;
      const userId = databaseBuilder.factory.buildUser().id;
      const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
        campaignId,
        sharedAt: new Date('2020-01-01'),
        userId,
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

    it('should return shared campaign participations from active campaigns even if there is a snapshot from a different date that already exists', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const campaignParticipationWithoutSnapshot = databaseBuilder.factory.buildCampaignParticipation({
        sharedAt: new Date('2020-01-01'),
        userId,
      });

      const firstCampaignParticiationId = databaseBuilder.factory.buildCampaignParticipation({
        sharedAt: new Date('2020-02-01'),
        userId,
      }).id;
      const secondCampaignParticiationId = databaseBuilder.factory.buildCampaignParticipation({
        sharedAt: new Date('2020-03-01'),
        userId,
      }).id;
      databaseBuilder.factory.buildKnowledgeElementSnapshot({
        snappedAt: new Date('2020-02-01'),
        campaignParticipationId: firstCampaignParticiationId,
      });
      databaseBuilder.factory.buildKnowledgeElementSnapshot({
        snappedAt: new Date('2020-03-01'),
        campaignParticipationId: secondCampaignParticiationId,
      });
      await databaseBuilder.commit();

      // when
      const campaignParticipationData = await getEligibleCampaignParticipations(maxParticipationCountToGet);

      // then
      expect(campaignParticipationData).to.have.lengthOf(1);
      expect(campaignParticipationData[0]).to.deep.equal({
        id: campaignParticipationWithoutSnapshot.id,
        userId: campaignParticipationWithoutSnapshot.userId,
        sharedAt: campaignParticipationWithoutSnapshot.sharedAt,
      });
    });

    it('should return maximum campaign participation as set in the parameter', async function () {
      // given
      const campaignId = databaseBuilder.factory.buildCampaign({ archivedAt: null }).id;
      const userId1 = databaseBuilder.factory.buildUser().id;
      const userId2 = databaseBuilder.factory.buildUser().id;
      const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
        campaignId,
        sharedAt: new Date('2020-01-01'),
        userId: userId1,
      });
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId,
        sharedAt: new Date('2020-01-01'),
        userId: userId2,
      });
      await databaseBuilder.commit();

      // when
      const campaignParticipationData = await getEligibleCampaignParticipations(1);

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
