import sinon from 'sinon';

import { FinalizedSession } from '../../../../../../src/certification/session-management/domain/models/FinalizedSession.js';
import { unpublishSession } from '../../../../../../src/certification/session-management/domain/usecases/unpublish-session.js';
import { expect } from '../../../../../test-helper.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Certification | Session-Management | Unit | Domain | Use Cases | unpublish-session', function () {
  let certificationRepository;
  let sessionManagementRepository;
  let finalizedSessionRepository;

  beforeEach(function () {
    certificationRepository = {
      unpublishCertificationCoursesBySessionId: sinon.stub(),
    };
    sessionManagementRepository = {
      get: sinon.stub(),
      updatePublishedAt: sinon.stub(),
    };
    finalizedSessionRepository = {
      get: sinon.stub(),
      save: sinon.stub(),
    };
    sessionManagementRepository.flagResultsAsSentToPrescriber = sinon.stub();
  });

  it('should return the session', async function () {
    // given
    const sessionId = 123;
    const expectedSession = domainBuilder.certification.sessionManagement.buildSessionManagement({
      id: sessionId,
      publishedAt: new Date('2020-01-01'),
    });
    sessionManagementRepository.get.withArgs({ id: sessionId }).resolves(expectedSession);
    const finalizedSession = new FinalizedSession({ sessionId, publishSession: new Date('2020-01-01') });
    finalizedSessionRepository.get.withArgs({ sessionId }).resolves(finalizedSession);

    // when
    const actualSession = await unpublishSession({
      sessionId,
      certificationRepository,
      sessionManagementRepository,
      finalizedSessionRepository,
    });

    // then
    expect(certificationRepository.unpublishCertificationCoursesBySessionId).to.have.been.calledWithExactly({
      sessionId,
    });
    expect(sessionManagementRepository.updatePublishedAt).to.have.been.calledWithExactly({
      id: sessionId,
      publishedAt: null,
    });
    expect(finalizedSession.publishedAt).to.be.null;
    expect(finalizedSessionRepository.save).to.be.calledWith({ finalizedSession });
    expect(actualSession).to.deep.equal({
      ...expectedSession,
      publishedAt: null,
    });
  });
});
