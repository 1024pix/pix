import Joi from 'joi';

import { knex } from '../../../../../db/knex-database-connection.js';
import { DomainTransaction } from '../../../domain/DomainTransaction.js';
import { EntityValidationError } from '../../../domain/errors.js';

export class JobRepository {
  #schema = Joi.object({
    expireIn: Joi.string()
      .required()
      .valid(...Object.values(JobExpireIn))
      .messages({
        'any.only': `"expireIn" accept only JobExpireIn value such as ${Object.keys(JobExpireIn).join(', ')}`,
      }),
    priority: Joi.string()
      .required()
      .valid(...Object.values(JobPriority))
      .messages({
        'any.only': `"priority" accept only JobPriority value such as ${Object.keys(JobPriority).join(', ')}`,
      }),
    retry: Joi.object()
      .required()
      .valid(...Object.values(JobRetry))
      .messages({
        'any.only': `"retry" accept only JobRetry value such as ${Object.keys(JobRetry).join(', ')}`,
      }),
  });

  /**
   * @param {Object} config
   * @param {string} config.name Job name
   * @param {valueOf<JobPriority>} config.priority Job prority
   * @param {valueOf<JobRetry>} config.retry Job retry strategy
   * @param {valueOf<JobExpireIn>} config.expireIn Job retention duration
   */
  constructor(config) {
    this.name = config.name;

    this.retry = config.retry || JobRetry.NO_RETRY;

    this.expireIn = config.expireIn || JobExpireIn.INFINITE;
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

    const results = await knex.batchInsert('pgboss.job', jobs).transacting(knexConn.isTransaction ? knexConn : null);

    const rowCount = results.reduce((total, batchResult) => total + (batchResult.rowCount || 0), 0);

    return { rowCount };
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
  FEW_RETRY: {
    retryLimit: 2,
    retryDelay: 30,
    retryBackoff: true,
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
  INFINITE: '48:00:00',
  /*
   pg-boss n'arrête pas les jobs expirés. De plus, il empile d'autres jobs par dessus et relance le job expiré, ce qui peut provoquer des états incohérents.
   Par conséquent nous définissons 48 heures comme durée maximale, ce qui fait plus que la durée maximale d'un conteneur.
   */
});
