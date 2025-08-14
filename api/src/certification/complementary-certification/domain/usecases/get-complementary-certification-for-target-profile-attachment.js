import * as injectedComplementaryCertificationForTargetProfileAttachmentRepository from '../../infrastructure/repositories/complementary-certification-for-target-profile-attachment-repository.js';
const getComplementaryCertificationForTargetProfileAttachmentRepository = async function ({
  complementaryCertificationId,
  complementaryCertificationForTargetProfileAttachmentRepository = injectedComplementaryCertificationForTargetProfileAttachmentRepository,
} = {}) {
  return complementaryCertificationForTargetProfileAttachmentRepository.getById({
    complementaryCertificationId,
  });
};

export { getComplementaryCertificationForTargetProfileAttachmentRepository };
