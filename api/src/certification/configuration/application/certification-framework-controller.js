import { usecases } from '../domain/usecases/index.js';
import * as certificationFrameworkSerializer from '../infrastructure/serializers/certification-framework-serializer.js';
import * as frameworkHistorySerializer from '../infrastructure/serializers/framework-history-serializer.js';

async function findCertificationFrameworks() {
  const frameworks = await usecases.findCertificationFrameworks();
  return certificationFrameworkSerializer.serialize(frameworks);
}

async function getFrameworkHistory(request) {
  const framework = request.params.framework;

  const frameworkHistory = await usecases.getFrameworkHistory({
    framework,
  });

  return frameworkHistorySerializer.serialize({ scope: framework, frameworkHistory });
}

async function getTargetProfileHistory(request) {
  const framework = request.params.framework;
  const certificationFramework = await usecases.getComplementaryCertificationTargetProfileHistory({
    complementaryCertificationKey: framework,
  });
  return certificationFrameworkSerializer.serializeWithTargetProfilesHistory(certificationFramework);
}

export const certificationFrameworkController = {
  findCertificationFrameworks,
  getFrameworkHistory,
  getTargetProfileHistory,
};
