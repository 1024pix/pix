export class Event {
  constructor({ id, name, candidateId, createdAt, metadata }) {
    this.id = id ?? null;
    this.name = name;
    this.candidateId = candidateId;
    this.createdAt = createdAt ?? new Date();
    this.metadata = metadata ?? null;
  }
}
