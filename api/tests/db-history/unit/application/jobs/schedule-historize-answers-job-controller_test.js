import sinon from 'sinon';

import { getDatesOneYearEarlier } from '../../../../../src/db-history/application/jobs/date-utils.js';
import { ScheduleHistorizeAnswersJobController } from '../../../../../src/db-history/application/jobs/schedule-historize-answers-job-controller.js';
import { usecases } from '../../../../../src/db-history/domain/usecases/index.js';
import { expect } from '../../../../test-helper.js';

describe('DB-History | Unit | Application | Jobs | ScheduleHistorizeAnswersJobController', function () {
  describe('#handle', function () {
    it('schedules answers historization usecase call', async function () {
      // given
      const now = new Date('2025-06-11T00:00:00Z');
      const clock = sinon.useFakeTimers(now);
      sinon.stub(usecases, 'historizeAnswers');
      const scheduleHistorizeAnswersJobController = new ScheduleHistorizeAnswersJobController();
      const [expectedDate] = getDatesOneYearEarlier(now);

      // when
      await scheduleHistorizeAnswersJobController.handle();

      // then
      expect(usecases.historizeAnswers).to.have.been.calledWith({ targetDate: expectedDate });

      clock.restore();
    });
  });

  describe('when it is the 29th of February', function () {
    it('should not run the usecase ', async function () {
      // given
      const now = new Date('2024-02-29T00:00:00Z');
      const clock = sinon.useFakeTimers(now);
      sinon.stub(usecases, 'historizeAnswers');
      const scheduleHistorizeAnswersJobController = new ScheduleHistorizeAnswersJobController();

      // when
      await scheduleHistorizeAnswersJobController.handle();

      // then
      expect(usecases.historizeAnswers).to.not.have.been.called;

      clock.restore();
    });
  });

  describe('when it is the 1st of March the year after a leap year', function () {
    it('should run the usecase twice', async function () {
      // given
      const now = new Date('2025-03-01T00:00:00Z');
      const clock = sinon.useFakeTimers(now);
      sinon.stub(usecases, 'historizeAnswers');
      const scheduleHistorizeAnswersJobController = new ScheduleHistorizeAnswersJobController();
      const expectedDates = getDatesOneYearEarlier(now);

      // when
      await scheduleHistorizeAnswersJobController.handle();

      // then
      const usecaseCalls = usecases.historizeAnswers.getCalls();
      expect(usecases.historizeAnswers).to.have.been.calledTwice;
      expect(usecaseCalls[0]).to.have.been.calledWith({ targetDate: expectedDates[0] });
      expect(usecaseCalls[1]).to.have.been.calledWith({ targetDate: expectedDates[1] });

      clock.restore();
    });
  });
});
