import { usecases } from '../domain/usecases/index.js';
import * as frameworkInfoRepository from '../infrastructure/repositories/framework-info-repository.js';
import * as certificationFrameworkSerializer from '../infrastructure/serializers/certification-framework-serializer.js';
import * as frameworkHistorySerializer from '../infrastructure/serializers/framework-history-serializer.js';
import * as frameworkInfoSerializer from '../infrastructure/serializers/framework-info-serializer.js';

async function findCertificationFrameworks() {
  const allFrameworksInfo = await frameworkInfoRepository.findAll();
  return frameworkInfoSerializer.serialize(allFrameworksInfo);
}

async function findCertificationFramework(request) {
  const frameworkKey = request.params.framework;
  const frameworkInfo = await frameworkInfoRepository.find(frameworkKey);
  return frameworkInfoSerializer.serialize(frameworkInfo);
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
  findCertificationFramework,
  getFrameworkHistory,
  getTargetProfileHistory,
};
