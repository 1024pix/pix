import * as schoolRepository from '../../infrastructure/repositories/school-repository.js';

const execute = async function ({ schoolCode, dependencies = { schoolRepository } }) {
  const result = await dependencies.schoolRepository.getSessionExpirationDate({ code: schoolCode });

  return result && new Date() < new Date(result) ? true : false;
};

export { execute };
