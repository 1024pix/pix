import jsonapiSerializer from 'jsonapi-serializer';

const { Deserializer } = jsonapiSerializer;

import { usecases } from '../domain/usecases/index.js';
import { certificationInfoSerializer } from '../infrastructure/serializers/certification-info-serializer.js';
import * as versionDetailsSerializer from '../infrastructure/serializers/version-details-serializer.js';

async function getVersionById(request) {
  const certificationVersionId = request.params.certificationVersionId;

  const versionDetails = await usecases.getVersionById({
    id: certificationVersionId,
  });

  return versionDetailsSerializer.serialize(versionDetails);
}

async function update(request, h) {
  const certificationVersionId = request.params.certificationVersionId;
  const updateCommand = await deserialize(request.payload);

  await usecases.updateVersion({
    ...updateCommand,
    id: certificationVersionId,
  });

  return h.response().code(204);
}

async function updateComments(request, h) {
  const id = request.params.certificationVersionId;
  const comments = request.payload.data.attributes.comments;
  await usecases.updateVersionComment({ id, comments });
  return h.response().code(204);
}

async function deleteCertificationVersion(request, h) {
  const id = request.params.certificationVersionId;

  await usecases.deleteVersion({ id });

  return h.response().code(204);
}

async function createDraft(request, h) {
  const { tubeIds, scope } = request.payload.data.attributes;

  const id = await usecases.createDraft({ scope, tubeIds });

  const versionDetails = await usecases.getVersionById({
    id,
  });

  return h.response(versionDetailsSerializer.serialize(versionDetails)).code(201);
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
  updateComments,
  getInfo,
};

export { certificationVersionController };

function deserialize(json) {
  const deserializer = new Deserializer({ keyForAttribute: 'camelCase' });
  return deserializer.deserialize(json);
}
