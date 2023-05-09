import { NotFoundError } from '../../errors.js';

const getPrivateCertificate = async function ({ certificationId, userId, locale, certificateRepository }) {
  const privateCertificate = await certificateRepository.getPrivateCertificate(certificationId, { locale });
  if (privateCertificate.userId !== userId) {
    throw new NotFoundError();
  }

  return privateCertificate;
};

export { getPrivateCertificate };
