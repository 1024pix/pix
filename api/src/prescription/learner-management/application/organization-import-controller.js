import { usecases } from '../domain/usecases/index.js';
import { organizationImportDetailSerializer } from '../infrastructure/serializers/jsonapi/organization-import-detail-serializer.js';
import { organizationLearnerImportFormatSerializer } from '../infrastructure/serializers/jsonapi/organization-learner-import-format-serializer.js';

const getOrganizationImportStatus = async function (request, h, dependencies = { organizationImportDetailSerializer }) {
  const { organizationId } = request.params;
  const organizationImportDetail = await usecases.getOrganizationImportStatus({
    organizationId,
  });

  return h.response(dependencies.organizationImportDetailSerializer.serialize(organizationImportDetail)).code(200);
};

const saveOrganizationLearnerImportFormats = async function (request) {
  const authenticatedUserId = request.auth.credentials.userId;
  await usecases.saveOrganizationLearnerImportFormats({ userId: authenticatedUserId, payload: request.payload });

  return null;
};

const findAllOrganizationLearnerImportFormats = async (
  request,
  h,
  dependencies = { organizationLearnerImportFormatSerializer },
) => {
  const results = await usecases.findAllOrganizationLearnerImportFormats();
  return h.response(dependencies.organizationLearnerImportFormatSerializer.serialize(results)).code(200);
};

const organizationImportController = {
  getOrganizationImportStatus,
  saveOrganizationLearnerImportFormats,
  findAllOrganizationLearnerImportFormats,
};

export { organizationImportController };
