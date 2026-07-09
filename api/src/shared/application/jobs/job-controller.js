import Joi from 'joi';

import { config } from '../../config.js';
import { EntityValidationError } from '../../domain/errors.js';
import { JobExpireIn } from '../../infrastructure/repositories/jobs/job-repository.js';

export const JobGroup = {
  DEFAULT: 'default',
  MADDO: 'maddo',
};

export function checkJobGroups(jobGroups) {
  if (!jobGroups) throw new Error('Job groups are mandatory');
  for (const jobGroup of jobGroups) {
    if (!Object.values(JobGroup).includes(jobGroup)) {
      throw new Error(`Job group invalid, allowed Job groups are [${Object.values(JobGroup)}]`);
    }
  }
}

export class JobController {
  constructor(jobName, options = {}) {
    this.jobName = jobName;
    this.jobGroup = options.jobGroup ?? JobGroup.DEFAULT;
    this.expireIn = options.expireIn ?? JobExpireIn.INFINITE;

    this.#validate();
  }

  get isJobEnabled() {
    return true;
  }

  get legacyName() {
    return null;
  }

  get localConcurrency() {
    return config.pgBoss.localConcurrency;
  }

  #schema = Joi.object({
    jobName: Joi.string().required(),
    jobGroup: Joi.string()
      .required()
      .valid(...Object.values(JobGroup)),
  });

  #validate() {
    const { error } = this.#schema.validate(this, { allowUnknown: true });
    if (error) {
      throw EntityValidationError.fromJoiErrors(error.details);
    }
  }
}
