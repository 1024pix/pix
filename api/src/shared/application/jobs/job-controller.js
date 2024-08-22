import Joi from 'joi';

import { EntityValidationError } from '../../domain/errors.js';

export const JobGroup = {
  DEFAULT: 'default',
};

export class JobController {
  constructor(jobName, jobGroup = JobGroup.DEFAULT) {
    this.jobName = jobName;
    this.jobGroup = jobGroup;

    this.#validate();
  }

  get isJobEnabled() {
    return true;
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
