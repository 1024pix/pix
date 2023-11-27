import _ from 'lodash';

class PlacesLot {
  #deletedAt;
  #activationDate;
  #expirationDate;

  constructor({ count, deletedAt, activationDate, expirationDate }) {
    this.count = count;
    this.#deletedAt = deletedAt;
    this.#activationDate = activationDate;
    this.#expirationDate = expirationDate;
  }

  get isActive() {
    return this.#expirationDate > Date.now() && this.#activationDate < Date.now() && !this.#deletedAt;
  }
}

export class PlaceStatistics {
  #placesLots;
  #numberOfParticipantWithAtLeastOneParticipation;

  constructor({ placesLots = [], numberOfParticipantWithAtLeastOneParticipation } = {}) {
    this.#placesLots = placesLots.map((p) => new PlacesLot(p));
    this.#numberOfParticipantWithAtLeastOneParticipation = numberOfParticipantWithAtLeastOneParticipation;
  }

  get total() {
    if (!this.#placesLots) return 0;
    const activePlaces = this.#placesLots.filter((placesLot) => placesLot.isActive);
    return _.sumBy(activePlaces, 'count');
  }

  get occupied() {
    if (!this.#numberOfParticipantWithAtLeastOneParticipation) return 0;

    return this.#numberOfParticipantWithAtLeastOneParticipation;
  }

  get available() {
    const available = this.total - this.occupied;
    if (available < 0) return 0;
    return available;
  }
}
