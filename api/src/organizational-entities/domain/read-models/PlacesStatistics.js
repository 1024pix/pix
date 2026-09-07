import _ from 'lodash';

import { config } from '../../../../config/config.js';

export class PlacesStatistics {
  #placesLots;
  #placeRepartition;
  #isMaximumPlacesLimitEnabled;

  constructor({ placesLots = [], placeRepartition, organizationId, enableMaximumPlacesLimit } = {}) {
    this.id = `${organizationId}_place_statistics`;
    this.#placesLots = placesLots;
    this.#placeRepartition = placeRepartition;
    this.#isMaximumPlacesLimitEnabled = enableMaximumPlacesLimit;
  }

  static buildFrom({ placesLots, placeRepartition, organizationId, enableMaximumPlacesLimit } = {}) {
    return new PlacesStatistics({ placesLots, placeRepartition, organizationId, enableMaximumPlacesLimit });
  }

  get #activePlacesLots() {
    return this.#placesLots.filter((placesLot) => placesLot.isActive);
  }

  get total() {
    if (!this.#placesLots) return 0;
    const activePlaces = this.#activePlacesLots;
    return _.sumBy(activePlaces, 'count');
  }

  get occupied() {
    return this.#placeRepartition.totalRegisteredParticipant + this.#placeRepartition.totalUnRegisteredParticipant;
  }

  get anonymousSeat() {
    return this.#placeRepartition.totalUnRegisteredParticipant;
  }

  get available() {
    const available = this.total - this.occupied;
    if (available < 0) return 0;
    return available;
  }

  get placesLotsTotal() {
    return this.#activePlacesLots.length;
  }

  get hasReachedMaximumPlacesLimit() {
    if (!this.#isMaximumPlacesLimitEnabled || this.occupied === 0) return false;

    const thresholdLock = config.features.organizationPlacesManagementThreshold;
    const maximumPlaces = this.total + this.total * thresholdLock;
    return this.occupied >= maximumPlaces;
  }
}
