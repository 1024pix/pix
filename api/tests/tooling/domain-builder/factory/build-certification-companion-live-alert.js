import {
  CertificationCompanionLiveAlert,
  CertificationCompanionLiveAlertStatus,
} from '../../../../src/certification/shared/domain/models/CertificationCompanionLiveAlert.js';

export function buildCertificationCompanionLiveAlert({
  id = 456,
  assessmentId = 123,
  status = CertificationCompanionLiveAlertStatus.ONGOING,
  createdAt = new Date('2020-01-01'),
  updatedAt = new Date('2020-01-01'),
} = {}) {
  return new CertificationCompanionLiveAlert({
    id,
    assessmentId,
    status,
    createdAt,
    updatedAt,
  });
}
