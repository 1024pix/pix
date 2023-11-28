import { usecases } from '../domain/usecases/index.js';
import * as requestResponseUtils from '../../../../lib/infrastructure/utils/request-response-utils.js';
import * as supOrganizationLearnerWarningSerializer from '../infrastructure/serializers/jsonapi/sup-organization-learner-warnings-serializer.js';
import { SupOrganizationLearnerParser } from '../infrastructure/serializers/csv/sup-organization-learner-parser.js';

const importSupOrganizationLearners = async function (
  request,
  h,
  dependencies = { makeOrganizationLearnerParser, supOrganizationLearnerWarningSerializer },
) {
  const organizationId = request.params.id;
  const buffer = request.payload;
  const supOrganizationLearnerParser = dependencies.makeOrganizationLearnerParser(buffer, organizationId, request.i18n);
  const warnings = await usecases.importSupOrganizationLearners({ supOrganizationLearnerParser });

  return h
    .response(dependencies.supOrganizationLearnerWarningSerializer.serialize({ id: organizationId, warnings }))
    .code(200);
};

const replaceSupOrganizationLearners = async function (
  request,
  h,
  dependencies = { requestResponseUtils, makeOrganizationLearnerParser, supOrganizationLearnerWarningSerializer },
) {
  const userId = dependencies.requestResponseUtils.extractUserIdFromRequest(request);
  const organizationId = request.params.id;
  const buffer = request.payload;
  const supOrganizationLearnerParser = dependencies.makeOrganizationLearnerParser(buffer, organizationId, request.i18n);
  const warnings = await usecases.replaceSupOrganizationLearners({
    organizationId,
    userId,
    supOrganizationLearnerParser,
  });

  return h
    .response(dependencies.supOrganizationLearnerWarningSerializer.serialize({ id: organizationId, warnings }))
    .code(200);
};

function makeOrganizationLearnerParser(buffer, organizationId, i18n) {
  return new SupOrganizationLearnerParser(buffer, organizationId, i18n);
}

const supOrganizationManagementController = {
  importSupOrganizationLearners,
  replaceSupOrganizationLearners,
};

export { supOrganizationManagementController };
