import fs from 'node:fs';

import { tokenService } from '../../../shared/domain/services/token-service.js';
import { logger } from '../../../shared/infrastructure/utils/logger.js';
import { usecases } from '../domain/usecases/index.js';
import { SupOrganizationLearnerParser } from '../infrastructure/serializers/csv/sup-organization-learner-parser.js';

const importSupOrganizationLearners = async function (
  request,
  h,
  dependencies = {
    logger,
    unlink: fs.unlink,
  },
) {
  const organizationId = request.params.organizationId;
  const userId = request.auth.credentials.userId;

  try {
    await usecases.uploadCsvFile({
      Parser: SupOrganizationLearnerParser,
      payload: request.payload,
      organizationId,
      userId,
      i18n: request.i18n,
      type: 'ADDITIONAL_STUDENT',
    });
  } catch (error) {
    dependencies.logger.warn(error);

    throw error;
  } finally {
    try {
      dependencies.unlink(request.payload.path);
    } catch (err) {
      dependencies.logger.error(err);
    }
  }

  return h.response().code(204);
};

const replaceSupOrganizationLearners = async function (
  request,
  h,
  dependencies = {
    logger,
    unlink: fs.unlink,
  },
) {
  const userId = request.auth.credentials.userId;
  const organizationId = request.params.organizationId;

  try {
    await usecases.uploadCsvFile({
      Parser: SupOrganizationLearnerParser,
      payload: request.payload,
      organizationId,
      userId,
      i18n: request.i18n,
      type: 'REPLACE_STUDENT',
    });
  } catch (error) {
    dependencies.logger.warn(error);

    throw error;
  } finally {
    // see https://hapi.dev/api/?v=21.3.3#-routeoptionspayloadoutput
    // add a catch to avoid an error if unlink fails
    try {
      dependencies.unlink(request.payload.path);
    } catch (err) {
      dependencies.logger.error(err);
    }
  }

  return h.response().code(204);
};

const getOrganizationLearnersCsvTemplate = async function (request, h, dependencies = { tokenService }) {
  const organizationId = request.params.organizationId;
  const token = request.query.accessToken;
  const userId = dependencies.tokenService.extractUserId(token);
  const template = await usecases.getOrganizationLearnersCsvTemplate({
    userId,
    organizationId,
    i18n: request.i18n,
  });

  return h
    .response(template)
    .header('Content-Type', 'text/csv;charset=utf-8')
    .header('Content-Disposition', `attachment; filename=${request.i18n.__('csv-template.template-name')}.csv`);
};

const updateStudentNumber = async function (request, h) {
  const payload = request.payload.data.attributes;
  const organizationId = request.params.organizationId;
  const studentNumber = payload['student-number'];
  const organizationLearnerId = request.params.organizationLearnerId;

  await usecases.updateStudentNumber({ organizationLearnerId, studentNumber, organizationId });

  return h.response().code(204);
};

const reconcileSupOrganizationLearner = async function (request, h) {
  const userId = request.auth.credentials.userId;
  const payload = request.payload.data.attributes;

  const campaignCode = payload['campaign-code'];

  const reconciliationInfo = {
    userId,
    studentNumber: payload['student-number'],
    firstName: payload['first-name'],
    lastName: payload['last-name'],
    birthdate: payload['birthdate'],
  };

  await usecases.reconcileSupOrganizationLearner({ campaignCode, reconciliationInfo });

  return h.response(null).code(204);
};

const supOrganizationManagementController = {
  getOrganizationLearnersCsvTemplate,
  importSupOrganizationLearners,
  replaceSupOrganizationLearners,
  updateStudentNumber,
  reconcileSupOrganizationLearner,
};

export { supOrganizationManagementController };
