const {
  expect,
  HttpTestServer,
  sinon,
} = require('../../../test-helper');

const moduleUnderTest = require('../../../../lib/application/campaigns');

const campaignController = require('../../../../lib/application/campaigns/campaign-controller');

describe('Integration | Application | Route | campaignRouter', () => {

  let httpTestServer;

  beforeEach(() => {
    sinon.stub(campaignController, 'save').callsFake((request, h) => h.response('ok').code(201));
    sinon.stub(campaignController, 'getCsvAssessmentResults').callsFake((request, h) => h.response('ok').code(200));
    sinon.stub(campaignController, 'getCsvProfilesCollectionResults').callsFake((request, h) => h.response('ok').code(200));
    sinon.stub(campaignController, 'getById').callsFake((request, h) => h.response('ok').code(200));
    sinon.stub(campaignController, 'update').callsFake((request, h) => h.response('ok').code(201));
    sinon.stub(campaignController, 'getAnalysis').callsFake((request, h) => h.response('ok').code(200));

    httpTestServer = new HttpTestServer(moduleUnderTest);
  });

  describe('POST /api/campaigns', () => {

    it('should exist', async () => {
      // when
      const response = await httpTestServer.request('POST', '/api/campaigns');

      // then
      expect(response.statusCode).to.equal(201);
    });
  });

  describe('GET /api/campaigns/{id}/csv-assessment-results', () => {

    it('should exist', async () => {
      // when
      const response = await httpTestServer.request('GET', '/api/campaigns/FAKE_ID/csv-assessment-results');

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('GET /api/campaigns/{id}/csv-profiles-collection-results', () => {

    it('should exist', async () => {
      // when
      const response = await httpTestServer.request('GET', '/api/campaigns/FAKE_ID/csv-profiles-collection-results');

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('GET /api/campaigns/{id}', () => {

    it('should return a 200', async () => {
      // when
      const response = await httpTestServer.request('GET', '/api/campaigns/1');

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('GET /api/campaigns/{id}/analyses', () => {

    it('should return 200', async () => {
      // given
      const campaignId = 1;

      // when
      const response = await httpTestServer.request('GET', `/api/campaigns/${campaignId}/analyses`);

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should return 400', async () => {
      // given
      const campaignId = 'wrongId';

      // when
      const response = await httpTestServer.request('GET', `/api/campaigns/${campaignId}/analyses`);

      // then
      expect(response.statusCode).to.equal(400);
    });
  });

  describe('PATCH /api/campaigns/{id}', () => {

    it('should exist', async () => {
      // when
      const response = await httpTestServer.request('PATCH', '/api/campaigns/FAKE_ID');

      // then
      expect(response.statusCode).to.equal(201);
    });
  });
});
