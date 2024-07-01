import * as divisionSerializer from '../../prescription/campaign/infrastructure/serializers/jsonapi/division-serializer.js';
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

const getDivisions = async function (request) {
  const { organizationId } = request.params;
  const divisions = await usecases.getDivisions({ organizationId });
  return divisionSerializer.serialize(divisions);
};

const schoolController = { getSchool, activateSchoolSession, getDivisions };
export { schoolController };
