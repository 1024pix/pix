import sinon from 'sinon';

import { campaignResultsController } from '../../../../../src/prescription/campaign/application/campaign-results-controller.js';
import { campaignResultsRoute as moduleUnderTest } from '../../../../../src/prescription/campaign/application/campaign-results-route.js';
import { securityPreHandlers } from '../../../../../src/shared/application/security-pre-handlers.js';
import { expect } from '../../../../test-helper.js';
import { HttpTestServer } from '../../../../tooling/server/http-test-server.js';

describe('Unit | Application | campaign-results-router ', function () {
  describe('GET /api/campaigns/{campaignId}/assessment-results', function () {
    describe('when pre handler throws', function () {
      it('should not call controller', async function () {
        // given
        const checkOrganizationAccessStub = sinon.stub(securityPreHandlers, 'checkOrganizationAccess');
        const checkAuthorizationToAccessCampaignStub = sinon.stub(
          securityPreHandlers,
          'checkAuthorizationToAccessCampaign',
        );
        sinon.stub(campaignResultsController, 'findAssessmentParticipationResults');

        const validateAllAccessStub = sinon.stub(securityPreHandlers, 'validateAllAccess').returns((request, h) =>
          h
            .response({ errors: new Error('') })
            .code(403)
            .takeover(),
        );
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        await httpTestServer.request('GET', '/api/campaigns/1/assessment-results');

        // then
        expect(
          validateAllAccessStub.calledWithExactly([
            checkAuthorizationToAccessCampaignStub,
            checkOrganizationAccessStub,
          ]),
        ).to.be.true;
        expect(campaignResultsController.findAssessmentParticipationResults.called).to.be.false;
      });
    });
  });

  describe('GET /api/campaigns/{campaignId}/profiles-collection-participations', function () {
    let checkAuthorizationToAccessCampaignStub, checkOrganizationAccessStub;

    beforeEach(function () {
      checkOrganizationAccessStub = sinon.stub(securityPreHandlers, 'checkOrganizationAccess').returns(true);
      checkAuthorizationToAccessCampaignStub = sinon
        .stub(securityPreHandlers, 'checkAuthorizationToAccessCampaign')
        .returns((_, h) => h.response(true));
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

    describe('when pre handler throws', function () {
      it('should not call controller', async function () {
        // given
        const validateAllAccessStub = sinon.stub(securityPreHandlers, 'validateAllAccess').returns((request, h) =>
          h
            .response({ errors: new Error('') })
            .code(403)
            .takeover(),
        );
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        await httpTestServer.request('GET', '/api/campaigns/1/profiles-collection-participations');

        // then
        expect(
          validateAllAccessStub.calledWithExactly([
            checkAuthorizationToAccessCampaignStub,
            checkOrganizationAccessStub,
          ]),
        ).to.be.true;
        expect(campaignResultsController.findProfilesCollectionParticipations.called).to.be.false;
      });
    });
  });

  describe('GET /api/campaigns/{campaignId}/collective-results', function () {
    it('should return 200', async function () {
      // given
      sinon.stub(securityPreHandlers, 'checkOrganizationAccess').returns(true);
      sinon
        .stub(campaignResultsController, 'getCollectiveResult')
        .callsFake((request, h) => h.response('ok').code(200));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('GET', '/api/campaigns/1/collective-results');

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should return 400 with an invalid campaign id', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('GET', '/api/campaigns/invalid/collective-results');

      // then
      expect(response.statusCode).to.equal(400);
    });

    describe('when pre handler throws', function () {
      it('should not call controller', async function () {
        // given
        const getCollectiveResultStub = sinon.stub(campaignResultsController, 'getCollectiveResult');
        const organizationAccessStub = sinon.stub(securityPreHandlers, 'checkOrganizationAccess').throws();
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        await httpTestServer.request('GET', '/api/campaigns/1/collective-results');

        // then
        expect(organizationAccessStub.called).to.be.true;
        expect(getCollectiveResultStub.called).to.be.false;
      });
    });
  });
});
