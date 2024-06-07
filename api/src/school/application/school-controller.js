import { usecases } from '../domain/usecases/index.js';
import * as schoolSerializer from '../infrastructure/serializers/school-serializer.js';

const getSchool = async function (request) {
  const { code } = request.query;
  const school = await usecases.getSchoolByCode({ code });
  return schoolSerializer.serialize(school);
};

const activateSchoolSession = async function (request, h) {
  const { organizationId } = request.params;
  await usecases.activateSchoolSession({ organizationId });
  return h.response().code(204);
};

const schoolController = { getSchool, activateSchoolSession };
export { schoolController };
