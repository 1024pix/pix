const getComplementaryCertificationForTargetProfileAttachmentRepository = async function ({
  complementaryCertificationId,
  complementaryCertificationForTargetProfileAttachmentRepository,
}) {
  return complementaryCertificationForTargetProfileAttachmentRepository.getById({
    complementaryCertificationId,
  });
};

export { getComplementaryCertificationForTargetProfileAttachmentRepository };
