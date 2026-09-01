import { expect } from 'chai';

import { TargetProfileDetachedEvent } from '../../../../../../src/certification/configuration/domain/events/TargetProfileDetachedEvent.js';

describe('Unit | Certification | Configuration | Domain | Events | TargetProfileDetachedEvent', function () {
  it('should build the event with the given payload', function () {
    // when
    const event = new TargetProfileDetachedEvent({
      targetProfileIdToDetach: 123,
      complementaryCertificationId: 456,
      complementaryCertificationName: 'Pix+ Édu',
    });

    // then
    expect(event.eventName).to.equal('target-profile.detached');
    expect(TargetProfileDetachedEvent.eventName).to.equal('target-profile.detached');
    expect(event.payload).to.deep.equal({
      targetProfileIdToDetach: 123,
      complementaryCertificationId: 456,
      complementaryCertificationName: 'Pix+ Édu',
    });
    expect(event.options).to.deep.equal({});
  });
});
