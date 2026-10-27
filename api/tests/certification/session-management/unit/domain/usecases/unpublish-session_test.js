import { expect } from 'chai';
import sinon from 'sinon';

import { FinalizedSession } from '../../../../../../src/certification/session-management/domain/models/FinalizedSession.js';
import { unpublishSession } from '../../../../../../src/certification/session-management/domain/usecases/unpublish-session.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Certification | Session-Management | Unit | Domain | Use Cases | unpublish-session', function () {
  let certificationRepository;
  let sessionManagementRepository;
  let finalizedSessionRepository;
  let dependencies;

  beforeEach(function () {
    certificationRepository = {
      unpublishCertificationCoursesBySessionId: sinon.stub(),
    };
    sessionManagementRepository = {
      get: sinon.stub(),
      update: sinon.stub(),
    };
    finalizedSessionRepository = {
      get: sinon.stub(),
      save: sinon.stub(),
    };
    dependencies = {
      certificationRepository,
      sessionManagementRepository,
      finalizedSessionRepository,
    };
  });

  it('throws a NotFoundError when no session is found', async function () {
    // given
    sessionManagementRepository.get.withArgs({ id: 99 }).resolves(null);

    // when
    const error = await catchErr(unpublishSession)({
      sessionId: 99,
      ...dependencies,
    });

    // then
    expect(error).to.deepEqualInstance(new NotFoundError("La session n'existe pas ou son accès est restreint"));
  });

  it('should return the session', async function () {
    // given
    const sessionId = 123;
    const session = domainBuilder.certification.sessionManagement.buildSessionManagement({
      id: sessionId,
      publishedAt: new Date('2020-01-01'),
    });
    const updatedSession = domainBuilder.certification.sessionManagement.buildSessionManagement({
      id: sessionId,
      publishedAt: null,
    });
    sessionManagementRepository.get.withArgs({ id: sessionId }).onFirstCall().resolves(session);
    sessionManagementRepository.get.withArgs({ id: sessionId }).onSecondCall().resolves(updatedSession);
    const finalizedSession = new FinalizedSession({ sessionId, publishSession: new Date('2020-01-01') });
    finalizedSessionRepository.get.withArgs({ sessionId }).resolves(finalizedSession);

    // when
    const actualSession = await unpublishSession({
      sessionId,
      ...dependencies,
    });

    // then
    expect(certificationRepository.unpublishCertificationCoursesBySessionId).to.have.been.calledWithExactly({
      sessionId,
    });
    expect(sessionManagementRepository.update).to.have.been.calledWithExactly(updatedSession);
    expect(finalizedSession.publishedAt).to.be.null;
    expect(finalizedSessionRepository.save).to.be.calledWith({ finalizedSession });
    expect(actualSession).to.deep.equal(updatedSession);
  });
});
