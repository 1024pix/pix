import { CertificationInfo } from '../../../../../../src/certification/configuration/domain/read-models/CertificationInfo.js';
import { Frameworks } from '../../../../../../src/certification/shared/domain/models/Frameworks.js';

export const buildCertificationInfo = function ({
  framework = Frameworks.CORE,
  startDate = null,
  expirationDate = null,
  assessmentDuration = 10,
  minimumAssessmentLength = 5,
  maximumAssessmentLength = 10,
}) {
  return new CertificationInfo({
    framework,
    startDate,
    expirationDate,
    assessmentDuration,
    minimumAssessmentLength,
    maximumAssessmentLength,
  });
};
