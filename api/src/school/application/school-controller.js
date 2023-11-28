import { usecases } from '../shared/usecases/index.js';
import * as schoolSerializer from '../infrastructure/serializers/school-serializer.js';

const getSchool = async function (request) {
  const { code } = request.params;
  const school = await usecases.getSchoolByCode({ code });
  return schoolSerializer.serialize(school);
};

const schoolController = { getSchool };
export { schoolController };
