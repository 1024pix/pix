import { FileUploaded } from '../../../../../../../src/prescription/learner-management/domain/events/FileUploaded.js';
import { ScheduleValidateOrganizationImportFileJob } from '../../../../../../../src/prescription/learner-management/infrastructure/events/subscribers/ScheduleValidateOrganizationImportFileJob.js';
import { expect, sinon } from '../../../../../../test-helper.js';

describe('Unit | Subscribers | ScheduleValidateOrganizationImportFileJob', function () {
  let validateOrganizationImportFileJobStub;
  let event;

  beforeEach(function () {
    validateOrganizationImportFileJobStub = { schedule: sinon.stub() };
    event = Symbol('event');
  });

  it('should schedule event', function () {
    const schedule = new ScheduleValidateOrganizationImportFileJob({
      validateOrganizationImportFileJob: validateOrganizationImportFileJobStub,
    });

    schedule.handle(event);

    expect(validateOrganizationImportFileJobStub.schedule).to.have.been.called;
  });

  it('should return job name', function () {
    const jobName = 'ValidateOrganizationImportFileJob';
    const schedule = new ScheduleValidateOrganizationImportFileJob({
      validateOrganizationImportFileJob: validateOrganizationImportFileJobStub,
    });

    expect(schedule.name).to.equal(jobName);
  });

  it('should link scheduler with the right event', function () {
    expect(ScheduleValidateOrganizationImportFileJob.event).to.be.equal(FileUploaded);
  });
});
