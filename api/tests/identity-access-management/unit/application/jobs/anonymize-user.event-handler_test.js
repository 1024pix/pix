import { expect } from 'chai';

import { AnonymizeUserEventHandler } from '../../../../../src/identity-access-management/application/jobs/anonymize-user.event-handler.js';

describe('Unit | Identity Access Management | Application | Jobs | AnonymizeUserEventHandler', function () {
  it('never looses failed anonymization jobs', function () {
    // when
    const handler = new AnonymizeUserEventHandler();

    // then
    expect(handler.isDeadLetterQueueEnabled).to.be.true;
  });
});
