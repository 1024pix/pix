import _ from 'lodash';

import { OrganizationCantGetPlacesStatisticsError } from '../../../../prescription/organization-place/domain/errors.js';

export class PlaceStatistics {
  #placesLots;
  #placeRepartition;

  constructor({ placesLots = [], placeRepartition, organizationId } = {}) {
    this.id = `${organizationId}_place_statistics`;
    this.#placesLots = placesLots;
    this.#placeRepartition = placeRepartition;
    this.#validate();
  }

  #validate() {
    if (this.#placesLots.every((placesLot) => placesLot.count === 0) && this.#placesLots.length > 0) {
      throw new OrganizationCantGetPlacesStatisticsError();
    }
  }
  static buildFrom({ placesLots, placeRepartition, organizationId } = {}) {
    return new PlaceStatistics({ placesLots, placeRepartition, organizationId });
  }

  get total() {
    if (!this.#placesLots) return 0;
    const activePlaces = this.#placesLots.filter((placesLot) => placesLot.isActive);
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
}
