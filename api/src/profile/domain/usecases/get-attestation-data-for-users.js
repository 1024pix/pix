import * as injectedStringUtils from '../../../shared/infrastructure/utils/string-utils.js';
import * as injectedAttestationRepository from '../../infrastructure/repositories/attestation-repository.js';
import * as injectedProfileRewardRepository from '../../infrastructure/repositories/profile-reward-repository.js';
import { AttestationNotFoundError } from '../errors.js';

export async function getAttestationDataForUsers({
  attestationKey,
  userIds,
  locale,
  userRepository,
  profileRewardRepository = injectedProfileRewardRepository,
  attestationRepository = injectedAttestationRepository,
  stringUtils = injectedStringUtils,
} = {}) {
  const attestationData = await attestationRepository.getByKey({ attestationKey });

  if (!attestationData) {
    throw new AttestationNotFoundError();
  }
  const users = await userRepository.getByIds({ userIds });

  const profileRewards = await profileRewardRepository.getByAttestationKeyAndUserIds({ attestationKey, userIds });

  return {
    data: profileRewards.map(({ userId, createdAt }) => {
      const user = users.find((user) => user.id === userId);
      return user.toForm(createdAt, locale, stringUtils.normalizeAndRemoveAccents);
    }),
    templateName: attestationData.templateName,
  };
}
