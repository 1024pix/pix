import { usecases } from '../domain/usecases/index.js';
import * as certificationDetailsSerializer from '../infrastructure/serializers/certification-details-serializer.js';

const getCertificationDetails = async function (request, h, dependencies = { certificationDetailsSerializer }) {
  const certificationCourseId = request.params.certificationCourseId;
  const certificationDetails = await usecases.getCertificationDetails({ certificationCourseId });

  return dependencies.certificationDetailsSerializer.serialize(certificationDetails);
};

const certificationDetailsController = {
  getCertificationDetails,
};

export { certificationDetailsController };
