const {
  expect,
  generateValidRequestAuthorizationHeader,
  HttpTestServer,
  sinon,
} = require('../../../test-helper');

const preHandler = require('../../../../lib/application/security-pre-handlers');
const schoolingRegistrationUserAssociationController = require('../../../../lib/application/schooling-registration-user-associations/schooling-registration-user-association-controller');

const moduleUnderTest = require('../../../../lib/application/schooling-registration-user-associations');

describe('Unit | Application | Router | schooling-registration-user-associations-router', function() {

  const organizationId = 2;
  const studentId = '1234';
  const userId = 2;

  let httpTestServer;

  beforeEach(() => {
    sinon.stub(preHandler, 'checkUserIsAdminInSUPOrganizationManagingStudents');

    sinon.stub(schoolingRegistrationUserAssociationController, 'dissociate').returns('ok');
    sinon.stub(schoolingRegistrationUserAssociationController, 'updateStudentNumber').returns('ok');

    httpTestServer = new HttpTestServer(moduleUnderTest);
  });

  describe('PATCH /api/organizations/id/schooling-registration-user-associations/studentId', () => {

    const method = 'PATCH';
    const headers = {
      authorization: generateValidRequestAuthorizationHeader(userId),
    };

    let payload;
    let url;

    beforeEach(() => {
      payload = {
        data: {
          attributes: {
            'student-number': '1234',
          },
        },
      };
    });

    afterEach(() => {
      preHandler.checkUserIsAdminInSUPOrganizationManagingStudents.restore();
    });

    context('when the user is authenticated', () => {

      beforeEach(() => {
        preHandler.checkUserIsAdminInSUPOrganizationManagingStudents.callsFake((request, h) => h.response(true));
      });

      it('should exist', async () => {
        // given
        url = `/api/organizations/${organizationId}/schooling-registration-user-associations/${studentId}`;

        // when
        const response = await httpTestServer.request(method, url, payload, null, headers);

        // then
        expect(response.statusCode).to.equal(200);
      });

      it('should return a 422 status error when student-number parameter is not a string', async () => {
        // given
        url = `/api/organizations/${organizationId}/schooling-registration-user-associations/${studentId}`;
        payload.data.attributes['student-number'] = 1234;

        // when
        const response = await httpTestServer.request(method, url, payload, null, headers);

        // then
        const responsePayload = JSON.parse(response.payload);
        expect(response.statusCode).to.equal(422);
        expect(responsePayload.errors[0].title).to.equal('Unprocessable entity');
        expect(responsePayload.errors[0].detail).to.equal('Un des champs saisis n’est pas valide.');
      });

      it('should return a 404 status error when organizationId parameter is not a number', async () => {
        // given
        url = `/api/organizations/FAKE_ORGANIZATION_ID/schooling-registration-user-associations/${studentId}`;

        // when
        const response = await httpTestServer.request(method, url, payload, null, headers);

        // then
        const responsePayload = JSON.parse(response.payload);
        expect(response.statusCode).to.equal(404);
        expect(responsePayload.errors[0].title).to.equal('Not Found');
        expect(responsePayload.errors[0].detail).to.equal('Ressource non trouvée');
      });

      it('should return a 404 status error when studentId parameter is not a number', async () => {
        // given
        url = `/api/organizations/${organizationId}/schooling-registration-user-associations/FAKE_STUDENT_ID`;

        // when
        const response = await httpTestServer.request(method, url, payload, null, headers);

        // then
        const responsePayload = JSON.parse(response.payload);
        expect(response.statusCode).to.equal(404);
        expect(responsePayload.errors[0].title).to.equal('Not Found');
        expect(responsePayload.errors[0].detail).to.equal('Ressource non trouvée');
      });
    });

    context('when the user is not authenticated', () => {

      beforeEach(() => {
        preHandler.checkUserIsAdminInSUPOrganizationManagingStudents.callsFake((request, h) => h.response().code(403).takeover());
      });

      it('should return an error when the user is not authenticated', async () => {
        // given
        url = `/api/organizations/${organizationId}/schooling-registration-user-associations/${studentId}`;

        // when
        const response = await httpTestServer.request(method, url, payload, null, headers);

        // then
        expect(response.statusCode).to.equal(403);
      });
    });
  });

  describe('DELETE /api/schooling-registration-user-associations/{id}', () => {

    const method = 'DELETE';
    const headers = {
      authorization: generateValidRequestAuthorizationHeader(userId),
    };
    const payload = null;

    let url;

    it('should return a HTTP status code 200', async () => {
      // given
      url = '/api/schooling-registration-user-associations/1';

      // when
      const response = await httpTestServer.request(method, url, payload, null, headers);

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should return a HTTP status code 400 if id parameter is not a number', async () => {
      // given
      url = '/api/schooling-registration-user-associations/ABC';

      // when
      const response = await httpTestServer.request(method, url, payload, null, headers);

      // then
      expect(response.statusCode).to.equal(400);
    });
  });

});
