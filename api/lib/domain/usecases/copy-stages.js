export async function copyStages({
  originTargetProfileId,
  destinationTargetProfileId,
  domainTransaction,
  stageRepository,
}) {
  const stagesToCopy = await stageRepository.getByTargetProfileIds([originTargetProfileId], domainTransaction);

  if (stagesToCopy.length) {
    const stagesToSave = stagesToCopy.map((existingStage) => {
      delete existingStage.id;
      existingStage.targetProfileId = destinationTargetProfileId;
      return existingStage;
    });
    await stageRepository.saveAll(stagesToSave, domainTransaction);
  }
}
