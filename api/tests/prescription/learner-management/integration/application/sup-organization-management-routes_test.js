import { supOrganizationManagementController } from '../../../../../src/prescription/learner-management/application/sup-organization-management-controller.js';
import * as moduleUnderTest from '../../../../../src/prescription/learner-management/application/sup-organization-management-route.js';
import { securityPreHandlers } from '../../../../../src/shared/application/security-pre-handlers.js';
import { expect, generateValidRequestAuthorizationHeader, HttpTestServer, sinon } from '../../../../test-helper.js';

describe('Integration | Application | Route | sup-organization-learners', function () {
  let httpTestServer;

  beforeEach(async function () {
    sinon
      .stub(securityPreHandlers, 'checkUserIsAdminInSUPOrganizationManagingStudents')
      .callsFake((request, h) => h.response(true));
    sinon.stub(supOrganizationManagementController, 'updateStudentNumber').returns('ok');

    httpTestServer = new HttpTestServer();
    await httpTestServer.register(moduleUnderTest);
  });

  describe('PATCH /api/organizations/id/sup-organization-learners/organizationLearnerId', function () {
    const method = 'PATCH';
    const organizationId = 2;
    const organizationLearnerId = '1234';
    const userId = 2;
    let headers;

    beforeEach(function () {
      headers = {
        authorization: generateValidRequestAuthorizationHeader(userId),
      };
    });

    context('when the user is authenticated', function () {
      it('should exist', async function () {
        // given
        const url = `/api/organizations/${organizationId}/sup-organization-learners/${organizationLearnerId}`;
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
        const url = `/api/organizations/${organizationId}/sup-organization-learners/${organizationLearnerId}`;
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
        const url = `/api/organizations/FAKE_ORGANIZATION_ID/sup-organization-learners/${organizationLearnerId}`;
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
        const url = `/api/organizations/${organizationId}/sup-organization-learners/FAKE_STUDENT_ID`;
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
        securityPreHandlers.checkUserIsAdminInSUPOrganizationManagingStudents.callsFake((request, h) =>
          h.response().code(403).takeover(),
        );
        const url = `/api/organizations/${organizationId}/sup-organization-learners/${organizationLearnerId}`;
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
});
