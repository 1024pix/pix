const markTargetProfileAsSimplifiedAccess = async function ({ id, targetProfileAdministrationRepository }) {
  return targetProfileAdministrationRepository.update({ id, isSimplifiedAccess: true });
};

export { markTargetProfileAsSimplifiedAccess };
