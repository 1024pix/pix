import { config } from '../../../../shared/config.js';
import { GarAuthenticationMethodAnonymized } from '../../../domain/events/GarAuthenticationMethodAnonymized.js';

export class GarAnonymizedJobScheduler {
  constructor({ garAnonymizedBatchEventsLoggingJob }) {
    this.garAnonymizedBatchEventsLoggingJob = garAnonymizedBatchEventsLoggingJob;
  }

  static event = GarAuthenticationMethodAnonymized;

  get name() {
    return this.constructor.name;
  }

  async handle(event) {
    if (config.auditLogger.isEnabled) {
      await this.garAnonymizedBatchEventsLoggingJob.schedule(event);
    }
  }
}
