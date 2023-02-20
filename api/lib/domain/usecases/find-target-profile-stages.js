export default async function findTargetProfileStages({ targetProfileId, targetProfileRepository }) {
  return targetProfileRepository.findStages({ targetProfileId });
}
