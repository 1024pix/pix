import Joi from 'joi';

import { DomainTransaction } from '../../domain/DomainTransaction.js';
import { EntityValidationError } from '../../domain/errors.js';
import { JobPriority } from './JobPriority.js';

class JobPgBoss {
  #schema = Joi.object({
    priority: Joi.string()
      .required()
      .valid(...Object.values(JobPriority)),
  });

  /**
   * @param {Object} config
   * @param {valueOf<JobPriority>} config.priority
   */
  constructor(config) {
    this.name = config.name;
    this.retryLimit = config.retryLimit ?? 0;
    this.retryDelay = config.retryDelay ?? 30;
    this.retryBackoff = config.retryBackoff || false;
    this.expireIn = config.expireIn || '00:15:00';
    this.priority = config.priority || JobPriority.DEFAULT;

    this.#validate();
  }

  #buildPayload(data) {
    return {
      name: this.name,
      retrylimit: this.retryLimit,
      retrydelay: this.retryDelay,
      retrybackoff: this.retryBackoff,
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

export { JobPgBoss };
