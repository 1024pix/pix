const { expect, sinon, HttpTestServer } = require('../../../test-helper');

const organizationLearnerDependentUserController = require('../../../../lib/application/organization-learner-dependent-users/organization-learner-dependent-user-controller');
const moduleUnderTest = require('../../../../lib/application/organization-learner-dependent-users');
const securityPreHandlers = require('../../../../lib/application/security-pre-handlers');

describe('Integration | Application | Route | organization-learner-dependent-users', function () {
  let httpTestServer;

  beforeEach(async function () {
    sinon
      .stub(securityPreHandlers, 'checkUserBelongsToScoOrganizationAndManagesStudents')
      .callsFake((request, h) => h.response(true));
    sinon
      .stub(organizationLearnerDependentUserController, 'generateUsernameWithTemporaryPassword')
      .callsFake((request, h) => h.response('ok').code(200));
    httpTestServer = new HttpTestServer();
    await httpTestServer.register(moduleUnderTest);
  });

  describe('POST /api/schooling-registration-dependent-users/generate-username-password', function () {
    it('should succeed', async function () {
      // given
      const method = 'POST';
      const url = '/api/schooling-registration-dependent-users/generate-username-password';
      const payload = {
        data: {
          attributes: {
            'schooling-registration-id': 1,
            'organization-id': 3,
          },
        },
      };

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });
});
