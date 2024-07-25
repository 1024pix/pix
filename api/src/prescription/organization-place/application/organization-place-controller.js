import { usecases as libUsecases } from '../../../../lib/domain/usecases/index.js';
import { usecases } from '../domain/usecases/index.js';
import * as dataOrganizationPlacesStatisticsSerializer from '../infrastructure/serializers/json/data-organization-places-statistics-serializer.js';
import * as organizationPlacesCapacitySerializer from '../infrastructure/serializers/jsonapi/organization-places-capacity-serializer.js';
import * as organizationPlacesLotManagementSerializer from '../infrastructure/serializers/jsonapi/organization-places-lot-management-serializer.js';
import * as organizationPlacesLotSerializer from '../infrastructure/serializers/jsonapi/organization-places-lot-serializer.js';
import * as organizationPlacesStatisticsSerializer from '../infrastructure/serializers/jsonapi/organization-places-statistics-serializer.js';

const createOrganizationPlacesLot = async function (
  request,
  h,
  dependencies = {
    organizationPlacesLotSerializer,
    organizationPlacesLotManagementSerializer,
  },
) {
  const organizationId = request.params.id;
  const createdBy = request.auth.credentials.userId;
  const organizationPlacesLotData = await dependencies.organizationPlacesLotSerializer.deserialize(request.payload);
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

  await usecases.deleteOrganizationPlaceLot({ organizationPlaceId, userId });

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

const getOrganizationPlacesCapacity = async function (request) {
  const organizationId = request.params.id;
  const organizationPlacesCapacity = await usecases.getOrganizationPlacesCapacity({ organizationId });
  return organizationPlacesCapacitySerializer.serialize(organizationPlacesCapacity);
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
    getOrganizationPlacesStatistics: usecases.getOrganizationPlacesStatistics,
    findPaginatedFilteredOrganizations: libUsecases.findPaginatedFilteredOrganizations,
  },
) {
  const dataOrganizationPlacesStatistics = await usecases.getDataOrganizationsPlacesStatistics({
    getOrganizationPlacesStatistics: dependencies.getOrganizationPlacesStatistics,
    findPaginatedFilteredOrganizations: dependencies.findPaginatedFilteredOrganizations,
  });
  return dependencies.dataOrganizationPlacesStatisticsSerializer.serialize(dataOrganizationPlacesStatistics);
};

const organizationPlaceController = {
  createOrganizationPlacesLot,
  deleteOrganizationPlacesLot,
  findOrganizationPlacesLot,
  getOrganizationPlacesCapacity,
  getOrganizationPlacesStatistics,
  getDataOrganizationsPlacesStatistics,
};

export { organizationPlaceController };
