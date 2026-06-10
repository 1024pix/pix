import { usecases } from '../domain/usecases/index.js';
import * as certificationVersionDetailSerializer from '../infrastructure/serializers/certification-version-detail-serializer.js';
import * as certificationVersionSerializer from '../infrastructure/serializers/certification-version-serializer.js';

const getVersionById = async function (request) {
  const certificationVersionId = request.params.certificationVersionId;

  const certificationVersion = await usecases.getVersionById({
    id: certificationVersionId,
  });

  return certificationVersionDetailSerializer.serialize(certificationVersion);
};

const update = async function (request, h) {
  const certificationVersionId = request.params.certificationVersionId;
  const comments = request.payload.data.attributes.comments;

  await usecases.updateVersion({
    id: certificationVersionId,
    comments,
  });

  return h.response().code(204);
};

const deleteCertificationVersion = async function (request, h) {
  const certificationVersionId = request.params.certificationVersionId;

  await usecases.deleteCertificationVersion({ certificationVersionId });

  return h.response().code(204);
};

const createDraft = async function (request, h) {
  const { scope } = request.params;
  const { tubeIds } = request.payload.data.attributes;

  const certificationVersion = await usecases.createDraft({ scope, tubeIds });

  return h.response(certificationVersionSerializer.serialize(certificationVersion)).code(201);
};

const certificationVersionController = {
  createDraft,
  getVersionById,
  deleteCertificationVersion,
  update,
};

export { certificationVersionController };
