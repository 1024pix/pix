import sinon from 'sinon';

import { MonitoredJobHandler } from '../../../../../src/shared/infrastructure/jobs/MonitoredJobHandler.js';
import { expect } from '../../../../test-helper.js';

describe('Unit | Share | Infrastructure | Jobs | MonitoringJobHandler', function () {
  context('handle', function () {
    it('should execute and monitor a job', async function () {
      // given
      const metricsMock = { addMetricPoint: sinon.stub() };
      const handlerMock = { handle: sinon.stub() };
      const loggerMock = { info: sinon.stub(), error: sinon.stub() };
      sinon.useFakeTimers({ now: new Date('2022-02-27T13:00:00Z') });
      const jobData = {
        id: '123',
        data: { foo: 'bar' },
        createdOn: '2022-02-27T11:00:00Z',
        startedOn: '2022-02-27T12:00:00Z',
      };

      // when
      const monitorJobHandler = new MonitoredJobHandler(metricsMock, handlerMock, loggerMock);
      await monitorJobHandler.handle('MyJob', jobData);

      // then
      expect(loggerMock.info).to.have.been.calledWith(
        {
          type: 'JOB_LOG',
          jobId: jobData.id,
          data: jobData.data,
          handlerName: 'MyJob',
        },
        'PGBOSS JOB STARTING',
      );
      expect(handlerMock.handle).to.have.been.calledWith({ data: jobData.data, jobId: jobData.id });
      expect(loggerMock.info).to.have.been.calledWith(
        {
          event: 'pg-boss-execution-time',
          type: 'JOB_LOG_EXEC_TIME',
          jobId: jobData.id,
          handlerName: 'MyJob',
          executionTime: 3600,
          totalTime: 2 * 3600,
        },
        'PGBOSS JOB COMPLETED',
      );
      expect(metricsMock.addMetricPoint).to.have.been.called;
    });

    it('should log failure when job failed', async function () {
      // given
      const metricsMock = { addMetricPoint: sinon.stub() };
      const handlerMock = { handle: sinon.stub().rejects(new Error('error in handler')) };
      const loggerMock = { info: sinon.stub(), error: sinon.stub() };
      sinon.useFakeTimers({ now: new Date('2022-02-27T13:00:00Z') });
      const jobData = {
        id: '123',
        data: { foo: 'bar' },
        createdOn: '2022-02-27T11:00:00Z',
        startedOn: '2022-02-27T12:00:00Z',
      };

      // when
      const monitorJobHandler = new MonitoredJobHandler(metricsMock, handlerMock, loggerMock);
      await expect(monitorJobHandler.handle('MyJob', jobData)).to.be.rejectedWith('error in handler');

      // then
      const message = loggerMock.error.getCalls()[0].lastArg;
      const payload = loggerMock.error.getCalls()[0].firstArg;

      expect(message).to.equal('PGBOSS ERROR IN JOB');
      expect(payload.type).to.equal('JOB_LOG_ERROR');
      expect(payload.message).to.equal('Job failed');
      expect(payload.jobId).to.equal(jobData.id);
      expect(payload.data).to.equal(jobData.data);
      expect(payload.handlerName).to.equal('MyJob');
      expect(payload.error).to.equal('error in handler');
      expect(payload.stack).to.contains('Error: error in handler\n');

      expect(metricsMock.addMetricPoint).to.have.been.called;
    });
  });
});
