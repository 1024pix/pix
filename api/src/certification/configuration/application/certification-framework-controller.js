import * as frameworkInfoRepository from '../infrastructure/repositories/framework-info-repository.js';
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

export const certificationFrameworkController = {
  findCertificationFrameworks,
  findCertificationFramework,
};
