import { AlgorithmEngineVersion } from '../../../shared/domain/models/AlgorithmEngineVersion.js';

export async function computeCertificatesForSession({ sessionId, certificateRepository }) {
  const certificationsData = await certificateRepository.findCertificationsIdAndVersion({ sessionId });
  const certificates = [];
  for (const { id, version } of certificationsData) {
    if (version !== AlgorithmEngineVersion.V3) {
      throw new Error(`not implemented or unknown version ${version}`);
    }
    const certificate = await certificateRepository.buildCertificateV3(id);
    certificates.push(certificate);
  }
  await certificateRepository.save(certificates);
  return true;
}
