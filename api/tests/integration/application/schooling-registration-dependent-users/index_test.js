const { expect, sinon, HttpTestServer } = require('../../../test-helper');

const schoolingRegistrationDependentUserController = require('../../../../lib/application/schooling-registration-dependent-users/schooling-registration-dependent-user-controller');
const moduleUnderTest = require('../../../../lib/application/schooling-registration-dependent-users');
const securityController = require('../../../../lib/interfaces/controllers/security-controller');

describe('Integration | Application | Route | schooling-registration-dependent-users', () => {

  let httpTestServer;

  beforeEach(() => {
    sinon.stub(securityController, 'checkUserBelongsToScoOrganizationAndManagesStudents').callsFake((request, h) => h.response(true));
    sinon.stub(schoolingRegistrationDependentUserController, 'createAndAssociateUserToSchoolingRegistration').callsFake((request, h) => h.response('ok').code(201));
    sinon.stub(schoolingRegistrationDependentUserController, 'updatePassword').callsFake((request, h) => h.response('ok').code(200));
    httpTestServer = new HttpTestServer(moduleUnderTest);
  });

  describe('POST /api/schooling-registration-dependent-users', () => {

    it('should succeed', async () => {
      // given
      const method = 'POST';
      const url = '/api/schooling-registration-dependent-users';
      const payload = {
        data: {
          attributes: {
            'campaign-code': 'RESTRICD',
            'first-name': 'Robert',
            'last-name': 'Smith',
            birthdate: '2012-12-12',
            username: 'robert.smith1212',
            password: 'P@ssw0rd'
          }
        }
      };

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(201);
    });
  });

  describe('POST /api/schooling-registration-dependent-users/password-update', () => {

    it('should succeed', async () => {
      // given
      const method = 'POST';
      const url = '/api/schooling-registration-dependent-users/password-update';
      const payload = {
        data: {
          attributes: {
            'student-id': 1,
            'organization-id': 3,
            'password': 'P@ssw0rd'
          }
        }
      };

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

});
