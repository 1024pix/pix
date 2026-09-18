import { expect } from 'chai';
import sinon from 'sinon';

import { publishSession } from '../../../../../../src/certification/session-management/domain/usecases/publish-session.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { PublishSessionEvent } from '../../../../../../src/shared/domain/events/PublishSessionEvent.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Certification | Session-Management | Unit | Domain | Use Cases | Publish-Session', function () {
  it('throw a NotFoundError when session does not exist', async function () {
    const sessionId = Symbol('a session id');

    const sessionRepository = {
      get: sinon.stub(),
    };
    const eventJobPublisherService = {
      publishEvent: sinon.stub(),
    };

    const error = await catchErr(publishSession)({
      sessionId,
      eventJobPublisherService,
      sessionRepository,
    });

    expect(error).to.be.an.instanceof(NotFoundError);
  });

  it('delegates the action to the session-publication-service and return the session', async function () {
    // given
    const sessionId = Symbol('a session id');
    const session = domainBuilder.certification.sessionManagement.buildSession();

    const sessionRepository = {
      get: sinon.stub(),
    };
    const eventJobPublisherService = {
      publishEvent: sinon.stub(),
    };
    sessionRepository.get.withArgs({ id: sessionId }).resolves(session);

    // when
    await publishSession({
      sessionId,
      eventJobPublisherService,
      sessionRepository,
    });

    expect(eventJobPublisherService.publishEvent).to.have.been.calledWithExactly(
      new PublishSessionEvent({ sessionId }),
    );
  });
});
