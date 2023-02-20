export default async function updateTargetProfile({
  id,
  name,
  description,
  comment,
  category,
  targetProfileForUpdateRepository,
}) {
  const targetProfileForUpdate = await targetProfileForUpdateRepository.get(id);
  targetProfileForUpdate.update({ name, description, comment, category });
  await targetProfileForUpdateRepository.update(targetProfileForUpdate);
}
