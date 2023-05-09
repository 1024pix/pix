const markTargetProfileAsSimplifiedAccess = async function ({ id, targetProfileRepository }) {
  return targetProfileRepository.update({ id, isSimplifiedAccess: true });
};

export { markTargetProfileAsSimplifiedAccess };
