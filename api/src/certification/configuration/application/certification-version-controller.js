import jsonapiSerializer from 'jsonapi-serializer';

const { Deserializer } = jsonapiSerializer;

import { usecases } from '../domain/usecases/index.js';
import * as calibrationReportSerializer from '../infrastructure/serializers/calibration-report-serializer.js';
import * as calibrationScoringConfigurationSerializer from '../infrastructure/serializers/calibration-scoring-configuration-serializer.js';
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

async function generateCalibrationReport(request, h) {
  const { certificationVersionId: versionId } = request.params;
  const report = await usecases.generateCalibrationReportCheck({ versionId });
  return h.response(calibrationReportSerializer.serialize(report)).code(200);
}

async function getCalibrationScoringConfiguration(request, h) {
  const { calibrationId } = request.params;
  const calibrationScoringConfiguration = await usecases.getCalibrationScoringConfiguration({ calibrationId });
  return h.response(calibrationScoringConfigurationSerializer.serialize(calibrationScoringConfiguration)).code(200);
}

async function getInfo(request) {
  const framework = request.params.framework;

  const certificationInfo = await usecases.getInfo({
    framework,
  });

  return certificationInfoSerializer.serialize(certificationInfo);
}

export const certificationVersionController = {
  createDraft,
  getVersionById,
  deleteCertificationVersion,
  update,
  updateComments,
  getInfo,
  generateCalibrationReport,
  getCalibrationScoringConfiguration,
};

function deserialize(json) {
  const deserializer = new Deserializer({ keyForAttribute: 'camelCase' });
  return deserializer.deserialize(json);
}
