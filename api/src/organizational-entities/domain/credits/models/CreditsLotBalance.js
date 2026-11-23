export class CreditsLotBalance {
  constructor({ id, count, activationDate, expirationDate, consumedCount } = {}) {
    this.id = id;
    this.count = count;
    this.activationDate = activationDate;
    this.expirationDate = expirationDate;
    this.consumedCount = consumedCount;
  }

  get isActive() {
    const now = new Date();

    return new Date(this.activationDate) <= now && now <= new Date(this.expirationDate);
  }

  get hasRemainingCapacity() {
    return this.consumedCount < this.count;
  }
}
