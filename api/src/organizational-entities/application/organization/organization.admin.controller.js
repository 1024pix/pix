import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { usecases } from '../../domain/usecases/index.js';
import { organizationTagCsvParser } from '../../infrastructure/parsers/csv/organization-tag-csv.parser.js';
import { organizationForAdminSerializer } from '../../infrastructure/serializers/jsonapi/organizations-administration/organization-for-admin.serializer.js';

const addTagsToOrganizations = async function (request, h) {
  const filePath = request.payload.path;
  const organizationTags = await organizationTagCsvParser.getCsvData(filePath);
  await usecases.addTagsToOrganizations({ organizationTags });
  return h.response().code(204);
};

const attachChildOrganization = async function (request, h) {
  const { childOrganizationId } = request.payload;
  const { organizationId: parentOrganizationId } = request.params;

  await usecases.attachChildOrganizationToOrganization({ childOrganizationId, parentOrganizationId });

  return h.response().code(204);
};

const addOrganizationFeatureInBatch = async function (request, h) {
  await usecases.addOrganizationFeatureInBatch({ filePath: request.payload.path });
  return h.response().code(204);
};

const getOrganizationDetails = async function (request, h, dependencies = { organizationForAdminSerializer }) {
  const organizationId = request.params.id;

  const organizationDetails = await usecases.getOrganizationDetails({ organizationId });
  return dependencies.organizationForAdminSerializer.serialize(organizationDetails);
};

const updateOrganizationsInBatch = async function (request, h) {
  await usecases.updateOrganizationsInBatch({ filePath: request.payload.path });
  return h.response().code(204);
};

const updateOrganizationInformation = async function (
  request,
  h,
  dependencies = {
    organizationForAdminSerializer,
  },
) {
  const organizationDeserialized = dependencies.organizationForAdminSerializer.deserialize(request.payload);

  const organizationUpdated = await DomainTransaction.execute(function (domainTransaction) {
    return usecases.updateOrganizationInformation({
      organization: organizationDeserialized,
      domainTransaction,
    });
  });
  return h.response(dependencies.organizationForAdminSerializer.serialize(organizationUpdated));
};

const organizationAdminController = {
  addTagsToOrganizations,
  attachChildOrganization,
  addOrganizationFeatureInBatch,
  getOrganizationDetails,
  updateOrganizationsInBatch,
  updateOrganizationInformation,
};

export { organizationAdminController };
