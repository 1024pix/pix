import _ from 'lodash';

export class PlaceStatistics {
  #placesLots;
  #numberOfParticipantWithAtLeastOneParticipation;

  constructor({ placesLots = [], numberOfParticipantWithAtLeastOneParticipation, organizationId } = {}) {
    this.id = `${organizationId}_place_statistics`;
    this.#placesLots = placesLots;
    this.#numberOfParticipantWithAtLeastOneParticipation = numberOfParticipantWithAtLeastOneParticipation;
  }

  static buildFrom({ placesLots, numberOfParticipantWithAtLeastOneParticipation, organizationId } = {}) {
    return new PlaceStatistics({ placesLots, numberOfParticipantWithAtLeastOneParticipation, organizationId });
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
