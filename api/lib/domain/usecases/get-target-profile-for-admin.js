export default async function getTargetProfileForAdmin({ targetProfileId, targetProfileForAdminRepository }) {
  return targetProfileForAdminRepository.get({ id: targetProfileId });
}
