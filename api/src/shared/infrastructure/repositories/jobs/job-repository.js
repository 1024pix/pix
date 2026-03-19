import Joi from 'joi';
import { PgBoss } from 'pg-boss';

import { knex } from '../../../../../db/knex-database-connection.js';
import { config } from '../../../config.js';
import { EntityValidationError } from '../../../domain/errors.js';

const monitorStateIntervalSeconds = config.pgBoss.monitorStateIntervalSeconds;

export const pgBoss = new PgBoss({
  ...(monitorStateIntervalSeconds ? { monitorStateIntervalSeconds } : {}),
  archiveFailedAfterSeconds: config.pgBoss.archiveFailedAfterSeconds,
  db: {
    // temporary code to reuse connection pool from knex one
    // shall be deleted when using a dedicated pgboss database
    executeSql: (query, values) => {
      const remapped = [];
      const converted = query.replace(/\$(\d+)/g, (_, index) => {
        const value = values[parseInt(index, 10) - 1];
        remapped.push(value ?? null);
        return '?';
      });
      // eslint-disable-next-line knex/avoid-injections
      return knex.raw(converted, remapped);
    },
  },
});

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

    const { error } = this.#schema.validate(this, { allowUnknown: true });
    if (error) {
      throw EntityValidationError.fromJoiErrors(error.details);
    }
  }

  get options() {
    return {
      expireInSeconds: this.expireIn,
      retryLimit: this.retry.retryLimit,
      retryDelay: this.retry.retryDelay,
      retryBackoff: this.retry.retryBackoff,
      priority: this.priority,
      onComplete: true,
    };
  }

  async performAsync(...payloads) {
    for (const payload of payloads) {
      await pgBoss.send(this.name, payload, this.options);
    }
    return { rowCount: payloads.length };
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
  INFINITE: 20 * 3600,
  /*
   pg-boss n'arrête pas les jobs expirés. De plus, il empile d'autres jobs par dessus et relance le job expiré, ce qui peut provoquer des états incohérents.
   Par conséquent nous définissons 20 heures comme durée maximale, ce qui fait plus que la durée maximale d'un conteneur.
   */
});
