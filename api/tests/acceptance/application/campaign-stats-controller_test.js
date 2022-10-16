const {
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  LearningContentMock,
} = require('../../test-helper');

const createServer = require('../../../server');

describe('Acceptance | API | Campaign Stats Controller', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
    LearningContentMock.mockCommon();
  });

  describe('GET /api/campaigns/{id}/stats/participations-by-stage', function () {
    const skill1Id = 'skillPixA1C1Th1Tu1S1';
    const skill2Id = 'skillPixA1C1Th1Tu1S2';

    it('should return the campaign by id', async function () {
      // given
      const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId: skill1Id });
      databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId: skill2Id });
      const stage1 = databaseBuilder.factory.buildStage({
        targetProfileId,
        threshold: 0,
        prescriberTitle: 'title',
        prescriberDescription: 'desc',
      });
      const stage2 = databaseBuilder.factory.buildStage({ targetProfileId, threshold: 30 });

      const campaign = databaseBuilder.factory.buildCampaign({ targetProfileId });
      const userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildMembership({ organizationId: campaign.organizationId, userId });
      await databaseBuilder.commit();

      // when
      const response = await server.inject({
        method: 'GET',
        url: `/api/campaigns/${campaign.id}/stats/participations-by-stage`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      });

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data.id).to.equal(campaign.id.toString());
      expect(response.result.data.attributes.data).to.deep.equal([
        { id: stage1.id, value: 0, title: stage1.prescriberTitle, description: stage1.prescriberDescription },
        { id: stage2.id, value: 0, title: null, description: null },
      ]);
    });

    it('should return HTTP code 403 if the authenticated user is not authorize to access the campaign', async function () {
      // given
      const campaign = databaseBuilder.factory.buildCampaign();
      const userId = databaseBuilder.factory.buildUser().id;
      await databaseBuilder.commit();

      // when
      const response = await server.inject({
        method: 'GET',
        url: `/api/campaigns/${campaign.id}/stats/participations-by-stage`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      });

      // then
      expect(response.statusCode).to.equal(403);
    });
  });

  describe('GET /api/campaigns/{id}/stats/participations-by-status', function () {
    it('should return participations counts by status for the campaign', async function () {
      // given
      const campaign = databaseBuilder.factory.buildCampaign();
      const userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildMembership({ organizationId: campaign.organizationId, userId });
      await databaseBuilder.commit();

      // when
      const response = await server.inject({
        method: 'GET',
        url: `/api/campaigns/${campaign.id}/stats/participations-by-status`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      });

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data.id).to.equal(campaign.id.toString());
      expect(response.result.data.attributes).to.deep.equal({ started: 0, completed: 0, shared: 0 });
    });

    it('should return HTTP code 403 if the authenticated user is not authorize to access the campaign', async function () {
      // given
      const campaign = databaseBuilder.factory.buildCampaign();
      const userId = databaseBuilder.factory.buildUser().id;
      await databaseBuilder.commit();

      // when
      const response = await server.inject({
        method: 'GET',
        url: `/api/campaigns/${campaign.id}/stats/participations-by-status`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      });

      // then
      expect(response.statusCode).to.equal(403);
    });
  });

  describe('GET /api/campaigns/{id}/stats/participations-by-day', function () {
    it('should return the activity by day', async function () {
      // given
      const campaign = databaseBuilder.factory.buildCampaign();
      const userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildMembership({ organizationId: campaign.organizationId, userId });
      await databaseBuilder.commit();

      // when
      const response = await server.inject({
        method: 'GET',
        url: `/api/campaigns/${campaign.id}/stats/participations-by-day`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      });

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data).to.deep.equal({
        type: 'campaign-participations-counts-by-days',
        id: `${campaign.id}`,
        attributes: {
          'started-participations': [],
          'shared-participations': [],
        },
      });
    });
  });
});
