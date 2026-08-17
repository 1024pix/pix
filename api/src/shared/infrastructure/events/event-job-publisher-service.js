import { JobClient } from '../jobs/JobClient.js';

export function publishEvent(eventName, payload, jobClientClass = JobClient) {
  return jobClientClass.instance.publishEvent(eventName, payload);
}
