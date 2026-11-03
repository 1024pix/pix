import { expect } from 'chai';
import sinon from 'sinon';

import {
  CertificationCourseNotPublishableError,
  SessionAlreadyPublishedError,
} from '../../../../../../src/certification/session-management/domain/errors.js';
import { publishSession } from '../../../../../../src/certification/session-management/domain/usecases/publish-session.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { AssessmentResult } from '../../../../../../src/shared/domain/models/AssessmentResult.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { catchErr, preventStubsToBeCalledUnexpectedly } from '../../../../../tooling/test-utils/error.js';

describe('Unit | domain | usecases | publish session', function () {
  let sessionId,
    sessionManagementRepository,
    eventJobPublisherService,
    certificationRepository,
    certificationResultAdapter,
    finalizedSessionRepository,
    dependencies,
    now;

  beforeEach(function () {
    sessionId = 7402;
    sessionManagementRepository = {
      get: sinon.stub(),
      updatePublishedAt: sinon.stub(),
    };
    certificationRepository = {
      getStatusesBySessionId: sinon.stub(),
      publishCertificationCourses: sinon.stub(),
    };
    certificationResultAdapter = {
      buildCertificationResults: sinon.stub(),
    };
    finalizedSessionRepository = {
      get: sinon.stub(),
      save: sinon.stub(),
    };
    eventJobPublisherService = {
      publishEvent: sinon.stub(),
    };
    preventStubsToBeCalledUnexpectedly([
      sessionManagementRepository.get,
      sessionManagementRepository.updatePublishedAt,
      certificationRepository.getStatusesBySessionId,
      certificationRepository.publishCertificationCourses,
      certificationResultAdapter.buildCertificationResults,
      finalizedSessionRepository.get,
      finalizedSessionRepository.save,
      eventJobPublisherService.publishEvent,
    ]);
    now = new Date('2024-11-23');
    sinon.useFakeTimers({ now, toFake: ['Date'] });
    dependencies = {
      sessionId,
      sessionManagementRepository,
      certificationRepository,
      certificationResultAdapter,
      finalizedSessionRepository,
      eventJobPublisherService,
    };
  });

  context('when session does not exist', function () {
    it('throws a NotFound error', async function () {
      sessionManagementRepository.get.withArgs({ id: sessionId }).resolves(null);

      const error = await catchErr(publishSession)({
        ...dependencies,
      });

      expect(error).to.be.an.instanceof(NotFoundError);
    });
  });

  context('when session exists', function () {
    context('when session is already published', function () {
      it('throws a SessionAlreadyPublishedError', async function () {
        sessionManagementRepository.get
          .withArgs({ id: sessionId })
          .resolves(domainBuilder.certification.sessionManagement.buildSessionManagement({ publishedAt: new Date() }));

        const error = await catchErr(publishSession)({
          ...dependencies,
        });

        expect(error).to.be.an.instanceof(SessionAlreadyPublishedError);
      });
    });

    context('when session is not published yet', function () {
      beforeEach(function () {
        sessionManagementRepository.get
          .withArgs({ id: sessionId })
          .resolves(
            domainBuilder.certification.sessionManagement.buildSessionManagement({ id: sessionId, publishedAt: null }),
          );
      });

      context('when at least one certification is not publishable', function () {
        context('because it has no scoring', function () {
          it('throws a CertificationCourseNotPublishableError', async function () {
            certificationRepository.getStatusesBySessionId
              .withArgs(sessionId)
              .resolves([
                { pixCertificationStatus: AssessmentResult.status.VALIDATED },
                { pixCertificationStatus: null },
              ]);

            const error = await catchErr(publishSession)({
              ...dependencies,
            });

            expect(error).to.be.an.instanceof(CertificationCourseNotPublishableError);
          });
        });

        context('because it is in error', function () {
          it('throws a CertificationCourseNotPublishableError', async function () {
            certificationRepository.getStatusesBySessionId
              .withArgs(sessionId)
              .resolves([
                { pixCertificationStatus: AssessmentResult.status.ERROR },
                { pixCertificationStatus: AssessmentResult.status.VALIDATED },
              ]);

            const error = await catchErr(publishSession)({
              ...dependencies,
            });

            expect(error).to.be.an.instanceof(CertificationCourseNotPublishableError);
          });
        });
      });

      context('when certifications are all publishable', function () {
        let certificationStatuses, finalizedSession;
        beforeEach(function () {
          certificationStatuses = [
            { pixCertificationStatus: AssessmentResult.status.VALIDATED },
            { pixCertificationStatus: AssessmentResult.status.CANCELLED },
          ];
          certificationRepository.getStatusesBySessionId.withArgs(sessionId).resolves(certificationStatuses);
          finalizedSessionRepository.save.resolves();
          sessionManagementRepository.updatePublishedAt.resolves();
          certificationResultAdapter.buildCertificationResults.resolves();
          certificationRepository.publishCertificationCourses.resolves();
          eventJobPublisherService.publishEvent.resolves();
          finalizedSession = domainBuilder.buildFinalizedSession({ id: sessionId, publishedAt: null });
          finalizedSessionRepository.get.withArgs({ sessionId }).resolves(finalizedSession);
        });

        it('posts a session-published event', async function () {
          await publishSession({
            ...dependencies,
          });

          expect(eventJobPublisherService.publishEvent).to.have.been.called;
        });

        it('publishes the session and the certifications', async function () {
          await publishSession({
            ...dependencies,
          });

          sinon.assert.calledOnceWithMatch(finalizedSessionRepository.save, {
            finalizedSession: sinon.match({ publishedAt: now }),
          });
          sinon.assert.calledOnceWithExactly(sessionManagementRepository.updatePublishedAt, {
            id: sessionId,
            publishedAt: now,
          });
          sinon.assert.calledOnceWithExactly(certificationRepository.publishCertificationCourses, {
            certificationCourseIds: certificationStatuses,
            publishedAt: now,
          });
        });

        it('triggers the building of the certification results', async function () {
          await publishSession({
            ...dependencies,
          });

          expect(certificationResultAdapter.buildCertificationResults).to.have.been.calledOnceWithExactly({
            sessionId,
          });
        });
      });
    });
  });
});
