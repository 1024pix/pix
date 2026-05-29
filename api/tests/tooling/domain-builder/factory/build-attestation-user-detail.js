import { AttestationUserDetail } from '../../../../src/profile/domain/models/AttestationUserDetail.js';

export function buildAttestationUserDetail({
  id = 456,
  attestationKey = 'attestation-key',
  userId = 123,
  obtainedAt = new Date(),
  label,
  templateName,
} = {}) {
  return new AttestationUserDetail({ id, attestationKey, userId, obtainedAt, label, templateName });
}
