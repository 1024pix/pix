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
    sinon.stub(campaignController, 'findProfilesCollectionParticipations').callsFake((request, h) => h.response('ok').code(200));
    sinon.stub(campaignController, 'findAssessmentParticipations').callsFake((request, h) => h.response('ok').code(200));

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

  describe('GET /api/campaigns/{id}/profiles-collection-participations', () => {

    it('should return 200 with empty query string', async () => {
      // when
      const result = await httpTestServer.request('GET', '/api/campaigns/1/profiles-collection-participations');

      // then
      expect(result.statusCode).to.equal(200);
    });

    it('should return 200 with pagination', async () => {
      // when
      const result = await httpTestServer.request('GET', '/api/campaigns/1/profiles-collection-participations?page[number]=1&page[size]=25');

      // then
      expect(result.statusCode).to.equal(200);
    });

    it('should return 200 with a string array of one element as division filter', async () => {
      // when
      const result = await httpTestServer.request('GET', '/api/campaigns/1/profiles-collection-participations?filter[divisions][]="3EMEB"');

      // then
      expect(result.statusCode).to.equal(200);
    });

    it('should return 200 with a string array of several elements as division filter', async () => {
      // when
      const result = await httpTestServer.request('GET', '/api/campaigns/1/profiles-collection-participations?filter[divisions][]="3EMEB"&filter[divisions][]="3EMEA"');

      // then
      expect(result.statusCode).to.equal(200);
    });

    it('should return 400 with unexpected filters', async () => {
      // when
      const result = await httpTestServer.request('GET', '/api/campaigns/1/profiles-collection-participations?filter[unexpected][]=5');

      // then
      expect(result.statusCode).to.equal(400);
    });

    it('should return 400 with a division filter which is not an array', async () => {
      // when
      const result = await httpTestServer.request('GET', '/api/campaigns/1/profiles-collection-participations?filter[divisions]="3EMEA"');

      // then
      expect(result.statusCode).to.equal(400);
    });

    it('should return 400 with a page number which is not a number', async () => {
      // when
      const result = await httpTestServer.request('GET', '/api/campaigns/1/profiles-collection-participations?page[number]=a');

      // then
      expect(result.statusCode).to.equal(400);
    });

    it('should return 400 with a page size which is not a number', async () => {
      // when
      const result = await httpTestServer.request('GET', '/api/campaigns/1/profiles-collection-participations?page[size]=a');

      // then
      expect(result.statusCode).to.equal(400);
    });

    it('should return 400 with an invalid campaign id', async () => {
      // when
      const result = await httpTestServer.request('GET', '/api/campaigns/invalid/profiles-collection-participations');

      // then
      expect(result.statusCode).to.equal(400);
    });
  });

  describe('GET /api/campaigns/{id}/assessment-participations', () => {

    it('should return 200 with empty query string', async () => {
      // when
      const result = await httpTestServer.request('GET', '/api/campaigns/1/assessment-participations');

      // then
      expect(result.statusCode).to.equal(200);
    });

    it('should return 200 with pagination', async () => {
      // when
      const result = await httpTestServer.request('GET', '/api/campaigns/1/assessment-participations?page[number]=1&page[size]=25');

      // then
      expect(result.statusCode).to.equal(200);
    });

    it('should return 200 with a string array of one element as division filter', async () => {
      // when
      const result = await httpTestServer.request('GET', '/api/campaigns/1/assessment-participations?filter[divisions][]="3EMEB"');

      // then
      expect(result.statusCode).to.equal(200);
    });

    it('should return 200 with a string array of several elements as division filter', async () => {
      // when
      const result = await httpTestServer.request('GET', '/api/campaigns/1/assessment-participations?filter[divisions][]="3EMEB"&filter[divisions][]="3EMEA"');

      // then
      expect(result.statusCode).to.equal(200);
    });

    it('should return 200 with a string array of one element as badge filter', async () => {
      // when
      const result = await httpTestServer.request('GET', '/api/campaigns/1/assessment-participations?filter[badges][]=114');

      // then
      expect(result.statusCode).to.equal(200);
    });

    it('should return 200 with a string array of several elements as badge filter', async () => {
      // when
      const result = await httpTestServer.request('GET', '/api/campaigns/1/assessment-participations?filter[badges][]=114&filter[badges][]=115');

      // then
      expect(result.statusCode).to.equal(200);
    });

    it('should return 400 with unexpected filters', async () => {
      // when
      const result = await httpTestServer.request('GET', '/api/campaigns/1/assessment-participations?filter[unexpected][]=5');

      // then
      expect(result.statusCode).to.equal(400);
    });

    it('should return 400 with a division filter which is not an array', async () => {
      // when
      const result = await httpTestServer.request('GET', '/api/campaigns/1/assessment-participations?filter[divisions]="3EMEA"');

      // then
      expect(result.statusCode).to.equal(400);
    });

    it('should return 400 with a badge filter which is not an array', async () => {
      // when
      const result = await httpTestServer.request('GET', '/api/campaigns/1/assessment-participations?filter[badges]=114');

      // then
      expect(result.statusCode).to.equal(400);
    });

    it('should return 400 with a badge filter which is not a number', async () => {
      // when
      const result = await httpTestServer.request('GET', '/api/campaigns/1/assessment-participations?filter[badges][]="truc"');

      // then
      expect(result.statusCode).to.equal(400);
    });

    it('should return 400 with a page number which is not a number', async () => {
      // when
      const result = await httpTestServer.request('GET', '/api/campaigns/1/assessment-participations?page[number]=a');

      // then
      expect(result.statusCode).to.equal(400);
    });

    it('should return 400 with a page size which is not a number', async () => {
      // when
      const result = await httpTestServer.request('GET', '/api/campaigns/1/assessment-participations?page[size]=a');

      // then
      expect(result.statusCode).to.equal(400);
    });

    it('should return 400 with an invalid campaign id', async () => {
      // when
      const result = await httpTestServer.request('GET', '/api/campaigns/invalid/assessment-participations');

      // then
      expect(result.statusCode).to.equal(400);
    });
  });
});
