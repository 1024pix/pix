import { config } from '../../../../shared/config.js';
import { temporaryStorage } from '../../../../shared/infrastructure/temporary-storage/index.js';

const _getTemporaryStorage = () => temporaryStorage.withPrefix('companion:ping:');

const save = async function ({ sessionId, certificationCandidateId }) {
  const expirationDelaySeconds = config.temporaryCompanionStorage.expirationDelaySeconds;
  const companionPingStorage = _getTemporaryStorage();
  await companionPingStorage.save({
    key: `${sessionId}:${certificationCandidateId}`,
    value: true,
    expirationDelaySeconds,
  });
};

const getBySessionId = async function (sessionId) {
  const companionPingStorage = _getTemporaryStorage();
  const values = await companionPingStorage.keys(`${sessionId}:*`);
  return values.map((value) => parseInt(value.slice(`${sessionId}:`.length)));
};

export { getBySessionId, save };
