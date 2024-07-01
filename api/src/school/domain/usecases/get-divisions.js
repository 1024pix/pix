const getDivisions = async function ({ organizationId, schoolRepository } = {}) {
  return schoolRepository.getDivisions({ organizationId });
};

export { getDivisions };
