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

const getBySessionId = async function (sessionId) {
  const companionPingStorage = _getTemporaryStorage();
  const values = await companionPingStorage.keys(`${sessionId}:*`);
  return values.map((value) => parseInt(value.slice(`${sessionId}:`.length)));
};

export { getBySessionId, save };
