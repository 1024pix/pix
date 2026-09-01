import { expect } from 'chai';
import sinon from 'sinon';

import { SendTargetProfileNotificationsOnTargetProfileDetachedEventHandler } from '../../../../../../src/certification/configuration/application/jobs/send-target-profile-notifications-on-target-profile-detached.event-handler.js';

describe('Unit | Certification | Configuration | Application | Jobs | send-target-profile-notifications-on-target-profile-detached.event-handler', function () {
  describe('#handle', function () {
    it('should call sendTargetProfileNotifications usecase with a complementaryCertification rebuilt from the event payload', async function () {
      // given
      const usecases = {
        sendTargetProfileNotifications: sinon.stub(),
      };
      const handler = new SendTargetProfileNotificationsOnTargetProfileDetachedEventHandler();
      const data = {
        targetProfileIdToDetach: 123,
        complementaryCertificationId: 456,
        complementaryCertificationName: 'Pix+ Édu',
      };

      // when
      await handler.handle({ data, dependencies: { usecases } });

      // then
      expect(usecases.sendTargetProfileNotifications).to.have.been.calledWith({
        targetProfileIdToDetach: 123,
        complementaryCertification: { id: 456, label: 'Pix+ Édu' },
      });
    });
  });
});
