import { expect, sinon } from '../../../../test-helper';
import Event from '../../../../../lib/domain/events/Event';
import ScheduleSendSharedParticipationResultsToPoleEmploiJob from '../../../../../lib/infrastructure/events/subscribers/ScheduleSendSharedParticipationResultsToPoleEmploiJob';

describe('Unit | Infrastructure | Events | Handler | SharedParticipationResultsToPoleEmploi', function () {
  describe('#handle', function () {
    it('schedules the result calculation', async function () {
      const job = {
        schedule: sinon.stub(),
      };

      const event = new Event();
      const handler = new ScheduleSendSharedParticipationResultsToPoleEmploiJob({
        sendSharedParticipationResultsToPoleEmploiJob: job,
      });
      await handler.handle(event);

      expect(job.schedule).to.have.been.calledWith(event);
    });
  });
});
