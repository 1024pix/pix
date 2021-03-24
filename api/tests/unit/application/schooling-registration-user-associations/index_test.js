const { expect, sinon, generateValidRequestAuthorizationHeader } = require('../../../test-helper');
const Hapi = require('@hapi/hapi');
const schoolingRegistrationUserAssociationController = require('../../../../lib/application/schooling-registration-user-associations/schooling-registration-user-association-controller');
const preHandler = require('../../../../lib/application/security-pre-handlers');

const route = require('../../../../lib/application/schooling-registration-user-associations');

describe('Unit | Application | Router | campaign-router ', function() {

  let server;
  const userId = 2;
  const organizationId = 2;
  const studentId = '1234';

  beforeEach(function() {
    sinon.stub(schoolingRegistrationUserAssociationController, 'updateStudentNumber').returns('ok');
    sinon.stub(preHandler, 'checkUserIsAdminInSUPOrganizationManagingStudents');

    server = Hapi.server();

    return server.register(route);
  });

  describe('PATCH /api/organizations/id/schooling-registration-user-associations/studentId', function() {

    context('when the user is authenticated', function() {
      beforeEach(function() {
        preHandler.checkUserIsAdminInSUPOrganizationManagingStudents.callsFake((request, h) => h.response(true));
      });

      afterEach(function() {
        preHandler.checkUserIsAdminInSUPOrganizationManagingStudents.restore();
      });

      it('should exist', async function() {
        // given
        const options = {
          method: 'PATCH',
          url: `/api/organizations/${organizationId}/schooling-registration-user-associations/${studentId}`,
          headers: {
            authorization: generateValidRequestAuthorizationHeader(userId),
          },
          payload: {
            data: {
              attributes: {
                'student-number': '1234',
              },
            },
          },
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
      });

      it('should return a 422 status error when student-number parameter is not a string', async function() {
        // given
        const options = {
          method: 'PATCH',
          url: `/api/organizations/${organizationId}/schooling-registration-user-associations/${studentId}`,
          headers: {
            authorization: generateValidRequestAuthorizationHeader(userId),
          },
          payload: {
            data: {
              attributes: {
                'student-number': 1234,
              },
            },
          },
        };

        // when
        const response = await server.inject(options);

        const payload = JSON.parse(response.payload);

        // then
        expect(response.statusCode).to.equal(422);
        expect(payload.errors[0].title).to.equal('Unprocessable entity');
        expect(payload.errors[0].detail).to.equal('Un des champs saisis n’est pas valide.');
      });

      it('should return a 404 status error when organizationId parameter is not a number', async function() {
        // given
        const options = {
          method: 'PATCH',
          url: `/api/organizations/FAKE_ORGANIZATION_ID/schooling-registration-user-associations/${studentId}`,
          headers: {
            authorization: generateValidRequestAuthorizationHeader(userId),
          },
          payload: {
            data: {
              attributes: {
                'student-number': '1234',
              },
            },
          },
        };

        // when
        const response = await server.inject(options);

        const payload = JSON.parse(response.payload);

        // then
        expect(response.statusCode).to.equal(404);
        expect(payload.errors[0].title).to.equal('Not Found');
        expect(payload.errors[0].detail).to.equal('Ressource non trouvée');
      });

      it('should return a 404 status error when studentId parameter is not a number', async function() {
        // given
        const options = {
          method: 'PATCH',
          url: `/api/organizations/${organizationId}/schooling-registration-user-associations/FAKE_STUDENT_ID`,
          headers: {
            authorization: generateValidRequestAuthorizationHeader(userId),
          },
          payload: {
            data: {
              attributes: {
                'student-number': '1234',
              },
            },
          },
        };

        // when
        const response = await server.inject(options);

        const payload = JSON.parse(response.payload);

        // then
        expect(response.statusCode).to.equal(404);
        expect(payload.errors[0].title).to.equal('Not Found');
        expect(payload.errors[0].detail).to.equal('Ressource non trouvée');
      });

    });

    context('when the user is not authenticated', function() {
      beforeEach(function() {
        preHandler.checkUserIsAdminInSUPOrganizationManagingStudents.callsFake((request, h) => h.response().code(403).takeover());
      });

      afterEach(function() {
        preHandler.checkUserIsAdminInSUPOrganizationManagingStudents.restore();
      });

      it('should return an error when the user is not authenticated', async function() {
        // given
        const options = {
          method: 'PATCH',
          url: `/api/organizations/${organizationId}/schooling-registration-user-associations/${studentId}`,
          headers: {
            authorization: generateValidRequestAuthorizationHeader(userId),
          },
          payload: {
            data: {
              attributes: {
                'student-number': '1234',
              },
            },
          },
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(403);
      });
    });

  });
});
