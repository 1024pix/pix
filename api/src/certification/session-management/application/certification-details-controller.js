import * as certificationDetailsSerializer from '../../../../lib/infrastructure/serializers/jsonapi/certification-details-serializer.js';
import { usecases } from '../domain/usecases/index.js';

const getCertificationDetails = async function (request, h, dependencies = { certificationDetailsSerializer }) {
  const certificationCourseId = request.params.id;
  const certificationDetails = await usecases.getCertificationDetails({ certificationCourseId });

  return dependencies.certificationDetailsSerializer.serialize(certificationDetails);
};

const certificationDetailsController = {
  getCertificationDetails,
};

export { certificationDetailsController };
