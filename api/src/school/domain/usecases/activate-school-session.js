const SCHOOL_SESSION_DURATION_HOURS = 4;

const activateSchoolSession = async function ({ organizationId, schoolRepository } = {}) {
  const sessionExpirationDate = new Date();
  sessionExpirationDate.setHours(sessionExpirationDate.getHours() + SCHOOL_SESSION_DURATION_HOURS);
  await schoolRepository.updateSessionExpirationDate(organizationId, sessionExpirationDate);
};

export { activateSchoolSession };
