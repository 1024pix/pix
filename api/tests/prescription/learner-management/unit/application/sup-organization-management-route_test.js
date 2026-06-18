import sinon from 'sinon';

import { supOrganizationManagementController } from '../../../../../src/prescription/learner-management/application/sup-organization-management-controller.js';
import { supOrganizationManagementRoute as moduleUnderTest } from '../../../../../src/prescription/learner-management/application/sup-organization-management-route.js';
import { securityPreHandlers } from '../../../../../src/shared/application/security-pre-handlers.js';
import { expect } from '../../../../test-helper.js';
import { HttpTestServer } from '../../../../tooling/server/http-test-server.js';

describe('Unit | Router | sup-organization-management-route', function () {
  describe('POST /api/organizations/{id}/sup-organization-learners/import-csv', function () {
    context('when the id not an integer', function () {
      it('responds 400', async function () {
        // given
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        const method = 'POST';
        const url = '/api/organizations/qsdqsd/sup-organization-learners/import-csv';

        // when
        const response = await httpTestServer.request(method, url);

        // then
        expect(response.statusCode).to.equal(400);
      });
    });
  });

  describe('POST /api/organizations/{id}/sup-organization-learners/replace-csv', function () {
    beforeEach(function () {
      sinon.stub(supOrganizationManagementController, 'replaceSupOrganizationLearners');
      sinon.stub(securityPreHandlers, 'checkUserIsAdminInSUPOrganizationManagingStudents');
      supOrganizationManagementController.replaceSupOrganizationLearners.resolves('ok');
    });

    context(
      'when the user is an admin for the organization and the organization is SUP and manages student',
      function () {
        it('responds 200', async function () {
          securityPreHandlers.checkUserIsAdminInSUPOrganizationManagingStudents.resolves(true);
          const httpTestServer = new HttpTestServer();
          await httpTestServer.register(moduleUnderTest);

          const method = 'POST';
          const url = '/api/organizations/1/sup-organization-learners/replace-csv';

          const response = await httpTestServer.request(method, url);

          expect(response.statusCode).to.equal(200);
        });
      },
    );

    context('when the user is not admin for the organization', function () {
      it('responds 403', async function () {
        securityPreHandlers.checkUserIsAdminInSUPOrganizationManagingStudents.callsFake((request, h) =>
          h.response().code(403).takeover(),
        );
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        const method = 'POST';
        const url = '/api/organizations/1/sup-organization-learners/replace-csv';

        const response = await httpTestServer.request(method, url);

        expect(response.statusCode).to.equal(403);
      });
    });

    context('when the organization id is not an id', function () {
      it('responds 400', async function () {
        securityPreHandlers.checkUserIsAdminInSUPOrganizationManagingStudents.resolves(true);
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        const method = 'POST';
        const url = '/api/organizations/asgfs/sup-organization-learners/replace-csv';

        const response = await httpTestServer.request(method, url);

        expect(response.statusCode).to.equal(400);
      });
    });
  });

  describe('GET /api/organizations/{id}/organization-learners/csv-template', function () {
    let httpTestServer;

    beforeEach(async function () {
      sinon
        .stub(supOrganizationManagementController, 'getOrganizationLearnersCsvTemplate')
        .callsFake((request, h) => h.response('ok').code(200));

      httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);
    });

    it('should call the organization controller to csv template', async function () {
      // given
      const method = 'GET';
      const url = '/api/organizations/1/organization-learners/csv-template?accessToken=token';

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(200);
      expect(supOrganizationManagementController.getOrganizationLearnersCsvTemplate).to.have.been.calledOnce;
    });

    describe('When parameters are not valid', function () {
      it('should throw an error when id is not a number', async function () {
        // given
        const method = 'GET';
        const url = '/api/organizations/ABC/organization-learners/csv-template?accessToken=token';

        // when
        const response = await httpTestServer.request(method, url);

        // then
        expect(response.statusCode).to.equal(400);
      });

      it('should throw an error when id is null', async function () {
        // given
        const method = 'GET';
        const url = '/api/organizations/null/organization-learners/csv-template?accessToken=token';

        // when
        const response = await httpTestServer.request(method, url);

        // then
        expect(response.statusCode).to.equal(400);
      });

      it('should throw an error when access token is not specified', async function () {
        // given
        const method = 'GET';
        const url = '/api/organizations/1/organization-learners/csv-template';

        // when
        const response = await httpTestServer.request(method, url);

        // then
        expect(response.statusCode).to.equal(400);
      });
    });
  });

  describe('PATCH /api/organizations/{organizationId}/sup-organization-learners/{organizationLearnerId}', function () {
    beforeEach(function () {
      sinon.stub(supOrganizationManagementController, 'updateStudentNumber');
      sinon.stub(securityPreHandlers, 'checkUserIsAdminInSUPOrganizationManagingStudents');
      sinon.stub(securityPreHandlers, 'checkUserBelongsToLearnersOrganization');
      supOrganizationManagementController.updateStudentNumber.resolves('ok');
    });

    context(
      'when the user is an admin for the organization and the organization is SUP and manages student',
      function () {
        it('responds 200', async function () {
          securityPreHandlers.checkUserIsAdminInSUPOrganizationManagingStudents.resolves(true);
          securityPreHandlers.checkUserBelongsToLearnersOrganization.resolves(true);
          const httpTestServer = new HttpTestServer();
          await httpTestServer.register(moduleUnderTest);

          const method = 'PATCH';
          const url = '/api/organizations/2/sup-organization-learners/1';

          const response = await httpTestServer.request(method, url, {
            data: { attributes: { 'student-number': '125ABC18' } },
          });

          expect(response.statusCode).to.equal(200);
          expect(supOrganizationManagementController.updateStudentNumber.called).true;
        });
      },
    );

    context('when the user is not admin for the organization', function () {
      it('responds 403', async function () {
        securityPreHandlers.checkUserBelongsToLearnersOrganization.resolves(true);
        securityPreHandlers.checkUserIsAdminInSUPOrganizationManagingStudents.callsFake((request, h) =>
          h.response().code(403).takeover(),
        );
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        const method = 'PATCH';
        const url = '/api/organizations/2/sup-organization-learners/1';

        const response = await httpTestServer.request(method, url, {
          data: { attributes: { 'student-number': '125ABC18' } },
        });

        expect(response.statusCode).to.equal(403);
        expect(supOrganizationManagementController.updateStudentNumber.called).false;
      });
    });

    context('when the user is not member of learner organization', function () {
      it('responds 403', async function () {
        securityPreHandlers.checkUserIsAdminInSUPOrganizationManagingStudents.resolves(true);
        securityPreHandlers.checkUserBelongsToLearnersOrganization.callsFake((request, h) =>
          h.response().code(403).takeover(),
        );
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        const method = 'PATCH';
        const url = '/api/organizations/2/sup-organization-learners/1';

        const response = await httpTestServer.request(method, url, {
          data: { attributes: { 'student-number': '125ABC18' } },
        });

        expect(response.statusCode).to.equal(403);
        expect(supOrganizationManagementController.updateStudentNumber.called).false;
      });
    });

    context('when the organizationId is not an id', function () {
      it('responds 400', async function () {
        securityPreHandlers.checkUserBelongsToLearnersOrganization.resolves(true);
        securityPreHandlers.checkUserIsAdminInSUPOrganizationManagingStudents.resolves(true);
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        const method = 'PATCH';
        const url = '/api/organizations/abcdef/sup-organization-learners/1';

        const response = await httpTestServer.request(method, url, {
          data: { attributes: { 'student-number': '125ABC18' } },
        });

        expect(response.statusCode).to.equal(400);
        expect(supOrganizationManagementController.updateStudentNumber.called).false;
      });
    });

    context('when the student number is not an string', function () {
      it('responds 400', async function () {
        securityPreHandlers.checkUserBelongsToLearnersOrganization.resolves(true);
        securityPreHandlers.checkUserIsAdminInSUPOrganizationManagingStudents.resolves(true);
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        const method = 'PATCH';
        const url = '/api/organizations/2/sup-organization-learners/1';

        const response = await httpTestServer.request(method, url, {
          data: { attributes: { 'student-number': { data: 'pouet' } } },
        });

        expect(response.statusCode).to.equal(400);
        expect(supOrganizationManagementController.updateStudentNumber.called).false;
      });
    });

    context('when the organizationLearnerId is not an id', function () {
      it('responds 400', async function () {
        securityPreHandlers.checkUserBelongsToLearnersOrganization.resolves(true);
        securityPreHandlers.checkUserIsAdminInSUPOrganizationManagingStudents.resolves(true);
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        const method = 'PATCH';
        const url = '/api/organizations/2/sup-organization-learners/abcdef';

        const response = await httpTestServer.request(method, url, {
          data: { attributes: { 'student-number': '125ABC18' } },
        });

        expect(response.statusCode).to.equal(400);
        expect(supOrganizationManagementController.updateStudentNumber.called).false;
      });
    });
  });
});
