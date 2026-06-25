import { usecases } from '../domain/usecases/index.js';
import { certificationInfoSerializer } from '../infrastructure/serializers/certification-info-serializer.js';
import * as certificationVersionDetailSerializer from '../infrastructure/serializers/certification-version-detail-serializer.js';

async function getVersionById(request) {
  const certificationVersionId = request.params.certificationVersionId;

  const certificationVersion = await usecases.getVersionById({
    id: certificationVersionId,
  });

  return certificationVersionDetailSerializer.serialize(certificationVersion);
}

async function update(request, h) {
  const certificationVersionId = request.params.certificationVersionId;
  const comments = request.payload.data.attributes.comments;

  await usecases.updateVersion({
    id: certificationVersionId,
    comments,
  });

  return h.response().code(204);
}

async function deleteCertificationVersion(request, h) {
  const certificationVersionId = request.params.certificationVersionId;

  await usecases.deleteCertificationVersion({ certificationVersionId });

  return h.response().code(204);
}

async function createDraft(request, h) {
  const { tubeIds, scope } = request.payload.data.attributes;

  const id = await usecases.createDraft({ scope, tubeIds });

  const certificationVersion = await usecases.getVersionById({
    id,
  });

  return h.response(certificationVersionDetailSerializer.serialize(certificationVersion)).code(201);
}

async function getInfo(request) {
  const framework = request.params.framework;

  const certificationInfo = await usecases.getInfo({
    framework,
  });

  return certificationInfoSerializer.serialize(certificationInfo);
}

const certificationVersionController = {
  createDraft,
  getVersionById,
  deleteCertificationVersion,
  update,
  getInfo,
};

export { certificationVersionController };
