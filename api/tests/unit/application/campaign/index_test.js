const { expect, HttpTestServer, sinon } = require('../../../test-helper');
const securityPreHandlers = require('../../../../lib/application/security-pre-handlers');
const { NotFoundError } = require('../../../../lib/domain/errors');
const moduleUnderTest = require('../../../../lib/application/campaigns');
const campaignController = require('../../../../lib/application/campaigns/campaign-controller');
const campaignStatsController = require('../../../../lib/application/campaigns/campaign-stats-controller');
const campaignManagementController = require('../../../../lib/application/campaigns/campaign-management-controller');

describe('Unit | Application | Router | campaign-router ', function () {
  describe('POST /api/campaigns', function () {
    it('should return 201', async function () {
      // given
      sinon.stub(campaignController, 'save').callsFake((request, h) => h.response('ok').code(201));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('POST', '/api/campaigns');

      // then
      expect(response.statusCode).to.equal(201);
    });
  });

  describe('GET /api/campaigns?filter[code=SOMECODE]', function () {
    it('should return 200', async function () {
      // given
      sinon.stub(campaignController, 'getByCode').callsFake((request, h) => h.response('ok').code(200));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // given
      campaignController.getByCode.returns('ok');

      // when
      const response = await httpTestServer.request('GET', '/api/campaigns?filter[code=SOMECODE]');

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should return 404 when controller throws a NotFound domain error', async function () {
      // given
      sinon.stub(campaignController, 'getByCode').rejects(new NotFoundError());
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('GET', '/api/campaigns?filter[code=SOMECODE]');

      // then
      expect(response.statusCode).to.equal(404);
    });
  });

  describe('GET /api/campaigns/{id}', function () {
    it('should return 200', async function () {
      // given
      sinon.stub(campaignController, 'getById').callsFake((request, h) => h.response('ok').code(200));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('GET', '/api/campaigns/1');

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should return 400 with an invalid campaign id', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('GET', '/api/campaigns/invalid');

      // then
      expect(response.statusCode).to.equal(400);
    });
  });

  describe('GET /api/campaigns/{id}/csv-assessment-results', function () {
    it('should return 200', async function () {
      // given
      sinon.stub(campaignController, 'getCsvAssessmentResults').callsFake((request, h) => h.response('ok').code(200));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('GET', '/api/campaigns/1/csv-assessment-results');

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should return 400 with an invalid campaign id', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('GET', '/api/campaigns/invalid/csv-assessment-results');

      // then
      expect(response.statusCode).to.equal(400);
    });
  });

  describe('GET /api/campaigns/{id}/csv-profiles-collection-results', function () {
    it('should return 200', async function () {
      // given
      sinon
        .stub(campaignController, 'getCsvProfilesCollectionResults')
        .callsFake((request, h) => h.response('ok').code(200));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('GET', '/api/campaigns/1/csv-profiles-collection-results');

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should return 400 with an invalid campaign id', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('GET', '/api/campaigns/invalid/csv-profiles-collection-results');

      // then
      expect(response.statusCode).to.equal(400);
    });
  });

  describe('PATCH /api/campaigns/{id}', function () {
    it('should return 400 with an invalid campaign id', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('PATCH', '/api/campaigns/invalid');

      // then
      expect(response.statusCode).to.equal(400);
    });
  });

  describe('PATCH /api/admin/campaigns/{id}', function () {
    it('should return 204', async function () {
      // given
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleCertif')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
      sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin').callsFake((request, h) => h.response(true));
      sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport').callsFake((request, h) => h.response(true));
      sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleMetier').callsFake((request, h) => h.response(true));
      sinon
        .stub(campaignManagementController, 'updateCampaignDetailsManagement')
        .callsFake((request, h) => h.response('ok').code(204));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);
      const payload = {
        data: {
          type: 'campaigns',
          attributes: {
            name: 'name',
            title: 'title',
            'custom-landing-page-text': null,
            'custom-result-page-text': null,
            'custom-result-page-button-text': null,
            'custom-result-page-button-url': null,
            'multiple-sendings': false,
          },
        },
      };

      // when
      const response = await httpTestServer.request('PATCH', '/api/admin/campaigns/1', payload);

      // then
      expect(response.statusCode).to.equal(204);
    });

    it('should return 400 with an invalid campaign id', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('PATCH', '/api/admin/campaigns/invalid');

      // then
      expect(response.statusCode).to.equal(400);
    });

    it('should return 400 when name is null', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);
      const payload = {
        data: {
          type: 'campaigns',
          attributes: {
            name: null,
            title: null,
            'custom-result-page-text': null,
            'custom-result-page-button-text': null,
            'custom-result-page-button-url': null,
            'custom-landing-page-text': null,
            'multiple-sendings': false,
          },
        },
      };

      // when
      const response = await httpTestServer.request('PATCH', '/api/admin/campaigns/1', payload);

      // then
      expect(response.statusCode).to.equal(400);
    });

    it('should return 400 when name is empty', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);
      const payload = {
        data: {
          type: 'campaigns',
          attributes: {
            name: '',
            title: null,
            'custom-result-page-text': null,
            'custom-result-page-button-text': null,
            'custom-result-page-button-url': null,
            'custom-landing-page-text': null,
            'multiple-sendings': false,
          },
        },
      };

      // when
      const response = await httpTestServer.request('PATCH', '/api/admin/campaigns/1', payload);

      // then
      expect(response.statusCode).to.equal(400);
    });

    it('should return 400 when title is empty', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);
      const payload = {
        data: {
          type: 'campaigns',
          attributes: {
            name: 'name',
            title: '',
            'custom-result-page-text': null,
            'custom-result-page-button-text': null,
            'custom-result-page-button-url': null,
            'custom-landing-page-text': null,
            'multiple-sendings': false,
          },
        },
      };

      // when
      const response = await httpTestServer.request('PATCH', '/api/admin/campaigns/1', payload);

      // then
      expect(response.statusCode).to.equal(400);
    });

    it('returns forbidden access if admin member has CERTIF role', async function () {
      // given
      sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleCertif').callsFake((request, h) => h.response(true));
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleMetier')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);
      const payload = {
        data: {
          type: 'campaigns',
          attributes: {
            name: 'name',
            title: 'title',
            'custom-landing-page-text': null,
            'custom-result-page-text': null,
            'custom-result-page-button-text': null,
            'custom-result-page-button-url': null,
            'multiple-sendings': false,
          },
        },
      };

      // when
      const response = await httpTestServer.request('PATCH', '/api/admin/campaigns/1', payload);

      // then
      expect(response.statusCode).to.equal(403);
    });
  });

  describe('GET /api/admin/campaigns/{id}', function () {
    it('should return 200', async function () {
      // given
      sinon.stub(securityPreHandlers, 'adminMemberHasAtLeastOneAccessOf').returns(() => true);
      sinon
        .stub(campaignManagementController, 'getCampaignDetails')
        .callsFake((request, h) => h.response('ok').code(200));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('GET', '/api/admin/campaigns/1');

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should return 400 with an invalid campaign id', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('GET', '/api/admin/campaigns/invalid');

      // then
      expect(response.statusCode).to.equal(400);
    });

    it('should return 403 when unauthorized', async function () {
      // given
      sinon
        .stub(securityPreHandlers, 'adminMemberHasAtLeastOneAccessOf')
        .returns((request, h) => h.response().code(403).takeover());
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('GET', '/api/admin/campaigns/1');

      // then
      expect(response.statusCode).to.equal(403);
    });
  });

  describe('GET /api/admin/campaigns/{id}/participations', function () {
    it('should return 200', async function () {
      // given
      sinon.stub(securityPreHandlers, 'adminMemberHasAtLeastOneAccessOf').returns(() => true);
      sinon
        .stub(campaignManagementController, 'findPaginatedParticipationsForCampaignManagement')
        .callsFake((request, h) => h.response('ok').code(200));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('GET', '/api/admin/campaigns/1/participations');

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should return 400 with an invalid campaign id', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('GET', '/api/admin/campaigns/invalid/participations');

      // then
      expect(response.statusCode).to.equal(400);
    });

    it('should return 403 when unauthorized', async function () {
      // given
      sinon
        .stub(securityPreHandlers, 'adminMemberHasAtLeastOneAccessOf')
        .returns((request, h) => h.response().code(403).takeover());
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('GET', '/api/admin/campaigns/1/participations');

      // then
      expect(response.statusCode).to.equal(403);
    });
  });

  describe('GET /api/campaigns/{id}/collective-results', function () {
    it('should return 200', async function () {
      // given
      sinon.stub(campaignController, 'getCollectiveResult').callsFake((request, h) => h.response('ok').code(200));
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
  });

  describe('GET /api/campaigns/{id}/analyses', function () {
    it('should return 200', async function () {
      // given
      sinon.stub(campaignController, 'getAnalysis').callsFake((request, h) => h.response('ok').code(200));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('GET', '/api/campaigns/1/analyses');

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should return 400', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('GET', '/api/campaigns/wrong_id/analyses');

      // then
      expect(response.statusCode).to.equal(400);
    });
  });

  describe('PUT /api/campaigns/{id}/archive', function () {
    it('should return 400 with an invalid campaign id', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('PUT', '/api/campaigns/invalid/archive');

      // then
      expect(response.statusCode).to.equal(400);
    });
  });

  describe('DELETE /api/campaigns/{id}/archive', function () {
    it('should return 400 with an invalid campaign id', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('DELETE', '/api/campaigns/invalid/archive');

      // then
      expect(response.statusCode).to.equal(400);
    });
  });

  describe('GET /api/campaigns/{id}/profiles-collection-participations', function () {
    it('should return 200 with empty query string', async function () {
      // given
      sinon
        .stub(campaignController, 'findProfilesCollectionParticipations')
        .callsFake((request, h) => h.response('ok').code(200));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const result = await httpTestServer.request('GET', '/api/campaigns/1/profiles-collection-participations');

      // then
      expect(result.statusCode).to.equal(200);
    });

    it('should return 200 with pagination', async function () {
      // given
      sinon.stub(campaignController, 'findProfilesCollectionParticipations').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const result = await httpTestServer.request(
        'GET',
        '/api/campaigns/1/profiles-collection-participations?page[number]=1&page[size]=25'
      );

      // then
      expect(result.statusCode).to.equal(200);
    });

    it('should return 200 with a string array of one element as division filter', async function () {
      // given
      sinon.stub(campaignController, 'findProfilesCollectionParticipations').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const result = await httpTestServer.request(
        'GET',
        '/api/campaigns/1/profiles-collection-participations?filter[divisions][]="3EMEB"'
      );

      // then
      expect(result.statusCode).to.equal(200);
    });

    it('should return 200 with a string array of several elements as division filter', async function () {
      // given
      sinon.stub(campaignController, 'findProfilesCollectionParticipations').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const result = await httpTestServer.request(
        'GET',
        '/api/campaigns/1/profiles-collection-participations?filter[divisions][]="3EMEB"&filter[divisions][]="3EMEA"'
      );

      // then
      expect(result.statusCode).to.equal(200);
    });

    it('should return 200 with a string array of one element as group filter', async function () {
      // given
      sinon.stub(campaignController, 'findProfilesCollectionParticipations').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const result = await httpTestServer.request(
        'GET',
        '/api/campaigns/1/profiles-collection-participations?filter[groups][]="AB1"'
      );

      // then
      expect(result.statusCode).to.equal(200);
    });

    it('should return 200 with a string array of several elements as group filter', async function () {
      // given
      sinon.stub(campaignController, 'findProfilesCollectionParticipations').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const result = await httpTestServer.request(
        'GET',
        '/api/campaigns/1/profiles-collection-participations?filter[groups][]="AB1"&filter[groups][]="AB2"'
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
        '/api/campaigns/1/profiles-collection-participations?filter[unexpected][]=5'
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
        '/api/campaigns/1/profiles-collection-participations?filter[divisions]="3EMEA"'
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
        '/api/campaigns/1/profiles-collection-participations?filter[groups]="AB3"'
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
        '/api/campaigns/1/profiles-collection-participations?page[number]=a'
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
        '/api/campaigns/1/profiles-collection-participations?page[size]=a'
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

  describe('GET /api/campaigns/{id}/divisions', function () {
    it('should return 200', async function () {
      // given
      sinon.stub(campaignController, 'division').callsFake((request, h) => h.response('ok').code(200));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const result = await httpTestServer.request('GET', '/api/campaigns/1/divisions');

      // then
      expect(result.statusCode).to.equal(200);
    });

    it('should return 400 with an invalid campaign id', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const result = await httpTestServer.request('GET', '/api/campaigns/invalid/divisions');

      // then
      expect(result.statusCode).to.equal(400);
    });
  });

  describe('GET /api/campaigns/{id}/groups', function () {
    it('should return 200', async function () {
      // given
      sinon.stub(campaignController, 'getGroups').callsFake((request, h) => h.response('ok').code(200));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const result = await httpTestServer.request('GET', '/api/campaigns/1/groups');

      // then
      expect(result.statusCode).to.equal(200);
    });

    it('should return 400 with an invalid campaign id', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const result = await httpTestServer.request('GET', '/api/campaigns/invalid/groups');

      // then
      expect(result.statusCode).to.equal(400);
    });
  });

  describe('GET /api/campaigns/{id}/stats/participations-by-stage', function () {
    it('should return 200', async function () {
      // given
      sinon
        .stub(campaignStatsController, 'getParticipationsByStage')
        .callsFake((request, h) => h.response('ok').code(200));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const result = await httpTestServer.request('GET', '/api/campaigns/1/stats/participations-by-stage');

      // then
      expect(result.statusCode).to.equal(200);
    });

    it('should return 400 with an invalid campaign id', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const result = await httpTestServer.request('GET', '/api/campaigns/invalid/stats/participations-by-stage');

      // then
      expect(result.statusCode).to.equal(400);
    });
  });

  describe('GET /api/campaigns/{id}/stats/participations-by-status', function () {
    it('should return 200', async function () {
      sinon
        .stub(campaignStatsController, 'getParticipationsByStatus')
        .callsFake((request, h) => h.response('ok').code(200));

      // when
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);
      const result = await httpTestServer.request('GET', '/api/campaigns/1/stats/participations-by-status');

      // then
      expect(result.statusCode).to.equal(200);
    });

    it('should return 400 with an invalid campaign id', async function () {
      // when
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);
      const result = await httpTestServer.request('GET', '/api/campaigns/invalid/stats/participations-by-status');

      // then
      expect(result.statusCode).to.equal(400);
    });
  });

  describe('GET /api/campaigns/{id}/participants-activity', function () {
    it('should return 200', async function () {
      sinon.stub(campaignController, 'findParticipantsActivity').callsFake((request, h) => h.response('ok').code(200));

      // when
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);
      const result = await httpTestServer.request('GET', '/api/campaigns/1/participants-activity');

      // then
      expect(result.statusCode).to.equal(200);
    });

    it('should return 200 with a string array of one element as division filter', async function () {
      // given
      sinon.stub(campaignController, 'findParticipantsActivity').callsFake((request, h) => h.response('ok').code(200));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const result = await httpTestServer.request(
        'GET',
        '/api/campaigns/1/participants-activity?filter[divisions][]="3EMEB"'
      );

      // then
      expect(result.statusCode).to.equal(200);
    });

    it('should return 200 with a string array of several elements as division filter', async function () {
      // given
      sinon.stub(campaignController, 'findParticipantsActivity').callsFake((request, h) => h.response('ok').code(200));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const result = await httpTestServer.request(
        'GET',
        '/api/campaigns/1/participants-activity?filter[divisions][]="3EMEB"&filter[divisions][]="3EMEA"'
      );

      // then
      expect(result.statusCode).to.equal(200);
    });

    it('should return 400 with an invalid campaign id', async function () {
      // when
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);
      const result = await httpTestServer.request('GET', '/api/campaigns/invalid/participants-activity');

      // then
      expect(result.statusCode).to.equal(400);
    });

    it('should return 400 with unexpected filters', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const result = await httpTestServer.request(
        'GET',
        '/api/campaigns/1/participants-activity?filter[unexpected][]=5'
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
        '/api/campaigns/1/participants-activity?filter[divisions]="3EMEA"'
      );

      // then
      expect(result.statusCode).to.equal(400);
    });
  });

  describe('GET /api/campaigns/{id}/stats/participations-by-mastery-rate', function () {
    beforeEach(function () {
      sinon
        .stub(campaignStatsController, 'getParticipationsCountByMasteryRate')
        .callsFake((request, h) => h.response('ok').code(200));
    });

    it('should return 200', async function () {
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);
      const result = await httpTestServer.request('GET', '/api/campaigns/1/stats/participations-by-mastery-rate');

      expect(result.statusCode).to.equal(200);
    });

    it('should return 400 with an invalid campaign id', async function () {
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);
      const result = await httpTestServer.request('GET', '/api/campaigns/invalid/stats/participations-by-mastery-rate');

      expect(result.statusCode).to.equal(400);
    });
  });
});
