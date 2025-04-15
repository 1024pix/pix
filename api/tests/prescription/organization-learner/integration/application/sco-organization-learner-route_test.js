import { scoOrganizationLearnerController } from '../../../../../src/prescription/organization-learner/application/sco-organization-learner-controller.js';
import * as moduleUnderTest from '../../../../../src/prescription/organization-learner/application/sco-organization-learner-route.js';
import { expect, HttpTestServer, sinon } from '../../../../test-helper.js';

describe('Integration | Application | Route | sco-organization-learners', function () {
  let httpTestServer;

  beforeEach(async function () {
    sinon
      .stub(scoOrganizationLearnerController, 'createUserAndReconcileToOrganizationLearnerFromExternalUser')
      .callsFake((request, h) => h.response('ok').code(200));

    httpTestServer = new HttpTestServer();
    await httpTestServer.register(moduleUnderTest);
  });

  describe('POST /api/sco-organization-learners/external', function () {
    let method;
    let url;
    let payload;
    let response;

    beforeEach(async function () {
      // given
      method = 'POST';
      url = '/api/sco-organization-learners/external';
      payload = {
        data: {
          attributes: {
            'campaign-code': 'RESTRICTD',
            'external-user-token': 'external-user-token',
            birthdate: '1948-12-21',
            'access-token': null,
          },
          type: 'external-users',
        },
      };
    });

    it('should succeed', async function () {
      // when
      response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should return a 400 Bad Request when campaignCode is missing', async function () {
      // given
      payload.data.attributes['campaign-code'] = '';

      // when
      response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(400);
      expect(JSON.parse(response.payload).errors[0].detail).to.equal(
        '"data.attributes.campaign-code" is not allowed to be empty',
      );
    });

    it('should return 400 Bad Request when external-user-token is missing', async function () {
      // given
      payload.data.attributes['external-user-token'] = '';

      // when
      response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(400);
      expect(JSON.parse(response.payload).errors[0].detail).to.equal(
        '"data.attributes.external-user-token" is not allowed to be empty',
      );
    });

    it('should return 400 Bad Request when birthDate is not a valid date', async function () {
      // given
      payload.data.attributes.birthdate = '2012*-12-12';

      // when
      response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(400);
      expect(JSON.parse(response.payload).errors[0].detail).to.equal(
        '"data.attributes.birthdate" must be in YYYY-MM-DD format',
      );
    });
  });
});
