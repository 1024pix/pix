export async function copyTargetProfileStages({ originTargetProfileId, destinationTargetProfileId, stageRepository }) {
  const stagesToCopy = await stageRepository.getByTargetProfileIds([originTargetProfileId]);

  if (stagesToCopy.length) {
    const stagesToSave = stagesToCopy.map((existingStage) => {
      delete existingStage.id;
      existingStage.targetProfileId = destinationTargetProfileId;
      return existingStage;
    });
    await stageRepository.saveAll(stagesToSave);
  }
}
