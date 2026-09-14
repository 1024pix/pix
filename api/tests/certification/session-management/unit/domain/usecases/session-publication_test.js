import { expect } from 'chai';
import sinon from 'sinon';

import {
  CertificationCourseNotPublishableError,
  SessionAlreadyPublishedError,
} from '../../../../../../src/certification/session-management/domain/errors.js';
import { FinalizedSession } from '../../../../../../src/certification/session-management/domain/models/FinalizedSession.js';
import { sessionPublication } from '../../../../../../src/certification/session-management/domain/usecases/session-publication.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { AssessmentResult } from '../../../../../../src/shared/domain/models/AssessmentResult.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Unit | domain | usecases | sessionPublication', function () {
  let sessionId,
    publishedAt,
    finalizedSession,
    sessionManagementRepository,
    certificationRepository,
    finalizedSessionRepository;

  beforeEach(function () {
    sessionId = 7402;
    publishedAt = new Date(2026, 3, 12, 9, 23, 45);
    sessionManagementRepository = {
      get: sinon.stub(),
      updatePublishedAt: sinon.stub(),
    };

    certificationRepository = {
      getStatusesBySessionId: sinon.stub(),
      publishCertificationCourses: sinon.stub(),
    };

    finalizedSessionRepository = {
      get: sinon.stub(),
      save: sinon.stub(),
    };

    finalizedSession = new FinalizedSession();
    finalizedSessionRepository.get.withArgs({ sessionId }).resolves(finalizedSession);
  });

  context('with an existing session', function () {
    let session, certificationCourseIds;
    beforeEach(function () {
      session = {
        isPublished: () => false,
      };
      sessionManagementRepository.get.resolves(session);

      certificationCourseIds = [{ certificationCourseId: 1 }];
      certificationRepository.getStatusesBySessionId.withArgs(sessionId).resolves(certificationCourseIds);
    });

    it('calls sessionMAnagementRepository.get', async function () {
      await sessionPublication({
        publishedAt,
        sessionId,
        sessionManagementRepository,
        certificationRepository,
        finalizedSessionRepository,
      });

      expect(sessionManagementRepository.get).to.have.been.calledWithExactly({ id: sessionId });
    });

    it('calls certificationRepository.getStatusesBySessionId', async function () {
      await sessionPublication({
        publishedAt,
        sessionId,
        sessionManagementRepository,
        certificationRepository,
        finalizedSessionRepository,
      });

      expect(certificationRepository.getStatusesBySessionId).to.have.been.calledWithExactly(sessionId);
    });

    it('calls certificationRepository.publishCertficiationCourses', async function () {
      await sessionPublication({
        publishedAt,
        sessionId,
        sessionManagementRepository,
        certificationRepository,
        finalizedSessionRepository,
      });

      expect(certificationRepository.publishCertificationCourses).to.have.been.calledWithExactly({
        certificationCourseIds,
        publishedAt,
      });
    });

    it('calls sessionManagementRepository.updatePublishedAt', async function () {
      await sessionPublication({
        publishedAt,
        sessionId,
        sessionManagementRepository,
        certificationRepository,
        finalizedSessionRepository,
      });

      expect(sessionManagementRepository.updatePublishedAt).to.have.been.calledWithExactly({
        id: sessionId,
        publishedAt,
      });
    });

    it('calls finalizedSessionRepository.get', async function () {
      await sessionPublication({
        publishedAt,
        sessionId,
        sessionManagementRepository,
        certificationRepository,
        finalizedSessionRepository,
      });

      expect(finalizedSessionRepository.get).to.have.been.calledWithExactly({ sessionId });
    });

    it('calls finalizedSessionRepository.save', async function () {
      await sessionPublication({
        publishedAt,
        sessionId,
        sessionManagementRepository,
        certificationRepository,
        finalizedSessionRepository,
      });

      expect(finalizedSessionRepository.save).to.have.been.calledWithExactly({ finalizedSession });
    });
  });

  context('without matching session', function () {
    it('throws a NotFoundError', async function () {
      const error = await catchErr(sessionPublication)({
        publishedAt,
        sessionId,
        sessionManagementRepository,
        certificationRepository,
        finalizedSessionRepository,
      });

      expect(error).to.be.an.instanceof(NotFoundError);
    });
  });

  context('with an already published session', function () {
    it('throws a SessionAlreadyPublished', async function () {
      const session = {
        isPublished: () => true,
      };
      sessionManagementRepository.get.resolves(session);
      const error = await catchErr(sessionPublication)({
        publishedAt,
        sessionId,
        sessionManagementRepository,
        certificationRepository,
        finalizedSessionRepository,
      });

      expect(error).to.be.an.instanceof(SessionAlreadyPublishedError);
    });
  });

  context('with a certificationCourse in error in the session', function () {
    it('throws a CertificationCourseNotPublishableError when an Error Status certificationCourse', async function () {
      const session = {
        isPublished: () => false,
      };
      sessionManagementRepository.get.resolves(session);

      const certificationCourseIds = [
        { certificationCourseId: 1, pixCertificationStatus: AssessmentResult.status.ERROR },
      ];
      certificationRepository.getStatusesBySessionId.withArgs(sessionId).resolves(certificationCourseIds);

      const error = await catchErr(sessionPublication)({
        publishedAt,
        sessionId,
        sessionManagementRepository,
        certificationRepository,
        finalizedSessionRepository,
      });

      expect(error).to.be.an.instanceof(CertificationCourseNotPublishableError);
    });

    it('throws a CertificationCourseNotPublishableError when certificationCourse has no scoring', async function () {
      const session = {
        isPublished: () => false,
      };
      sessionManagementRepository.get.resolves(session);

      const certificationCourseIds = [{ certificationCourseId: 1, pixCertificationStatus: null }];
      certificationRepository.getStatusesBySessionId.withArgs(sessionId).resolves(certificationCourseIds);

      const error = await catchErr(sessionPublication)({
        publishedAt,
        sessionId,
        sessionManagementRepository,
        certificationRepository,
        finalizedSessionRepository,
      });

      expect(error).to.be.an.instanceof(CertificationCourseNotPublishableError);
    });
  });
});
