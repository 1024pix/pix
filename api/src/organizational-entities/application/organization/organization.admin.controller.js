import { generateCSVTemplate } from '../../../shared/infrastructure/serializers/csv/csv-template.js';
import { extractUserIdFromRequest } from '../../../shared/infrastructure/utils/request-response-utils.js';
import { ORGANIZATION_FEATURES_HEADER, ORGANIZATIONS_UPDATE_HEADER } from '../../domain/constants.js';
import { usecases } from '../../domain/usecases/index.js';
import { organizationTagCsvParser } from '../../infrastructure/parsers/csv/organization-tag-csv.parser.js';
import {
  deserializeForOrganizationBatchArchive,
  requiredFieldNamesForOrganizationBatchArchive,
} from '../../infrastructure/serializers/csv/organization-archive-csv-serializer.js';
import {
  deserializeForOrganizationsImport,
  requiredFieldNamesForOrganizationsImport,
} from '../../infrastructure/serializers/csv/organizations-csv-serializer.js';
import { certificationCenterSerializer } from '../../infrastructure/serializers/jsonapi/certification-center/certification-center.serializer.js';
import { organizationSerializer } from '../../infrastructure/serializers/jsonapi/organization-serializer.js';
import { organizationForAdminSerializer } from '../../infrastructure/serializers/jsonapi/organizations-administration/organization-for-admin.serializer.js';
import { organizationPlacesStatisticsSerializer } from '../../infrastructure/serializers/jsonapi/organizations-administration/organization-places-statistics.serializer.js';
import { organizationStatisticsSerializer } from '../../infrastructure/serializers/jsonapi/organizations-administration/organization-statistics.serializer.js';

const ADD_TAGS_TO_ORGANIZATIONS_HEADER = organizationTagCsvParser.CSV_HEADER;

const getTemplateForAddTagsToOrganizations = async function (request, h) {
  const fields = ADD_TAGS_TO_ORGANIZATIONS_HEADER.columns.map(({ name }) => name);
  const csvTemplateFileContent = generateCSVTemplate(fields);

  return h
    .response(csvTemplateFileContent)
    .header('Content-Type', 'text/csv; charset=utf-8')
    .header('content-disposition', 'filename=add-tags-to-organizations')
    .code(200);
};

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

const detachParentOrganization = async function (request, h) {
  const { childOrganizationId } = request.params;

  await usecases.detachParentOrganizationFromOrganization({ childOrganizationId });

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
  const { userId } = request.auth.credentials;
  const organization = organizationForAdminSerializer.deserialize(request.payload);
  organization.createdBy = userId;

  const createdOrganization = await usecases.createOrganization({ organization });
  const serializedOrganization = organizationForAdminSerializer.serialize(createdOrganization);
  return serializedOrganization;
};

const getTemplateForCreateOrganizationsInBatch = async function (request, h) {
  const csvTemplateFileContent = generateCSVTemplate(requiredFieldNamesForOrganizationsImport);

  return h
    .response(csvTemplateFileContent)
    .header('Content-Type', 'text/csv; charset=utf-8')
    .header('content-disposition', 'filename=create-organizations-in-batch')
    .code(200);
};

const createInBatch = async function (request, h) {
  const organizations = await deserializeForOrganizationsImport(request.payload.path);

  const createdOrganizations = await usecases.createOrganizationsWithTagsAndTargetProfiles({ organizations });

  return h.response(organizationForAdminSerializer.serialize(createdOrganizations)).code(201);
};

const getTemplateForArchiveOrganizationsInBatch = async function (request, h) {
  const csvTemplateFileContent = generateCSVTemplate(requiredFieldNamesForOrganizationBatchArchive);

  return h
    .response(csvTemplateFileContent)
    .header('Content-Type', 'text/csv; charset=utf-8')
    .header('content-disposition', 'filename=archive-organizations-in-batch')
    .code(200);
};

const archiveInBatch = async function (request, h) {
  const userId = extractUserIdFromRequest(request);

  const organizationIds = await deserializeForOrganizationBatchArchive(request.payload.file.path);
  await usecases.archiveOrganizationsInBatch({ organizationIds, userId });

  return h.response().code(204);
};

const getOrganizationDetails = async function (request, h, dependencies = { organizationForAdminSerializer }) {
  const organizationId = request.params.organizationId;

  const organizationDetails = await usecases.getOrganizationDetails({ organizationId });
  return dependencies.organizationForAdminSerializer.serialize(organizationDetails);
};

const getOrganizationPlacesStatistics = async function (
  request,
  h,
  dependencies = { organizationPlacesStatisticsSerializer },
) {
  const organizationId = request.params.organizationId;
  const organizationPlacesStatistics = await usecases.getOrganizationPlacesStatistics({ organizationId });
  return dependencies.organizationPlacesStatisticsSerializer.serialize(organizationPlacesStatistics);
};

const getTemplateForUpdateOrganizationsInBatch = async function (request, h) {
  const fields = ORGANIZATIONS_UPDATE_HEADER.columns.map(({ name }) => name);
  const csvTemplateFileContent = generateCSVTemplate(fields);

  return h
    .response(csvTemplateFileContent)
    .header('Content-Type', 'text/csv; charset=utf-8')
    .header('content-disposition', 'filename=update-organizations-in-batch')
    .code(200);
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
  const { userId } = request.auth.credentials;
  const organizationUpdated = await usecases.updateOrganizationInformation({
    userId,
    organization: organizationDeserialized,
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

const getOrganizationStatistics = async function (request, h, dependencies = { organizationStatisticsSerializer }) {
  const organizationId = request.params.organizationId;
  const statistics = await usecases.getOrganizationStatistics({ organizationId });
  return dependencies.organizationStatisticsSerializer.serialize(statistics);
};

const findAttachedCertificationCenterForAdmin = async function (request) {
  const organizationId = request.params.organizationId;

  const certificationCenter = await usecases.findAttachedCertificationCenterForAdmin({ organizationId });

  return certificationCenterSerializer.serialize(certificationCenter);
};

const attachCertificationCenter = async function (request, h) {
  const { certificationCenterId } = request.payload;
  const { organizationId } = request.params;

  await usecases.attachCertificationCenterToOrganization({ organizationId, certificationCenterId });

  return h.response().code(204);
};

const detachCertificationCenter = async function (request, h) {
  const { organizationId } = request.params;

  await usecases.detachCertificationCenterFromOrganization({ organizationId });

  return h.response().code(204);
};

const organizationAdminController = {
  getTemplateForAddTagsToOrganizations,
  addTagsToOrganizations,
  create,
  getTemplateForCreateOrganizationsInBatch,
  createInBatch,
  archiveOrganization,
  getTemplateForArchiveOrganizationsInBatch,
  archiveInBatch,
  getOrganizationPlacesStatistics,
  attachChildOrganization,
  detachParentOrganization,
  detachCertificationCenter,
  getTemplateForAddOrganizationFeatureInBatch,
  addOrganizationFeatureInBatch,
  getOrganizationDetails,
  getTemplateForUpdateOrganizationsInBatch,
  updateOrganizationsInBatch,
  updateOrganizationInformation,
  findPaginatedFilteredOrganizations,
  findChildrenOrganizations,
  getOrganizationStatistics,
  findAttachedCertificationCenterForAdmin,
  attachCertificationCenter,
};

export { organizationAdminController };
