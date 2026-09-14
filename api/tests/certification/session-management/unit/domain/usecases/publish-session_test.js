import { expect } from 'chai';
import sinon from 'sinon';

import { publishSession } from '../../../../../../src/certification/session-management/domain/usecases/publish-session.js';
import { PublishSessionEvent } from '../../../../../../src/shared/domain/events/PublishSessionEvent.js';

describe('Certification | Session-Management | Unit | Domain | Use Cases | Publish-Session', function () {
  it('delegates the action to the session-publication-service and return the session', async function () {
    // given
    const sessionId = Symbol('a session id');

    const eventJobPublisherService = {
      publishEvent: sinon.stub(),
    };

    // when
    await publishSession({
      sessionId,
      eventJobPublisherService,
    });

    expect(eventJobPublisherService.publishEvent).to.have.been.calledWithExactly(new PublishSessionEvent(sessionId));
  });
});
