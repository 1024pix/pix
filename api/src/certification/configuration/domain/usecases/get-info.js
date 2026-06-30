import { ActiveCertificationInfoNotFound } from '../errors.js';

export async function getInfo({ framework, certificationInfoRepository }) {
  const certificationInfos = await certificationInfoRepository.findAllByFramework(framework);

  const activeCertificationInfo = certificationInfos.find(
    (certificationInfo) => certificationInfo.isCertificationActive,
  );
  if (!activeCertificationInfo) {
    throw new ActiveCertificationInfoNotFound(framework);
  }

  return activeCertificationInfo;
}
