import { usecases } from '../domain/usecases/index.js';
import * as juryCertificationSerializer from '../infrastructure/serializers/jury-certification-serializer.js';

const getJuryCertification = async function (request, h, dependencies = { juryCertificationSerializer }) {
  const certificationCourseId = request.params.id;
  const translate = request.i18n.__;
  const juryCertification = await usecases.getJuryCertification({ certificationCourseId });

  return dependencies.juryCertificationSerializer.serialize(juryCertification, { translate });
};

const juryCertificationController = {
  getJuryCertification,
};

export { juryCertificationController };
