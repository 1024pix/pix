const getSchoolByCode = async function ({ code, schoolRepository } = {}) {
  return schoolRepository.getByCode(code);
};

export { getSchoolByCode };
