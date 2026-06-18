import { usecases } from '../domain/usecases/index.js';
import * as certificationFrameworkSerializer from '../infrastructure/serializers/certification-framework-serializer.js';
import * as frameworkHistorySerializer from '../infrastructure/serializers/framework-history-serializer.js';

const findCertificationFrameworks = async function () {
  const frameworks = await usecases.findCertificationFrameworks();
  return certificationFrameworkSerializer.serialize(frameworks);
};

const getFrameworkHistory = async function (request) {
  const framework = request.params.framework;

  const frameworkHistory = await usecases.getFrameworkHistory({
    framework,
  });

  return frameworkHistorySerializer.serialize({ scope: framework, frameworkHistory });
};

const getTargetProfileHistory = async function (request) {
  const framework = request.params.framework;
  const certificationFramework = await usecases.getComplementaryCertificationTargetProfileHistory({
    complementaryCertificationKey: framework,
  });
  return certificationFrameworkSerializer.serializeWithTargetProfilesHistory(certificationFramework);
};

const certificationFrameworkController = {
  findCertificationFrameworks,
  getFrameworkHistory,
  getTargetProfileHistory,
};

export { certificationFrameworkController };
