import { Event } from '../../../../../../src/certification/shared/domain/models/Event.js';

export function buildEvent({
  id = 1,
  name = 'FooHappened',
  candidateId = 123,
  createdAt = new Date('1990-04-01'),
  metadata = { foo: 'bar' },
} = {}) {
  return new Event({
    id,
    name,
    candidateId,
    createdAt,
    metadata,
  });
}
