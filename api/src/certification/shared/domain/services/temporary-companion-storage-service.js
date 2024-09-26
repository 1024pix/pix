import { temporaryStorage } from '../../../../shared/infrastructure/temporary-storage/index.js';

const _getTemporaryStorage = () => temporaryStorage.withPrefix('companion:ping:');

const getBySessionId = async function (sessionId) {
  const companionPingStorage = _getTemporaryStorage();
  const values = await companionPingStorage.keys(`${sessionId}:*`);
  return values.map((value) => parseInt(value.slice(`${sessionId}:`.length)));
};

export { getBySessionId };
