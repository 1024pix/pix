import { organizationLearnersController } from '../../../../../src/prescription/learner-management/application/organization-learners-controller.js';
import * as moduleUnderTest from '../../../../../src/prescription/learner-management/application/organization-learners-route.js';
import { expect, generateValidRequestAuthorizationHeader, HttpTestServer, sinon } from '../../../../test-helper.js';

describe('Unit | Prescription | learner management | Application | Router | organization-learner-router', function () {
  describe('POST /api/organization-learners/reconcile', function () {
    let url, method, httpTestServer, headers, reconcileCommonOrganizationLearnerStub;

    beforeEach(async function () {
      method = 'POST';
      url = '/api/organization-learners/reconcile';
      headers = { authorization: generateValidRequestAuthorizationHeader(666) };

      reconcileCommonOrganizationLearnerStub = sinon
        .stub(organizationLearnersController, 'reconcileCommonOrganizationLearner')
        .resolves('ok');

      httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);
    });

    describe('error cases', function () {
      it('should throw an error when payload reconciliationInfos is not an object', async function () {
        // given
        const payload = { data: { attributes: { 'campaign-code': 'myCode', 'reconciliation-infos': null } } };

        // when
        const response = await httpTestServer.request(method, url, payload, null, headers);

        // then
        expect(response.statusCode).to.equal(400);
        expect(reconcileCommonOrganizationLearnerStub.called).to.be.false;
      });

      it('should not called controller when payload campaignCode is not a string', async function () {
        // given
        const payload = { data: { attributes: { 'campaign-code': null, 'reconciliation-infos': {} } } };

        // when
        const response = await httpTestServer.request(method, url, payload, null, headers);

        // then
        expect(response.statusCode).to.equal(400);
        expect(reconcileCommonOrganizationLearnerStub.called).to.be.false;
      });
    });

    it('should called the controller when everything is ok', async function () {
      // given
      const payload = {
        data: { attributes: { 'campaign-code': 'myCode', 'reconciliation-infos': {} }, type: 'organization-learner' },
      };

      // when
      await httpTestServer.request(method, url, payload, null, headers);

      // then
      expect(reconcileCommonOrganizationLearnerStub.called).to.be.true;
    });
  });
});
