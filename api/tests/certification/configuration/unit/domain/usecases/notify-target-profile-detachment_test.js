import { expect } from 'chai';
import sinon from 'sinon';

import { TargetProfileDetachedEvent } from '../../../../../../src/certification/configuration/domain/events/TargetProfileDetachedEvent.js';
import { notifyTargetProfileDetachment } from '../../../../../../src/certification/configuration/domain/usecases/notify-target-profile-detachment.js';

describe('Unit | UseCase | notify-target-profile-detachment', function () {
  it('should publish a TargetProfileDetachedEvent built from the given target profile and complementary certification', async function () {
    // given
    const eventJobPublisherService = {
      publishEvent: sinon.stub(),
    };
    const complementaryCertification = { id: 456, label: 'Pix+ Édu' };

    // when
    await notifyTargetProfileDetachment({
      targetProfileIdToDetach: 123,
      complementaryCertification,
      eventJobPublisherService,
    });

    // then
    expect(eventJobPublisherService.publishEvent).to.have.been.calledWith(
      new TargetProfileDetachedEvent({
        targetProfileIdToDetach: 123,
        complementaryCertificationId: 456,
        complementaryCertificationName: 'Pix+ Édu',
      }),
    );
  });
});
