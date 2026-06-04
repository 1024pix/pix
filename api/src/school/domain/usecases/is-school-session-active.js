export async function isSchoolSessionActive({ schoolCode, schoolRepository }) {
  const sessionExpirationDate = await schoolRepository.getSessionExpirationDate({ code: schoolCode });

  return new Date() < new Date(sessionExpirationDate);
}
