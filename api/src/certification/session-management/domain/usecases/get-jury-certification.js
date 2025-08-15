import * as injectedJuryCertificationRepository from '../../infrastructure/repositories/jury-certification-repository.js';

const getJuryCertification = async function ({
  certificationCourseId,
  juryCertificationRepository = injectedJuryCertificationRepository,
} = {}) {
  return juryCertificationRepository.get({ certificationCourseId });
};

export { getJuryCertification };
