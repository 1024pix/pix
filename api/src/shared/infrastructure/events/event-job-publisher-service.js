import { NotAnEventError } from '../../domain/errors.js';
import { JobClient } from '../jobs/JobClient.js';

export function publishEvent(event, jobClientClass = JobClient) {
  if (!itsAnEventClass(event)) {
    throw new NotAnEventError(`${event.constructor.name} is not an Event class`);
  }
  return jobClientClass.instance.publishEvent(event.eventName, event.payload);
}

function itsAnEventClass(event) {
  return event.constructor.name.endsWith('Event');
}
