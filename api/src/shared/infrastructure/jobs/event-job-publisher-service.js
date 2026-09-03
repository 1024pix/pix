import { trace } from '@opentelemetry/api';

import { NotAnEventError } from '../../domain/errors.js';
import { getCorrelationInfo } from '../execution-context-manager.js';
import { JobExpireIn, JobPriority, JobRetry } from '../jobs/default-config.js';
import { JobClient } from '../jobs/JobClient.js';

export function publishEvent(event, jobClientClass = JobClient) {
  if (!isAnEventClass(event)) {
    throw new NotAnEventError(`${event.constructor.name} is not an Event class`);
  }

  const options = {
    expireInSeconds: event.options?.expireInSeconds || JobExpireIn.INFINITE,
    retryLimit: event.options?.retryLimit || JobRetry.FEW_RETRY.retryLimit,
    retryDelay: event.options?.retryDelay || JobRetry.FEW_RETRY.retryDelay,
    retryBackoff: event.options?.retryBackoff || JobRetry.FEW_RETRY.retryBackoff,
    priority: event.options?.priority || JobPriority.DEFAULT,
  };

  const correlationContext = getCorrelationInfo();
  const openTelemetryContext = trace.getActiveSpan()?.spanContext?.();
  return jobClientClass.instance.publishEvent(
    event.eventName,
    { ...event.payload, correlationContext, openTelemetryContext },
    options,
  );
}

function isAnEventClass(event) {
  return event.constructor.name.endsWith('Event');
}
