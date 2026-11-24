import { expect } from 'chai';

import { jobControllers } from '../../jobs.js';
import { JobController } from '../../src/shared/application/jobs/job-controller.js';

describe('Unit | jobs', function () {
  it('lists job controllers that instantiate without arguments', function () {
    const jobs = jobControllers.map((JobControllerClass) => new JobControllerClass());

    expect(jobs).to.have.lengthOf(jobControllers.length);
    jobs.forEach((job) => expect(job).to.be.an.instanceOf(JobController));
  });

  it('lists each job controller once', function () {
    const classNames = jobControllers.map((JobControllerClass) => JobControllerClass.name);

    expect(new Set(classNames).size).to.equal(classNames.length);
  });

  it('gives every job a distinct queue name', function () {
    const jobNames = jobControllers.map((JobControllerClass) => String(new JobControllerClass().jobName));

    expect(new Set(jobNames).size).to.equal(jobNames.length);
  });
});
