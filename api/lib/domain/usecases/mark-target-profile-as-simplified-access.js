export default async function markTargetProfileAsSimplifiedAccess({ id, targetProfileRepository }) {
  return targetProfileRepository.update({ id, isSimplifiedAccess: true });
}
