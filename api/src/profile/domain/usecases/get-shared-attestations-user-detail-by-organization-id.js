import { AttestationNotFoundError } from '../errors.js';
import { AttestationUserDetail } from '../models/AttestationUserDetail.js';

export async function getSharedAttestationsUserDetailByOrganizationId({
  attestationKey,
  organizationId,
  attestationRepository,
  organizationProfileRewardRepository,
}) {
  const attestation = await attestationRepository.getByKey({ attestationKey });

  if (!attestation) {
    throw new AttestationNotFoundError();
  }

  const sharedProfileRewards = await organizationProfileRewardRepository.getByOrganizationId({
    attestationKey,
    organizationId,
  });

  return sharedProfileRewards.map((sharedProfileReward) => {
    return new AttestationUserDetail({
      id: sharedProfileReward.profileRewardId,
      attestationKey,
      userId: sharedProfileReward.userId,
      obtainedAt: sharedProfileReward.obtainedAt,
    });
  });
}
