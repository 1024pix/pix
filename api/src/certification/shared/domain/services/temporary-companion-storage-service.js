import { temporaryStorage } from '../../../../../lib/infrastructure/temporary-storage/index.js';
import { config } from '../../../../shared/config.js';

const _getTemporaryStorage = () => temporaryStorage.withPrefix('companion:ping:');

const save = async function ({ sessionId, id: certificationCandidateId }) {
  const expirationDelaySeconds = config.temporaryCompanionStorage.expirationDelaySeconds;
  const companionPingStorage = _getTemporaryStorage();
  await companionPingStorage.save({
    key: `${sessionId}:${certificationCandidateId}`,
    value: true,
    expirationDelaySeconds,
  });
};

export { save };
