const { expect, sinon } = require('../../../test-helper');
const Hapi = require('@hapi/hapi');
const campaignController = require('../../../../lib/application/campaigns/campaign-controller');

describe('Integration | Application | Route | campaignRouter', () => {
  let server;

  beforeEach(() => {
    sinon.stub(campaignController, 'save').callsFake((request, h) => h.response('ok').code(201));
    sinon.stub(campaignController, 'getCsvAssessmentResults').callsFake((request, h) => h.response('ok').code(200));
    sinon.stub(campaignController, 'getCsvProfilesCollectionResults').callsFake((request, h) => h.response('ok').code(200));
    sinon.stub(campaignController, 'getById').callsFake((request, h) => h.response('ok').code(200));
    sinon.stub(campaignController, 'update').callsFake((request, h) => h.response('ok').code(201));
    sinon.stub(campaignController, 'getAnalysis').callsFake((request, h) => h.response('ok').code(200));

    server = Hapi.server();

    return server.register(require('../../../../lib/application/campaigns'));
  });

  afterEach(() => {
    server.stop();
  });

  describe('POST /api/campaigns', () => {

    it('should exist', function() {
      // when
      const promise = server.inject({
        method: 'POST',
        url: '/api/campaigns',
      });

      // then
      return promise.then((res) => {
        expect(res.statusCode).to.equal(201);
      });

    });

  });

  describe('GET /api/campaigns/{id}/csvResults', () => {

    it('should exist', () => {
      // when
      const promise = server.inject({
        method: 'GET',
        url: '/api/campaigns/FAKE_ID/csvResults',
      });

      // then
      return promise.then((res) => {
        expect(res.statusCode).to.equal(200);
      });

    });

  });

  describe('GET /api/campaigns/{id}/csv-assessment-results', () => {

    it('should exist', () => {
      // when
      const promise = server.inject({
        method: 'GET',
        url: '/api/campaigns/FAKE_ID/csv-assessment-results',
      });

      // then
      return promise.then((res) => {
        expect(res.statusCode).to.equal(200);
      });

    });

  });

  describe('GET /api/campaigns/{id}/csv-profiles-collection-results', () => {

    it('should exist', () => {
      // when
      const promise = server.inject({
        method: 'GET',
        url: '/api/campaigns/FAKE_ID/csv-profiles-collection-results',
      });

      // then
      return promise.then((res) => {
        expect(res.statusCode).to.equal(200);
      });

    });

  });

  describe('GET /api/campaigns/{id}', () => {

    it('should return a 200', function() {
      // when
      const promise = server.inject({
        method: 'GET',
        url: '/api/campaigns/1',
      });

      // then
      return promise.then((res) => {
        expect(res.statusCode).to.equal(200);
      });
    });
  });

  describe('GET /api/campaigns/{id}/analyses', () => {

    it('should return 200', async () => {
      // given
      const campaignId = 1;

      // when
      const result = await server.inject({ method: 'GET', url: `/api/campaigns/${campaignId}/analyses` });

      // then
      expect(result.statusCode).to.equal(200);
    });

    it('should return 400', async () => {
      // given
      const campaignId = 'wrongId';

      // when
      const result = await server.inject({ method: 'GET', url: `/api/campaigns/${campaignId}/analyses` });

      // then
      expect(result.statusCode).to.equal(400);
    });
  });

  describe('PATCH /api/campaigns/{id}', () => {

    it('should exist', function() {
      // when
      const promise = server.inject({
        method: 'PATCH',
        url: '/api/campaigns/FAKE_ID',
      });

      // then
      return promise.then((res) => {
        expect(res.statusCode).to.equal(201);
      });
    });

  });

});
