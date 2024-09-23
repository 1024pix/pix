import Joi from 'joi';

import { config } from '../../config.js';
import { EntityValidationError } from '../../domain/errors.js';

export const JobGroup = {
  DEFAULT: 'default',
  FAST: 'fast',
};

export class JobController {
  constructor(jobName, options = {}) {
    this.jobName = jobName;
    this.jobGroup = options.jobGroup || JobGroup.DEFAULT;

    this.#validate();
  }

  get isJobEnabled() {
    return true;
  }

  get legacyName() {
    return null;
  }

  get teamSize() {
    return config.pgBoss.teamSize;
  }

  get teamConcurrency() {
    return config.pgBoss.teamConcurrency;
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
