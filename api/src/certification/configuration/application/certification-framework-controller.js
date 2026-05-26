import { usecases } from '../domain/usecases/index.js';
import * as certificationFrameworkSerializer from '../infrastructure/serializers/certification-framework-serializer.js';
import * as frameworkHistorySerializer from '../infrastructure/serializers/framework-history-serializer.js';

const findCertificationFrameworks = async function () {
  const frameworks = await usecases.findCertificationFrameworks();
  return certificationFrameworkSerializer.serialize(frameworks);
};

const getFrameworkHistory = async function (request) {
  const scope = request.params.scope;

  const frameworkHistory = await usecases.getFrameworkHistory({
    scope,
  });

  return frameworkHistorySerializer.serialize({ scope, frameworkHistory });
};

const getTargetProfileHistory = async function (request) {
  const scope = request.params.scope;
  const certificationFramework = await usecases.getComplementaryCertificationTargetProfileHistory({
    complementaryCertificationKey: scope,
  });
  return certificationFrameworkSerializer.serializeWithTargetProfilesHistory(certificationFramework);
};

const certificationFrameworkController = {
  findCertificationFrameworks,
  getFrameworkHistory,
  getTargetProfileHistory,
};

export { certificationFrameworkController };
