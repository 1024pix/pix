import {
  expect,
  HttpTestServer,
  sinon,
  databaseBuilder,
  generateValidRequestAuthorizationHeader,
} from '../../../test-helper.js';
import { campaignController } from '../../../../lib/application/campaigns/campaign-controller.js';
import * as moduleUnderTest from '../../../../lib/application/campaigns/index.js';
import { getByIds } from '../../../../src/shared/infrastructure/repositories/user-repository.js';

describe('Integration | Application | Route | campaignRouter', function () {
  let httpTestServer, getByIdStub;
  beforeEach(async function () {
    sinon.stub(campaignController, 'save').callsFake((request, h) => h.response('ok').code(201));
    sinon.stub(campaignController, 'getCsvAssessmentResults').callsFake((request, h) => h.response('ok').code(200));
    sinon
      .stub(campaignController, 'getCsvProfilesCollectionResults')
      .callsFake((request, h) => h.response('ok').code(200));
    getByIdStub = sinon.stub(campaignController, 'getById').callsFake((request, h) => h.response('ok').code(200));
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
    beforeEach(function () {
      httpTestServer.setupAuthentication();
    });

    it('should return a 200 if user can access campaign', async function () {
      //given
      const organization = databaseBuilder.factory.buildOrganization();
      const user = databaseBuilder.factory.buildUser();
      databaseBuilder.factory.buildMembership({ userId: user.id, organizationId: organization.id });
      const campaign = databaseBuilder.factory.buildCampaign({ id: '1', organizationId: organization.id });
      await databaseBuilder.commit();

      const options = {
        method: 'GET',
        url: `/api/campaigns/${campaign.id}`,
        headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
      };

      // when
      const response = await httpTestServer.requestObject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(getByIdStub.called).to.be.true;
    });
    it('should return a 403 if user can not access campaign', async function () {
      //given
      const organization = databaseBuilder.factory.buildOrganization();
      const user = databaseBuilder.factory.buildUser();
      const campaign = databaseBuilder.factory.buildCampaign({ id: '1', organizationId: organization.id });
      await databaseBuilder.commit();

      const options = {
        method: 'GET',
        url: `/api/campaigns/${campaign.id}`,
        headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
      };
      // when
      const response = await httpTestServer.requestObject(options);

      // then
      expect(response.statusCode).to.equal(403);
      expect(getByIdStub.notCalled).to.be.true;
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
