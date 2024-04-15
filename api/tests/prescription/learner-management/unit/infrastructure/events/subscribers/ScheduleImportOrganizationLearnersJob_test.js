import { FileValidated } from '../../../../../../../src/prescription/learner-management/domain/events/FileValidated.js';
import { ScheduleImportOrganizationLearnersJob } from '../../../../../../../src/prescription/learner-management/infrastructure/events/subscribers/ScheduleImportOrganizationLearnersJob.js';
import { expect, sinon } from '../../../../../../test-helper.js';

describe('Unit | Subscribers | ScheduleImportOrganizationLearnersJob', function () {
  let importOrganizationLearnersJobStub;
  let event;

  beforeEach(function () {
    importOrganizationLearnersJobStub = { schedule: sinon.stub() };
    event = Symbol('event');
  });

  it('should schedule event', function () {
    const schedule = new ScheduleImportOrganizationLearnersJob({
      importOrganizationLearnersJob: importOrganizationLearnersJobStub,
    });

    schedule.handle(event);

    expect(importOrganizationLearnersJobStub.schedule).to.have.been.called;
  });

  it('should return job name', function () {
    const jobName = 'ImportOrganizationLearnersJob';
    const schedule = new ScheduleImportOrganizationLearnersJob({
      importOrganizationLearnersJob: importOrganizationLearnersJobStub,
    });

    expect(schedule.name).to.equal(jobName);
  });

  it('should link scheduler with the right event', function () {
    expect(ScheduleImportOrganizationLearnersJob.event).to.be.equal(FileValidated);
  });
});
