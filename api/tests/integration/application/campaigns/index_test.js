import { expect, HttpTestServer, sinon } from '../../../test-helper';
import moduleUnderTest from '../../../../lib/application/campaigns';
import campaignController from '../../../../lib/application/campaigns/campaign-controller';

describe('Integration | Application | Route | campaignRouter', function () {
  let httpTestServer;

  beforeEach(async function () {
    sinon.stub(campaignController, 'save').callsFake((request, h) => h.response('ok').code(201));
    sinon.stub(campaignController, 'getCsvAssessmentResults').callsFake((request, h) => h.response('ok').code(200));
    sinon
      .stub(campaignController, 'getCsvProfilesCollectionResults')
      .callsFake((request, h) => h.response('ok').code(200));
    sinon.stub(campaignController, 'getById').callsFake((request, h) => h.response('ok').code(200));
    sinon.stub(campaignController, 'getAnalysis').callsFake((request, h) => h.response('ok').code(200));

    httpTestServer = new HttpTestServer();
    await httpTestServer.register(moduleUnderTest);
  });

  describe('POST /api/campaigns', function () {
    it('should exist', async function () {
      // when
      const response = await httpTestServer.request('POST', '/api/campaigns');

      // then
      expect(response.statusCode).to.equal(201);
    });
  });

  describe('GET /api/campaigns/{id}/csv-assessment-results', function () {
    it('should exist', async function () {
      // when
      const response = await httpTestServer.request('GET', '/api/campaigns/1/csv-assessment-results');

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('GET /api/campaigns/{id}/csv-profiles-collection-results', function () {
    it('should exist', async function () {
      // when
      const response = await httpTestServer.request('GET', '/api/campaigns/1/csv-profiles-collection-results');

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('GET /api/campaigns/{id}', function () {
    it('should return a 200', async function () {
      // when
      const response = await httpTestServer.request('GET', '/api/campaigns/1');

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('GET /api/campaigns/{id}/analyses', function () {
    it('should return 200', async function () {
      // given
      const campaignId = 1;

      // when
      const response = await httpTestServer.request('GET', `/api/campaigns/${campaignId}/analyses`);

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should return 400', async function () {
      // given
      const campaignId = 'wrongId';

      // when
      const response = await httpTestServer.request('GET', `/api/campaigns/${campaignId}/analyses`);

      // then
      expect(response.statusCode).to.equal(400);
    });
  });
});
