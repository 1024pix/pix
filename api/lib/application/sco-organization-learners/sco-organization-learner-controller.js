import * as scoOrganizationLearnerSerializer from '../../../src/prescription/learner-management/infrastructure/serializers/jsonapi/sco-organization-learner-serializer.js';
import { usecases } from '../../domain/usecases/index.js';

const generateUsername = async function (request, h, dependencies = { scoOrganizationLearnerSerializer }) {
  const payload = request.payload.data.attributes;
  const { 'organization-id': organizationId } = payload;

  const studentInformation = {
    firstName: payload['first-name'],
    lastName: payload['last-name'],
    birthdate: payload['birthdate'],
  };

  const username = await usecases.generateUsername({ organizationId, studentInformation });

  const scoOrganizationLearner = {
    ...studentInformation,
    username,
  };

  return h
    .response(dependencies.scoOrganizationLearnerSerializer.serializeWithUsernameGeneration(scoOrganizationLearner))
    .code(200);
};

const libScoOrganizationLearnerController = {
  generateUsername,
};

export { libScoOrganizationLearnerController };
