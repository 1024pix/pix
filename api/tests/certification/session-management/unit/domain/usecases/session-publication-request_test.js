import { expect } from 'chai';
import sinon from 'sinon';

import { SessionAlreadyPublishedError } from '../../../../../../src/certification/session-management/domain/errors.js';
import { sessionPublicationRequest } from '../../../../../../src/certification/session-management/domain/usecases/session-publication-request.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Certification | Session-Management | Unit | Domain | Use Cases | Session-publication-request', function () {
  let sessionManagementRepository, publishSessionJobRepository;

  beforeEach(function () {
    sessionManagementRepository = {
      get: sinon.stub(),
    };
    publishSessionJobRepository = {
      performAsync: sinon.stub(),
    };
  });

  it('throw a NotFoundError when session does not exist', async function () {
    const sessionId = Symbol('a session id');

    const error = await catchErr(sessionPublicationRequest)({
      sessionId,
      publishSessionJobRepository,
      sessionManagementRepository,
    });

    expect(error).to.be.an.instanceof(NotFoundError);
  });

  it('throws a SessionAlreadyPublished when session is already published', async function () {
    const session = domainBuilder.certification.sessionManagement.buildSessionManagement({
      id: 123,
      publishedAt: new Date('2024-03-23'),
    });

    sessionManagementRepository.get.withArgs({ id: session.id }).resolves(session);

    const error = await catchErr(sessionPublicationRequest)({
      sessionId: session.id,
      publishSessionJobRepository,
      sessionManagementRepository,
    });

    expect(error).to.be.an.instanceof(SessionAlreadyPublishedError);
  });

  it('call PublishSessionJob.performAsync', async function () {
    // given
    const sessionId = Symbol('a session id');
    const session = domainBuilder.certification.sessionManagement.buildSessionManagement();

    sessionManagementRepository.get.withArgs({ id: sessionId }).resolves(session);

    // when
    await sessionPublicationRequest({
      sessionId,
      publishSessionJobRepository,
      sessionManagementRepository,
    });

    expect(publishSessionJobRepository.performAsync).to.have.been.calledWith({ sessionId });
  });
});
