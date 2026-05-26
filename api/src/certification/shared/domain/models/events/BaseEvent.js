export class BaseEvent {
  constructor({ candidateId, createdAt = new Date(), metadata }) {
    this.candidateId = candidateId;
    this.createdAt = createdAt;
    this.metadata = metadata;
  }

  get name() {
    throw new Error('Must implement a derived class event');
  }
}
