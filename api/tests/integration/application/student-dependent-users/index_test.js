const { expect, sinon, HttpTestServer } = require('../../../test-helper');

const schoolingRegistrationDependentUserController = require('../../../../lib/application/schooling-registration-dependent-users/schooling-registration-dependent-user-controller');
const moduleUnderTest = require('../../../../lib/application/student-dependent-users');
const securityPreHandlers = require('../../../../lib/application/security-pre-handlers');

describe('Integration | Application | Route | student-dependent-users', () => {

  let httpTestServer;

  beforeEach(() => {
    sinon.stub(securityPreHandlers, 'checkUserBelongsToScoOrganizationAndManagesStudents').callsFake((request, h) => h.response(true));
    sinon.stub(schoolingRegistrationDependentUserController, 'createAndAssociateUserToSchoolingRegistration').callsFake((request, h) => h.response('ok').code(201));
    httpTestServer = new HttpTestServer(moduleUnderTest);
  });

  describe('POST /api/student-dependent-users', () => {

    let method;
    let url;
    let payload;
    let response;

    beforeEach(async () => {
      // given
      method = 'POST';
      url = '/api/student-dependent-users';
      payload = {
        data: {
          attributes: {
            'campaign-code': 'RESTRICTD',
            'first-name': 'Robert',
            'last-name': 'Smith',
            birthdate: '2012-12-12',
            username: 'robert.smith1212',
            password: 'P@ssw0rd',
            'with-username': true,
          }
        }
      };
    });

    it('should succeed', async () => {
      // when
      response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(201);
    });

    it('should return 400 when firstName is empty', async () => {
      // given
      payload.data.attributes['first-name'] = '';

      // when
      response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(400);
    });

    it('should return 400 when lastName is empty', async () => {
      // given
      payload.data.attributes['last-name'] = '';

      // when
      response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(400);
    });

    it('should return 400 when birthDate is not a valid date', async () => {
      // given
      payload.data.attributes.birthdate = '2012*-12-12';

      // when
      response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(400);
    });

    it('should return 400 when campaignCode is empty', async () => {
      // given
      payload.data.attributes['campaign-code'] = '';

      // when
      response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(400);
    });

    it('should return 400 when password is not a valid', async () => {
      // given
      payload.data.attributes.password = 'not_valid';

      // when
      response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(400);
    });

    it('should return 400 when withUsername is not a boolean', async () => {
      // given
      payload.data.attributes['with-username'] = 'not_a_boolean';

      // when
      response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(400);
    });
  });
});
