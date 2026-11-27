import Joi from 'joi';

import { config } from '../../../../config/config.js';
import { EntityValidationError } from '../../domain/errors.js';
import { JobExpireIn } from '../../infrastructure/jobs/default-config.js';

export const JobGroup = {
  DEFAULT: 'default',
  MADDO: 'maddo',
};

/**
 * Teams owning the jobs, the GitHub teams of `.github/CODEOWNERS` without their `team-` prefix
 * @readonly
 * @enum {string}
 */
export const JobTeam = Object.freeze({
  ACCES: 'acces',
  ACQUISITION: 'acquisition',
  CAPTAINS: 'captains',
  CERTIFICATION: 'certification',
  CONTENU: 'contenu',
  DATA: 'data',
  DEVCOMP: 'devcomp',
  PRESCRIPTION: 'prescription',
  STAFF: 'staff',
  COMBINIX: 'combinix',
});

export function checkJobGroups(jobGroups) {
  if (!jobGroups) throw new Error('Job groups are mandatory');
  for (const jobGroup of jobGroups) {
    if (!Object.values(JobGroup).includes(jobGroup)) {
      throw new Error(`Job group invalid, allowed Job groups are [${Object.values(JobGroup)}]`);
    }
  }
}

export class JobController {
  /**
   * @param {string} jobName - name of the pg-boss queue
   * @param {object} options
   * @param {string} options.description - what the job does and when it runs, for the generated documentation (`npm run doc:jobs`)
   * @param {string} options.team - the JobTeam owning the job, who can confirm what it does and why
   * @param {string} [options.jobGroup]
   * @param {number} [options.expireIn]
   * @param {boolean} [options.isDeadLetterQueueEnabled]
   */
  constructor(jobName, options = {}) {
    this.jobName = jobName;
    this.description = options.description;
    this.team = options.team;
    this.jobGroup = options.jobGroup ?? JobGroup.DEFAULT;
    this.expireIn = options.expireIn ?? JobExpireIn.INFINITE;
    this.isDeadLetterQueueEnabled = options.isDeadLetterQueueEnabled ?? false;

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
