import { NotFoundError } from '../../../../shared/domain/errors.js';

const getPrivateCertificate = async function ({ certificationCourseId, userId, locale, certificateRepository }) {
  const privateCertificate = await certificateRepository.getPrivateCertificate(certificationCourseId, { locale });
  if (privateCertificate.userId !== userId) {
    throw new NotFoundError();
  }

  return privateCertificate;
};

export { getPrivateCertificate };
