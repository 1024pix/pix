import { usecases } from '../../shared/usecases/index.js';

import * as supOrganizationLearnerWarningSerializer from '../infrastructure/serializers/jsonapi/sup-organization-learner-warnings-serializer.js';
import { SupOrganizationLearnerParser } from '../infrastructure/serializers/csv/sup-organization-learner-parser.js';

const importSupOrganizationLearners = async function (request, h) {
  const organizationId = request.params.id;
  const buffer = request.payload;
  const supOrganizationLearnerParser = new SupOrganizationLearnerParser(buffer, organizationId, request.i18n);
  const warnings = await usecases.importSupOrganizationLearners({ supOrganizationLearnerParser });

  return h.response(supOrganizationLearnerWarningSerializer.serialize({ id: organizationId, warnings })).code(200);
};

const replaceSupOrganizationLearners = async function (request, h) {
  const organizationId = request.params.id;
  const buffer = request.payload;
  const supOrganizationLearnerParser = new SupOrganizationLearnerParser(buffer, organizationId, request.i18n);
  const warnings = await usecases.replaceSupOrganizationLearners({
    organizationId,
    supOrganizationLearnerParser,
  });

  return h.response(supOrganizationLearnerWarningSerializer.serialize({ id: organizationId, warnings })).code(200);
};

const supOrganizationManagementController = {
  importSupOrganizationLearners,
  replaceSupOrganizationLearners,
};

export { supOrganizationManagementController };
