import { expect, sinon } from '../../../../test-helper';
import Event from '../../../../../lib/domain/events/Event';
import ScheduleParticipationResultCalculationJob from '../../../../../lib/infrastructure/events/subscribers/ScheduleParticipationResultCalculationJob';

describe('Unit | Infrastructure | Events | Handler | ParticipationResultCalculation', function () {
  describe('#handle', function () {
    it('schedules the result calculation', async function () {
      const job = {
        schedule: sinon.stub(),
      };

      const event = new Event();
      const handler = new ScheduleParticipationResultCalculationJob({ participationResultCalculationJob: job });
      await handler.handle(event);

      expect(job.schedule).to.have.been.called;
    });
  });
});
