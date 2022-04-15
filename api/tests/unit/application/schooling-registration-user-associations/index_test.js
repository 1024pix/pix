const { expect, generateValidRequestAuthorizationHeader, HttpTestServer, sinon } = require('../../../test-helper');

const preHandler = require('../../../../lib/application/security-pre-handlers');
const schoolingRegistrationUserAssociationController = require('../../../../lib/application/schooling-registration-user-associations/schooling-registration-user-association-controller');
const moduleUnderTest = require('../../../../lib/application/schooling-registration-user-associations');

describe('Unit | Application | Router | schooling-registration-user-associations-router', function () {
  const organizationId = 2;
  const studentId = '1234';
  const userId = 2;

  describe('PATCH /api/organizations/id/schooling-registration-user-associations/studentId', function () {
    const method = 'PATCH';
    const headers = {
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line mocha/no-setup-in-describe
      authorization: generateValidRequestAuthorizationHeader(userId),
    };

    context('when the user is authenticated', function () {
      it('should exist', async function () {
        // given
        sinon
          .stub(preHandler, 'checkUserIsAdminInSUPOrganizationManagingStudents')
          .callsFake((request, h) => h.response(true));
        sinon.stub(schoolingRegistrationUserAssociationController, 'updateStudentNumber').returns('ok');
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        const url = `/api/organizations/${organizationId}/schooling-registration-user-associations/${studentId}`;
        const payload = {
          data: {
            attributes: {
              'student-number': '1234',
            },
          },
        };
        // when
        const response = await httpTestServer.request(method, url, payload, null, headers);

        // then
        expect(response.statusCode).to.equal(200);
      });

      it('should return a 422 status error when student-number parameter is not a string', async function () {
        // given
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        const url = `/api/organizations/${organizationId}/schooling-registration-user-associations/${studentId}`;
        const payload = {
          data: {
            attributes: {
              'student-number': 1234,
            },
          },
        };

        // when
        const response = await httpTestServer.request(method, url, payload, null, headers);

        // then
        const responsePayload = JSON.parse(response.payload);
        expect(response.statusCode).to.equal(422);
        expect(responsePayload.errors[0].title).to.equal('Unprocessable entity');
        expect(responsePayload.errors[0].detail).to.equal('Un des champs saisis n’est pas valide.');
      });

      it('should return a 404 status error when organizationId parameter is not a number', async function () {
        // given
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        const url = `/api/organizations/FAKE_ORGANIZATION_ID/schooling-registration-user-associations/${studentId}`;
        const payload = {
          data: {
            attributes: {
              'student-number': '1234',
            },
          },
        };

        // when
        const response = await httpTestServer.request(method, url, payload, null, headers);

        // then
        const responsePayload = JSON.parse(response.payload);
        expect(response.statusCode).to.equal(404);
        expect(responsePayload.errors[0].title).to.equal('Not Found');
        expect(responsePayload.errors[0].detail).to.equal('Ressource non trouvée');
      });

      it('should return a 404 status error when studentId parameter is not a number', async function () {
        // given
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        const url = `/api/organizations/${organizationId}/schooling-registration-user-associations/FAKE_STUDENT_ID`;
        const payload = {
          data: {
            attributes: {
              'student-number': '1234',
            },
          },
        };

        // when
        const response = await httpTestServer.request(method, url, payload, null, headers);

        // then
        const responsePayload = JSON.parse(response.payload);
        expect(response.statusCode).to.equal(404);
        expect(responsePayload.errors[0].title).to.equal('Not Found');
        expect(responsePayload.errors[0].detail).to.equal('Ressource non trouvée');
      });
    });

    context('when the user is not authenticated', function () {
      it('should return an error when the user is not authenticated', async function () {
        // given
        sinon
          .stub(preHandler, 'checkUserIsAdminInSUPOrganizationManagingStudents')
          .callsFake((request, h) => h.response().code(403).takeover());
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        const url = `/api/organizations/${organizationId}/schooling-registration-user-associations/${studentId}`;
        const payload = {
          data: {
            attributes: {
              'student-number': '1234',
            },
          },
        };

        // when
        const response = await httpTestServer.request(method, url, payload, null, headers);

        // then
        expect(response.statusCode).to.equal(403);
      });
    });
  });

  describe('DELETE /api/schooling-registration-user-associations/{id}', function () {
    const method = 'DELETE';

    it('should return a HTTP status code 204', async function () {
      // given
      sinon.stub(preHandler, 'checkUserHasRoleSuperAdmin').returns(true);
      sinon
        .stub(schoolingRegistrationUserAssociationController, 'dissociate')
        .callsFake((request, h) => h.response('ok').code(204));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const url = '/api/schooling-registration-user-associations/1';

      // when
      const response = await httpTestServer.request(method, url, null);

      // then
      expect(response.statusCode).to.equal(204);
    });

    it('should return a HTTP status code 403 when user is not ', async function () {
      // given
      sinon.stub(preHandler, 'checkUserHasRoleSuperAdmin').callsFake((request, h) => h.response().code(403).takeover());
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const url = '/api/schooling-registration-user-associations/1';

      // when
      const response = await httpTestServer.request(method, url, null);

      // then
      expect(response.statusCode).to.equal(403);
    });

    it('should return a HTTP status code 400 if id parameter is not a number', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const url = '/api/schooling-registration-user-associations/ABC';

      // when
      const response = await httpTestServer.request(method, url, null);

      // then
      expect(response.statusCode).to.equal(400);
    });
  });
});
