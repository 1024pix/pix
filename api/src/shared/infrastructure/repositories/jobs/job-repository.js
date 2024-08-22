import Joi from 'joi';

import { DomainTransaction } from '../../../domain/DomainTransaction.js';
import { EntityValidationError } from '../../../domain/errors.js';

export class JobRepository {
  #schema = Joi.object({
    expireIn: Joi.string()
      .required()
      .valid(...Object.values(JobExpireIn)),
    priority: Joi.string()
      .required()
      .valid(...Object.values(JobPriority)),
    retry: Joi.object()
      .required()
      .valid(...Object.values(JobRetry))
      .messages({
        'any.only': `retry accept only JobRetry value such as ${Object.keys(JobRetry).join(', ')}`,
      }),
  });

  /**
   * @param {Object} config
   * @param {valueOf<JobPriority>} config.priority
   * @param {valueOf<JobRetry>} config.retry
   */
  constructor(config) {
    this.name = config.name;

    this.retry = config.retry || JobRetry.NO_RETRY;

    this.expireIn = config.expireIn || JobExpireIn.DEFAULT;
    this.priority = config.priority || JobPriority.DEFAULT;

    this.#validate();
  }

  #buildPayload(data) {
    return {
      name: this.name,
      retrylimit: this.retry.retryLimit,
      retrydelay: this.retry.retryDelay,
      retrybackoff: this.retry.retryBackoff,
      expirein: this.expireIn,
      data,
      on_complete: true,
      priority: this.priority,
    };
  }

  async #send(jobs) {
    const knexConn = DomainTransaction.getConnection();

    return knexConn('pgboss.job').insert(jobs);
  }

  async performAsync(...datas) {
    const jobs = datas.map((payload) => {
      return this.#buildPayload(payload);
    });

    return this.#send(jobs);
  }

  #validate() {
    const { error } = this.#schema.validate(this, { allowUnknown: true });
    if (error) {
      throw EntityValidationError.fromJoiErrors(error.details);
    }
  }
}

/**
 * Job priority. Higher numbers have, um, higher priority
 * @see https://github.com/timgit/pg-boss/blob/9.0.3/docs/readme.md#insertjobs
 * @readonly
 * @enum {number}
 */
export const JobPriority = Object.freeze({
  DEFAULT: 0,
  HIGH: 1,
});

/**
 * Job retry. define few config to retry job when failed
 * @see https://github.com/timgit/pg-boss/blob/9.0.3/docs/readme.md#insertjobs
 * @readonly
 * @enum {Object}
 */
export const JobRetry = Object.freeze({
  NO_RETRY: {
    retryLimit: 0,
    retryDelay: 0,
    retryBackoff: false,
  },
  STANDARD_RETRY: {
    retryLimit: 10,
    retryDelay: 30,
    retryBackoff: true,
  },
  HIGH_RETRY: {
    retryLimit: 10,
    retryDelay: 30,
    retryBackoff: false,
  },
});

/**
 * Job expireIn. define few config to set expireIn field
 * @see https://github.com/timgit/pg-boss/blob/9.0.3/docs/readme.md#insertjobs
 * @readonly
 * @enum {string}
 */
export const JobExpireIn = Object.freeze({
  DEFAULT: '00:15:00',
  HIGH: '00:30:00',
});
