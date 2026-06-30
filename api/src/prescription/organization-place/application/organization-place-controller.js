import { usecases } from '../domain/usecases/index.js';
import * as dataOrganizationPlacesStatisticsSerializer from '../infrastructure/serializers/json/data-organization-places-statistics-serializer.js';
import { organizationPlacesLotManagementSerializer } from '../infrastructure/serializers/jsonapi/organization-places-lot-management-serializer.js';
import { organizationPlacesLotsSerializer } from '../infrastructure/serializers/jsonapi/organization-places-lots-serializer.js';
import { organizationPlacesStatisticsSerializer } from '../infrastructure/serializers/jsonapi/organization-places-statistics-serializer.js';

const createOrganizationPlacesLot = async function (
  request,
  h,
  dependencies = {
    organizationPlacesLotManagementSerializer,
  },
) {
  const organizationId = request.params.id;
  const createdBy = request.auth.credentials.userId;
  const organizationPlacesLotData = await dependencies.organizationPlacesLotManagementSerializer.deserialize(
    request.payload,
  );
  const organizationPlacesLot = await usecases.createOrganizationPlacesLot({
    organizationPlacesLotData,
    organizationId,
    createdBy,
  });
  return h.response(dependencies.organizationPlacesLotManagementSerializer.serialize(organizationPlacesLot)).code(201);
};

const deleteOrganizationPlacesLot = async function (request, h) {
  const organizationPlaceId = request.params.placeId;
  const userId = request.auth.credentials.userId;

  await usecases.deleteOrganizationPlacesLot({ organizationPlaceId, userId });

  return h.response(null).code(204);
};

const findOrganizationPlacesLot = async function (
  request,
  h,
  dependencies = { organizationPlacesLotManagementSerializer },
) {
  const organizationId = request.params.id;
  const places = await usecases.findOrganizationPlacesLot({ organizationId });
  return dependencies.organizationPlacesLotManagementSerializer.serialize(places);
};

const getOrganizationPlacesStatistics = async function (
  request,
  h,
  dependencies = { organizationPlacesStatisticsSerializer },
) {
  const organizationId = request.params.id;
  const organizationPlacesStatistics = await usecases.getOrganizationPlacesStatistics({ organizationId });
  return dependencies.organizationPlacesStatisticsSerializer.serialize(organizationPlacesStatistics);
};

const getDataOrganizationsPlacesStatistics = async function (
  request,
  h,
  dependencies = {
    dataOrganizationPlacesStatisticsSerializer,
  },
) {
  const dataOrganizationPlacesStatistics = await usecases.getDataOrganizationsPlacesStatistics();
  return dependencies.dataOrganizationPlacesStatisticsSerializer.serialize(dataOrganizationPlacesStatistics);
};

const getOrganizationPlacesLots = async function (request, h, dependencies = { organizationPlacesLotsSerializer }) {
  const organizationId = request.params.id;
  const organizationPlacesLots = await usecases.getOrganizationPlacesLots({ organizationId });

  return dependencies.organizationPlacesLotsSerializer.serialize(organizationPlacesLots);
};

const organizationPlaceController = {
  createOrganizationPlacesLot,
  deleteOrganizationPlacesLot,
  findOrganizationPlacesLot,
  getOrganizationPlacesLots,
  getOrganizationPlacesStatistics,
  getDataOrganizationsPlacesStatistics,
};

export { organizationPlaceController };
