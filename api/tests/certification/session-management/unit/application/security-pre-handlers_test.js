import sinon from 'sinon';

import { sessionManagementSecurityPreHandlers } from '../../../../../src/certification/session-management/application/security-pre-handlers.js';
import { expect } from '../../../../test-helper.js';
import { hFake } from '../../../../tooling/mocks/hapi.mock.js';

describe('Unit | Certification | Session Management | Application | SecurityPreHandlers', function () {
  describe('#checkUserIsMemberOfCertificationCenterSessionFromCertificationIssueReportId', function () {
    context('Successful case', function () {
      it('should authorize access to resource when the user is a member of the organization center', async function () {
        // given
        const certificationCourseId = 7;

        const certificationIssueReportRepositoryStub = {
          get: sinon.stub().withArgs(certificationCourseId).resolves({ certificationCourseId }),
        };
        const checkUserIsMemberOfCertificationCenterSessionUsecaseStub = {
          execute: sinon.stub().resolves(true),
        };
        // when
        const response =
          await sessionManagementSecurityPreHandlers.checkUserIsMemberOfCertificationCenterSessionFromCertificationIssueReportId(
            {
              auth: { credentials: { accessToken: 'valid.access.token', userId: 123 } },
              params: { id: 666 },
            },
            hFake,
            {
              certificationIssueReportRepository: certificationIssueReportRepositoryStub,
              checkUserIsMemberOfCertificationCenterSessionUsecase:
                checkUserIsMemberOfCertificationCenterSessionUsecaseStub,
            },
          );

        // then
        expect(response.source).to.be.true;
      });
    });

    context('Error cases', function () {
      it('should forbid resource access when user was not previously authenticated', async function () {
        // given
        const certificationIssueReportRepositoryStub = {
          get: sinon.stub(),
        };

        const checkUserIsMemberOfCertificationCenterSessionUsecaseStub = {
          execute: sinon.stub(),
        };

        // when
        const response =
          await sessionManagementSecurityPreHandlers.checkUserIsMemberOfCertificationCenterSessionFromCertificationIssueReportId(
            { auth: { credentials: {} }, params: { id: 5678 } },
            hFake,
            {
              certificationIssueReportRepository: certificationIssueReportRepositoryStub,
              checkUserIsMemberOfCertificationCenterSessionUsecase:
                checkUserIsMemberOfCertificationCenterSessionUsecaseStub,
            },
          );

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });

      it('should forbid resource access when user is not a member of the organization center', async function () {
        // given
        const checkUserIsMemberOfCertificationCenterSessionUsecaseStub = {
          execute: sinon.stub().resolves(false),
        };
        const certificationIssueReportRepositoryStub = {
          get: sinon.stub().resolves({ certificationCourseId: 7 }),
        };

        // when
        const response =
          await sessionManagementSecurityPreHandlers.checkUserIsMemberOfCertificationCenterSessionFromCertificationIssueReportId(
            { auth: { credentials: { accessToken: 'valid.access.token', userId: 1 } }, params: { id: 666 } },
            hFake,
            {
              certificationIssueReportRepository: certificationIssueReportRepositoryStub,
              checkUserIsMemberOfCertificationCenterSessionUsecase:
                checkUserIsMemberOfCertificationCenterSessionUsecaseStub,
            },
          );

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });

      it('should forbid resource access when an error is thrown by use case', async function () {
        // given
        const certificationIssueReportRepositoryStub = {
          get: sinon.stub().resolves({ certificationCourseId: 7 }),
        };
        const checkUserIsMemberOfCertificationCenterSessionUsecaseStub = {
          execute: sinon.stub().rejects(new Error('Some error')),
        };

        // when
        const response =
          await sessionManagementSecurityPreHandlers.checkUserIsMemberOfCertificationCenterSessionFromCertificationIssueReportId(
            { auth: { credentials: { accessToken: 'valid.access.token', userId: 1 } }, params: { id: 666 } },
            hFake,
            {
              certificationIssueReportRepository: certificationIssueReportRepositoryStub,
              checkUserIsMemberOfCertificationCenterSessionUsecase:
                checkUserIsMemberOfCertificationCenterSessionUsecaseStub,
            },
          );

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });

      it('should forbid resource access when an error is thrown by repo', async function () {
        // given
        const certificationIssueReportRepositoryStub = {
          get: sinon.stub().rejects(new Error('Some error')),
        };
        const checkUserIsMemberOfCertificationCenterSessionUsecaseStub = {
          execute: sinon.stub(),
        };
        // when
        const response =
          await sessionManagementSecurityPreHandlers.checkUserIsMemberOfCertificationCenterSessionFromCertificationIssueReportId(
            { auth: { credentials: { accessToken: 'valid.access.token', userId: 1 } }, params: { id: 666 } },
            hFake,
            {
              certificationIssueReportRepository: certificationIssueReportRepositoryStub,
              checkUserIsMemberOfCertificationCenterSessionUsecase:
                checkUserIsMemberOfCertificationCenterSessionUsecaseStub,
            },
          );

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });
    });
  });

  describe('#checkUserIsMemberOfCertificationCenterSessionFromCertificationCourseId', function () {
    context('Successful case', function () {
      it('should authorize access to resource when the user is a member of the organization center', async function () {
        // given
        const checkUserIsMemberOfCertificationCenterSessionUsecaseStub = {
          execute: sinon.stub().resolves(true),
        };

        // when
        const response =
          await sessionManagementSecurityPreHandlers.checkUserIsMemberOfCertificationCenterSessionFromCertificationCourseId(
            {
              auth: { credentials: { accessToken: 'valid.access.token', userId: 123 } },
              params: { certificationCourseId: 7 },
            },
            hFake,
            {
              checkUserIsMemberOfCertificationCenterSessionUsecase:
                checkUserIsMemberOfCertificationCenterSessionUsecaseStub,
            },
          );

        // then
        expect(response.source).to.be.true;
      });
    });

    context('Error cases', function () {
      it('should forbid resource access when user was not previously authenticated', async function () {
        // given
        const checkUserIsMemberOfCertificationCenterSessionUsecaseStub = {
          execute: sinon.stub(),
        };

        // when
        const response =
          await sessionManagementSecurityPreHandlers.checkUserIsMemberOfCertificationCenterSessionFromCertificationCourseId(
            { auth: { credentials: {} }, params: { certificationCourseId: 5678 } },
            hFake,
            {
              checkUserIsMemberOfCertificationCenterSessionUsecase:
                checkUserIsMemberOfCertificationCenterSessionUsecaseStub,
            },
          );

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });

      it('should forbid resource access when user is not a member of the organization center', async function () {
        // given
        const checkUserIsMemberOfCertificationCenterSessionUsecaseStub = {
          execute: sinon.stub().resolves(false),
        };

        // when
        const response =
          await sessionManagementSecurityPreHandlers.checkUserIsMemberOfCertificationCenterSessionFromCertificationCourseId(
            {
              auth: { credentials: { accessToken: 'valid.access.token', userId: 1 } },
              params: { certificationCourseId: 5678 },
            },
            hFake,
            {
              checkUserIsMemberOfCertificationCenterSessionUsecase:
                checkUserIsMemberOfCertificationCenterSessionUsecaseStub,
            },
          );

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });

      it('should forbid resource access when an error is thrown by use case', async function () {
        // given
        const checkUserIsMemberOfCertificationCenterSessionUsecaseStub = {
          execute: sinon.stub().rejects(new Error('Some error')),
        };

        // when
        const response =
          await sessionManagementSecurityPreHandlers.checkUserIsMemberOfCertificationCenterSessionFromCertificationCourseId(
            {
              auth: { credentials: { accessToken: 'valid.access.token', userId: 1 } },
              params: { certificationCourseId: 5678 },
            },
            hFake,
            {
              checkUserIsMemberOfCertificationCenterSessionUsecase:
                checkUserIsMemberOfCertificationCenterSessionUsecaseStub,
            },
          );

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });
    });
  });
});
