const serialize = function (dataOrganizationPlacesStatistics) {
  return dataOrganizationPlacesStatistics.map((dataOrganizationPlacesStatistic) => ({
    organization_id: dataOrganizationPlacesStatistic.organizationId,
    organization_type: dataOrganizationPlacesStatistic.organizationType,
    organization_name: dataOrganizationPlacesStatistic.organizationName,
    organization_places_count: dataOrganizationPlacesStatistic.organizationPlacesCount,
    organization_occupied_places_count: dataOrganizationPlacesStatistic.organizationOccupiedPlacesCount,
    organization_active_places_lot_count: dataOrganizationPlacesStatistic.organizationActivePlacesLotCount,
  }));
};

export { serialize };
