import * as schoolRepository from '../../infrastructure/repositories/school-repository.js';

const execute = async function ({ schoolCode, dependencies = { schoolRepository } }) {
  const sessionExpirationDate = await dependencies.schoolRepository.getSessionExpirationDate({ code: schoolCode });

  return _isSessionActive(sessionExpirationDate);
};

function _isSessionActive(sessionExpirationDate) {
  return new Date() < new Date(sessionExpirationDate);
}

export { execute };
