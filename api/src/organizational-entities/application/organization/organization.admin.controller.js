import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import * as csvSerializer from '../../../shared/infrastructure/serializers/csv/csv-serializer.js';
import { generateCSVTemplate } from '../../../shared/infrastructure/serializers/csv/csv-template.js';
import { extractUserIdFromRequest } from '../../../shared/infrastructure/utils/request-response-utils.js';
import { ORGANIZATION_FEATURES_HEADER } from '../../domain/constants.js';
import { usecases } from '../../domain/usecases/index.js';
import { organizationTagCsvParser } from '../../infrastructure/parsers/csv/organization-tag-csv.parser.js';
import * as organizationSerializer from '../../infrastructure/serializers/jsonapi/organization-serializer.js';
import { organizationForAdminSerializer } from '../../infrastructure/serializers/jsonapi/organizations-administration/organization-for-admin.serializer.js';

const addTagsToOrganizations = async function (request, h) {
  const filePath = request.payload.path;
  const organizationTags = await organizationTagCsvParser.getCsvData(filePath);
  await usecases.addTagsToOrganizations({ organizationTags });
  return h.response().code(204);
};

const archiveOrganization = async function (request, h, dependencies = { organizationForAdminSerializer }) {
  const organizationId = request.params.id;
  const userId = extractUserIdFromRequest(request);
  const archivedOrganization = await usecases.archiveOrganization({ organizationId, userId });
  return dependencies.organizationForAdminSerializer.serialize(archivedOrganization);
};

const attachChildOrganization = async function (request, h) {
  const { childOrganizationIds } = request.payload;
  const { organizationId: parentOrganizationId } = request.params;

  await usecases.attachChildOrganizationToOrganization({ childOrganizationIds, parentOrganizationId });

  return h.response().code(204);
};

const getTemplateForAddOrganizationFeatureInBatch = async function (request, h) {
  const fields = ORGANIZATION_FEATURES_HEADER.columns.map(({ name }) => name);
  const csvTemplateFileContent = generateCSVTemplate(fields);

  return h
    .response(csvTemplateFileContent)
    .header('Content-Type', 'text/csv; charset=utf-8')
    .header('content-disposition', 'filename=add-organization-feature-in-batch')
    .code(200);
};

const addOrganizationFeatureInBatch = async function (request, h) {
  await usecases.addOrganizationFeatureInBatch({
    userId: request.auth.credentials.userId,
    filePath: request.payload.path,
  });
  return h.response().code(204);
};

const create = async function (request) {
  const superAdminUserId = extractUserIdFromRequest(request);
  const organization = organizationForAdminSerializer.deserialize(request.payload);

  organization.createdBy = superAdminUserId;

  const createdOrganization = await usecases.createOrganization({ organization });
  const serializedOrganization = organizationForAdminSerializer.serialize(createdOrganization);

  return serializedOrganization;
};

const createInBatch = async function (request, h) {
  const organizations = await csvSerializer.deserializeForOrganizationsImport(request.payload.path);

  const createdOrganizations = await usecases.createOrganizationsWithTagsAndTargetProfiles({ organizations });

  return h.response(organizationForAdminSerializer.serialize(createdOrganizations)).code(204);
};

const archiveInBatch = async function (request, h) {
  const userId = extractUserIdFromRequest(request);
  const organizationIds = await csvSerializer.deserializeForOrganizationBatchArchive(request.payload.path);
  await usecases.archiveOrganizationsInBatch({ organizationIds, userId });

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

const findPaginatedFilteredOrganizations = async function (request, h, dependencies = { organizationSerializer }) {
  const options = request.query;

  const { models: organizations, pagination } = await usecases.findPaginatedFilteredOrganizations({
    filter: options.filter,
    page: options.page,
  });
  return dependencies.organizationSerializer.serialize(organizations, pagination);
};

const findChildrenOrganizations = async function (request, h, dependencies = { organizationForAdminSerializer }) {
  const parentOrganizationId = request.params.organizationId;
  const childOrganizations = await usecases.findChildrenOrganizations({ parentOrganizationId });
  return dependencies.organizationForAdminSerializer.serialize(childOrganizations);
};

const organizationAdminController = {
  addTagsToOrganizations,
  create,
  createInBatch,
  archiveOrganization,
  archiveInBatch,
  attachChildOrganization,
  getTemplateForAddOrganizationFeatureInBatch,
  addOrganizationFeatureInBatch,
  getOrganizationDetails,
  updateOrganizationsInBatch,
  updateOrganizationInformation,
  findPaginatedFilteredOrganizations,
  findChildrenOrganizations,
};

export { organizationAdminController };
