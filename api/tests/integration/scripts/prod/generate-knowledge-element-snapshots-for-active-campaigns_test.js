const { expect, databaseBuilder, sinon } = require('../../../test-helper');
const knowledgeElementRepository = require('../../../../lib/infrastructure/repositories/knowledge-element-repository');
const knowledgeElementSnapshotRepository = require('../../../../lib/infrastructure/repositories/knowledge-element-snapshot-repository');
const {
  getEligibleCampaignParticipations,
  generateKnowledgeElementSnapshots,
} = require('../../../../scripts/prod/generate-knowledge-element-snapshots-for-active-campaigns');

describe('Integration | Scripts | generate-knowledge-element-snapshots-for-active-campaigns.js', () => {

  describe('#getEligibleCampaignParticipations', () => {

    it('should avoid returning campaign participations that are not in active campaigns', async () => {
      // given
      const campaignId = databaseBuilder.factory.buildCampaign({ archivedAt: new Date('2020-01-01') }).id;
      databaseBuilder.factory.buildCampaignParticipation({ campaignId });
      await databaseBuilder.commit();

      // when
      const campaignParticipationData = await getEligibleCampaignParticipations(5);

      // then
      expect(campaignParticipationData.length).to.equal(0);
    });

    it('should avoid returning campaign participations that are not shared', async () => {
      // given
      const campaignId = databaseBuilder.factory.buildCampaign({ archivedAt: null }).id;
      databaseBuilder.factory.buildCampaignParticipation({ campaignId, sharedAt: null });
      await databaseBuilder.commit();

      // when
      const campaignParticipationData = await getEligibleCampaignParticipations(5);

      // then
      expect(campaignParticipationData.length).to.equal(0);
    });

    it('should avoid returning campaign participations that already have a corresponding snasphot', async () => {
      // given
      const campaignId = databaseBuilder.factory.buildCampaign({ archivedAt: null }).id;
      const userId = databaseBuilder.factory.buildUser().id;
      const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({ campaignId, sharedAt: new Date('2020-01-01'), userId });
      databaseBuilder.factory.buildKnowledgeElementSnapshot({ snappedAt: campaignParticipation.sharedAt, userId });
      await databaseBuilder.commit();

      // when
      const campaignParticipationData = await getEligibleCampaignParticipations(5);

      // then
      expect(campaignParticipationData.length).to.equal(0);
    });

    it('should return shared campaign participations from active campaigns that does not have a corresponding snapshot', async () => {
      // given
      const campaignId = databaseBuilder.factory.buildCampaign({ archivedAt: null }).id;
      const userId1 = databaseBuilder.factory.buildUser().id;
      const userId2 = databaseBuilder.factory.buildUser().id;
      const campaignParticipation1 = databaseBuilder.factory.buildCampaignParticipation({ campaignId, sharedAt: new Date('2020-01-01'), userId: userId1 });
      const campaignParticipation2 = databaseBuilder.factory.buildCampaignParticipation({ campaignId, sharedAt: new Date('2020-02-01'), userId: userId2 });
      databaseBuilder.factory.buildKnowledgeElementSnapshot({ snappedAt: new Date('2019-01-01'), userId: userId2 });
      await databaseBuilder.commit();

      // when
      const campaignParticipationData = await getEligibleCampaignParticipations(5);

      // then
      expect(campaignParticipationData.length).to.equal(2);
      expect(campaignParticipationData[0]).to.deep.equal({ userId: campaignParticipation1.userId, sharedAt: campaignParticipation1.sharedAt });
      expect(campaignParticipationData[1]).to.deep.equal({ userId: campaignParticipation2.userId, sharedAt: campaignParticipation2.sharedAt });
    });

    it('should return maximum campaign participation as set in the parameter', async () => {
      // given
      const campaignId = databaseBuilder.factory.buildCampaign({ archivedAt: null }).id;
      const userId1 = databaseBuilder.factory.buildUser().id;
      const userId2 = databaseBuilder.factory.buildUser().id;
      const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({ campaignId, sharedAt: new Date('2020-01-01'), userId: userId1 });
      databaseBuilder.factory.buildCampaignParticipation({ campaignId, sharedAt: new Date('2020-01-01'), userId: userId2 });
      await databaseBuilder.commit();

      // when
      const campaignParticipationData = await getEligibleCampaignParticipations(1);

      // then
      expect(campaignParticipationData.length).to.equal(1);
      expect(campaignParticipationData[0]).to.deep.equal({ userId: campaignParticipation.userId, sharedAt: campaignParticipation.sharedAt });
    });
  });

  describe('#generateKnowledgeElementSnapshots', () => {

    beforeEach(() => {
      sinon.stub(knowledgeElementRepository, 'findUniqByUserId');
      sinon.stub(knowledgeElementSnapshotRepository, 'save');
    });

    afterEach(() => {
      knowledgeElementRepository.findUniqByUserId.restore();
      knowledgeElementSnapshotRepository.save.restore();
    });

    it('should save snapshots', async () => {
      // given
      const concurrency = 1;
      const campaignParticipationData = [{ userId: 1, sharedAt: new Date('2020-01-01') }];
      const expectedKnowledgeElements = ['someKnowledgeElements'];
      knowledgeElementRepository.findUniqByUserId
        .withArgs({ userId: campaignParticipationData[0].userId, limitDate: campaignParticipationData[0].sharedAt })
        .resolves(expectedKnowledgeElements);

      // when
      await generateKnowledgeElementSnapshots(campaignParticipationData, concurrency);

      // then
      expect(knowledgeElementSnapshotRepository.save).to.have.been.calledWithExactly({
        userId: campaignParticipationData[0].userId,
        snappedAt: campaignParticipationData[0].sharedAt,
        knowledgeElements: expectedKnowledgeElements,
      });
    });
  });
});
