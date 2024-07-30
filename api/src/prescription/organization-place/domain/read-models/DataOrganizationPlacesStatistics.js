export class DataOrganizationPlacesStatistics {
  #placeStatistics;
  #organization;

  constructor({ placeStatistics, organization }) {
    this.#placeStatistics = placeStatistics;
    this.#organization = organization;
  }

  get organizationId() {
    return this.#organization.id;
  }

  get organizationName() {
    return this.#organization.name;
  }

  get organizationType() {
    return this.#organization.type;
  }

  get organizationPlacesCount() {
    return this.#placeStatistics.total;
  }

  get organizationOccupiedPlacesCount() {
    return this.#placeStatistics.occupied;
  }

  get organizationActivePlacesLotCount() {
    return this.#placeStatistics.placesLotsTotal;
  }
}
