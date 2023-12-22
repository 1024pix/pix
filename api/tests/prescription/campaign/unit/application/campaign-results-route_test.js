import { expect, HttpTestServer, sinon } from '../../../../test-helper.js';
import { campaignResultsController } from '../../../../../src/prescription/campaign/application/campaign-results-controller.js';
import { securityPreHandlers } from '../../../../../lib/application/security-pre-handlers.js';

import * as moduleUnderTest from '../../../../../src/prescription/campaign/application/campaign-results-route.js';

describe('Unit | Application | campaign-results-router ', function () {
  describe('GET /api/campaigns/{id}/profiles-collection-participations', function () {
    beforeEach(function () {
      sinon.stub(securityPreHandlers, 'checkAuthorizationToAccessCampaign').returns((_, h) => h.response(true));
      sinon
        .stub(campaignResultsController, 'findProfilesCollectionParticipations')
        .callsFake((request, h) => h.response('ok').code(200));
    });

    it('should return 200 with empty query string', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const result = await httpTestServer.request('GET', '/api/campaigns/1/profiles-collection-participations');

      // then
      expect(result.statusCode).to.equal(200);
    });

    it('should return 200 with pagination', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const result = await httpTestServer.request(
        'GET',
        '/api/campaigns/1/profiles-collection-participations?page[number]=1&page[size]=25',
      );

      // then
      expect(result.statusCode).to.equal(200);
    });

    it('should return 200 with a string array of one element as division filter', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const result = await httpTestServer.request(
        'GET',
        '/api/campaigns/1/profiles-collection-participations?filter[divisions][]="3EMEB"',
      );

      // then
      expect(result.statusCode).to.equal(200);
    });

    it('should return 200 with a string array of several elements as division filter', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const result = await httpTestServer.request(
        'GET',
        '/api/campaigns/1/profiles-collection-participations?filter[divisions][]="3EMEB"&filter[divisions][]="3EMEA"',
      );

      // then
      expect(result.statusCode).to.equal(200);
    });

    it('should return 200 with a string array of one element as group filter', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const result = await httpTestServer.request(
        'GET',
        '/api/campaigns/1/profiles-collection-participations?filter[groups][]="AB1"',
      );

      // then
      expect(result.statusCode).to.equal(200);
    });

    it('should return 200 with a string array of several elements as group filter', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const result = await httpTestServer.request(
        'GET',
        '/api/campaigns/1/profiles-collection-participations?filter[groups][]="AB1"&filter[groups][]="AB2"',
      );

      // then
      expect(result.statusCode).to.equal(200);
    });

    it('should return 200 with a string of certificability filter', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const result = await httpTestServer.request(
        'GET',
        '/api/campaigns/1/profiles-collection-participations?filter[certificability]="eligibile"',
      );

      // then
      expect(result.statusCode).to.equal(200);
    });

    it('should return 400 with unexpected filters', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const result = await httpTestServer.request(
        'GET',
        '/api/campaigns/1/profiles-collection-participations?filter[unexpected][]=5',
      );

      // then
      expect(result.statusCode).to.equal(400);
    });

    it('should return 400 with a division filter which is not an array', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const result = await httpTestServer.request(
        'GET',
        '/api/campaigns/1/profiles-collection-participations?filter[divisions]="3EMEA"',
      );

      // then
      expect(result.statusCode).to.equal(400);
    });

    it('should return 400 with a group filter which is not an array', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const result = await httpTestServer.request(
        'GET',
        '/api/campaigns/1/profiles-collection-participations?filter[groups]="AB3"',
      );

      // then
      expect(result.statusCode).to.equal(400);
    });

    it('should return 400 with a page number which is not a number', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const result = await httpTestServer.request(
        'GET',
        '/api/campaigns/1/profiles-collection-participations?page[number]=a',
      );

      // then
      expect(result.statusCode).to.equal(400);
    });

    it('should return 400 with a page size which is not a number', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const result = await httpTestServer.request(
        'GET',
        '/api/campaigns/1/profiles-collection-participations?page[size]=a',
      );

      // then
      expect(result.statusCode).to.equal(400);
    });

    it('should return 400 with an invalid campaign id', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const result = await httpTestServer.request('GET', '/api/campaigns/invalid/profiles-collection-participations');

      // then
      expect(result.statusCode).to.equal(400);
    });
  });
});
