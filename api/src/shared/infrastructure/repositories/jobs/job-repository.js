import { trace } from '@opentelemetry/api';
import Joi from 'joi';

import { EntityValidationError } from '../../../domain/errors.js';
import { getCorrelationInfo } from '../../execution-context-manager.js';
import { JobExpireIn, JobPriority, JobRetry } from '../../jobs/default-config.js';
import { JobClient } from '../../jobs/JobClient.js';

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
    };
  }

  async performAsync(...payloads) {
    const correlationContext = getCorrelationInfo();
    const openTelemetryContext = trace.getActiveSpan()?.spanContext?.();

    for (const payload of payloads) {
      await JobClient.instance.send(this.name, { ...payload, correlationContext, openTelemetryContext }, this.options);
    }
    return { rowCount: payloads.length };
  }
}
