export async function getComplementaryCertificationForTargetProfileAttachmentRepository({
  complementaryCertificationId,
  complementaryCertificationForTargetProfileAttachmentRepository,
}) {
  return complementaryCertificationForTargetProfileAttachmentRepository.getById({
    complementaryCertificationId,
  });
}
